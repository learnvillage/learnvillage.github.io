# LearnVillage（學習村落）

讓孩子透過互動遊戲學會程式的教育平台。**目前是 Phase 1 雛型**：純靜態網站，不需要後端、資料庫或任何付費服務。

完整規格請看 [`docs/LearnVillage_規格書.md`](docs/LearnVillage_規格書.md)。

---

## 1. 怎麼在你的電腦上打開

> 不能直接雙擊 `index.html`。瀏覽器會擋住讀取 JSON 資料的動作，頁面會一直停在「載入中」。

**方法 A（最簡單）**：雙擊專案根目錄的 **`start.bat`**，瀏覽器會自動打開 http://localhost:8000。需要電腦裝有 Python。

**方法 B**：用 VS Code 打開這個資料夾 → 安裝外掛 **Live Server** → 對 `index.html` 按右鍵 → *Open with Live Server*。

改完檔案後，在瀏覽器按 `Ctrl + F5`（強制重新整理）就能看到新內容。

---

## 2. 目前有什麼

| 區塊 | 檔案 | 狀態 |
|---|---|---|
| 首頁、教材列表（含篩選/搜尋）、教材詳情 | `index.html`、`pages/materials.html`、`pages/material-detail.html` | ✅ |
| 遊玩頁（外框 + 完成後導流） | `pages/play.html` | ✅ |
| 教師列表 / 詳情 | `pages/teachers.html`、`pages/teacher-detail.html` | ✅ |
| 課程列表 / 詳情（含預約按鈕） | `pages/courses.html`、`pages/course-detail.html` | ✅ |
| 站內表單：預約、教材投稿、教師申請（存進 Supabase） | `pages/book.html`、`pages/apply.html`、`pages/submit.html` | ✅ |
| 關於、條款與隱私（簡版） | `about.html`、`legal.html` | ✅ |
| 3 份互動教材 | `games/scratch/scratch-001`、`games/logic/logic-001`、`games/python/python-001` | ✅ |
| 事件追蹤（page_view、play_start、challenge_complete、play_complete…） | `assets/js/analytics.js` | ✅ 本機記錄；GA4 待設定 |

規格書的 P1 目標是 7 份教材，目前先做 3 份（每個類別 1 份），用來驗證整條流程。再加 4 份的做法見第 5 節。

---

## 3. 你需要做的事（上線前）

**① 建立資料表（只要做一次）**
預約、投稿、教師申請三張表單都在站內填寫，資料存進 Supabase（設定在 `assets/js/config.js` 的 `SUPABASE`）。
到 Supabase 專案 → 左側 **SQL Editor** → New query → 貼上 `supabase/schema.sql` 全部內容 → **Run**。
之後在 **Table Editor** 就能看到 `bookings`、`material_submissions`、`teacher_applications` 三張表的資料。
> 訪客只能「新增」資料，讀不到任何人送出的內容。**絕對不要**把 secret / service_role key 放進網站程式。

**② 換成你自己的內容**（目前標了【範例】的都是暫代文字）
- `data/teachers.json`：`teacher-001` 的 `bio`、`teaching_style`、`headline`
- `data/courses.json`：課程大綱、對象、價格（目前體驗課設為免費）
- `pages/legal.html`：條款是簡版草稿，**開始收費前請找專業人士審閱**

**③（選用）Google Analytics 4**：在 `assets/js/config.js` 填入 `GA_ID`。沒填就不會載入任何外部分析。
沒設定也能檢查事件：在瀏覽器按 F12 → Console，輸入 `JSON.parse(localStorage.lv_events)`。

**④ 部署到 GitHub Pages**
1. 在 GitHub 建立新的 repository，把整個資料夾內容推上去（記得包含 `.nojekyll`）。
2. Repository → Settings → Pages → Source 選 *Deploy from a branch* → Branch 選 `main` / `/ (root)` → Save。
3. 幾分鐘後會得到 `https://你的帳號.github.io/repo名稱/`。

---

## 4. 資料夾結構

