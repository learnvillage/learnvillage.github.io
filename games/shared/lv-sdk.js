// 教材 SDK：每份教材都透過這裡跟平台外框溝通。
// 事件格式請見規格書 §7.2：{ type: "lv:play_start" | "lv:challenge_complete" | "lv:play_complete", materialId, ... }
const params = new URLSearchParams(location.search);
export const materialId = params.get("id") || document.documentElement.dataset.materialId || "unknown";

export function emit(type, data = {}) {
  try {
    parent.postMessage({ type: `lv:${type}`, materialId, ...data }, "*");
  } catch (e) { /* 單獨開啟教材（沒有外框）時忽略 */ }
}

/** 小型 DOM 產生器：h("button", { class: "x", onclick: fn }, "文字", 子元素) */
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (typeof v === "boolean") el[k] = v;
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false || kid === "") continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
