// 遊玩頁 = 「外框」。教材本體在 iframe 裡，透過 bridge 回報進度；
// 完成時由這一頁負責導流（再玩一次 / 下一份教材 / 看老師怎麼教）。
import { initPage, boot, esc, qs } from "../ui.js";
import { getMaterial, getMaterials, getTeacher, coursesForMaterial } from "../data.js";
import { notFound } from "../render.js";
import { routes, abs } from "../config.js";
import { initBridge } from "../bridge.js";

initPage({ active: "materials", title: "遊玩" });

boot(async () => {
  const id = qs("id");
  const m = id ? await getMaterial(id) : null;
  const main = document.getElementById("main");
  if (!m) { main.innerHTML = notFound("教材"); return; }
  document.title = `玩：${m.title}｜LearnVillage`;

  const [all, author, courses] = await Promise.all([getMaterials(), getTeacher(m.author_id), coursesForMaterial(m.id)]);
  const idx = all.findIndex((x) => x.id === m.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const gameUrl = `${abs(m.play_path)}?id=${encodeURIComponent(m.id)}`;

  main.innerHTML = `
    <p class="crumbs"><a href="${routes.materials()}">教材</a> › <a href="${routes.material(m.id)}">${esc(m.title)}</a> › 遊玩</p>
    <div class="play-head">
      <h1>${esc(m.title)}</h1>
      <a class="btn btn--ghost" href="${routes.material(m.id)}">教材介紹</a>
    </div>
    <iframe id="game" class="play-frame" title="${esc(m.title)} 互動教材" src="${esc(gameUrl)}" loading="eager"></iframe>

    <section id="done" class="complete-panel" hidden aria-live="polite">
      <h2 id="done-title">太棒了，你完成了！</h2>
      <p>想繼續嗎？選一個下一步：</p>
      <div class="btn-row">
        <button class="btn btn--ghost" id="replay" type="button">再玩一次</button>
        ${next && next.id !== m.id ? `<a class="btn btn--primary" href="${routes.play(next.id)}" data-track="next_material_click" data-material_id="${esc(next.id)}">下一份：${esc(next.title)}</a>` : ""}
        ${courses[0]
          ? `<a class="btn btn--accent" href="${routes.course(courses[0].id)}" data-track="cta_course_click" data-course="${esc(courses[0].id)}" data-from="play_complete">看看老師怎麼教 →</a>`
          : author ? `<a class="btn btn--accent" href="${routes.teacher(author.id)}" data-track="cta_teacher_click" data-teacher="${esc(author.id)}" data-from="play_complete">認識作者 ${esc(author.display_name)} →</a>` : ""}
      </div>
    </section>`;

  const frame = document.getElementById("game");
  const done = document.getElementById("done");

  initBridge(frame, {
    play_start() { done.hidden = true; },
    play_complete(d) {
      document.getElementById("done-title").textContent =
        d.total ? `太棒了！你完成了 ${d.total} 個挑戰` : "太棒了，你完成了！";
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  });

  document.getElementById("replay").addEventListener("click", () => {
    done.hidden = true;
    frame.src = gameUrl;
    frame.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});
