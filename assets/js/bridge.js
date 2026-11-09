// 橋接：接收教材（iframe）用 postMessage 回報的事件，轉成平台的分析事件與畫面反應。
// 教材只需要呼叫 parent.postMessage({ type: "lv:play_complete", ... })，不用知道平台長怎樣。
import { track } from "./analytics.js";

export function initBridge(frame, handlers = {}) {
  window.addEventListener("message", (e) => {
    if (e.source !== frame.contentWindow) return; // 只信任這個 iframe
    const d = e.data;
    if (!d || typeof d.type !== "string" || !d.type.startsWith("lv:")) return;
    const name = d.type.slice(3); // play_start / challenge_complete / play_complete
    track(name, { material_id: d.materialId, step: d.step, total: d.total, score: d.score });
    if (typeof handlers[name] === "function") handlers[name](d);
  });
}
