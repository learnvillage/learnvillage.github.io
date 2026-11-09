# LearnVillage 平台規格書

**版本：Spec v0.1（草案）｜日期：2026-11-06**
**來源：** 《EduVerse 教育創作者平台企畫書 V1.1》
**專案目錄：** `C:\Users\user\Documents\code\LearnVillage`
**狀態：** 供審閱；標示 `【待決】` 的項目需要你確認後才能定案。

---

## 0. 文件說明

### 0.1 目的
將企畫書轉為可直接開發的規格：頁面、功能、資料結構、流程、驗收標準與分階段範圍。

### 0.2 命名
- 專案／網址代號：**LearnVillage**（「學習村落／我們城市」）。
- 企畫書原名 EduVerse，本規格書統一使用 LearnVillage。`【待決】` 是否沿用此名作為對外品牌。

### 0.3 範圍分級標記
| 標記 | 意義 |
|---|---|
| **P1** | Phase 1 展示型 MVP（第 1–4 週）必做 |
| **P2** | Phase 2 人工營運驗證（第 5–8 週） |
| **P3** | Phase 3 會員與創作者系統（第 3–6 月） |
| **P4** | Phase 4 正式商業化（第 6–12 月） |

---

## 1. 產品概述

### 1.1 定位
以程式教育／STEAM 為起點，整合 **互動教材、線上家教、教育創作者市場** 的教育平台。

### 1.2 核心價值主張
| 對象 | 訊息 |
|---|---|
| 學生／家長 | 讓孩子透過互動遊戲學會程式 |
| 教師 | 讓互動教材融入課堂，提升教學效率 |
| 創作者 | 分享教材、累積作品，未來有機會獲得收入 |

### 1.3 設計原則
1. **三者互連**：教材頁、教師頁、課程頁必須互相連結，不是三個獨立服務。
2. **資料與畫面分離**：內容以 JSON 管理，之後可無痛遷移資料庫。
3. **多角色不互斥**：同一人可同時是學生／教師／創作者。
4. **少量但完整**：寧可 7 份完整教材，也不堆 50 份半成品。
5. **未成年保護優先**：家長為預約窗口，不公開學生個資。
6. **先驗證再投入**：金流、會員、編輯器皆待需求驗證後再做。

### 1.4 非目標（P1 不做）
會員登入、即時聊天、自建視訊、線上金流、AI 教材生成、完整教師後台、萬能教材編輯器、自動化教材複製／改編。

---

## 2. 使用者角色

| 角色 | 說明 | P1 能做 | 後期能做 |
|---|---|---|---|
| 訪客／學生 | 國小至國中為主 | 瀏覽、遊玩教材、看教師與課程 | 收藏、進度、分享成果（P3） |
| 家長 | 預約與聯絡窗口 | 送出體驗課預約表單 | 管理孩子資料、付款（P4） |
| 教師／家教 | 提供教學服務 | 被展示、使用教材、提交資料審核 | 課程管理、評價、訂閱（P3–P4） |
| 創作者 | 教材設計者 | 以表單投稿 | 作品頁、上傳／改編、分潤（P3–P4） |
| 管理員（站長） | 你本人 | 以 Google Sheets 審核與處理 | 管理後台（P3） |

> 角色以「標籤」存在於使用者上（`roles: ["teacher","creator"]`），而非互斥類型。

---

## 3. 資訊架構與路由

### 3.1 網站地圖
```
首頁 /
├─ 教材 /materials
│   └─ 教材詳情 /material?id=scratch-001
│       └─ 遊玩頁 /play?id=scratch-001
├─ 教師 /teachers
│   └─ 教師詳情 /teacher?id=teacher-001
├─ 課程 /courses
│   └─ 課程詳情 /course?id=course-001
├─ 投稿 /submit           （導向 Google Form）
├─ 預約 /book?course=...  （導向 Google Form）
├─ 關於 /about
└─ 隱私與使用條款 /legal
```
P1 使用 GitHub Pages 靜態站，以 query string 傳遞 id（`?id=`）。遷移到框架／資料庫後可改為 `/materials/scratch-001`。

### 3.2 三者互連矩陣
| 從 \ 到 | 教材 | 教師 | 課程 |
|---|---|---|---|
| **教材頁** | 相關教材 | 作者／推薦教師 | 對應體驗課 |
| **教師頁** | 教師的教材 | — | 教師開的課 |
| **課程頁** | 課程使用的教材 | 授課教師 | 相似課程 |

