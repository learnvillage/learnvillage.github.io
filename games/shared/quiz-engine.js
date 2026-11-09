// 題目引擎：選擇題（可附程式碼）與排序題。用在程式邏輯與 Python 教材。
import { h } from "./lv-sdk.js";

export function mountQuiz(stage, c, ctx) {
  if (c.type === "order") return mountOrder(stage, c, ctx);
  return mountChoice(stage, c, ctx);
}

// ---------- 選擇題 ----------
// c = { prompt(html), code?(純文字), options:[…], answer:index, explain?, wrong? }
function mountChoice(stage, c, ctx) {
  let wrong = 0;
  const list = h("div", { class: "q-options", role: "group", "aria-label": "選項" });

  c.options.forEach((opt, idx) => {
    const b = h("button", { class: "q-opt", type: "button", onclick: () => pick(idx, b) }, opt);
    list.append(b);
  });

  function pick(idx, b) {
    if (idx === c.answer) {
      b.classList.add("ok");
      list.querySelectorAll("button").forEach((x) => (x.disabled = true));
      ctx.complete({ clean: wrong === 0, message: "答對了！" + (c.explain ? " " + c.explain : "") });
    } else {
      wrong++;
      b.classList.add("bad");
      b.disabled = true;
      ctx.say(c.wrong || "還不是喔，再想想看。需要的話可以按「提示」。", "bad");
    }
  }

  stage.append(
    c.prompt ? h("p", { class: "q-prompt", html: c.prompt }) : null,
    c.code ? h("pre", { class: "q-code" }, h("code", {}, c.code)) : null,
    list
  );
}

// ---------- 排序題 ----------
// c = { steps:[正確順序], display:[初始排列用的索引], prompt? }
function mountOrder(stage, c, ctx) {
  const items = c.steps.map((text, i) => ({ text, i }));
  let answer = [];
  let checks = 0;
  let usedAnswer = false;
  let done = false;

  const pool = h("div", { class: "q-pool", role: "group", "aria-label": "待排的步驟" });
  const line = h("ol", { class: "q-line", "aria-label": "你的排列" });
  const checkBtn = h("button", { class: "g-btn g-btn--big", type: "button", onclick: check }, "檢查順序");
  const resetBtn = h("button", { class: "g-btn g-btn--ghost", type: "button", onclick: () => { if (!done) { answer = []; render(); } } }, "重排");
  const answerBtn = h("button", { class: "g-btn g-btn--ghost", type: "button", hidden: true, onclick: () => {
    if (done) return;
    usedAnswer = true;
    answer = [...items];
    render();
    ctx.say("已經幫你排好了，按「檢查順序」確認。", "warn");
  } }, "看答案");

  function render() {
    pool.replaceChildren(
      ...c.display.map((i) => items[i]).filter((it) => !answer.includes(it)).map((it) =>
        h("button", { class: "q-item", type: "button", disabled: done, onclick: () => { answer.push(it); render(); } }, it.text))
    );
    line.replaceChildren(
      ...(answer.length
        ? answer.map((it, k) =>
            h("li", {}, h("button", { class: "q-item q-item--set", type: "button", disabled: done,
              "aria-label": `第 ${k + 1} 步：${it.text}，點一下放回去`,
              onclick: () => { answer.splice(k, 1); render(); } }, it.text)))
        : [h("li", { class: "gg-empty" }, "點下面的步驟，照順序排在這裡")])
    );
    checkBtn.disabled = done || answer.length !== items.length;
  }

  function check() {
    if (done) return;
    const bad = answer.findIndex((it, k) => it.i !== k);
    if (bad === -1) {
      done = true;
      render();
      ctx.complete({ clean: checks === 0 && !usedAnswer, message: "順序正確！" + (c.explain ? " " + c.explain : "") });
    } else {
      checks++;
      ctx.say(`第 ${bad + 1} 步好像不太對，點它可以放回去重排。`, "bad");
      if (checks >= 2) answerBtn.hidden = false;
    }
  }

  stage.append(
    c.prompt ? h("p", { class: "q-prompt", html: c.prompt }) : null,
    h("p", { class: "gg-label" }, "你的排列"), line,
    h("p", { class: "gg-label" }, "待排的步驟"), pool,
    h("div", { class: "g-actions" }, checkBtn, resetBtn, answerBtn)
  );
  render();
}