```
LearnVillage/
├─ index.html              首頁
├─ start.bat               一鍵本機預覽
├─ pages/                  其他頁面（每頁只有骨架，內容由 JS 畫出）
├─ data/                   ★ 內容資料：教材、教師、課程（改這裡就能更新網站）
│   ├─ materials.json
│   ├─ teachers.json
│   └─ courses.json
├─ assets/
│   ├─ css/                tokens.css（顏色字型都在這）、base.css、components.css
│   └─ js/
│       ├─ config.js       ★ Supabase 連線、GA、站名
│       ├─ data.js         讀取內容資料（之後換 Supabase 只改這個）
│       ├─ api.js          表單寫入 Supabase
│       ├─ forms.js        通用表單（欄位、檢查、送出）
│       ├─ analytics.js    事件追蹤出口
│       ├─ bridge.js       接收教材回報的進度事件
│       ├─ ui.js / render.js / filters.js
│       └─ pages/          每一頁各自的程式
├─ games/
│   ├─ shared/             教材共用：外殼流程、方格引擎、題目引擎、樣式
│   └─ <類別>/<教材id>/    ★ 每份教材一個資料夾（content.js 就是題目）
├─ supabase/schema.sql     資料表與權限（貼到 Supabase SQL Editor 執行）
├─ tools/check.mjs         專案健檢（選用，需要 Node.js）
└─ docs/                   規格書
```

---

## 5. 如何新增一份教材（像模組一樣加上去）

以新增 `logic-002` 為例：

1. 複製 `games/logic/logic-001/` 整個資料夾，改名為 `logic-002`。
2. 打開裡面的 **`content.js`**，改 `meta`（標題）、`concepts`（概念頁，最多 3 頁）、`challenges`（題目）。
   - **選擇題**：`type: "choice"`，填 `prompt`、`options`、`answer`（第幾個選項，從 0 算起）、可選 `code`。
   - **排序題**：`type: "order"`，`steps` 寫正確順序，`display` 是打亂後的初始排列。
   - **方格移動**：複製 `scratch-001` 的做法，每關填 `size`、`start`、`goal`、`walls`、`allowed`、`solution`。
3. 修改同資料夾的 `manifest.json`（概念數、挑戰數）和 `index.html` 的 `<title>`、`data-theme`（`scratch`／`python`／`logic` 決定顏色）。
4. 在 `data/materials.json` 加一筆，`play_path` 指向新資料夾的 `index.html`，`status` 先設 `draft`，確認沒問題再改成 `published`。
5. 若有安裝 Node.js，執行 `node tools/check.mjs`，它會檢查資料關聯、連結，以及**每個方格關卡是否一定有解**。

想要全新的玩法（例如拖拉排程式碼）？在 `games/shared/` 新增一個引擎檔，介面和 `quiz-engine.js` 一樣：`mount(舞台元素, 單一挑戰資料, ctx)`，答對時呼叫 `ctx.complete()` 即可，進度列、提示、完成頁都由外殼處理。

教材與平台的溝通方式（規格書 §7.2）：教材透過 `postMessage` 送出 `lv:play_start`、`lv:challenge_complete`、`lv:play_complete`，已封裝在 `games/shared/lv-sdk.js` 的 `emit()`。

---

## 6. 與規格書的差異與已知限制

- **關聯欄位只保留單一來源**：規格書的 `teacher.material_ids`、`teacher.course_ids`、`material.related_course_ids` 沒有放進 JSON，改由 `material.author_id`、`course.teacher_id`、`course.material_ids` 推算，避免兩邊資料不一致。
- **封面圖**：目前用程式產生的色塊（`cover_label` 欄位）。之後想換成圖片，把檔案放進 `assets/images/`，並在該教材的 `cover` 填路徑。
- **表單**：規格書原本用 Google 表單，已改為站內表單＋Supabase，所以能記錄真正送出的事件（`booking_submit`、`submit_material`、`apply_teacher`，不含個資）。站內審核後台尚未製作，目前請在 Supabase 的 Table Editor 查看與修改 `status`。
- **分享預覽（Open Graph）**：靜態網站的社群預覽圖／標題對所有教材相同。要做到每份教材不同的預覽，需要之後改用預先產生頁面的做法。
- **網址格式**：目前用 `?id=`（例如 `material-detail.html?id=scratch-001`）。
- **瀏覽器相容**：使用原生 ES Modules，需要近兩年的 Chrome / Edge / Safari / Firefox。
- **授權文字**：教材預設標示「原創，保留權利（開放個人學習使用）」，是規格書【待決】項目的暫定值，確定後在 `data/materials.json` 統一修改。
- **著作權提醒**：請確保教材內容、題目、圖像都是你自己從零製作，不要使用任職單位或第三方的教材。

---

## 7. 接下來建議

1. 先執行 `supabase/schema.sql`、補上教師簡介，用手機實際玩一遍三份教材。
2. 找 2～3 位孩子試玩，觀察「哪一關卡住」，再決定第 4～7 份教材做什麼。
3. 上線後看事件：玩的人多但完成的少 → 檢查難度；完成的多但沒人預約 → 檢查課程頁的呈現。
