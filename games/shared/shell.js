// 教材外殼：統一的「開始頁 → 概念講解 → 小挑戰 → 完成頁」流程（規格書 §7.3）。
// 各教材只要提供內容（concepts / challenges）與「單一挑戰怎麼玩」的 mount 函式。
import { emit, h } from "./lv-sdk.js";

/**
 * cfg = {
 *   root, title, badge, goal, learn:[…], minutes,
 *   concepts:[{ title, html }],
 *   challenges:[{ title, task(說明文字，可含 HTML), hint, success, ... }],
 *   mount(stageEl, challenge, ctx)   // ctx.say(text, kind) / ctx.complete({ clean, message })
 * }
 */
export function startGame(cfg) {
  const { root, challenges } = cfg;
  const total = challenges.length;
  const concepts = cfg.concepts || [];
  let results = [];

  const show = (...nodes) => {
    root.replaceChildren(...nodes);
    window.scrollTo(0, 0);
  };

  const dots = (i) =>
    h("div", { class: "g-dots", role: "img", "aria-label": `第 ${i + 1} 關，共 ${total} 關` },
      challenges.map((_, k) => h("span", { class: "g-dot" + (k < i ? " done" : k === i ? " now" : "") })));

  const top = (label, i) => h("div", { class: "g-top" }, h("strong", { class: "g-label" }, label), i == null ? null : dots(i));

  function intro() {
    results = [];
    show(
      h("div", { class: "g-card g-intro" },
        h("span", { class: "g-badge" }, cfg.badge || ""),
        h("h1", { class: "g-h1" }, cfg.title),
        h("p", { class: "g-lead" }, cfg.goal),
        h("ul", { class: "g-list" }, cfg.learn.map((t) => h("li", {}, t))),
        h("p", { class: "g-meta" }, `約 ${cfg.minutes} 分鐘・${total} 個小挑戰`),
        h("button", { class: "g-btn g-btn--big", type: "button", onclick: () => { emit("play_start"); concepts.length ? concept(0) : challenge(0); } }, "開始 ▶")
      )
    );
  }

  function concept(i) {
    const c = concepts[i];
    const last = i === concepts.length - 1;
    show(
      top(`認識概念 ${i + 1} / ${concepts.length}`),
      h("div", { class: "g-card" },
        h("h2", { class: "g-h2" }, c.title),
        h("div", { class: "g-body", html: c.html })
      ),
      h("div", { class: "g-actions" },
        i > 0 ? h("button", { class: "g-btn g-btn--ghost", type: "button", onclick: () => concept(i - 1) }, "← 上一頁") : null,
        h("button", { class: "g-btn g-btn--big", type: "button", onclick: () => (last ? challenge(0) : concept(i + 1)) }, last ? "開始挑戰 ▶" : "下一頁 →")
      )
    );
  }

  function challenge(i) {
    const c = challenges[i];
    const stage = h("div", { class: "g-stage" });
    const msg = h("div", { class: "g-msg", role: "status", "aria-live": "polite" });
    const hintBox = h("div", { class: "g-hint", hidden: true });
    const footer = h("div", { class: "g-actions" });
    let finished = false;

    const hintBtn = c.hint
      ? h("button", { class: "g-btn g-btn--ghost", type: "button", onclick: () => {
          hintBox.hidden = false;
          hintBox.textContent = "💡 " + c.hint;
        } }, "💡 提示")
      : null;

    const ctx = {
      say(text, kind = "") {
        msg.className = "g-msg " + kind;
        msg.textContent = text;
      },
      complete({ clean = true, message } = {}) {
        if (finished) return;
        finished = true;
        results.push(!!clean);
        emit("challenge_complete", { step: i + 1, total });
        ctx.say(message || c.success || "答對了！", "ok");
        if (hintBtn) hintBtn.hidden = true;
        footer.replaceChildren(
          h("button", { class: "g-btn g-btn--big", type: "button", onclick: () => (i + 1 < total ? challenge(i + 1) : finish()) },
            i + 1 < total ? "下一關 →" : "看成果 ★")
        );
        footer.querySelector("button").focus();
      },
    };

    show(
      top(`第 ${i + 1} 關`, i),
      h("h2", { class: "g-h2" }, c.title),
      h("p", { class: "g-goal", html: c.task }),
      stage, msg, hintBox,
      hintBtn ? h("div", { class: "g-actions" }, hintBtn) : null,
      footer
    );
    cfg.mount(stage, c, ctx);
  }

  function finish() {
    const score = results.filter(Boolean).length;
    emit("play_complete", { score, total });
    const line = score === total ? "全部一次過關，太厲害了！" : score >= total / 2 ? "很不錯！再玩一次也許能拿滿星。" : "完成了！多玩幾次就會越來越熟。";
    show(
      h("div", { class: "g-card g-finish" },
        h("div", { class: "g-stars", role: "img", "aria-label": `${score} 顆星，滿分 ${total} 顆` }, "★".repeat(score) + "☆".repeat(total - score)),
        h("h1", { class: "g-h1" }, "挑戰完成！"),
        h("p", { class: "g-lead" }, line),
        h("p", { class: "g-meta" }, "一次過關（沒有看答案、沒有答錯）才會拿到星星。"),
        h("div", { class: "g-actions g-actions--center" },
          h("button", { class: "g-btn g-btn--ghost", type: "button", onclick: intro }, "↺ 再玩一次"))
      )
    );
  }

  intro();
}
