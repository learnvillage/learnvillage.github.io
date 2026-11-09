// 資料層：頁面只透過這裡取資料。之後換成 Supabase，只需要改這個檔案。
import { abs } from "./config.js";

let cache = null;

async function loadJson(name) {
  const res = await fetch(abs(`data/${name}.json`));
  if (!res.ok) throw new Error(`讀取 ${name}.json 失敗（${res.status}）`);
  return res.json();
}

export function loadAll() {
  if (!cache) {
    cache = Promise.all([loadJson("materials"), loadJson("teachers"), loadJson("courses")]).then(
      ([materials, teachers, courses]) => ({ materials, teachers, courses })
    );
  }
  return cache;
}

const published = (list) => list.filter((x) => x.status === "published");

export async function getMaterials() { return published((await loadAll()).materials); }
export async function getTeachers() { return published((await loadAll()).teachers); }
export async function getCourses() { return published((await loadAll()).courses); }

export async function getMaterial(id) { return (await getMaterials()).find((x) => x.id === id) || null; }
export async function getTeacher(id) { return (await getTeachers()).find((x) => x.id === id) || null; }
export async function getCourse(id) { return (await getCourses()).find((x) => x.id === id) || null; }

// ---- 三者互連：關係都由「單一來源欄位」推算，避免兩邊資料不一致 ----
// material.author_id → 作者；course.teacher_id → 授課教師；course.material_ids → 課程用到的教材
export async function coursesForMaterial(materialId) {
  return (await getCourses()).filter((c) => (c.material_ids || []).includes(materialId));
}
export async function materialsForCourse(course) {
  const all = await getMaterials();
  return (course.material_ids || []).map((id) => all.find((m) => m.id === id)).filter(Boolean);
}
export async function materialsOfTeacher(teacherId) {
  return (await getMaterials()).filter((m) => m.author_id === teacherId);
}
export async function coursesOfTeacher(teacherId) {
  return (await getCourses()).filter((c) => c.teacher_id === teacherId);
}