---

## 4. 頁面規格（P1）

### 4.1 首頁 `index.html`
- **區塊：** Hero（理念＋「開始遊玩」CTA）、精選教材（3–6 張卡）、教師預覽（2–3 位）、體驗課程入口、如何運作（3 步驟）、投稿邀請、頁尾。
- **驗收：** 3 秒內可看出平台是做什麼的；首屏有明確的「開始遊玩」按鈕；手機版可用。

### 4.2 教材列表 `materials.html`
- **功能：** 卡片網格；分類篩選（Scratch / Python / 程式邏輯）；難度篩選（beginner / intermediate / advanced）；關鍵字搜尋（標題、tags）。
- **卡片：** 縮圖、標題、分類、難度、預估時間、作者。
- **空狀態：** 無結果時顯示提示與清除篩選。
- **資料來源：** `data/materials.json`，僅顯示 `status = published`。

### 4.3 教材詳情 `material-detail.html`
- **內容：** 標題、封面、學習目標（列點）、難度、預估時間、先備知識、作者卡（連到教師頁）、授權標示、「開始遊玩」按鈕、「相關體驗課」區塊、分享連結（複製網址）。
- **驗收：** 每份教材有獨立可分享網址；作者名稱必顯示。

### 4.4 互動遊玩頁 `play.html`
- **流程（單一教材）：** 介紹概念 → 小挑戰（1–3 關）→ 完成回饋 → 引導至對應教師／體驗課。
- **共通元件：** 進度列、提示按鈕、重試、完成畫面（可再玩／下一份教材／查看體驗課）。
- **技術：** 每份教材為獨立模組（`games/<類別>/<id>/`），由 play 頁以 iframe 或動態載入。
- **事件紀錄：** `play_start`、`challenge_complete`、`play_complete`（見 §9）。
- **驗收：** 一般國小學生可在無說明下完成第一關；斷網重整不崩壞。

### 4.5 教師列表／詳情
- **列表：** 教師卡（頭像、姓名／暱稱、專長標籤、一句話介紹）。
- **詳情：** 簡介、專長、教學風格、適合年齡、教過的教材、開設課程、「預約體驗」按鈕。
- **隱私：** 不公開教師聯絡方式；只可透過預約表單聯繫。

### 4.6 課程列表／詳情
- **詳情：** 課程名稱、對象、時長、內容大綱、費用、授課教師、使用教材、上課方式（Google Meet）、「預約」按鈕。
- **費用：** P1 僅展示，不線上收款。`【待決】` 體驗課是否免費？正式課費用區間？

### 4.7 投稿與預約
| 項目 | 實作 | 必填欄位 | 後處理 |
|---|---|---|---|
| 教材投稿 | Google Form | 作者、聯絡 Email、教材名稱、類別、難度、學習目標、原創／授權聲明 | 人工審核（Sheet 狀態欄） |
| 教師申請 | Google Form | 姓名、專長、經驗、簡介、授權同意 | 人工審核 |
| 體驗課預約 | Google Form | 家長姓名、聯絡方式、孩子年級（不收全名）、課程、可上課時段、監護人同意勾選 | 人工聯繫 |

---

## 5. 功能需求清單

| ID | 功能 | 階段 | 說明 |
|---|---|---|---|
| F-01 | 教材列表、分類、搜尋 | P1 | 前端篩選 JSON |
| F-02 | 教材詳情頁 | P1 | 含作者、授權 |
| F-03 | 互動教材遊玩 | P1 | 首批 7 份 |
| F-04 | 教師／課程展示 | P1 | 靜態資料 |
| F-05 | 投稿表單 | P1 | Google Form |
| F-06 | 預約表單 | P1 | Google Form |
| F-07 | 分享連結 | P1 | 複製網址 |
| F-08 | 基礎數據追蹤 | P1 | GA4 或輕量事件記錄 |
| F-09 | 教材／教師審核流程 | P2 | Sheet 狀態管理 |
| F-10 | 預約管理與統計 | P2 | Sheet 儀表 |
| F-11 | 會員註冊登入 | P3 | Supabase Auth |
| F-12 | 創作者頁面 | P3 | 作品集 |
| F-13 | 教材上傳／編輯 | P3 | 有限度的模板式編輯 |
| F-14 | 收藏與進度 | P3 | 需登入 |
| F-15 | 教材複製／改編／版本 | P3 | 保留來源與授權 |
| F-16 | 教師課程管理後台 | P3 | |
| F-17 | 線上付款（新台幣） | P4 | 金流串接 |
| F-18 | 家教交易與抽成 | P4 | |
| F-19 | 付費教材與分潤 | P4 | |
| F-20 | 教師訂閱 | P4 | |
| F-21 | 課程評價 | P4 | |
| F-22 | 退款與交易管理 | P4 | |

