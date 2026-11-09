// 寫入層：站內表單送出資料都經過這裡（讀取內容仍由 data.js 負責）。
// 直接呼叫 Supabase 的 REST API，不需要載入額外套件。
import { SUPABASE } from "./config.js";

export class SubmitError extends Error {
  constructor(kind, detail) {
    super(kind);
    this.kind = kind; // "config" | "network" | "rejected"
    this.detail = detail;
  }
}

/** 新增一筆資料。訪客只有「新增」權限，所以不回傳內容（return=minimal）。 */
export async function insertRow(table, row) {
  if (!SUPABASE.url || !SUPABASE.key) throw new SubmitError("config");
  let res;
  try {
    res = await fetch(`${SUPABASE.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE.key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    throw new SubmitError("network", e);
  }
  if (!res.ok) {
    let detail = null;
    try { detail = await res.json(); } catch (e) { /* 沒有內容 */ }
    console.error(`[LearnVillage] 寫入 ${table} 失敗`, res.status, detail);
    throw new SubmitError("rejected", detail);
  }
}
