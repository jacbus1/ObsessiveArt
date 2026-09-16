# ObsessiveArt

結合雙向連結筆記、視覺白板及知識圖譜的本地優先知識工作台。

[English](README.md)

## 目前狀態

**此版本是已整理進 GitHub 的研究與開發規格，不是已完成的應用程式。** Production-ready 是開發目標；50 個應用程式驗收案例全部為 `not_run`，尚未進行應用程式 build、瀏覽器測試、同步壓測、匯入匯出往返、備份還原、安全審核或部署。

本次採用查核日期 **2026-09-15** 的最新規格包。英文與繁體中文說明分開；不包含你的私人筆記、截圖、PDF、帳戶資料或 API keys。

## 產品方向

以 Heptabase 式研究卡片工作流為主軸，加入 Obsidian 式資料可攜與連結能力，以及 Miro 式空間操作。這是獨立實作，不是複製三個產品的專有程式。

同一份筆記可以出現在多塊白板；正文共用，位置獨立。移除白板上的卡片，不等於刪除筆記。白板箭頭與知識關係分開保存，圖譜重新排列亦不能改動手動白板。

## 文件入口

| 文件 | 內容 |
|---|---|
| [完整繁體中文研究](docs/RESEARCH.zh-Hant.md) | 三個產品、選型、資料模型與範圍 |
| [Architecture](docs/ARCHITECTURE.md) | 權威資料、同步、權限、離線與部署 |
| [Interchange](docs/INTERCHANGE.md) | 匯入匯出、來源定位、完整備份與降級報告 |
| [Production gates](docs/PRODUCTION_GATES.md) | 正式上線前需要的實測證據 |
| [Backlog](docs/IMPLEMENTATION_BACKLOG.md) | 按相依關係排序的實作里程碑 |
| [License review](docs/LICENSE_REVIEW.md) | 第三方授權限制與待確認事項 |
| [Sources](docs/SOURCES.md) | 38 筆來源與讀取範圍 |
| [50 項驗收案例](specs/acceptance-cases.json) | 全部尚未執行，不能當作通過測試 |
| [Status](STATUS.json) | 此次版本的狀態與非宣稱範圍 |

原研究中「未 push」等敘述描述當時的研究輪次；本次 GitHub 提交紀錄是實際發布證據。`PACKAGE_MANIFEST.json` 列出檔案大小與 SHA-256。文件一致性與上傳核對，不是應用程式測試。

## 第一個實作里程碑

**一張筆記 → 兩塊白板 → 知識圖譜 → 離線修改 → 重開 → 匯出並在空白工作區還原。** 先驗證這條完整流程，再增加更複雜的研究、協作及 AI 功能。

目前沒有可啟動的 app、安裝指令或線上服務。GitHub 原始碼庫、完整應用程式及正式部署是三個不同交付階段。未固定的技術候選不能當作已安裝依賴；原創程式與第三方套件的授權也必須分開處理。
