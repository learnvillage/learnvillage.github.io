import { initPage, boot, esc, qs } from "../ui.js";
import { getTeacher, getTeachers, materialsOfTeacher, coursesOfTeacher } from "../data.js";
import { avatar, notFound, materialCard, courseCard } from "../render.js";
import { routes } from "../config.js";
import { track } from "../analytics.js";

initPage({ active: "teachers", title: "教師" });

boot(async () => {
  const id = qs("id");
  const t = id ? await getTeacher(id) : null;
  const main = document.getElementById("main");
  if (!t) { main.innerHTML = notFound("老師"); return; }
  document.title = `${t.display_name}｜LearnVillage`;
  track("teacher_view", { teacher_id: t.id });

  const [materials, courses, teachers] = await Promise.all([materialsOfTeacher(t.id), coursesOfTeacher(t.id), getTeachers()]);
  const first = courses[0];

  main.innerHTML = `
    <p class="crumbs"><a href="${routes.teachers()}">教師</a> › ${esc(t.display_name)}</p>
    <div class="detail">
      <div>
        <div class="author-box" style="margin-bottom:16px">${avatar(t, true)}
          <div><h1 style="margin:0">${esc(t.display_name)}</h1><p class="lead" style="margin:0">${esc(t.headline)}</p></div>
        </div>
        <div class="panel">
          <h2>關於老師</h2>
          <p>${esc(t.bio)}</p>
          <h3>教學風格</h3>
          <p>${esc(t.teaching_style)}</p>
        </div>
      </div>
      <aside class="detail__side">
        <div class="panel">
          <h3>專長</h3>
          <div class="tags">${(t.specialties || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
          <h3 style="margin-top:16px">適合年齡</h3>
          <div class="tags">${(t.age_groups || []).map((s) => `<span class="tag tag--plain">${esc(s)}</span>`).join("")}</div>
        </div>
        ${first ? `<div class="panel panel--soft">
          <h3>想試試看嗎？</h3>
          <p>先預約一堂體驗課，看看適不適合孩子。</p>
          <a class="btn btn--accent" href="${routes.course(first.id)}" data-track="cta_course_click" data-course="${esc(first.id)}" data-from="teacher">預約體驗 →</a>
        </div>` : ""}
      </aside>
    </div>

    ${materials.length ? `<section style="margin-top:48px"><h2>老師的教材</h2>
      <div class="grid">${materials.map((m) => materialCard(m, t)).join("")}</div></section>` : ""}
    ${courses.length ? `<section style="margin-top:48px"><h2>開設的課程</h2>
      <div class="grid">${courses.map((c) => courseCard(c, t)).join("")}</div></section>` : ""}`;
});
