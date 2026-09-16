"""Capture actual UI screenshots with public demo content, never a user's workspace.

Run `npm start` separately, then `python tools/capture_readme.py`.
Requires playwright==1.57.0 with Chromium. Only HTTP navigation is supported;
there is no isolated renderer, mock storage, or manufactured screenshot fallback.
"""
import hashlib
import json
import os
import re
from pathlib import Path
import subprocess
import tempfile
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'screenshots'
BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:4173/')
OUT.mkdir(parents=True, exist_ok=True)

ENGLISH = {
    'welcome': ('From ideas to understanding', '# Welcome to ObsessiveArt\n\nOne local workspace for connected thinking.\n\n## Three ways to work\n- **Notes**: explain one idea clearly.\n- **Canvas**: arrange and compare concepts.\n- **Graph**: explore links between your notes.\n\nTry [[pca|Principal Component Analysis]] and [[workflow|A research workflow]].\n\n> Download full JSON backups regularly. Browser storage is not an external backup.', ['Getting started', 'Workspace']),
    'pca': ('PCA · Find the main directions', '# Principal Component Analysis\n\nPCA projects data onto orthogonal axes that capture variance.\n\n## A practical workflow\n1. Decide whether to standardize the features.\n2. Find the directions with the most variance.\n3. Choose how many components to keep.\n4. Review information loss and interpretability.\n\nClosely related to [[svd|SVD]]. Compare it with [[clustering|K-means]] on the same canvas.\n\n**Ask yourself:** does high variance always mean useful signal?', ['Machine learning', 'Dimensionality reduction']),
    'svd': ('SVD · A different view of a matrix', '# Singular Value Decomposition\n\n`A = U Σ Vᵀ`\n\nSeparate a matrix into directions and scales.\n\n- U: left singular vectors.\n- Σ: singular values.\n- V: right singular vectors.\n\nSVD of centered data can be used to compute [[pca|PCA]].\n\n## Explore next\nCompare reconstruction error at different ranks.', ['Linear algebra', 'Dimensionality reduction']),
    'clustering': ('K-means · Discover groups', '# Grouping by similarity\n\nK-means alternates assignments and center updates to reduce within-cluster squared distances.\n\n- Initialization matters.\n- Feature scales affect distance.\n- Clusters need not match real-world categories.\n\nA [[pca|PCA]] projection is useful for exploration, not proof of a category.', ['Machine learning', 'Clustering']),
    'workflow': ('A research workflow', '# Turn information into understanding\n\n1. Collect a source.\n2. Explain one concept in your own words.\n3. Place notes on a canvas and compare.\n4. Add links to related notes.\n5. Record questions, not only conclusions.\n\n[[question|A question worth asking]]\n\n> Canvas arrows are visual. Only note links enter the graph.', ['Research methods']),
    'question': ('A question worth asking', '# Do I really understand this?\n\n- Can I explain it without jargon?\n- Can I give a counterexample?\n- Under what conditions does it apply?\n- What would I check next?\n\nReturn to the [[workflow|research workflow]].', ['Thinking', 'Research methods'])
}


def click(page, action, scope='#app'):
    page.locator(f'{scope} button[data-action="{action}"]').first.click()


def settled(page):
    expect(page.locator('#save-status')).to_have_class(re.compile(r'^save-status\s*$'), timeout=15000)
    page.evaluate('document.fonts.ready')


def capture(page, name, images):
    settled(page)
    page.screenshot(path=str(OUT / name), animations='disabled', full_page=True)
    images.append({'file': name, 'sha256': hashlib.sha256((OUT / name).read_bytes()).hexdigest(),
                   'viewport': page.viewport_size})