---

## 6. 資料模型

### 6.1 P1：JSON 結構

**`data/materials.json`**
```json
{
  "id": "scratch-001",
  "title": "Scratch 角色移動",
  "category": "Scratch",
  "level": "beginner",
  "type": "interactive",
  "author_id": "teacher-001",
  "description": "學習角色移動與座標概念",
  "learning_goals": ["理解 x、y 座標", "使用移動積木讓角色走到目標"],
  "prerequisites": [],
  "estimated_minutes": 10,
  "tags": ["Scratch", "座標", "入門"],
  "cover": "assets/images/scratch-001.png",
  "play_path": "games/scratch/scratch-001/index.html",
  "related_course_ids": ["course-001"],
  "license": "CC-BY-NC-4.0",
  "version": "1.0.0",
  "original_material_id": null,
  "status": "published",
  "created_at": "2026-11-20",
  "updated_at": "2026-11-20"
}
```

**`data/teachers.json`**
```json
{
  "id": "teacher-001",
  "display_name": "小黑老師",
  "avatar": "assets/images/teacher-001.png",
  "headline": "用遊戲學會 Scratch 與程式邏輯",
  "bio": "…",
  "specialties": ["Scratch", "Python 入門"],
  "age_groups": ["國小", "國中"],
  "teaching_style": "…",
  "roles": ["teacher", "creator"],
  "material_ids": ["scratch-001"],
  "course_ids": ["course-001"],
  "status": "published"
}
```

**`data/courses.json`**
```json
{
  "id": "course-001",
  "title": "Scratch 入門體驗課",
  "teacher_id": "teacher-001",
  "audience": "國小中高年級",
  "duration_minutes": 60,
  "format": "online_1on1",
  "platform": "Google Meet",
  "outline": ["認識舞台與角色", "座標與移動", "完成小遊戲"],
  "price_twd": 0,
  "material_ids": ["scratch-001"],
  "booking_form_url": "https://forms.google.com/...",
  "status": "published"
}
```

### 6.2 欄位規則
| 欄位 | 規則 |
|---|---|
| `id` | `<類別>-<三位數>`（教材）、`teacher-xxx`、`course-xxx`，建立後不可更改 |
| `level` | `beginner` / `intermediate` / `advanced` |
| `status` | `draft` / `review` / `published` / `archived` |
| `license` | 必填；P1 預設 CC BY-NC 或「原創，保留權利」`【待決】` |
| `version` | 語意化版本 `MAJOR.MINOR.PATCH` |
| `original_material_id` | 改編來源；原創為 `null` |

### 6.3 P3 資料庫（Supabase／PostgreSQL）
```
users(id, email, display_name, roles[], created_at)
teachers(user_id, headline, bio, specialties[], verified_at)
materials(id, author_id, original_material_id, title, category, level,
          license, version, status, content_ref, created_at, updated_at)
material_versions(id, material_id, version, changelog, content_ref, created_at)
courses(id, teacher_id, title, price_twd, status, ...)
course_materials(course_id, material_id)
bookings(id, course_id, guardian_contact, student_grade, slot, status, created_at)
favorites(user_id, material_id)
progress(user_id, material_id, status, last_step, updated_at)
transactions(id, booking_id|material_id, amount_twd, fee_twd, status)   -- P4
reviews(id, course_id, user_id, rating, comment)                          -- P4
```
- 啟用 Row Level Security；學生／家長資料僅本人與管理員可讀。
- 遷移需含：JSON → DB 匯入腳本、備份策略、權限、認證，不視為自動完成。

---

## 7. 互動教材規格

### 7.1 教材類型與首批清單（P1 目標 7 份）
| 類型 | 數量 | 範例主題 |
|---|---|---|
| Scratch 互動 | 3 | 角色移動、座標、條件判斷 |
| Python 互動 | 2 | 變數、輸入輸出 |
| 程式邏輯練習 | 2 | 順序、條件、迴圈 |

