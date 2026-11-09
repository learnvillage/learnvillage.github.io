// 事件追蹤的唯一出口。之後要換成 Plausible 等工具，只改這個檔案。
import { GA_ID } from "./config.js";

let gaReady = false;

function initGA() {
  if (gaReady || !GA_ID) return;
  gaReady = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

export function track(name, params = {}) {
  initGA();
  const evt = { name, params, t: new Date().toISOString(), page: location.pathname };
  // 只存在使用者自己的瀏覽器：方便你開發時在 localStorage.lv_events 檢查事件有沒有送出
  try {
    const log = JSON.parse(localStorage.getItem("lv_events") || "[]");
    log.push(evt);
    localStorage.setItem("lv_events", JSON.stringify(log.slice(-300)));
  } catch (e) { /* 隱私模式等情況下忽略 */ }
  if (typeof window.gtag === "function") window.gtag("event", name, params);
  if (new URLSearchParams(location.search).has("debug")) console.log("[LV event]", name, params);
}
