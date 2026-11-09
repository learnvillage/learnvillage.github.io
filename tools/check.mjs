// 專案健檢：node tools/check.mjs
// 檢查 JSON 關聯、檔案是否存在、頁面連結、以及每個關卡「一定有解」。
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { simulate, shortestLength } from "../games/shared/grid-logic.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

let errors = 0;
const bad = (msg) => { errors++; console.log("  ✗", msg); };
const ok = (msg) => console.log("  ✓", msg);

console.log("【資料】");
const materials = json("data/materials.json");
const teachers = json("data/teachers.json");
const courses = json("data/courses.json");
const ids = (l) => new Set(l.map((x) => x.id));
for (const [name, list] of [["教材", materials], ["教師", teachers], ["課程", courses]]) {
  if (ids(list).size !== list.length) bad(`${name} 有重複的 id`);
}
const STATUS = ["draft", "review", "published", "archived"];
const LEVEL = ["beginner", "intermediate", "advanced"];
for (const m of materials) {
  if (!STATUS.includes(m.status)) bad(`${m.id} status 不合法：${m.status}`);
  if (!LEVEL.includes(m.level)) bad(`${m.id} level 不合法：${m.level}`);
  if (!ids(teachers).has(m.author_id)) bad(`${m.id} 的 author_id 找不到：${m.author_id}`);
  if (!existsSync(join(root, m.play_path))) bad(`${m.id} 的 play_path 檔案不存在：${m.play_path}`);
  if (!m.license) bad(`${m.id} 缺少 license`);
  if (!/^\d+\.\d+\.\d+$/.test(m.version)) bad(`${m.id} version 格式不對：${m.version}`);
  if (m.status === "published" && !(m.learning_goals || []).length) bad(`${m.id} 缺少學習目標`);
}
for (const c of courses) {
  if (!ids(teachers).has(c.teacher_id)) bad(`${c.id} 的 teacher_id 找不到：${c.teacher_id}`);
  for (const mid of c.material_ids || []) if (!ids(materials).has(mid)) bad(`${c.id} 的教材找不到：${mid}`);
}
const pubTeachers = new Set(teachers.filter((t) => t.status === "published").map((t) => t.id));
for (const m of materials.filter((x) => x.status === "published")) {
  if (!pubTeachers.has(m.author_id)) bad(`${m.id} 已上架，但作者 ${m.author_id} 尚未上架`);
}
if (!errors) ok(`${materials.length} 份教材、${teachers.length} 位教師、${courses.length} 門課程，關聯都正確`);

console.log("【頁面連結】");
const htmlFiles = ["index.html", ...readdirSync(join(root, "pages")).map((f) => `pages/${f}`)];
let linkCount = 0;
for (const f of htmlFiles) {
  const html = read(f);
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    linkCount++;
    if (!existsSync(resolve(join(root, dirname(f)), url))) bad(`${f} 的連結找不到檔案：${url}`);
  }
}
ok(`檢查了 ${linkCount} 個站內連結`);

console.log("【教材關卡】");
for (const m of materials) {
  const dir = dirname(m.play_path);
  const manifest = JSON.parse(readFileSync(join(root, dir, "manifest.json"), "utf8"));
  const content = await import(pathToFileURL(join(root, dir, "content.js")).href);
  const { concepts, challenges } = content;
  if (manifest.concepts !== concepts.length) bad(`${m.id} manifest 的概念數(${manifest.concepts})與內容(${concepts.length})不同`);
  if (manifest.challenges !== challenges.length) bad(`${m.id} manifest 的挑戰數(${manifest.challenges})與內容(${challenges.length})不同`);
  if (concepts.length > 3) bad(`${m.id} 概念頁超過 3 頁（規格：≤ 3）`);
  if (challenges.length < 2) bad(`${m.id} 挑戰少於 2 關（規格：至少 2 關）`);

  challenges.forEach((c, i) => {
    const tag = `${m.id} 第 ${i + 1} 關`;
    if (!c.title || !c.task) bad(`${tag} 缺少 title 或 task`);
    if (!c.hint) bad(`${tag} 沒有提示（規格：要有提示）`);
    if (manifest.engine === "grid") {
      const sim = simulate(c, c.solution);
      if (!sim.ok) bad(`${tag} 的 solution 走不到終點（結果：${sim.reason}）`);
      const best = shortestLength(c, c.allowed);
      if (best < 0) bad(`${tag} 無解！`);
      else if (c.solution.length > c.maxBlocks) bad(`${tag} 的 solution(${c.solution.length}) 超過 maxBlocks(${c.maxBlocks})`);
      else ok(`${tag}：有解，最短 ${best} 步，附解答 ${c.solution.length} 步，積木上限 ${c.maxBlocks}`);
      for (const name of c.solution) if (!c.allowed.includes(name)) bad(`${tag} 的 solution 用了不在 allowed 的積木：${name}`);
      const inBounds = (p) => p[0] >= 0 && p[1] >= 0 && p[0] < c.size[0] && p[1] < c.size[1];
      if (![c.start, c.goal].every(inBounds)) bad(`${tag} 起點或終點超出棋盤`);
      const wallSet = new Set((c.walls || []).map((p) => p.join(",")));
      if (wallSet.has(c.start.join(",")) || wallSet.has(c.goal.join(","))) bad(`${tag} 起點或終點被牆擋住`);
    } else if (c.type === "order") {
      const n = c.steps.length;
      const perm = [...c.display].sort((a, b) => a - b);
      if (perm.length !== n || perm.some((v, k) => v !== k)) bad(`${tag} display 不是 0..${n - 1} 的排列`);
      if (c.display.every((v, k) => v === k)) bad(`${tag} 初始排列已經是正確答案`);
      else ok(`${tag}：排序題 ${n} 步`);
    } else {
      if (!Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.options.length) bad(`${tag} answer 超出選項範圍`);
      else if (new Set(c.options).size !== c.options.length) bad(`${tag} 選項有重複`);
      else ok(`${tag}：選擇題 ${c.options.length} 個選項，答案「${c.options[c.answer]}」`);
    }
  });
}

console.log(errors ? `\n發現 ${errors} 個問題 ✗` : "\n全部通過 ✓");
process.exit(errors ? 1 : 0);