### 7.2 教材模組介面（建議）
每份教材為獨立資料夾，並提供統一入口：
```
games/scratch/scratch-001/
├── index.html      // 教材本體
├── manifest.json   // 步驟數、挑戰數、完成條件
└── assets/
```
教材透過 `window.parent.postMessage` 回報事件給平台外框：
```js
{ type: "lv:challenge_complete", materialId: "scratch-001", step: 2 }
{ type: "lv:play_complete",      materialId: "scratch-001", score: 3, total: 3 }
```
好處：平台可統一記錄數據、顯示完成畫面與導流，教材本身可獨立開發。

### 7.3 第一份教材「完整學習體驗」（P1 首要）
1. 開始頁：一句話說明要學什麼。
2. 概念講解：≤ 3 個畫面，每畫面一個概念。
3. 小挑戰：至少 2 關，漸進難度，可提示。
4. 完成頁：鼓勵訊息＋「再玩一次」＋「看看老師怎麼教」（連到課程）。

### 7.4 教材品質檢核（上架前）
- [ ] 學習目標明確且可被挑戰驗證
- [ ] 不需說明即可開始操作
- [ ] 提示與重試完整，無死路
- [ ] 手機／平板／桌機皆可操作
- [ ] 作者、授權、版本已填寫
- [ ] 無未授權素材（圖片、音效、角色、第三方教材）

---

## 8. 核心使用流程

### 8.1 學生流程
首頁 → 教材列表 → 教材詳情 → 遊玩 → 完成 → 看到相關教師／體驗課 → 預約或繼續玩其他教材

### 8.2 家長預約流程（P1–P2 人工）
課程詳情 → 預約表單（含監護人同意）→ 寫入 Google Sheet → 站長人工聯繫（Email／LINE）→ 排定 Google Meet → 課後回饋收集

### 8.3 投稿審核流程
投稿表單 → Sheet 狀態 `review` → 站長依檢核表審核（品質／授權／適齡）→ 通過：加入 JSON 並上線；退回：附理由回覆作者

---

## 9. 數據與成效追蹤

### 9.1 事件清單
| 事件 | 觸發時機 | 對應指標 |
|---|---|---|
| `page_view` | 任一頁載入 | 訪客數 |
| `material_view` | 進入教材詳情 | 興趣度 |
| `play_start` | 開始遊玩 | 實際使用 |
| `challenge_complete` | 完成單一挑戰 | 難度分析 |
| `play_complete` | 完成教材 | 完成率 |
| `cta_course_click` | 點擊課程／預約 | 導流轉換 |
| `booking_submit` | 預約表單送出 | 家教需求 |
| `submit_material` | 投稿表單送出 | 創作者參與 |

### 9.2 診斷邏輯（來自企畫書）
- 訪客多、遊玩少 → 檢查首頁與教材介紹。
- 開始多、完成少 → 檢查難度與遊戲體驗。
- 教材使用多、詢問少 → 重新檢視家教價值與呈現。

### 9.3 隱私原則
不蒐集孩子姓名、學校等個資；數據以匿名事件為主；需有隱私政策頁並說明 cookie／分析工具。

---

## 10. 非功能需求

| 類別 | 要求 |
|---|---|
| 效能 | 首頁 LCP ≤ 2.5 秒（一般 4G）；單一教材資源 ≤ 5 MB |
| 相容 | 近兩個版本 Chrome / Edge / Safari / Firefox；iOS／Android 手機與平板 |
| RWD | 360px 到 1440px 皆可用；觸控目標 ≥ 44px |
| 無障礙 | 語意化 HTML、對比度 AA、鍵盤可操作、圖片 alt |
| 語言 | 繁體中文（zh-TW）；內容文字集中管理，利於日後多語 |
| 安全 | 全站 HTTPS；表單不收敏感資料；P3 起啟用 RLS、輸入驗證 |
| 可維護 | 內容改 JSON 即可更新；教材模組彼此獨立 |
| 成本 | P1 目標 NT$0；免費方案限制需留意 |

---

## 11. 未成年安全、隱私與著作權

### 11.1 未成年安全與個資
- 家長為預約與聯絡窗口；表單含監護人同意勾選。
- 不公開學生個人資料；教師與學生不直接私下聯繫（P1 由站長居中）。
- 教師需審核（身分、經歷、教學意願）後才展示。
- 正式營運前確認適用法規（個資法等）與責任範圍，`【待決】` 是否需法律諮詢。

