# Third-party notices

The application has no npm runtime dependencies and does not redistribute third-party application code or design assets. The separately installed Node.js runtime, its bundled SQLite implementation and the browser retain their own licenses. The container base image likewise retains its component licenses.

The optional test dependency is Playwright for Python, pinned in requirements-test.txt. Playwright is licensed under Apache-2.0; downloaded browsers have separate licenses. They are installed by the developer or CI and are not bundled in the source archive.

GitHub Actions are executed from pinned upstream commits and are not relicensed by this repository. See the respective upstream license files when modifying the workflow. MIT in this repository applies to the original ObsessArt application and documentation, not to separately installed runtimes or tools.
