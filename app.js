const steps = ["Дело", "Налоги", "Контакты", "Готово"];
const state = { step: 0, activity: "services", tax: "usn", name: "", email: "", phone: "", region: "Москва" };
const activityLabels = { services: "Услуги", shop: "Торговля", online: "Онлайн-бизнес", other: "Другое" };
const taxLabels = { usn: "Упрощённая система", patent: "Патент", general: "Общая система", unsure: "Помогите выбрать" };
const stepper = document.querySelector("#stepper");
const card = document.querySelector("#formCard");
const summary = document.querySelector("#summaryContent");
const back = document.querySelector("#backButton");
const next = document.querySelector("#nextButton");

function render() {
  stepper.innerHTML = steps.map((title, i) => `<div class="step ${i === state.step ? "active" : i < state.step ? "done" : ""}"><span class="step-number">${i < state.step ? "✓" : i + 1}</span><span>${title}</span></div>`).join("");
  back.disabled = state.step === 0 || state.step === 3;
  next.hidden = state.step === 3;
  if (state.step === 0) renderActivity();
  else if (state.step === 1) renderTax();
  else if (state.step === 2) renderContacts();
  else renderDone();
  renderSummary();
}
function choice(name, value, title, detail) {
  const checked = state[name] === value ? "checked" : "";
  return `<label class="choice ${checked ? "selected" : ""}"><input type="radio" name="${name}" value="${value}" ${checked}><span><b>${title}</b><small>${detail}</small></span></label>`;
}
function listenChoice(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(input => input.addEventListener("change", () => { state[name] = input.value; render(); }));
}
function renderActivity() {
  card.innerHTML = `<div class="step-kicker">Шаг 1 · 4</div><h2>Чем планируете заниматься?</h2><p class="step-description">Это поможет подобрать подходящие коды деятельности.</p><div class="option-grid">${choice("activity", "services", "Услуги", "Консалтинг, ремонт, обучение")}${choice("activity", "shop", "Торговля", "Магазин, доставка, маркетплейсы")}${choice("activity", "online", "Онлайн-бизнес", "Разработка, контент, онлайн-курсы")}${choice("activity", "other", "Другое", "Пока выбираю направление")}</div><div class="callout"><span>✦</span><div><b>Можно указать несколько видов деятельности.</b> Один из них будет основным, остальные — дополнительными.</div></div>`;
  listenChoice("activity");
}
function renderTax() {
  card.innerHTML = `<div class="step-kicker">Шаг 2 · 4</div><h2>Выберите налоговый режим</h2><p class="step-description">Подскажем с чего начать. Выбор можно изменить позже.</p><div class="option-grid">${choice("tax", "usn", "Упрощённая система", "Популярный вариант для небольшого бизнеса")}${choice("tax", "patent", "Патент", "Для отдельных видов деятельности")}${choice("tax", "general", "Общая система", "Подходит при работе с НДС")}${choice("tax", "unsure", "Помогите выбрать", "Покажем, на что обратить внимание")}</div><label class="field-label" for="region">Регион регистрации</label><select id="region"><option>Москва</option><option>Санкт-Петербург</option><option>Московская область</option><option>Другой регион</option></select><div class="field-hint">Налоговые условия зависят от региона и вида деятельности.</div>`;
  document.querySelector("#region").value = state.region;
  document.querySelector("#region").addEventListener("change", e => { state.region = e.target.value; renderSummary(); });
  listenChoice("tax");
}
function renderContacts() {
  card.innerHTML = `<div class="step-kicker">Шаг 3 · 4</div><h2>Куда отправить ваш план?</h2><p class="step-description">Заполните контактные данные для этого демо. Они останутся только в браузере.</p><label class="field-label" for="name">Как к вам обращаться</label><input class="text-field" id="name" autocomplete="given-name" placeholder="Например, Александра" value="${escapeHtml(state.name)}"><div class="inline-fields"><div><label class="field-label" for="email">Электронная почта</label><input class="text-field" type="email" id="email" placeholder="name@example.ru" value="${escapeHtml(state.email)}"></div><div><label class="field-label" for="phone">Телефон <span style="font-weight:400;color:#929ba7">(необязательно)</span></label><input class="text-field" type="tel" id="phone" placeholder="+7 ___ ___-__-__" value="${escapeHtml(state.phone)}"></div></div><div class="callout"><span>⌑</span><div>Для настоящей регистрации понадобятся паспортные данные и ИНН. Здесь их вводить не нужно.</div></div>`;
  ["name", "email", "phone"].forEach(key => document.querySelector(`#${key}`).addEventListener("input", e => { state[key] = e.target.value; renderSummary(); }));
}
function renderDone() {
  card.innerHTML = `<div class="success-box"><div class="success-icon">✓</div><div class="step-kicker">Ваш план готов</div><h2>Вы на верном пути${state.name ? `, ${escapeHtml(state.name)}` : ""}!</h2><p>Для регистрации ИП подготовьте документы и выберите способ подачи заявления. Этот прототип не отправляет данные в государственные сервисы.</p><div class="checklist"><b>Что пригодится</b><ul><li>Паспорт гражданина РФ</li><li>ИНН (если есть)</li><li>Основной код вида деятельности</li><li>Заявление о регистрации ИП — форма Р21001</li></ul></div></div>`;
}
function renderSummary() {
  if (state.step === 3) {
    summary.innerHTML = `<div class="summary-row"><span>Деятельность</span><b>${activityLabels[state.activity]}</b></div><div class="summary-row"><span>Налоговый режим</span><b>${taxLabels[state.tax]}</b></div><div class="summary-row"><span>Регион</span><b>${state.region}</b></div><div class="summary-progress">План собран<div class="progress-track"><div class="progress-value" style="width:100%"></div></div></div>`;
    return;
  }
  const pct = [20, 48, 76][state.step];
  summary.innerHTML = `<div class="summary-row"><span>Деятельность</span><b>${state.step > 0 ? activityLabels[state.activity] : "Не выбрана"}</b></div><div class="summary-row"><span>Налоговый режим</span><b>${state.step > 1 ? taxLabels[state.tax] : "Подберём вместе"}</b></div><div class="summary-row"><span>Регион</span><b>${state.region}</b></div><div class="summary-progress">Заполнено ${pct}%<div class="progress-track"><div class="progress-value" style="width:${pct}%"></div></div></div>`;
}
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
next.addEventListener("click", () => { if (state.step < 3) { state.step++; render(); } });
back.addEventListener("click", () => { if (state.step > 0) { state.step--; render(); } });
document.querySelector("#resetButton").addEventListener("click", () => { Object.assign(state, { step: 0, activity: "services", tax: "usn", name: "", email: "", phone: "", region: "Москва" }); render(); });
render();
