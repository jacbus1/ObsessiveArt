"""English-first regression checks against the real running application.
No browser bridge, mocked IndexedDB, or test-only application code.
Run after tests/browser_test.py with the same BASE_URL.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:4173')
OUT = Path('test-results')
OUT.mkdir(exist_ok=True)
results = []


def record(name):
    results.append({'name': name, 'status': 'passed'})
    print('PASS:', name, flush=True)


def click(page, action, scope='#app'):
    page.locator(f'{scope} button[data-action="{action}"]').first.click()


def saved(page, language='en'):
    expect(page.locator('#save-status')).to_have_text(
        'Saved on this device' if language == 'en' else '本機已儲存', timeout=10000)


def snapshot(page):
    return page.evaluate("""async () => {
      const {openStore,readWorkspace}=await import('./src/storage.js');
      const db=await openStore();try{return (await readWorkspace(db)).value;}
      finally{db.close();}
    }""")


with sync_playwright() as p:
    executable = os.environ.get('CHROMIUM_PATH')
    browser = p.chromium.launch(**({'executable_path': executable} if executable else {}))
    context = browser.new_context(viewport={'width': 1440, 'height': 960}, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        page.goto(BASE)
        expect(page.locator('html')).to_have_attribute('lang', 'en')
        expect(page.locator('.canvas-card')).to_have_count(6)
        saved(page)
        expect(page.locator('#app button[data-action="view-notes"]')).to_have_attribute('aria-label', 'Notes')
        page.screenshot(path=str(OUT/'english-canvas.png'))
        record('fresh profile starts with the English interface')

        initial = snapshot(page)
        assert initial['settings']['language'] == 'en'
        assert initial['notes'][0]['title'] == 'From ideas to understanding'
        assert all(not any('\u4e00' <= char <= '\u9fff' for char in note['title']+note['text']+' '.join(note['tags'])) for note in initial['notes'])
        assert initial['boards'][1]['title'] == 'Linear algebra · Shared notes'
        record('persisted first-run samples and canvas labels are English')

        page.locator('.canvas-card[data-note-id="pca"]').dblclick()
        body = '# English workspace\n\nKeep my own words: 中文內容 must not be translated. [[svd|SVD]]'
        page.locator('#note-body').fill(body)
        saved(page)
        click(page, 'close-panel')
        saved(page)
        page.reload()
        saved(page)
        assert next(n for n in snapshot(page)['notes'] if n['id'] == 'pca')['text'] == body
        record('English editing saves Unicode content and survives reload')

        before = snapshot(page)
        click(page, 'settings')
        click(page, 'language', '#modal')
        saved(page, 'zh')
        page.reload()
        expect(page.locator('html')).to_have_attribute('lang', 'zh-Hant')
        saved(page, 'zh')
        chinese = snapshot(page)
        assert chinese['settings']['language'] == 'zh'
        assert chinese['notes'] == before['notes']
        record('choosing Traditional Chinese persists without translating user notes')

        click(page, 'settings')
        click(page, 'language', '#modal')
        saved(page)
        click(page, 'close-modal', '#modal')
        page.reload()
        saved(page)
        english = snapshot(page)
        assert english['settings']['language'] == 'en'
        assert english['notes'] == before['notes']
        assert english['boards'] == before['boards']
        record('switching back to English preserves content, history and placements')

        page.set_viewport_size({'width':390, 'height':844})
        click(page, 'toggle-sidebar')
        click(page, 'view-notes')
        expect(page.locator('#note-title')).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth') == 390
        page.screenshot(path=str(OUT/'english-mobile.png'))
        record('English mobile note workflow fits a 390-pixel viewport')

        assert not errors, errors
        record('English-language workflows raise no uncaught JavaScript errors')
    except Exception:
        page.screenshot(path=str(OUT/'english-failure.png'), full_page=True)
        (OUT/'english-results.json').write_text(json.dumps({'status':'failed','results':results,'errors':errors},indent=2))
        raise
    finally:
        browser.close()
    (OUT/'english-results.json').write_text(json.dumps({'status':'passed','results':results,'errors':errors},indent=2))
