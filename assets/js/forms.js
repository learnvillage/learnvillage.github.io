// 通用表單：用一份欄位設定畫出表單、檢查必填、送出、顯示成功或錯誤。
// 預約、投稿、教師申請三張表單都用這個，只差在欄位設定。
import { esc } from "./ui.js";

/**
 * 欄位設定：
 * { name, label, type: "text"|"email"|"url"|"number"|"textarea"|"select"|"checkbox",
 *   required?, max?(字數上限), min?/maxValue?(數字範圍), options?: [[value, label]],
 *   hint?, placeholder?, value?, labelHtml?(checkbox 用，可含連結) }
 */
function fieldHtml(f) {
  const id = `f-${f.name}`;
  const req = f.required ? ' <span class="field__req" aria-hidden="true">必填</span>' : "";
  const hint = f.hint ? `<p class="field__hint" id="${id}-hint">${esc(f.hint)}</p>` : "";
  const describedBy = `${f.hint ? `${id}-hint ` : ""}${id}-err`;
  const common = `id="${id}" name="${f.name}" aria-describedby="${describedBy}"${f.required ? " required" : ""}`;
  const err = `<p class="field__error" id="${id}-err" hidden></p>`;

  if (f.type === "checkbox") {
    return `<div class="field field--check" data-field="${f.name}">
      <label class="check"><input type="checkbox" ${common}${f.value ? " checked" : ""}><span>${f.labelHtml || esc(f.label)}${req}</span></label>
      ${hint}${err}
    </div>`;
  }

  let control;
  const max = f.max ? ` maxlength="${f.max}"` : "";
  const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : "";
  if (f.type === "textarea") {
    control = `<textarea class="field__control" rows="${f.rows || 4}" ${common}${max}${ph}>${esc(f.value || "")}</textarea>`;
  } else if (f.type === "select") {
    control = `<select class="field__control" ${common}>
      <option value="">請選擇</option>
      ${f.options.map(([v, l]) => `<option value="${esc(v)}"${v === f.value ? " selected" : ""}>${esc(l)}</option>`).join("")}
    </select>`;
  } else {
    const range = f.type === "number" ? `${f.min != null ? ` min="${f.min}"` : ""}${f.maxValue != null ? ` max="${f.maxValue}"` : ""} inputmode="numeric"` : "";
    const auto = f.type === "email" ? ' autocomplete="email"' : "";
    control = `<input class="field__control" type="${f.type || "text"}" ${common}${max}${ph}${range}${auto} value="${esc(f.value || "")}">`;
  }
  return `<div class="field" data-field="${f.name}">
    <label class="field__label" for="${id}">${esc(f.label)}${req}</label>
    ${hint}${control}${err}
  </div>`;
}

function readValues(form, fields) {
  const out = {};
  for (const f of fields) {
    const el = form.elements[f.name];
    if (f.type === "checkbox") out[f.name] = el.checked;
    else {
      const v = el.value.trim();
      out[f.name] = v === "" ? null : f.type === "number" ? Number(v) : v;
    }
  }
  return out;
}

function checkField(f, v) {
  if (f.required && (v == null || v === false)) return f.type === "checkbox" ? "請勾選這一項" : "這一欄必填";
  if (v == null || v === false) return "";
  if (f.max && String(v).length > f.max) return `最多 ${f.max} 個字`;
  if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return "Email 格式看起來不對";
  if (f.type === "url" && !/^https?:\/\//i.test(v)) return "請貼上以 http:// 或 https:// 開頭的網址";
  if (f.type === "number") {
    if (!Number.isInteger(v)) return "請填整數";
    if (f.min != null && v < f.min) return `不能小於 ${f.min}`;
    if (f.maxValue != null && v > f.maxValue) return `不能大於 ${f.maxValue}`;
  }
  return "";
}

/**
 * opts = {
 *   fields, submitLabel,
 *   validate?(values) → { 欄位名: 錯誤訊息 }   // 跨欄位規則，例如「Email 和 LINE 至少一個」
 *   onSubmit(values) → Promise                  // 丟出錯誤代表失敗
 *   successHtml(values) → string                // 成功後取代整張表單
 * }
 */
export function mountForm(root, opts) {
  const { fields } = opts;
  const startedAt = Date.now();

  root.innerHTML = `
    <form class="form" novalidate>
      ${fields.map(fieldHtml).join("")}
      <div class="hp" aria-hidden="true"><label>請不要填這一欄<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <p class="form__status" role="alert" hidden></p>
      <div class="btn-row"><button class="btn btn--accent" type="submit">${esc(opts.submitLabel || "送出")}</button></div>
    </form>`;

  const form = root.querySelector("form");
  const btn = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".form__status");

  function setError(name, msg) {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    if (!wrap) return;
    const p = wrap.querySelector(".field__error");
    p.textContent = msg;
    p.hidden = !msg;
    const el = form.elements[name];
    if (el) el.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  // 使用者改了欄位就把該欄的錯誤訊息清掉
  form.addEventListener("input", (e) => { if (e.target.name) setError(e.target.name, ""); });
  form.addEventListener("change", (e) => { if (e.target.name) setError(e.target.name, ""); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.hidden = true;
    const values = readValues(form, fields);

    const errors = {};
    for (const f of fields) {
      const msg = checkField(f, values[f.name]);
      if (msg) errors[f.name] = msg;
    }
    const extra = opts.validate ? opts.validate(values) : {};
    for (const [k, msg] of Object.entries(extra)) if (msg && !errors[k]) errors[k] = msg;
    fields.forEach((f) => setError(f.name, errors[f.name] || ""));
    const firstBad = fields.find((f) => errors[f.name]);
    if (firstBad) {
      form.elements[firstBad.name].focus();
      return;
    }

    const done = () => { root.innerHTML = opts.successHtml(values); root.scrollIntoView({ behavior: "smooth", block: "start" }); };

    // 防機器人：隱藏欄位被填了、或 2 秒內就送出 → 假裝成功，但不寫入
    if (form.elements.website.value || Date.now() - startedAt < 2000) { done(); return; }

    btn.disabled = true;
    btn.textContent = "送出中…";
    try {
      await opts.onSubmit(values);
      done();
    } catch (err) {
      status.textContent =
        err && err.kind === "network"
          ? "送出失敗：網路好像斷了。你填的內容都還在，請確認連線後再按一次送出。"
          : "送出失敗，請稍後再試一次。如果一直不行，請檢查各欄位是否填寫正確。";
      status.hidden = false;
      btn.disabled = false;
      btn.textContent = opts.submitLabel || "送出";
    }
  });
}
