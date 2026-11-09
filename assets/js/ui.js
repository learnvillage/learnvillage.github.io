// 共用 UI：導覽列、頁尾、頁面初始化、錯誤處理
import { SITE, routes } from "./config.js";
import { track } from "./analytics.js";

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const NAV = [
  ["materials", "教材", () => routes.materials()],
  ["teachers", "教師", () => routes.teachers()],
  ["courses", "體驗課程", () => routes.courses()],
  ["submit", "加入我們", () => routes.submit()],
  ["about", "關於", () => routes.about()],
];

const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#17806d"/><text x="32" y="45" font-size="38" font-weight="800" text-anchor="middle" fill="#fff" font-family="sans-serif">L</text></svg>'
  );

/**
 * 每一頁開頭呼叫一次：設定標題、畫導覽列與頁尾、送出 page_view。
 * active：目前所在的導覽項目（"materials" 等），首頁傳 "home"
 */
export function initPage({ active = "", title = "" } = {}) {
  document.title = title ? `${title}｜${SITE.name}` : `${SITE.name}｜${SITE.tagline}`;

  if (!document.querySelector('link[rel="icon"]')) {
    const l = document.createElement("link");
    l.rel = "icon";
    l.href = ICON;
    document.head.appendChild(l);
  }

  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#main";
  skip.textContent = "跳到主要內容";
  document.body.prepend(skip);

  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <div class="container">
        <a class="brand" href="${routes.home()}"><span class="brand-mark" aria-hidden="true">L</span>${esc(SITE.name)}</a>
        <nav class="nav" aria-label="主選單">
          ${NAV.map(([key, label, href]) =>
            `<a href="${href()}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`
          ).join("")}
        </nav>
      </div>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-row">
          <div><strong>${esc(SITE.name)}</strong>｜${esc(SITE.tagline)}<br>讓孩子透過互動遊戲學會程式。</div>
          <nav aria-label="頁尾選單">
            <a href="${routes.about()}">關於</a>
            <a href="${routes.submit()}">投稿與預約</a>
            <a href="${routes.legal("#terms")}">使用條款</a>
            <a href="${routes.legal("#privacy")}">隱私政策</a>
          </nav>
        </div>
        <small>© ${SITE.year} ${esc(SITE.name)}。本站教材皆為原創的互動練習。Scratch 為 Scratch 基金會與 MIT Media Lab 的專案，本站與其無隸屬關係。</small>
      </div>`;
  }

  // 任何帶 data-track 的元素被點擊，就送出對應事件（例如 data-track="cta_course_click" data-course="course-001"）
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track]");
    if (!el) return;
    const { track: name, ...params } = el.dataset;
    track(name, params);
  });

  track("page_view", { page: active || "home" });
}

export function errorState(err) {
  console.error(err);
  const local = location.protocol === "file:";
  return `<div class="state">
    <h2>頁面沒有順利載入</h2>
    <p class="muted">${
      local
        ? "你可能是直接用「雙擊檔案」開啟的。請改用專案根目錄的 <code>start.bat</code>，或在 VS Code 用 Live Server 開啟。"
        : "請重新整理再試一次；如果還是不行，請回報給站長。"
    }</p>
    <a class="btn btn--ghost" href="${routes.home()}">回首頁</a>
  </div>`;
}

/** 包住頁面的非同步載入，出錯時顯示友善訊息而不是空白頁 */
export async function boot(fn) {
  try {
    await fn();
  } catch (err) {
    const main = document.getElementById("main");
    if (main) main.innerHTML = errorState(err);
  }
}

export function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

export function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
