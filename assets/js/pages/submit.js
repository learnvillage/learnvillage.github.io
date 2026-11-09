import { initPage, boot, esc } from "../ui.js";
import { routes } from "../config.js";

initPage({ active: "submit", title: "加入我們" });

const ITEMS = [
  {
    key: "submit_material",
    title: "投稿教材",
    text: "你做了適合孩子的互動教材嗎？填表投稿，審核通過後會上架並標示你的名字。需聲明為原創或已取得授權。",
    url: routes.apply("material"),
    cta: "填寫投稿表單",
  },
  {
    key: "apply_teacher",
    title: "申請成為教師",
    text: "想用 LearnVillage 的教材上課？填寫簡單資料，審核通過後會有專屬的教師介紹頁。",
    url: routes.apply("teacher"),
    cta: "填寫教師申請",
  },
  {
    key: "booking",
    title: "預約體驗課（家長）",
    text: "想讓孩子試上一堂？選好課程、留下聯絡方式，我們會親自聯絡你安排時間。",
    url: routes.book(),
    cta: "預約體驗課",
  },
];

boot(async () => {
  document.getElementById("main").innerHTML = `
    <h1>加入我們</h1>
    <p class="lead">不論你是創作者、老師還是家長，從這裡開始。</p>
    <div class="grid" style="margin-top:24px">
      ${ITEMS.map((it) => {
        return `<article class="card"><div class="card__body">
          <h3 class="card__title">${esc(it.title)}</h3>
          <p class="muted">${esc(it.text)}</p>
          <p style="margin-top:auto"><a class="btn btn--primary" href="${esc(it.url)}" data-track="cta_form_click" data-form="${it.key}">${esc(it.cta)} →</a></p>
        </div></article>`;
      }).join("")}
    </div>
    <p class="notice" style="margin-top:28px">投稿與教師資料都會由站長人工審核；請勿在表單中填寫孩子的全名或學校。詳見<a href="${routes.legal("#contribution")}">投稿授權條款</a>。</p>`;
});
