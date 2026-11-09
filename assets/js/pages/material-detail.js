import { initPage, boot, esc, qs, toast } from "../ui.js";
import { getMaterial, getMaterials, getTeacher, coursesForMaterial, getTeachers } from "../data.js";
import { cover, tagCat, tagLevel, notFound, avatar, courseCard, materialCard } from "../render.js";
import { routes } from "../config.js";
import { track } from "../analytics.js";

initPage({ active: "materials", title: "教材" });

boot(async () => {
  const id = qs("id");
  const m = id ? await getMaterial(id) : null;
  const main = document.getElementById("main");
  if (!m) { main.innerHTML = notFound("教材"); return; }

  document.title = `${m.title}｜LearnVillage`;
  track("material_view", { material_id: m.id });

  const [author, courses, allMaterials, teachers] = await Promise.all([
    getTeacher(m.author_id), coursesForMaterial(m.id), getMaterials(), getTeachers(),
  ]);
  const related = allMaterials.filter((x) => x.id !== m.id).slice(0, 3);

  main.innerHTML = `
    <p class="crumbs"><a href="${routes.materials()}">教材</a> › ${esc(m.title)}</p>
    <div class="detail">
      <div>
        ${cover(m)}
        <div class="tags">${tagCat(m)}${tagLevel(m)}</div>
        <h1>${esc(m.title)}</h1>
        <p class="lead">${esc(m.description)}</p>
        <div class="btn-row">
          <a class="btn btn--accent" href="${routes.play(m.id)}" data-track="cta_play_click" data-material_id="${esc(m.id)}">開始遊玩 ▶</a>
          <button class="btn btn--ghost" id="share" type="button">複製分享連結</button>
        </div>

        <div class="panel" style="margin-top:28px">
          <h2>你會學到</h2>
          <ul class="checks">${(m.learning_goals || []).map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
          <h3>先備知識</h3>
          <p class="muted">${(m.prerequisites || []).length ? esc(m.prerequisites.join("、")) : "不需要，直接開始就可以。"}</p>
        </div>
      </div>

      <aside class="detail__side">
        <div class="panel">
          <h3>教材資訊</h3>
          <dl class="meta-list">
            <dt>預估時間</dt><dd>約 ${m.estimated_minutes} 分鐘</dd>
            <dt>版本</dt><dd>${esc(m.version)}</dd>
            <dt>授權</dt><dd>${esc(m.license)}</dd>
            <dt>更新</dt><dd>${esc(m.updated_at)}</dd>
          </dl>
        </div>
        ${author ? `<div class="panel">
          <h3>作者</h3>
          <div class="author-box">${avatar(author)}<div><a href="${routes.teacher(author.id)}">${esc(author.display_name)}</a><br><span class="muted">${esc(author.headline)}</span></div></div>
        </div>` : ""}
        ${courses.length ? `<div class="panel panel--soft">
          <h3>想要老師陪著學？</h3>
          <p>這份教材會用在下面的體驗課：</p>
          ${courses.map((c) => `<p><a href="${routes.course(c.id)}" data-track="cta_course_click" data-course="${esc(c.id)}" data-from="material">${esc(c.title)} →</a></p>`).join("")}
        </div>` : ""}
      </aside>
    </div>

    ${related.length ? `<section style="margin-top:48px">
      <h2>也來玩玩這些</h2>
      <div class="grid">${related.map((x) => materialCard(x, teachers.find((t) => t.id === x.author_id))).join("")}</div>
    </section>` : ""}`;

  document.getElementById("share").addEventListener("click", async () => {
    const url = routes.material(m.id);
    try {
      await navigator.clipboard.writeText(url);
      toast("已複製連結！");
    } catch (e) {
      window.prompt("複製這個連結：", url);
    }
    track("share_click", { material_id: m.id });
  });
});
