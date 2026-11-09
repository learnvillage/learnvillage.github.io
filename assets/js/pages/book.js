// 體驗課預約（家長填寫）：資料寫進 Supabase 的 bookings 表
import { initPage, boot, esc, qs } from "../ui.js";
import { getCourses, getTeachers } from "../data.js";
import { priceText, FORMATS } from "../render.js";
import { routes } from "../config.js";
import { mountForm } from "../forms.js";
import { insertRow } from "../api.js";
import { track } from "../analytics.js";

initPage({ active: "courses", title: "預約體驗課" });

const GRADES = [
  "國小一年級", "國小二年級", "國小三年級", "國小四年級", "國小五年級", "國小六年級",
  "國中一年級", "國中二年級", "國中三年級", "其他",
];
const EXPERIENCE = ["完全沒學過", "玩過 Scratch", "學過一點 Python", "上過其他程式課", "不確定"];

boot(async () => {
  const [courses, teachers] = await Promise.all([getCourses(), getTeachers()]);
  const main = document.getElementById("main");
  const preset = courses.find((c) => c.id === qs("course"));

  main.innerHTML = `
    <p class="crumbs"><a href="${routes.courses()}">體驗課程</a> › 預約</p>
    <h1>預約體驗課</h1>
    <p class="lead">請由<strong>家長或監護人</strong>填寫。我們收到後會用你留下的聯絡方式，親自跟你約時間。</p>
    <div class="form-layout" style="margin-top:24px">
      <div id="form-root"></div>
      <aside class="detail__side" id="side"></aside>
    </div>`;

  const side = document.getElementById("side");
  function renderSide(courseId) {
    const c = courses.find((x) => x.id === courseId);
    const t = c && teachers.find((x) => x.id === c.teacher_id);
    side.innerHTML = `
      ${c ? `<div class="panel">
        <h3>${esc(c.title)}</h3>
        <dl class="meta-list">
          <dt>適合</dt><dd>${esc(c.audience)}</dd>
          <dt>時長</dt><dd>${c.duration_minutes} 分鐘</dd>
          <dt>方式</dt><dd>${esc(FORMATS[c.format] || c.format)}（${esc(c.platform)}）</dd>
          <dt>費用</dt><dd>${priceText(c)}</dd>
          ${t ? `<dt>老師</dt><dd>${esc(t.display_name)}</dd>` : ""}
        </dl>
        <p style="margin:12px 0 0"><a href="${routes.course(c.id)}">看課程內容 →</a></p>
      </div>` : ""}
      <div class="panel panel--soft">
        <h3>我們怎麼保護資料</h3>
        <ul style="margin:0;padding-left:1.2em">
          <li>只問孩子的年級，<strong>不需要孩子的全名或學校</strong>。</li>
          <li>資料只有站長看得到，只用來安排體驗課。</li>
          <li>想刪除資料，隨時跟我們說。<a href="${routes.legal("#privacy")}">隱私政策</a></li>
        </ul>
      </div>`;
  }
  renderSide(preset && preset.id);

  if (!courses.length) {
    document.getElementById("form-root").innerHTML = `<div class="state"><h2>目前沒有開放預約的課程</h2></div>`;
    return;
  }

  const fields = [
    { name: "course_id", label: "想上的課程", type: "select", required: true, value: preset ? preset.id : "",
      options: courses.map((c) => [c.id, `${c.title}（${priceText(c)}）`]) },
    { name: "guardian_name", label: "家長稱呼", required: true, max: 40, placeholder: "例如：王媽媽、陳先生" },
    { name: "contact_email", label: "Email", type: "email", max: 120, hint: "Email 和 LINE ID 至少留一個，方便我們聯絡你。" },
    { name: "contact_line", label: "LINE ID", max: 60 },
    { name: "student_grade", label: "孩子的年級", type: "select", required: true, options: GRADES.map((g) => [g, g]) },
    { name: "experience", label: "孩子的程式經驗", type: "select", options: EXPERIENCE.map((g) => [g, g]) },
    { name: "preferred_slots", label: "方便上課的時段", type: "textarea", rows: 3, required: true, max: 300,
      placeholder: "例如：平日晚上 7 點後、週六上午" },
    { name: "note", label: "想讓老師知道的事（選填）", type: "textarea", rows: 3, max: 1000,
      placeholder: "例如：孩子對做遊戲很有興趣" },
    { name: "guardian_consent", label: "監護人同意", type: "checkbox", required: true,
      labelHtml: `我是孩子的家長或監護人，同意 LearnVillage 依<a href="${routes.legal("#privacy")}" target="_blank" rel="noopener">隱私政策</a>使用以上資料聯絡我、安排體驗課。` },
  ];

  mountForm(document.getElementById("form-root"), {
    fields,
    submitLabel: "送出預約",
    validate: (v) => (!v.contact_email && !v.contact_line ? { contact_email: "Email 和 LINE ID 請至少填一個" } : {}),
    onSubmit: async (v) => {
      await insertRow("bookings", v);
      track("booking_submit", { course_id: v.course_id });
    },
    successHtml: (v) => {
      const c = courses.find((x) => x.id === v.course_id);
      return `<div class="success">
        <div class="success__icon" aria-hidden="true">✓</div>
        <h2>預約已送出，謝謝你！</h2>
        <p>我們收到「${esc(c ? c.title : "體驗課")}」的預約了，會在幾天內用你留下的${v.contact_email ? " Email" : ""}${v.contact_email && v.contact_line ? " 或" : ""}${v.contact_line ? " LINE" : ""}聯絡你。</p>
        <p class="muted">等待的時候，可以先讓孩子玩玩看免費教材。</p>
        <div class="btn-row">
          <a class="btn btn--primary" href="${routes.materials()}">去玩教材</a>
          <a class="btn btn--ghost" href="${routes.home()}">回首頁</a>
        </div>
      </div>`;
    },
  });

  document.getElementById("f-course_id").addEventListener("change", (e) => renderSide(e.target.value));
});