### 11.2 著作權與授權
- 投稿須聲明原創或已取得授權。
- 每份教材標示作者、授權、改編來源。
- **禁止使用公司（含現職、前雇主）或第三方未授權教材。** 建議你的原創教材從零製作，避免與工作內容混淆。
- 教師展示與教材使用須取得書面（或表單）同意。

### 11.3 營運條款
P1 需有《使用條款》《隱私政策》《投稿授權條款》簡版，P4 前補完整版與退款條款。

---

## 12. 技術架構

### 12.1 P1 技術棧
| 項目 | 工具 |
|---|---|
| 前端 | HTML、CSS、原生 JavaScript（ES Modules） |
| 託管 | GitHub Pages |
| 版本管理 | Git／GitHub |
| 內容資料 | JSON |
| 表單 | Google Forms |
| 管理 | Google Sheets |
| 視訊 | Google Meet |
| 分析 | GA4 或 Plausible `【待決】` |

### 12.2 專案結構
```
LearnVillage/
├── index.html
├── pages/
│   ├── materials.html
│   ├── material-detail.html
│   ├── play.html
│   ├── teachers.html
│   ├── teacher-detail.html
│   ├── courses.html
│   ├── course-detail.html
│   ├── about.html
│   └── legal.html
├── assets/
│   ├── css/        (tokens.css, base.css, components.css)
│   ├── js/         (data.js, render.js, filters.js, analytics.js, bridge.js)
│   └── images/
├── data/
│   ├── materials.json
│   ├── teachers.json
│   └── courses.json
├── games/
│   ├── scratch/
│   ├── python/
│   └── logic/
├── docs/           (本規格書、審核檢核表、授權條款)
└── README.md
```

### 12.3 前端模組職責
| 模組 | 職責 |
|---|---|
| `data.js` | 載入並快取 JSON，提供 `getMaterial(id)` 等查詢 |
| `render.js` | 卡片、列表、詳情頁渲染（含空狀態、錯誤狀態） |
| `filters.js` | 分類／難度／關鍵字篩選 |
| `bridge.js` | 接收教材 postMessage 事件並轉送分析 |
| `analytics.js` | 事件送出封裝，便於更換工具 |

### 12.4 Python 互動教材的技術選項 `【待決】`
| 方案 | 優點 | 缺點 |
|---|---|---|
| Pyodide（瀏覽器內執行 Python） | 零後端、可真實執行 | 首次載入約數 MB |
| 模擬型互動（拖拉／填空，不真跑 Python） | 輕量、可控 | 非真實執行 |
建議 P1 先用**模擬型＋小段 Pyodide**，視載入表現決定。

### 12.5 Scratch 教材的技術選項 `【待決】`
| 方案 | 說明 |
|---|---|
| 自製 Scratch 風格互動（Canvas／HTML） | 完全可控、可嵌入挑戰驗證 |
| 嵌入 Scratch 專案 | 需留意授權與嵌入限制 |
建議 P1 採自製互動，聚焦單一概念。

### 12.6 演進路線
P1 靜態站 → P3 加 Supabase（Auth＋DB＋Storage）→ P4 加金流與 Edge Functions；前端可逐步遷移至框架（如 Astro／Next.js），資料層以 `data.js` 介面隔離。

---

## 13. 設計規格（輕量）

- **風格：** 友善、明亮、遊戲感但不幼稚；適合國小至國中與家長同時使用。
- **設計 Token：** 主色、輔色、成功／提示／錯誤色、圓角、間距、字級集中於 `tokens.css`。
- **字型：** 系統中文字型優先（Noto Sans TC 為佳），標題字重加強。
- **元件：** 按鈕（主要／次要）、卡片、標籤、導覽列、頁尾、進度列、提示框、表單導流區塊。
- **語氣：** 鼓勵式、短句；避免專業術語堆疊。

---

## 14. 推廣與內容配合（與產品相關部分）

- 每份教材有獨立分享網址與社群預覽圖（Open Graph）。
- 教材頁顯示創作者名稱，作為創作者曝光入口。
- 首批 5 位學生＋2 位教師試用；以事件數據＋訪談評估。
- 推廣管道初期擇二經營（如 Facebook、YouTube Shorts），不做廣告。

---

## 15. 驗收標準與成功指標