def main():
    records = []
    with sync_playwright() as p, tempfile.TemporaryDirectory() as tmp:
        options = {'headless': True}
        if os.environ.get('CHROMIUM_PATH'):
            options['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = p.chromium.launch(**options)
        browser_version = browser.version
        try:
            for language in ('en', 'zh-Hant'):
                context = browser.new_context(viewport={'width': 1440, 'height': 1000},
                                              locale='en-CA' if language == 'en' else 'zh-TW',
                                              timezone_id='UTC', accept_downloads=True)
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                response = page.goto(BASE, wait_until='networkidle')
                assert response and response.status == 200, 'Application did not return HTTP 200'
                expect(page.locator('.canvas-card')).to_have_count(6)
                settled(page)
                if language == 'en':
                    # Translate synthetic sample CONTENT. Import it through the ordinary UI.
                    raw = subprocess.check_output(['node', '--input-type=module', '-e',
                        "import {seedWorkspace} from './src/core.js'; console.log(JSON.stringify(seedWorkspace()));"], cwd=ROOT)
                    fixture = json.loads(raw)
                    fixture['settings']['language'] = 'en'
                    for note in fixture['notes']:
                        note['title'], note['text'], note['tags'] = ENGLISH[note['id']]
                    fixture['boards'][1]['title'] = 'Linear algebra · Shared notes'
                    for edge, label in zip(fixture['boards'][0]['edges'], ['Explore', 'Structure', 'Compare', 'Question']):
                        edge['label'] = label
                    fixture['boards'][1]['edges'][0]['label'] = 'Shared content, independent position'
                    fixture_path = Path(tmp) / 'english-demo.json'
                    fixture_path.write_text(json.dumps(fixture, ensure_ascii=False), encoding='utf-8')
                    click(page, 'settings')
                    click(page, 'restore-backup', '#modal')
                    page.locator('#file-input').set_input_files(str(fixture_path))
                    with page.expect_download() as download:
                        click(page, 'export-backup', '#modal')
                    download.value.save_as(Path(tmp) / 'pre-restore-demo.json')
                    page.locator('#modal input[type="checkbox"]').check()
                    page.locator('#modal button[type="submit"]').click()
                    expect(page.locator('html')).to_have_attribute('lang', 'en')
                    expect(page.locator('#notices .toast')).to_have_count(0, timeout=15000)
                else:
                    expect(page.locator('html')).to_have_attribute('lang', 'zh-Hant')
                capture(page, f'whiteboard-{language}.png', records)
                click(page, 'view-notes')
                page.locator('.note-item[data-id="pca"]').click()
                page.locator('button[data-action="editor-mode"][data-mode="split"]').click()
                expect(page.locator('#note-preview')).to_contain_text('Principal Component Analysis')
                capture(page, f'editor-{language}.png', records)
                click(page, 'view-graph')
                expect(page.locator('.graph-node')).to_have_count(6)
                capture(page, f'graph-{language}.png', records)
                page.set_viewport_size({'width': 1440, 'height': 1200})
                click(page, 'settings')
                expect(page.locator('#storage-info')).not_to_have_text('…')
                capture(page, f'settings-{language}.png', records)
                click(page, 'close-modal', '#modal')
                click(page, 'view-notes')
                page.locator('button[data-action="editor-mode"][data-mode="edit"]').click()
                page.set_viewport_size({'width': 390, 'height': 844})
                expect(page.locator('#note-title')).to_be_visible()
                assert page.evaluate('document.documentElement.scrollWidth') == 390
                capture(page, f'mobile-{language}.png', records)
                assert not errors, errors
                context.close()
        finally:
            browser.close()
    files = ['index.html', 'style.css', 'src/app.js', 'src/core.js', 'src/storage.js', 'sw.js']
    report = {
        'capturedAt': datetime.now(timezone.utc).isoformat(),
        'commit': os.environ.get('GITHUB_SHA') or subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
        'browser': 'Chromium ' + browser_version,
        'method': 'Real HTTP browser navigation; ordinary UI controls; fresh disposable profiles; no mock storage.',
        'content': 'Bundled synthetic learning notes; English translations imported through the normal JSON restore flow. No private notes or user profiles.',
        'notEvidenceOf': ['public website deployment', 'cross-device sync', 'physical mobile testing', 'production security certification'],
        'runtimeSha256': {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in files},
        'images': records
    }
    (OUT / 'capture.json').write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    print(f'Captured {len(records)} real UI screenshots. No private workspace data used.')


if __name__ == '__main__':
    main()
