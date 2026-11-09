// 教材篩選：分類、難度、關鍵字
export const CATEGORIES = ["Scratch", "Python", "程式邏輯"];
export const LEVELS = { beginner: "入門", intermediate: "進階", advanced: "挑戰" };

export function filterMaterials(list, { q = "", cat = "", level = "" } = {}) {
  const k = q.trim().toLowerCase();
  return list.filter((m) => {
    if (cat && m.category !== cat) return false;
    if (level && m.level !== level) return false;
    if (!k) return true;
    const hay = [m.title, m.description, m.category, ...(m.tags || [])].join(" ").toLowerCase();
    return hay.includes(k);
  });
}

// 篩選條件寫在網址上，分享連結時對方會看到同樣的結果
export function readState() {
  const p = new URLSearchParams(location.search);
  return { q: p.get("q") || "", cat: p.get("cat") || "", level: p.get("level") || "" };
}
export function writeState(state) {
  const p = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => v && p.set(k, v));
  const qs = p.toString();
  history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
}