### 15.1 Phase 1 驗收（上線門檻）
- [ ] 7 份可遊玩教材（3 Scratch、2 Python、2 邏輯）
- [ ] 2–3 位教師頁、1–2 種體驗課
- [ ] 首頁、列表、詳情、遊玩、教師、課程頁皆可用並互相連結
- [ ] 投稿與預約表單可送出並寫入 Sheet
- [ ] 手機／桌機實測通過
- [ ] 隱私政策與授權說明已上線
- [ ] 部署至 GitHub Pages，分享連結可開啟
- [ ] 事件追蹤可看到 `play_start` / `play_complete`

### 15.2 初期驗證指標（企畫書）
| 指標 | 目標 |
|---|---|
| 可遊玩教材 | ≥ 7 |
| 試用學生 | ≥ 10 人 |
| 願意加入教師 | 2–3 位 |
| 家長課程詢問 | ≥ 3 次 |
| 實際體驗課 | 1–3 堂 |
| 外部創作者 | ≥ 2 位 |

### 15.3 進入下一階段的判斷
- P1 → P2：有真實使用者完成教材且有回訪。
- P2 → P3：出現真實預約，且至少有外部教師或創作者主動參與。
- P3 → P4：外部創作者持續產出內容；有付費意願的明確訊號。

---

## 16. 開發里程碑（Phase 1，4 週）

| 週 | 工作 | 產出 |
|---|---|---|
| 1 | 設計 Token、共用版型、資料結構、首頁骨架、列表／詳情頁 | 可瀏覽的靜態站 |
| 2 | 第一份 Scratch 完整教材＋遊玩外框（bridge、完成畫面） | 第一個完整學習體驗 |
| 3 | 其餘 6 份教材、教師／課程頁、表單串接 | 內容齊備 |
| 4 | 測試、RWD、無障礙、分析、法務頁、部署、小規模試用 | 上線 |

> 時間為目標而非保證；若教材製作超時，優先確保「1 份完整＋其餘逐步補」。

---

## 17. 風險與對策

| 風險 | 對策 |
|---|---|
| 冷啟動（無內容／使用者） | 創辦人先做原創教材；小規模試用 |
| 範圍過大 | 嚴守 P1 非目標清單 |
| 教材品質不一 | 檢核表＋人工審核 |
| 未成年安全與個資 | 家長窗口、最小蒐集、教師審核、法規確認 |
| 著作權／授權 | 原創聲明、授權標示、禁止未授權素材 |
| 商業化未驗證 | 先驗證預約與使用，再導入金流 |
| 單人維護負擔 | 內容 JSON 化、人工流程記錄於 Sheet、嚴控功能量 |
| 免費方案限制 | 監控用量；預留遷移路徑 |

---

## 18. 待決事項彙整

| # | 事項 | 建議預設 |
|---|---|---|
| 1 | 對外品牌名稱（LearnVillage／EduVerse） | LearnVillage |
| 2 | 教材預設授權 | 原創保留權利，開放個人學習使用 |
| 3 | Scratch 教材技術 | 自製互動 |
| 4 | Python 教材技術 | 模擬型＋小段 Pyodide |
| 5 | 體驗課是否免費、正式課價格區間 | 體驗課免費 |
| 6 | 分析工具 | Plausible 或 GA4 |
| 7 | 是否需要網域（P1 為 NT$0 可沿用 github.io） | 先不買 |
| 8 | 首批教師來源（含你本人？） | 你本人＋1–2 位合作者 |
| 9 | 法務諮詢時機 | P3 前完成 |

---

## 附錄 A：教材上架檢核表（可複製使用）
- [ ] id、標題、類別、難度、時間
- [ ] 學習目標（可驗證）
- [ ] 作者、授權、版本、來源
- [ ] 遊玩流程完整（開始→挑戰→完成→導流）
- [ ] 手機／桌機測試
- [ ] 素材授權確認
- [ ] JSON 已更新且 `status = published`

## 附錄 B：Google Form 欄位建議
**預約表單：** 家長姓名、聯絡方式（Email／LINE）、孩子年級、程式經驗、想上的課程、可上課時段、監護人同意（必勾）、備註。
**教材投稿表單：** 作者、Email、教材名稱、類別、難度、學習目標、預估時間、連結／附件、原創或授權聲明（必勾）、授權方式。
**教師申請表單：** 暱稱、專長、教學經驗、適合年齡、簡介、同意展示與審核（必勾）。
