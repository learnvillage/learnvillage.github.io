// 方格移動引擎：用積木排出路線，讓角色走到終點。用在 Scratch 風格的座標教材。
import { h, sleep } from "./lv-sdk.js";
import { CMD, simulate } from "./grid-logic.js";

export function mountGrid(stage, c, ctx) {
  const [w, hh] = c.size;
  const CELL = w >= 6 ? 44 : w >= 5 ? 48 : 56;
  const allowed = c.allowed || Object.keys(CMD);
  const max = c.maxBlocks || 12;
  const walls = new Set((c.walls || []).map((p) => p.join(",")));

  let program = [];
  let running = false;
  let finished = false;
  let fails = 0;
  let usedSolution = false;
  let pos = [...c.start];

  // ---------- 棋盤 ----------
  const hero = h("div", { class: "gg-hero", "aria-hidden": "true" }, h("i"));
  const field = h("div", { class: "gg-field" });
  const cells = {};
  for (let y = hh - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      const cell = h("div", { class: "gg-cell" + (walls.has(`${x},${y}`) ? " wall" : "") + (x === c.goal[0] && y === c.goal[1] ? " goal" : "") });
      cells[`${x},${y}`] = cell;
      field.append(cell);
    }
  }
  field.append(hero);

  const yAxis = h("div", { class: "gg-y" });
  for (let y = hh - 1; y >= 0; y--) yAxis.append(h("span", {}, String(y)));
  const xAxis = h("div", { class: "gg-x" });
  for (let x = 0; x < w; x++) xAxis.append(h("span", {}, String(x)));

  const board = h("div", {
    class: "gg-board",
    style: `--cell:${CELL}px;--w:${w};--h:${hh}`,
    role: "img",
    "aria-label": `${w} 乘 ${hh} 的方格。角色從 x=${c.start[0]}, y=${c.start[1]} 出發，終點在 x=${c.goal[0]}, y=${c.goal[1]}。`,
  }, yAxis, field, h("span"), xAxis);

  const readout = h("p", { class: "gg-readout", "aria-live": "off" });

  function placeHero(p, animate = true) {
    hero.style.transition = animate ? "" : "none";
    hero.style.transform = `translate(${p[0] * CELL}px, ${(hh - 1 - p[1]) * CELL}px)`;
    pos = [...p];
    readout.textContent = `角色位置：x = ${p[0]}，y = ${p[1]}　｜　終點：x = ${c.goal[0]}，y = ${c.goal[1]}`;
  }
  function clearTrail() { Object.values(cells).forEach((el) => el.classList.remove("trail")); }
  function resetHero() { placeHero(c.start, false); clearTrail(); void hero.offsetWidth; hero.style.transition = ""; }

  // ---------- 積木 ----------
  const progList = h("ol", { class: "gg-prog", "aria-label": "你的程式" });
  const count = h("span", { class: "gg-count" });

  function renderProgram(active = -1) {
    progList.replaceChildren(
      ...(program.length
        ? program.map((name, i) =>
            h("li", {},
              h("button", {
                class: "blk blk--prog" + (i === active ? " active" : ""),
                type: "button",
                disabled: running,
                "aria-label": `第 ${i + 1} 個：${CMD[name].label}，點一下移除`,
                onclick: () => { program.splice(i, 1); renderProgram(); },
              }, `${CMD[name].icon} ${CMD[name].label}`)))
        : [h("li", { class: "gg-empty" }, "從下面點積木，排在這裡")])
    );
    count.textContent = `${program.length} / ${max} 個積木`;
  }

  function add(name) {
    if (running || finished) return;
    if (program.length >= max) { ctx.say(`積木太多了，最多 ${max} 個。`, "warn"); return; }
    program.push(name);
    renderProgram();
  }

  const palette = h("div", { class: "gg-palette", role: "group", "aria-label": "積木" },
    allowed.map((name) =>
      h("button", { class: "blk", type: "button", onclick: () => add(name) }, `${CMD[name].icon} ${CMD[name].label}`)));

  // ---------- 控制 ----------
  const runBtn = h("button", { class: "g-btn g-btn--big", type: "button", onclick: run }, "▶ 執行");
  const undoBtn = h("button", { class: "g-btn g-btn--ghost", type: "button", onclick: () => { if (!running && !finished) { program.pop(); renderProgram(); } } }, "↩ 退回");
  const clearBtn = h("button", { class: "g-btn g-btn--ghost", type: "button", onclick: () => { if (!running && !finished) { program = []; usedSolution = usedSolution; renderProgram(); resetHero(); } } }, "清除");
  const answerBtn = h("button", { class: "g-btn g-btn--ghost", type: "button", hidden: true, onclick: () => {
    if (running || finished) return;
    usedSolution = true;
    program = [...c.solution];
    renderProgram();
    resetHero();
    ctx.say("已經幫你排好答案了，按「執行」看看它怎麼走。", "warn");
  } }, "看答案");

  function setBusy(b) {
    running = b;
    [runBtn, undoBtn, clearBtn, answerBtn].forEach((el) => (el.disabled = b || (finished && el !== runBtn)));
    runBtn.disabled = b || finished;
    palette.querySelectorAll("button").forEach((el) => (el.disabled = b || finished));
  }

  async function run() {
    if (running || finished) return;
    if (!program.length) { ctx.say("先點下面的積木，排出路線喔。", "warn"); return; }
    setBusy(true);
    resetHero();
    await sleep(60);
    const res = simulate(c, program);

    for (let k = 0; k < program.length; k++) {
      renderProgram(k);
      const next = res.path[k + 1];
      if (!next) {
        // 這一步走不過去：往前頂一下再彈回來
        const d = CMD[program[k]];
        hero.style.transform = `translate(${pos[0] * CELL + d.dx * 10}px, ${(hh - 1 - pos[1]) * CELL - d.dy * 10}px)`;
        await sleep(220);
        placeHero(pos);
        ctx.say(res.reason === "wall" ? `第 ${k + 1} 個積木撞到牆了！換個方向試試。` : `第 ${k + 1} 個積木走出舞台了！`, "bad");
        break;
      }
      placeHero(next);
      cells[next.join(",")].classList.add("trail");
      await sleep(380);
    }
    renderProgram();

    if (res.ok) {
      finished = true;
      setBusy(false);
      ctx.complete({
        clean: !usedSolution,
        message: usedSolution ? "走到終點了！下次試著自己排排看。" : c.success || "走到終點了，太棒了！",
      });
      return;
    }
    if (res.reason === "short") {
      ctx.say(`還沒走到終點：現在在 (${res.end[0]}, ${res.end[1]})，終點在 (${c.goal[0]}, ${c.goal[1]})。`, "bad");
    }
    fails++;
    await sleep(500);
    resetHero();
    if (fails >= 3) answerBtn.hidden = false;
    setBusy(false);
  }

  stage.append(
    board, readout,
    h("p", { class: "gg-label" }, "積木（點一下加入）"), palette,
    h("p", { class: "gg-label" }, "你的程式（點積木可以移除）", count), progList,
    h("div", { class: "g-actions" }, runBtn, undoBtn, clearBtn, answerBtn)
  );
  renderProgram();
  placeHero(c.start, false);
}
