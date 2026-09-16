# English-first update

This is a narrow update to the existing browser-local application at base commit `1a9b738d3c4bdd6ddc8f3e68cd74f099d0b5273b`. It does not replace IndexedDB with a different server or change the native backup schema.

## What changes

New workspaces start in English. The six editable sample notes, their tags, the second canvas name, and visual connector labels are English. Stable sample IDs and cross-canvas note references remain unchanged. The service-worker shell cache is versioned again so returning visitors can receive updated assets after closing old app tabs.

Existing workspaces keep their chosen language and all user content. To switch an existing workspace, open **Data & settings / 資料與設定**, then select **English** under **Language / 語言**. Do not clear site data to change languages. UI language changes never translate or reset personal notes.

## Checks and evidence

The local Node run passed **42 tests**: the previous 37 tests plus five English/data-preservation checks. Two old Unicode tests now create explicit Chinese fixtures, keeping Unicode coverage independent of the built-in sample language. The domain logic after sample initialization is byte-identical to the base version.

CI retains all 15 existing Chromium checks and adds seven English-first/browser-language checks. It records real results and screenshots under `test-results/`; inspect the actual Actions run for this commit. A checked-in test is not a claim that it has passed. The new test uses ordinary browser navigation and real IndexedDB, not a bridge or mocked store.

No independent AI sub-agent was executed: no callable model-review interface was available. Automated test processes and GitHub CI must not be represented as independent model reviewers. This remains a single-user, browser-local release, not multiplayer or enterprise production certification.

## Run

```sh
npm start
# Open http://localhost:4173
```

Use the same browser, domain and port to return to your data. Download full JSON backups regularly. A static host serves the app code; your notes stay in your browser.
