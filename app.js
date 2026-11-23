const sections = [
  { label: "Личные данные", step: 0 },
  { label: "Мой бизнес", step: 1 },
  { label: "Налоговый режим", step: 4 },
  { label: "Мои документы", step: 5 },
  { label: "Расчетный счет", step: 6 },
  { label: "Электронная подпись", step: 7 },
  { label: "Регистрация бизнеса", step: 8 },
  { label: "Начать работу в Saby", step: 9 }
];
const regions = ["Ярославль", "Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Другой регион"];
const activities = ["Розничный магазин", "Интернет-торговля", "Ресторан", "Бьюти-бизнес", "Автосервис", "Гостиничный бизнес", "Образование", "Другие виды"];
const state = {
  step: 0,
  personalStage: 0,
  region: "",
  email: "",
  entity: "ИП",
  selectedActivities: [],
  activityQuery: "",
  revenue: "",
  noEmployees: true,
  employees: "",
  tax: "income",
  bank: "later",
  signatureReady: false,
  prototypeScreen: "master",
  clicksEnabled: true,
  typicalView: true,
  deviceEnabled: true
};

const nav = document.querySelector("#workflowNav");
const screen = document.querySelector("#screen");
const profileLine = document.querySelector("#profileLine");
const systemArea = document.querySelector(".system-area");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function activeSection() {
  let index = 0;
  sections.forEach((item, i) => { if (state.step >= item.step) index = i; });
  return index;
}

