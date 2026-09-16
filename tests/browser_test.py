"""Real Chromium E2E tests. Run server first, then: python tests/browser_test.py.
Requires playwright==1.57.0 and its Chromium browser. No test-only app backdoors.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:4173')
OUT = Path('test-results')
OUT.mkdir(exist_ok=True)
results = []


def save_done(page):
    expect(page.locator('#save-status')).not_to_have_class('save-status pending', timeout=10000)
    expect(page.locator('#save-status')).not_to_have_class('save-status failed')


def snapshot(page):
    save_done(page)
    return page.evaluate("""async () => {
      const {openStore,readWorkspace}=await import('./src/storage.js');
      const db=await openStore(); const r=await readWorkspace(db); db.close(); return r.value;
    }""")


def click(page, action, scope='#app'):
    page.locator(f'{scope} [data-action="{action}"]').first.click()


def record(name):
    results.append({'name': name, 'status': 'passed'})
    print('PASS:', name, flush=True)


with sync_playwright() as p:
    executable = os.environ.get('CHROMIUM_PATH')
    browser = p.chromium.launch(**({'executable_path': executable} if executable else {}))
    context = browser.new_context(viewport={'width': 1440, 'height': 960}, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    try:
        page.goto(BASE)
        expect(page.locator('.canvas-card')).to_have_count(6)
        save_done(page)
        page.screenshot(path=str(OUT/'canvas.png'))
        record('first run: seeded workspace, no login or network dependency')

        # The same canonical note lives on two canvases.
        page.locator('.canvas-card[data-note-id="pca"]').dblclick()
        expect(page.locator('#note-body')).to_be_visible()
        page.locator('#note-body').fill('# Persistent PCA\n\n實際測試：繁體中文 + English. [[svd|SVD]]')
        save_done(page)
        click(page, 'close-panel')
        page.locator('.board-link').nth(1).click()
        expect(page.locator('.canvas-card[data-note-id="pca"] .card-excerpt')).to_contain_text('Persistent PCA')
        record('edit canonical note and see it on another canvas')

        # Reload from REAL IndexedDB, not the in-memory editor state.
        page.reload()
        expect(page.locator('.canvas-card[data-note-id="pca"] .card-excerpt')).to_contain_text('Persistent PCA')
        page.locator('.canvas-card[data-note-id="pca"]').dblclick()
        expect(page.locator('#note-body')).to_contain_text('實際測試')
        record('reload restores committed Unicode content from IndexedDB')

        click(page, 'history')
        expect(page.locator('#modal .history-list section')).to_have_count(1)
        click(page, 'close-modal', '#modal')
        click(page, 'close-panel')
        record('editing-session history retains prior body')

        before = snapshot(page)
        node_id = next(n['id'] for n in before['boards'][0]['nodes'] if n.get('noteId') == 'pca')
        node = page.locator(f'[data-node-id="{node_id}"]')
        box = node.bounding_box()
        page.mouse.move(box['x']+60, box['y']+60)
        page.mouse.down()
        page.mouse.move(box['x']+145, box['y']+105, steps=8)
        page.mouse.up()
        after = snapshot(page)
        old = next(n for n in before['boards'][0]['nodes'] if n['id'] == node_id)
        new = next(n for n in after['boards'][0]['nodes'] if n['id'] == node_id)
        assert new['x'] > old['x']+30
        assert after['boards'][1]['nodes'] == before['boards'][1]['nodes']
        record('drag persists placement and leaves other canvas untouched')

        click(page, 'remove-selected')
        expect(page.locator(f'[data-node-id="{node_id}"]')).to_have_count(0)
        assert any(n['id'] == 'pca' for n in snapshot(page)['notes'])
        click(page, 'undo')
        expect(page.locator(f'[data-node-id="{node_id}"]')).to_have_count(1)
        record('remove placement preserves note; undo restores placement')

        click(page, 'view-graph')
        expect(page.locator('.graph-node')).to_have_count(6)
        page.screenshot(path=str(OUT/'graph.png'))
        page.locator('#graph-search').fill('SVD')
        page.wait_for_timeout(350)
        assert 0 < page.locator('.graph-node').count() < 6
        record('graph derives links and supports text filtering')

        click(page, 'view-notes')
        page.locator('.note-item[data-id="welcome"]').click()
        page.locator('#note-body').fill('<img src=x onerror="window.XSS=true">\n<script>window.XSS=true</script>\n\n[[pca]]')
        click(page, 'editor-mode')
        page.locator('[data-action="editor-mode"][data-mode="preview"]').click()
        assert page.evaluate('window.XSS') is None
        expect(page.locator('#note-preview img')).to_have_count(0)
        expect(page.locator('#note-preview .wikilink')).to_have_count(1)
        record('malicious HTML remains escaped; safe wikilinks still work')

        click(page, 'settings')
        click(page, 'import-md', '#modal')
        page.locator('#file-input').set_input_files({'name':'Imported.md','mimeType':'text/markdown','buffer':'# Imported\n\nHello [[pca]].'.encode()})
        expect(page.locator('#modal .import-preview')).to_be_visible()
        page.locator('#modal button[type="submit"]').click()
        expect(page.locator('#note-title')).to_have_value('Imported')
        save_done(page)
        record('Markdown import previews changes before committing')

        with page.expect_download() as d:
            click(page, 'export-backup')
        backup_path = OUT/'roundtrip.json'
        d.value.save_as(backup_path)
        document = json.loads(backup_path.read_text())
        assert document['format'] == 'obsessiveart'
        assert any(n['title'] == 'Imported' for n in document['notes'])
        record('full JSON export contains real committed notes and board data')

        # Restore onto a fresh browser profile, then compare all semantic data.
        fresh = browser.new_context(accept_downloads=True)
        restore_page = fresh.new_page()
        restore_page.goto(BASE)
        expect(restore_page.locator('.canvas-card')).to_have_count(6)
        click(restore_page, 'settings')
        click(restore_page, 'restore-backup', '#modal')
        restore_page.locator('#file-input').set_input_files(str(backup_path))
        expect(restore_page.locator('#modal input[type="checkbox"]')).to_be_visible()
        with restore_page.expect_download():
            click(restore_page, 'export-backup', '#modal')
        restore_page.locator('#modal input[type="checkbox"]').check()
        restore_page.locator('#modal button[type="submit"]').click()
        assert snapshot(restore_page) == document
        fresh.close()
        record('JSON restore into a fresh profile preserves the whole workspace')

        # Transactions reject stale writers without overwriting the stored state.
        check = page.evaluate("""async () => {
          const {openStore,readWorkspace,commitWorkspace}=await import('./src/storage.js');
          const db=await openStore(), first=await readWorkspace(db);
          await commitWorkspace(db,first.revision,first.value);
          let rejected=false;try{await commitWorkspace(db,first.revision,first.value);}catch(e){rejected=e.name==='ConflictError';}
          const final=await readWorkspace(db);db.close();return {rejected,delta:final.revision-first.revision};
        }""")
        assert check == {'rejected':True,'delta':1}
        page.reload()
        expect(page.locator('.canvas-card')).to_have_count(6)
        record('real IndexedDB compare-and-swap rejects a stale writer atomically')

        # Browser offline reload uses the actual service worker shell.
        page.evaluate('() => navigator.serviceWorker.ready')
        page.wait_for_function('!!navigator.serviceWorker.controller')
        context.set_offline(True)
        page.reload()
        expect(page.locator('.canvas-card')).to_have_count(6)
        context.set_offline(False)
        record('offline reload uses cached shell and existing IndexedDB workspace')

        page.set_viewport_size({'width':390,'height':844})
        click(page,'toggle-sidebar')
        click(page,'view-notes')
        expect(page.locator('#note-title')).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth') == 390
        page.screenshot(path=str(OUT/'mobile.png'))
        record('mobile note workflow fits 390px without horizontal overflow')

        assert not errors, errors
        record('no uncaught browser JavaScript errors')
    except Exception:
        page.screenshot(path=str(OUT/'failure.png'), full_page=True)
        (OUT/'browser-results.json').write_text(json.dumps({'results':results,'errors':errors,'status':'failed'},indent=2))
        raise
    finally:
        browser.close()
    (OUT/'browser-results.json').write_text(json.dumps({'results':results,'errors':errors,'status':'passed'},indent=2))
