import { initPage, boot, esc } from "../ui.js";
import { getMaterials, getTeachers } from "../data.js";
import { materialCard, emptyState } from "../render.js";
import { CATEGORIES, LEVELS, filterMaterials, readState, writeState } from "../filters.js";

initPage({ active: "materials", title: "教材" });

boot(async () => {
  const [materials, teachers] = await Promise.all([getMaterials(), getTeachers()]);
  const state = readState();

  document.getElementById("main").innerHTML = `
    <h1>互動教材</h1>
    <p class="lead">每份教材都能直接在瀏覽器裡玩，不用安裝。挑一個有興趣的開始吧！</p>
    <div class="filters" role="search">
      <label class="sr-only" for="q">搜尋教材</label>
      <input id="q" class="input" type="search" placeholder="搜尋標題或關鍵字" value="${esc(state.q)}">
      <div class="chips" id="cats" role="group" aria-label="分類"></div>
      <label class="sr-only" for="lvl">難度</label>
      <select id="lvl" class="select">
        <option value="">所有難度</option>
        ${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}"${state.level === k ? " selected" : ""}>${v}</option>`).join("")}
      </select>
    </div>
    <p id="count" class="muted" aria-live="polite"></p>
    <div id="list" class="grid"></div>`;

  const $q = document.getElementById("q");
  const $lvl = document.getElementById("lvl");
  const $cats = document.getElementById("cats");
  const $count = document.getElementById("count");
  const $list = document.getElementById("list");

  function renderChips() {
    $cats.innerHTML = [["", "全部"], ...CATEGORIES.map((c) => [c, c])]
      .map(([val, label]) => `<button type="button" class="chip" data-cat="${esc(val)}" aria-pressed="${state.cat === val}">${esc(label)}</button>`)
      .join("");
  }

  function render() {
    const result = filterMaterials(materials, state);
    $count.textContent = `共 ${result.length} 份教材`;
    $list.innerHTML = result.length
      ? result.map((m) => materialCard(m, teachers.find((t) => t.id === m.author_id))).join("")
      : `<div style="grid-column:1/-1">${emptyState("沒有符合條件的教材", '<button class="btn btn--ghost" id="clear" type="button">清除篩選</button>')}</div>`;
    writeState(state);
  }

  $q.addEventListener("input", () => { state.q = $q.value; render(); });
  $lvl.addEventListener("change", () => { state.level = $lvl.value; render(); });
  $cats.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    state.cat = b.dataset.cat;
    renderChips();
    render();
  });
  $list.addEventListener("click", (e) => {
    if (!e.target.closest("#clear")) return;
    Object.assign(state, { q: "", cat: "", level: "" });
    $q.value = "";
    $lvl.value = "";
    renderChips();
    render();
  });

  renderChips();
  render();
});