function renderNav() {
  const active = activeSection();
  nav.innerHTML = sections.map((item, index) => {
    const current = index === active;
    const completed = index < active;
    const available = item.step <= state.step;
    const classes = ["nav-item", current ? "current" : "", completed ? "completed" : "", available ? "available" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-nav-step="${item.step}" ${available ? "" : "disabled"} ${current ? 'aria-current="step"' : ""}>${escapeHtml(item.label)}</button>`;
  }).join("");
}

function profileCopy() {
  return "Главный Сергей Александрович, +7 (999) 123-45-67";
}

function clickCue() {
  if (!state.clicksEnabled) return "";
  return `<span class="click-cue" aria-hidden="true"><span class="click-halo"></span><svg viewBox="0 0 20 26"><path d="M2 1.5 17.5 14l-6.2.7 3.3 7.1-3.2 1.5-3.4-7.2-4.2 4.5z"></path></svg></span>`;
}

function actions(nextLabel, disabled = false, backLabel = "Назад", showClick = false, actionClass = "") {
  return `<div class="actions ${actionClass}">
    ${state.step > 0 && state.step < 9 ? `<button class="secondary-button" type="button" data-action="back">${backLabel}</button>` : ""}
    <button class="primary-button" type="button" data-action="next" ${disabled ? "disabled" : ""}>${nextLabel}${showClick ? clickCue() : ""}</button>
  </div>`;
}

function renderPersonal() {
  const filled = state.personalStage === 1;
  const region = filled ? "Ярославль" : "Выберите регион из списка";
  const email = filled ? "itpremium@gmail.com" : "Укажите электронную почту";
  screen.innerHTML = `<section class="details personal-details" aria-label="Личные данные">
    <div class="field-block region-picker">
      <div class="lookup-trigger static-field" aria-hidden="true">
        <span>${region}${filled ? `<span class="field-clear">×</span>` : ""}</span>
        <img src="./assets/lookup.svg" width="12" height="9" alt="">
      </div>
      <p class="helper-text">Определим налоговую для подачи заявления</p>
    </div>
    <div class="field-block">
      <div class="line-input static-field ${filled ? "" : "placeholder"}" aria-hidden="true">${email}</div>
      ${filled ? "" : `<button class="field-hotspot" type="button" data-action="advance-personal" aria-label="Продолжить">${clickCue()}</button>`}
      <p class="helper-text">Пришлем ссылку на эту заявку и ответ ФНС</p>
    </div>
  </section>${actions("Продолжить", !filled, "Назад", filled)}`;
}

function regionOptions(query = "") {
  const filtered = regions.filter(region => region.toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru")));
  return filtered.map(region => `<button class="region-option" type="button" data-region="${escapeHtml(region)}">${escapeHtml(region)}</button>`).join("") || `<p class="helper-text">Регион не найден</p>`;
}

function renderEntity() {
  const sole = ["вы начинаете бизнес в одиночку", "риски минимальны", "планируется небольшой оборот", "быстро открыть и просто закрыть бизнес", "клиенты — физлица"];
  const company = ["важна защита личного имущества", "есть партнеры или инвесторы", "бизнес с крупными контрактами", "планируется масштабирование", "клиенты — компании"];
  screen.innerHTML = `<section class="details entity-details">
    <div class="choice-grid">
      ${entityCard("ИП", sole)}
      ${entityCard("ООО", company)}
    </div>
  </section>${actions("Продолжить", false, "Назад", false, "choice-actions")}`;
}

function entityCard(name, points) {
  const selected = state.entity === name;
  return `<button class="choice-card ${selected ? "selected" : ""}" type="button" data-entity="${name}" aria-pressed="${selected}">
    <span class="choice-head">${selected ? `<img class="radio-icon" src="./assets/entity-selected.svg" width="18" height="18" alt="">` : `<span class="radio-dot" aria-hidden="true"></span>`}${name}</span>
    <span class="choice-points">${points.map(point => `<span>${escapeHtml(point)}</span>`).join("")}</span>
  </button>`;
}

function renderActivities() {
  const chips = activities.map(name => {
    const selected = state.selectedActivities.includes(name);
    return `<button class="chip ${selected ? "selected" : ""}" type="button" data-activity="${escapeHtml(name)}" aria-pressed="${selected}">${escapeHtml(name)}</button>`;
  }).join("");
  screen.innerHTML = `<section class="details">
    <p class="activity-label">Индивидуальный предприниматель</p>
    <div class="chip-list" aria-label="Виды деятельности">${chips}</div>
    <input class="activity-search" id="activitySearch" type="text" autocomplete="off" placeholder="Выберите выше или напишите какой бизнес хотите открыть?" value="${escapeHtml(state.activityQuery)}" aria-label="Поиск вида деятельности">
    <div id="activitySuggestions"></div>
  </section>${actions("Продолжить", state.selectedActivities.length === 0)}`;
  renderActivitySuggestions();
}

function renderActivitySuggestions() {
  const host = document.querySelector("#activitySuggestions");
  if (!host) return;
  const query = state.activityQuery.trim();
  if (!query) { host.innerHTML = ""; return; }
  const matches = activities.filter(name => name.toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru")) && !state.selectedActivities.includes(name));
  const options = matches.slice(0, 4).map(name => `<button class="chip" type="button" data-activity="${escapeHtml(name)}">${escapeHtml(name)} +</button>`).join("");
  const custom = !activities.some(name => name.toLocaleLowerCase("ru") === query.toLocaleLowerCase("ru")) && !state.selectedActivities.includes(query)
    ? `<button class="chip" type="button" data-custom-activity="${escapeHtml(query)}">Добавить «${escapeHtml(query)}» +</button>` : "";
  host.innerHTML = `<div class="chip-list suggestions">${options}${custom}</div>`;
}

function renderBusinessDetails() {
  const label = "47.91 – Розничная торговля по почте или по информационно-коммуникационной сети Интернет (основной)";
  screen.innerHTML = `<section class="details">
    <p class="activity-label">Индивидуальный предприниматель</p>
    <p class="selected-summary">${escapeHtml(label)}</p>
    <div class="form-row">
      <div class="field-block">
        <input class="line-input" id="revenue" type="text" inputmode="numeric" placeholder="Выручка за год, ₽" value="${escapeHtml(state.revenue)}" aria-label="Выручка за год">
        <p class="helper-text">Оставьте пустым, если пока не знаете</p>
      </div>
      <div class="field-block">
        <label class="checkbox-label"><input id="noEmployees" type="checkbox" ${state.noEmployees ? "checked" : ""}> Буду работать без сотрудников</label>
        ${state.noEmployees ? "" : `<input class="line-input" id="employees" type="number" min="1" placeholder="Количество сотрудников" value="${escapeHtml(state.employees)}" aria-label="Количество сотрудников">`}
      </div>
    </div>
  </section>${actions("Продолжить")}`;
}

function taxCard(id, title, details, selected, recommendation = "") {
  return `<label class="tax-card ${selected ? "selected" : ""}">
    ${recommendation ? `<span class="recommend">${recommendation}</span>` : ""}
    <h3><input type="radio" name="tax" value="${id}" ${selected ? "checked" : ""}>${title}</h3>
    ${details.map(item => `<p>— ${item}</p>`).join("")}
  </label>`;
}

function renderTax() {
  const revenue = state.revenue ? `${escapeHtml(state.revenue)} ₽` : "";
  screen.innerHTML = `<section class="details">
    ${revenue ? `<p class="eyebrow">Выручка ${revenue}, ${state.noEmployees ? "без сотрудников" : "с сотрудниками"}</p>` : ""}
    <div class="tax-list">
      ${taxCard("income", "УСН «Доходы» 6%", ["Налог платится со всех входящих денег, расходы бизнеса не учитываются", "Налог можно уменьшить на страховые взносы (до 100%)", "менее 60%", "Подробнее"], state.tax === "income", "Рекомендуем")}
      ${taxCard("income-expenses", "УСН «Доходы – Расходы» 15%", ["Налог платится с разницы между доходами и расходами", "Все затраты снижают налоговую базу, «минимальный налог» (1% от доходов)", "более 60%"], state.tax === "income-expenses")}
    </div>
  </section>${actions("Продолжить")}`;
}

function renderDocuments() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Отправить заявку</h2>
    <p class="step-copy">Загрузите скан или фото документов. Они нужны для выдачи электронной подписи</p>
    <div class="document-list">
      <div class="document-row"><span><b>Паспорт РФ</b><small>Страница c фото · Страница с пропиской</small></span></div>
      <div class="document-row"><span><b>СНИЛС</b><small>Лицевая сторона</small></span></div>
      <div class="document-row"><span><b>ИНН</b></span></div>
    </div>
  </section>${actions("Отправить заявку")}`;
}

function renderBank() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Расчетный счет</h2>
  </section>${actions("Продолжить")}`;
}

function renderSignature() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Электронная подпись</h2>
    ${state.signatureReady ? `<p class="step-copy">Выпущена</p><p class="step-copy">Действует с 17.07.2026 по 17.07.2027</p>` : ""}
  </section>${state.signatureReady ? actions("Продолжить") : `<div class="actions"><button class="secondary-button" type="button" data-action="back">Назад</button><button class="primary-button" type="button" data-action="prepare-signature">Продолжить</button></div>`}`;
}

function renderApplication() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Заявление</h2>
    <div class="summary-list">
      <div class="summary-item"><span>Регистрация бизнеса</span><strong>Создано</strong></div>
      <div class="summary-item"><span>Отправка заявления</span><strong>Отправлено</strong></div>
      <div class="summary-item"><span>Выручка до 2,4 млн ₽, Без сотрудников,</span><strong>УСН Доходы 6%</strong></div>
      <div class="summary-item"><span>Ответ отрицательный</span><strong>Ответ положительный</strong></div>
    </div>
  </section>${actions("Подписать и отправить")}`;
}

function renderSuccess() {
  screen.innerHTML = `<section class="details success">
    <div class="success-mark" aria-hidden="true">✓</div>
    <h2>Ответ положительный</h2>
    <button class="secondary-button" type="button" data-action="restart">Пройти ещё раз</button>
  </section>`;
}

function renderLanding() {
  screen.innerHTML = `<section class="details landing-screen">
    <h2 class="step-heading">Регистрация бизнеса</h2>
    <button class="primary-button" type="button" data-action="open-master">Продолжить</button>
  </section>`;
}

function renderSystemControls() {
  systemArea.querySelectorAll("[data-prototype-screen]").forEach(button => {
    const selected = button.dataset.prototypeScreen === state.prototypeScreen;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-checked", String(selected));
  });
  const clicks = systemArea.querySelector('[data-system-toggle="clicks"]');
  clicks.classList.toggle("selected", state.clicksEnabled);
  clicks.setAttribute("aria-pressed", String(state.clicksEnabled));
  const mode = systemArea.querySelector(".prototype-mode");
  mode.classList.toggle("selected", state.typicalView);
  mode.setAttribute("aria-pressed", String(state.typicalView));
  const device = systemArea.querySelector('[data-system-toggle="device"]');
  device.classList.toggle("selected", state.deviceEnabled);
  device.setAttribute("aria-pressed", String(state.deviceEnabled));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function render() {
  renderNav();
  profileLine.textContent = profileCopy();
  if (state.prototypeScreen === "landing") {
    renderLanding();
  } else {
    const screens = [renderPersonal, renderEntity, renderActivities, renderBusinessDetails, renderTax, renderDocuments, renderBank, renderSignature, renderApplication, renderSuccess];
    screens[state.step]();
  }
  renderSystemControls();
}

nav.addEventListener("click", event => {
  const button = event.target.closest("[data-nav-step]");
  if (!button || button.disabled) return;
  const step = Number(button.dataset.navStep);
  if (step <= state.step) {
    state.step = step;
    if (step === 0) state.personalStage = 0;
    render();
  }
});

screen.addEventListener("click", event => {
  const target = event.target.closest("button, [data-region]");
  if (!target) return;
  if (target.dataset.action === "advance-personal") {
    state.personalStage = 1;
    state.region = "Ярославль";
    state.email = "itpremium@gmail.com";
    render();
  } else if (target.dataset.action === "next") {
    if (state.step === 0 && state.personalStage !== 1) return;
    if (state.step < 9) state.step++;
    render();
  } else if (target.dataset.action === "back") {
    state.step = Math.max(0, state.step - 1);
    render();
  } else if (target.dataset.action === "restart") {
    Object.assign(state, { step: 0, personalStage: 0, region: "", email: "", entity: "ИП", selectedActivities: [], activityQuery: "", revenue: "", noEmployees: true, employees: "", tax: "income", bank: "later", signatureReady: false, prototypeScreen: "master" });
    render();
  } else if (target.dataset.action === "toggle-regions") {
    const list = document.querySelector("#regionList");
    if (list) {
      list.hidden = !list.hidden;
      target.setAttribute("aria-expanded", String(!list.hidden));
      if (!list.hidden) document.querySelector("#regionSearch")?.focus();
    } else {
      const field = document.querySelector(".region-picker");
      const markup = `<div class="region-list" id="regionList"><input class="region-search" id="regionSearch" type="search" placeholder="Найти регион" aria-label="Найти регион"><div id="regionOptions">${regionOptions()}</div></div>`;
      field.insertAdjacentHTML("beforeend", markup);
      target.setAttribute("aria-expanded", "true");
      document.querySelector("#regionSearch")?.focus();
    }
  } else if (target.dataset.region) {
    state.region = target.dataset.region;
    render();
  } else if (target.dataset.entity) {
    state.entity = target.dataset.entity;
    renderEntity();
  } else if (target.dataset.activity) {
    const name = target.dataset.activity;
    state.selectedActivities = state.selectedActivities.includes(name) ? state.selectedActivities.filter(item => item !== name) : [...state.selectedActivities, name];
    renderActivities();
    document.querySelector("#activitySearch")?.focus();
  } else if (target.dataset.customActivity) {
    const name = target.dataset.customActivity;
    if (!state.selectedActivities.includes(name)) state.selectedActivities.push(name);
    state.activityQuery = "";
    renderActivities();
  } else if (target.dataset.bank) {
    state.bank = target.dataset.bank;
    renderBank();
  } else if (target.dataset.action === "prepare-signature") {
    state.signatureReady = true;
    renderSignature();
  } else if (target.dataset.action === "open-master") {
    state.prototypeScreen = "master";
    state.step = 0;
    render();
  }
});

systemArea.addEventListener("click", event => {
  const screenButton = event.target.closest("[data-prototype-screen]");
  if (screenButton) {
    state.prototypeScreen = screenButton.dataset.prototypeScreen;
    if (state.prototypeScreen === "master" || state.prototypeScreen === "landing") {
      state.step = 0;
      if (state.prototypeScreen === "master") state.personalStage = 0;
    }
    if (state.prototypeScreen === "signature") { state.step = 7; state.signatureReady = false; }
    if (state.prototypeScreen === "work") state.step = 9;
    render();
    return;
  }
  const toggle = event.target.closest("[data-system-toggle]");
  if (toggle?.dataset.systemToggle === "clicks") {
    state.clicksEnabled = !state.clicksEnabled;
    render();
  } else if (toggle?.dataset.systemToggle === "device") {
    state.deviceEnabled = !state.deviceEnabled;
    renderSystemControls();
  } else if (event.target.closest(".prototype-mode")) {
    state.typicalView = !state.typicalView;
    renderSystemControls();
  }
});

screen.addEventListener("change", event => {
  if (event.target.name === "tax") {
    state.tax = event.target.value;
    renderTax();
  }
  if (event.target.id === "noEmployees") {
    state.noEmployees = event.target.checked;
    renderBusinessDetails();
  }
});

screen.addEventListener("input", event => {
  if (event.target.id === "email") {
    state.email = event.target.value;
    const button = screen.querySelector('[data-action="next"]');
    if (button) button.disabled = !state.region || !validEmail(state.email);
  } else if (event.target.id === "regionSearch") {
    document.querySelector("#regionOptions").innerHTML = regionOptions(event.target.value);
  } else if (event.target.id === "activitySearch") {
    state.activityQuery = event.target.value;
    renderActivitySuggestions();
  } else if (event.target.id === "revenue") {
    state.revenue = event.target.value;
  } else if (event.target.id === "employees") {
    state.employees = event.target.value;
  }
});

screen.addEventListener("keydown", event => {
  if (event.target.id === "activitySearch" && event.key === "Enter") {
    event.preventDefault();
    const name = state.activityQuery.trim();
    if (name && !state.selectedActivities.includes(name)) state.selectedActivities.push(name);
    state.activityQuery = "";
    renderActivities();
  }
});

render();
