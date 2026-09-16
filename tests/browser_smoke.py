"""UI smoke tests. Default: real HTTP/browser integration.
OBSESSART_UI_ISOLATED=1: render local sources without browser navigation; use a
local HTTP request bridge and in-memory recovery storage. This mode does NOT
validate browser CSP, cookie transport, IndexedDB or real navigation.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ISOLATED = os.environ.get('OBSESSART_UI_ISOLATED') == '1'

def api(base: str, path: str, method: str = 'GET', value=None):
    if not path.startswith('/api/'):
        raise ValueError('Only this test server API may be called')
    payload = None if value is None else json.dumps(value).encode()
    headers = {'Origin': base, 'X-ObsessArt-Request': '1', 'Content-Type': 'application/json'}
    request = Request(base + path, data=payload, headers=headers, method=method)
    try:
        with urlopen(request, timeout=10) as response:
            return {'status': response.status, 'body': json.load(response)}
    except HTTPError as error:
        return {'status': error.code, 'body': json.load(error)}

def isolated_sources() -> str:
    model = (ROOT / 'public/model.mjs').read_text()
    model = re.sub(r'^export ', '', model, flags=re.M)
    md = (ROOT / 'public/markdown.mjs').read_text()
    md = re.sub(r'^import .*?;\n', '', md, flags=re.M)
    md = re.sub(r'^export ', '', md, flags=re.M)
    app = (ROOT / 'public/app.mjs').read_text()
    app = re.sub(r'^import .*?;\n', '', app, flags=re.M)
    return '''(() => {
      const memory = () => { const map = new Map(); return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}; };
      const localStorage = memory();
      if (!crypto.randomUUID) crypto.randomUUID = () => '10000000-1000-4000-8000-100000000000'.replace(/[018]/g,c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
      if (!crypto.subtle) Object.defineProperty(crypto,'subtle',{value:{digest:async (_,bytes)=>new Uint8Array(await window.__digest(Array.from(bytes))).buffer}});
      const model = (() => { ''' + model + '''; return {COLORS,LIMITS,createNote,placeNote,removePlacement,relations,searchNotes,validateWorkspace,resolveLink,safeUrl}; })();
      const md = (() => { const {resolveLink,safeUrl} = model; ''' + md + '''; return {markdown,escapeHtml}; })();
      const {COLORS,LIMITS,createNote,placeNote,removePlacement,relations,searchNotes,validateWorkspace} = model;
      const {markdown,escapeHtml:esc} = md;
      let recovery;
      const readDraft = async () => recovery;
      const writeDraft = async value => {recovery = structuredClone(value);};
      const clearDraft = async () => {recovery = undefined;};
      const request = async (path, method='GET',value) => {
        const response=await window.__localRequest(path,method,value??null);
        if(response.status>=400){const error=new Error(response.body.error);error.status=response.status;throw error;}
        return response.body;
      };
      window.__downloads=[];
      const download = (name,value,type) => window.__downloads.push({name,value,type});
      ''' + app + '\n})();'

class BrowserSmoke(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='obsessart-ui-')
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
        cls.base = f'http://127.0.0.1:{port}'
        env = {**os.environ, 'PORT': str(port), 'HOST':'127.0.0.1', 'PUBLIC_URL':cls.base,
               'DATA_DIR': cls.temp.name, 'NODE_ENV':'test', 'OBSESSART_PASSWORD':''}
        cls.server = subprocess.Popen(['node','server/index.mjs'], cwd=ROOT, env=env,
                                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(100):
            try:
                cls.original = api(cls.base, '/api/backup')['body']; break
            except OSError: time.sleep(.05)
        else: raise RuntimeError('Test server did not start')
        cls.pw = sync_playwright().start()
        executable = os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
        cls.browser = cls.pw.chromium.launch(**({'executable_path':executable} if executable else {}))
        cls.source = isolated_sources() if ISOLATED else ''
        print('UI mode: ' + ('ISOLATED (request bridge; browser storage mocked)' if ISOLATED else 'FULL HTTP/BROWSER'))

    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.pw.stop()
        cls.server.terminate(); cls.server.wait(timeout=10); cls.temp.cleanup()

    def setUp(self):
        current = api(self.base, '/api/workspace')['body']
        result = api(self.base,'/api/import','POST',{'backup':self.original,'expectedRevision':current['revision']})
        self.assertEqual(result['status'],200)
        self.context = self.browser.new_context(viewport={'width':1440,'height':960},accept_downloads=True)
        self.errors=[]
        self.page=self.context.new_page()
        self.mount(self.page)

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors,[])

    def mount(self,page):
        page.on('pageerror',lambda e:self.errors.append(str(e)))
        if not ISOLATED:
            page.goto(self.base)
        else:
            page.expose_function('__localRequest',lambda path,method,value:api(self.base,path,method,value))
            page.expose_function('__digest',lambda values:list(hashlib.sha256(bytes(values)).digest()))
            html=(ROOT/'public/index.html').read_text()
            html=re.sub(r'<link[^>]*>', '', html)
            html=re.sub(r'<script[\s\S]*?</script>', '', html)
            page.set_content(html)
            page.add_style_tag(content=(ROOT/'public/styles.css').read_text())
            page.evaluate(self.source)
        page.wait_for_selector('.board-card')

    def saved(self):
        expect(self.page.locator('#save-state')).to_have_text('Saved to local server',timeout=8000)

    def name_dialog(self,name):
        self.page.locator('#dialog-input').fill(name)
        self.page.locator('#dialog-footer button[value="ok"]').click()

    def new_note(self,title):
        self.page.locator('[data-action="new-note"]').first.click()
        self.name_dialog(title)
        self.page.locator('#note-body').wait_for()

    def test_initial_board_and_library(self):
        self.assertEqual(self.page.locator('.board-card').count(),4)
        self.page.locator('[data-view="library"]').first.click()
        self.assertEqual(self.page.locator('.note-tile').count(),4)
        self.page.locator('#search').fill('Research')
        self.assertGreaterEqual(self.page.locator('.note-tile').count(),1)

    def test_edit_and_server_persistence(self):
        self.new_note('研究筆記')
        self.page.locator('#note-body').fill('# 降維\n\n**主成分分析**\n\n自己的研究。')
        self.saved()
        saved=api(self.base,'/api/workspace')['body']['workspace']
        note=next(n for n in saved['notes'] if n['title']=='研究筆記')
        self.assertIn('主成分分析',note['body'])
        self.page.close();self.page=self.context.new_page();self.mount(self.page)
        self.page.locator(f'[data-note="{note["id"]}"]').first.click()
        expect(self.page.locator('#note-title')).to_have_value('研究筆記')

    def test_shared_card_and_remove_without_delete(self):
        original=api(self.base,'/api/workspace')['body']['workspace']
        note=original['notes'][0];board=original['boards'][0]
        self.page.locator('[data-action="new-board"]').click();self.name_dialog('Second board')
        self.page.locator('[data-action="add-existing"]').click()
        self.page.locator(f'[data-pick="{note["id"]}"]').click()
        self.page.locator('[data-drag]').click();self.page.locator('[data-action="write"]').click()
        self.page.locator('#note-body').fill('Changed through the second board.');self.saved()
        self.page.locator(f'[data-board="{board["id"]}"]').click()
        expect(self.page.locator('.card-content').first).to_contain_text('Changed through the second board.')
        self.page.locator('[data-remove]').first.click();self.saved()
        w=api(self.base,'/api/workspace')['body']['workspace']
        self.assertEqual(len(w['notes']),4)
        self.assertEqual(len(w['boards'][0]['placements']),3)
        self.assertEqual(w['boards'][1]['placements'][0]['noteId'],note['id'])

    def test_board_arrows_are_not_knowledge_links(self):
        self.page.locator('[data-action="connect"]').click()
        self.page.locator('[data-drag]').nth(0).click()
        self.page.locator('[data-drag]').nth(3).click();self.saved()
        w=api(self.base,'/api/workspace')['body']['workspace']
        self.assertEqual(len(w['boards'][0]['edges']),4)
        self.page.locator('[data-view="graph"]').first.click()
        self.assertEqual(self.page.locator('.graph-line').count(),4)

    def test_drag_resize_and_undo(self):
        before=api(self.base,'/api/workspace')['body']['workspace']['boards'][0]['placements'][0]
        handle=self.page.locator('[data-drag]').first.bounding_box()
        x,y=handle['x']+50,handle['y']+20
        self.page.mouse.move(x,y);self.page.mouse.down();self.page.mouse.move(x+65,y+40,steps=8);self.page.mouse.up()
        self.saved()
        after=api(self.base,'/api/workspace')['body']['workspace']['boards'][0]['placements'][0]
        self.assertGreater(after['x'],before['x'])
        self.page.wait_for_timeout(220)
        self.page.locator('[data-action="undo"]').click();self.saved()
        restored=api(self.base,'/api/workspace')['body']['workspace']['boards'][0]['placements'][0]
        self.assertEqual(restored['x'],before['x'])
        corner=self.page.locator('[data-resize]').first.bounding_box()
        x,y=corner['x']+8,corner['y']+8
        self.page.mouse.move(x,y);self.page.mouse.down();self.page.mouse.move(x+40,y+30,steps=8);self.page.mouse.up();self.saved()
        resized=api(self.base,'/api/workspace')['body']['workspace']['boards'][0]['placements'][0]
        self.assertGreater(resized['width'],before['width'])

    def test_safe_markdown_rendering(self):
        self.new_note('Markup safety')
        self.page.locator('#note-body').fill('<img src=x onerror="window.__attack=1">\n\n[x](javascript:alert)\n\n**Safe bold**')
        self.page.locator('[data-action="read"]').click();self.saved()
        self.assertEqual(self.page.locator('.prose img').count(),0)
        self.assertEqual(self.page.locator('.prose script').count(),0)
        expect(self.page.locator('.prose strong')).to_have_text('Safe bold')
        self.assertIsNone(self.page.evaluate('window.__attack'))

    def test_export_import_backup(self):
        if ISOLATED:
            self.page.locator('[data-action="export"]').click()
            self.page.wait_for_function('window.__downloads.length > 0')
            raw=self.page.evaluate('window.__downloads.at(-1).value')
        else:
            with self.page.expect_download() as info:
                self.page.locator('[data-action="export"]').click()
            raw=Path(info.value.path()).read_text()
        backup=json.loads(raw)
        self.assertEqual(backup['format'],'obsessart-backup')
        compact=json.dumps(backup['workspace'],ensure_ascii=False,separators=(',',':'))
        self.assertEqual(hashlib.sha256(compact.encode()).hexdigest(),backup['sha256'])
        self.page.locator('[data-action="delete-board"]').click()
        self.page.locator('#dialog-footer button[value="ok"]').click();self.saved()
        self.page.locator('#import-file').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':raw.encode()})
        self.page.locator('#dialog-footer button[value="ok"]').click()
        self.page.wait_for_selector('.board-card')
        self.assertEqual(self.page.locator('.board-card').count(),4)

    def test_stale_tab_save_is_blocked(self):
        current=api(self.base,'/api/workspace')['body']
        current['workspace']['title']='External edit'
        api(self.base,'/api/workspace','PUT',{'workspace':current['workspace'],'expectedRevision':current['revision']})
        self.page.locator('[data-drag]').first.click();self.page.locator('[data-action="write"]').click()
        self.page.locator('#note-body').fill('This tab has a stale draft.')
        expect(self.page.locator('#save-state')).to_have_text('Save needs attention',timeout=8000)
        w=api(self.base,'/api/workspace')['body']['workspace']
        self.assertEqual(w['title'],'External edit')
        self.assertNotEqual(w['notes'][0]['body'],'This tab has a stale draft.')

    def test_language_and_mobile_editor(self):
        self.page.locator('[data-action="language"]').click()
        expect(self.page.locator('html')).to_have_attribute('lang','zh-Hant')
        self.page.set_viewport_size({'width':390,'height':844})
        self.page.locator('[data-drag]').first.click()
        expect(self.page.locator('#editor')).to_be_visible()
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),390)
        self.page.locator('[data-action="close-note"]').click()
        expect(self.page.locator('#editor')).to_be_hidden()

if __name__=='__main__':
    unittest.main(verbosity=2)
