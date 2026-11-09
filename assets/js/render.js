// 共用的卡片與狀態畫面
import { esc } from "./ui.js";
import { routes, abs } from "./config.js";
import { LEVELS } from "./filters.js";

export const catKey = (category) =>
  category === "Scratch" ? "scratch" : category === "Python" ? "python" : "logic";

export function cover(m) {
  if (m.cover) {
    return `<div class="cover cover--img"><img src="${esc(abs(m.cover))}" alt="${esc(m.title)}" loading="lazy"></div>`;
  }
  return `<div class="cover cover--${catKey(m.category)}" role="img" aria-label="${esc(m.title)} 封面"><span>${esc(
    m.cover_label || m.category
  )}</span></div>`;
}

export const tagCat = (m) => `<span class="tag tag--${catKey(m.category)}">${esc(m.category)}</span>`;
export const tagLevel = (m) => `<span class="tag tag--plain">${esc(LEVELS[m.level] || m.level)}</span>`;

export const FORMATS = { online_1on1: "線上 1 對 1", online_group: "線上小班" };
export const priceText = (c) => (c.price_twd === 0 ? "免費體驗" : `NT$ ${Number(c.price_twd).toLocaleString("zh-TW")}`);

export function materialCard(m, author) {
  return `<article class="card">
    ${cover(m)}
    <div class="card__body">
      <div class="tags">${tagCat(m)}${tagLevel(m)}<span class="tag tag--plain">約 ${m.estimated_minutes} 分鐘</span></div>
      <h3 class="card__title"><a href="${routes.material(m.id)}">${esc(m.title)}</a></h3>
      <p class="muted">${esc(m.description)}</p>
      <p class="card__by">作者：${esc(author ? author.display_name : "—")}</p>
    </div>
  </article>`;
}

export function avatar(t, large = false) {
  return `<div class="avatar${large ? " avatar--lg" : ""}" aria-hidden="true">${esc([...t.display_name][0] || "?")}</div>`;
}

export function teacherCard(t) {
  return `<article class="card card--teacher">
    <div class="card__body">
      ${avatar(t)}
      <div class="card__text">
        <h3 class="card__title"><a href="${routes.teacher(t.id)}">${esc(t.display_name)}</a></h3>
        <p class="muted">${esc(t.headline)}</p>
        <div class="tags">${(t.specialties || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
      </div>
    </div>
  </article>`;
}

export function courseCard(c, teacher) {
  return `<article class="card">
    <div class="card__body">
      <div class="tags"><span class="tag ${c.price_twd === 0 ? "tag--free" : "tag--plain"}">${priceText(c)}</span><span class="tag tag--plain">${c.duration_minutes} 分鐘</span><span class="tag tag--plain">${esc(FORMATS[c.format] || c.format)}</span></div>
      <h3 class="card__title"><a href="${routes.course(c.id)}">${esc(c.title)}</a></h3>
      <p class="muted">適合：${esc(c.audience)}</p>
      <p class="card__by">授課：${esc(teacher ? teacher.display_name : "—")}</p>
    </div>
  </article>`;
}

export function emptyState(message, actionHtml = "") {
  return `<div class="state"><h2>${esc(message)}</h2>${actionHtml}</div>`;
}

export function notFound(what) {
  return emptyState(`找不到這個${what}`, `<p class="muted">它可能已下架，或網址有誤。</p><a class="btn btn--ghost" href="${routes.home()}">回首頁</a>`);
}
