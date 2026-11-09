// 教材投稿 / 教師申請：資料分別寫進 Supabase 的 material_submissions、teacher_applications 表
import { initPage, boot, esc, qs } from "../ui.js";
import { routes } from "../config.js";
import { mountForm } from "../forms.js";
import { insertRow } from "../api.js";
import { track } from "../analytics.js";
import { CATEGORIES, LEVELS } from "../filters.js";

const terms = () => `<a href="${routes.legal("#contribution")}" target="_blank" rel="noopener">投稿授權條款</a>`;

const KINDS = {
  material: {
    tab: "投稿教材",
    title: "投稿教材",
    lead: "你做了適合孩子的互動教材嗎？審核通過後會上架，並標示你的名字。",
    table: "material_submissions",
    event: "submit_material",
    submitLabel: "送出投稿",
    fields: () => [
      { name: "author_name", label: "作者名稱（會顯示在教材頁）", required: true, max: 40 },
      { name: "contact_email", label: "聯絡 Email", type: "email", required: true, max: 120, hint: "只用來通知審核結果，不會公開。" },
      { name: "title", label: "教材名稱", required: true, max: 80 },
      { name: "category", label: "類別", type: "select", required: true, options: [...CATEGORIES, "其他"].map((c) => [c, c]) },
      { name: "level", label: "難度", type: "select", required: true, options: Object.entries(LEVELS) },
      { name: "learning_goals", label: "學習目標", type: "textarea", required: true, max: 1000,
        hint: "孩子玩完之後會學會什麼？一行寫一個。", placeholder: "例如：\n看懂 x、y 座標\n會用迴圈重複動作" },
      { name: "estimated_minutes", label: "預估遊玩時間（分鐘）", type: "number", min: 1, maxValue: 180 },
      { name: "link_url", label: "教材連結", type: "url", max: 500,
        hint: "可以放雲端資料夾、GitHub、試玩網址等。請記得開啟分享權限。" },
      { name: "license_choice", label: "授權方式", type: "select", required: true, options: [
        ["原創，保留權利（開放個人學習使用）", "原創，保留權利（開放個人學習使用）"],
        ["CC BY-NC 4.0", "CC BY-NC 4.0（可非商業使用與改編，需標示作者）"],
        ["CC BY 4.0", "CC BY 4.0（可自由使用與改編，需標示作者）"],
        ["其他（寫在備註）", "其他（請寫在備註）"],
      ] },
      { name: "note", label: "備註（選填）", type: "textarea", rows: 3, max: 1000 },
      { name: "originality_consent", label: "原創聲明", type: "checkbox", required: true,
        labelHtml: `我聲明這份教材是我的原創作品，或我已取得所有素材的授權；沒有使用任職單位或第三方的教材。我已閱讀並同意${terms()}。` },
    ],
    done: "投稿已送出，謝謝你！",
    doneText: "我們會依照品質、授權與適齡檢核表審核，結果會寄到你留下的 Email。",
  },
  teacher: {
    tab: "申請成為教師",
    title: "申請成為教師",
    lead: "想用 LearnVillage 的教材上課？審核通過後會有專屬的教師介紹頁，你的聯絡方式不會公開。",
    table: "teacher_applications",
    event: "apply_teacher",
    submitLabel: "送出申請",
    fields: () => [
      { name: "display_name", label: "暱稱（會顯示在教師頁）", required: true, max: 40, placeholder: "例如：小黑老師" },
      { name: "contact_email", label: "聯絡 Email", type: "email", required: true, max: 120, hint: "只用來聯絡你，不會公開。" },
      { name: "specialties", label: "專長", required: true, max: 200, placeholder: "例如：Scratch、Python 入門、程式邏輯" },
      { name: "age_groups", label: "適合教的年齡", required: true, max: 100, placeholder: "例如：國小中高年級、國中" },
      { name: "experience", label: "教學經驗", type: "textarea", required: true, max: 1000,
        placeholder: "教過哪些對象、多久、用什麼方式上課" },
      { name: "bio", label: "自我介紹", type: "textarea", required: true, max: 1000,
        hint: "審核通過後會作為教師頁的簡介（之後還可以修改）。" },
      { name: "consent", label: "同意展示與審核", type: "checkbox", required: true,
        labelHtml: `我同意 LearnVillage 審核以上資料，並在通過後於網站展示暱稱、專長與自我介紹（不含聯絡方式）。我已閱讀${terms()}。` },
    ],
    done: "申請已送出，謝謝你！",
    doneText: "我們會看過你的資料後，用 Email 跟你聯絡。",
  },
};

boot(async () => {
  const type = KINDS[qs("type")] ? qs("type") : "material";
  const k = KINDS[type];
  initPage({ active: "submit", title: k.title });

  const main = document.getElementById("main");
  main.innerHTML = `
    <p class="crumbs"><a href="${routes.submit()}">加入我們</a> › ${esc(k.title)}</p>
    <h1>${esc(k.title)}</h1>
    <p class="lead">${esc(k.lead)}</p>
    <nav class="tabs" aria-label="表單類型">
      ${Object.entries(KINDS).map(([key, x]) =>
        `<a class="chip" href="${routes.apply(key)}" style="display:inline-flex;align-items:center;text-decoration:none"${key === type ? ' aria-pressed="true" aria-current="page"' : ""}>${esc(x.tab)}</a>`).join("")}
    </nav>
    <div class="form-layout">
      <div id="form-root"></div>
      <aside class="detail__side">
        <div class="panel panel--soft">
          <h3>審核流程</h3>
          <ol style="margin:0;padding-left:1.2em">
            <li>送出表單</li>
            <li>站長人工審核（品質、授權、適齡）</li>
            <li>用 Email 通知你結果</li>
            <li>通過後上架到網站</li>
          </ol>
        </div>
        <p class="notice" style="margin:0">請不要在表單中填寫任何孩子的姓名、學校或照片。</p>
      </aside>
    </div>`;

  mountForm(document.getElementById("form-root"), {
    fields: k.fields(),
    submitLabel: k.submitLabel,
    onSubmit: async (v) => {
      await insertRow(k.table, v);
      track(k.event, {});
    },
    successHtml: () => `<div class="success">
      <div class="success__icon" aria-hidden="true">✓</div>
      <h2>${esc(k.done)}</h2>
      <p>${esc(k.doneText)}</p>
      <div class="btn-row">
        <a class="btn btn--primary" href="${routes.materials()}">逛逛教材</a>
        <a class="btn btn--ghost" href="${routes.home()}">回首頁</a>
      </div>
    </div>`,
  });
});
