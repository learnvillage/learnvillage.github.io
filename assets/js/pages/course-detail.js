import { initPage, boot, esc, qs } from "../ui.js";
import { getCourse, getTeacher, materialsForCourse } from "../data.js";
import { notFound, avatar, materialCard, priceText, FORMATS } from "../render.js";
import { routes } from "../config.js";
import { track } from "../analytics.js";

initPage({ active: "courses", title: "課程" });

boot(async () => {
  const id = qs("id");
  const c = id ? await getCourse(id) : null;
  const main = document.getElementById("main");
  if (!c) { main.innerHTML = notFound("課程"); return; }
  document.title = `${c.title}｜LearnVillage`;
  track("course_view", { course_id: c.id });

  const [teacher, materials] = await Promise.all([getTeacher(c.teacher_id), materialsForCourse(c)]);

  main.innerHTML = `
    <p class="crumbs"><a href="${routes.courses()}">體驗課程</a> › ${esc(c.title)}</p>
    <div class="detail">
      <div>
        <div class="tags"><span class="tag ${c.price_twd === 0 ? "tag--free" : "tag--plain"}">${priceText(c)}</span></div>
        <h1>${esc(c.title)}</h1>
        <div class="panel">
          <h2>課程內容</h2>
          <ol>${(c.outline || []).map((o) => `<li>${esc(o)}</li>`).join("")}</ol>
        </div>
        ${materials.length ? `<section style="margin-top:36px"><h2>課程會用到的教材</h2><p class="muted">上課前可以先玩玩看，熟悉一下。</p>
          <div class="grid">${materials.map((m) => materialCard(m, teacher)).join("")}</div></section>` : ""}
      </div>

      <aside class="detail__side">
        <div class="panel panel--soft">
          <h3>預約體驗</h3>
          <dl class="meta-list">
            <dt>適合</dt><dd>${esc(c.audience)}</dd>
            <dt>時長</dt><dd>${c.duration_minutes} 分鐘</dd>
            <dt>方式</dt><dd>${esc(FORMATS[c.format] || c.format)}（${esc(c.platform)}）</dd>
            <dt>費用</dt><dd>${priceText(c)}</dd>
          </dl>
          <p style="margin-top:16px">
            <a class="btn btn--accent" href="${routes.book(c.id)}" data-track="booking_click" data-course="${esc(c.id)}">預約體驗課 →</a>
          </p>
          <p class="muted" style="font-size:.9rem;margin:0">由家長填寫即可，不需要提供孩子的全名或學校。我們收到後會親自聯絡你。</p>
        </div>
        ${teacher ? `<div class="panel"><h3>授課老師</h3>
          <div class="author-box">${avatar(teacher)}<div><a href="${routes.teacher(teacher.id)}">${esc(teacher.display_name)}</a><br><span class="muted">${esc(teacher.headline)}</span></div></div>
        </div>` : ""}
      </aside>
    </div>`;
});
