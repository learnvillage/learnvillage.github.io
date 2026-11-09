// ============================================================
// 全站設定：你最常改的就是這個檔案
// ============================================================

// 網站根目錄的網址（自動判斷，放在 GitHub Pages 子路徑也能正常運作）
export const ROOT = new URL("../../", import.meta.url).href;
export const abs = (path) => new URL(path, ROOT).href;

export const SITE = {
  name: "LearnVillage",
  tagline: "學習村落",
  year: 2026,
};

// ★ Supabase：站內表單（預約、投稿、教師申請）送出的資料存在這裡。
//   這兩個值本來就會公開在網頁上，安全性靠資料庫的 RLS 權限（見 supabase/schema.sql）。
//   ⚠ 絕對不要把 secret / service_role key 放進這個檔案。
export const SUPABASE = {
  url: "https://ntqdelaycmnabojsqyos.supabase.co",
  key: "sb_publishable_P1q3Wf2TRnKa9jHk2XYbfA_MiyF1mM-",
};

// ★ 想用 Google Analytics 4 就填測量 ID（例如 "G-XXXXXXXXXX"），留空則不載入任何外部分析
export const GA_ID = "";

// 全站連結都從這裡產生，之後改網址結構只要改這一處
export const routes = {
  home: () => abs("index.html"),
  materials: () => abs("pages/materials.html"),
  material: (id) => abs(`pages/material-detail.html?id=${encodeURIComponent(id)}`),
  play: (id) => abs(`pages/play.html?id=${encodeURIComponent(id)}`),
  teachers: () => abs("pages/teachers.html"),
  teacher: (id) => abs(`pages/teacher-detail.html?id=${encodeURIComponent(id)}`),
  courses: () => abs("pages/courses.html"),
  course: (id) => abs(`pages/course-detail.html?id=${encodeURIComponent(id)}`),
  submit: () => abs("pages/submit.html"),
  book: (courseId = "") => abs(`pages/book.html${courseId ? `?course=${encodeURIComponent(courseId)}` : ""}`),
  apply: (type) => abs(`pages/apply.html?type=${encodeURIComponent(type)}`),
  about: () => abs("pages/about.html"),
  legal: (hash = "") => abs(`pages/legal.html${hash}`),
};
