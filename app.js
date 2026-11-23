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
  signatureReady: false
};

const nav = document.querySelector("#workflowNav");
const screen = document.querySelector("#screen");
const profileLine = document.querySelector("#profileLine");

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
  return state.region ? `Демо-профиль · ${escapeHtml(state.region)} · контактные данные не отправляются` : "Демо-профиль · личные данные не отправляются";
}

function actions(nextLabel, disabled = false, backLabel = "Назад") {
  return `<div class="actions">
    ${state.step > 0 && state.step < 9 ? `<button class="secondary-button" type="button" data-action="back">${backLabel}</button>` : ""}
    <button class="primary-button" type="button" data-action="next" ${disabled ? "disabled" : ""}>${nextLabel}</button>
  </div>`;
}

function renderPersonal() {
  const menu = state.region ? `<div class="region-list" id="regionList" hidden>
      <input class="region-search" id="regionSearch" type="search" placeholder="Найти регион" aria-label="Найти регион">
      <div id="regionOptions">${regionOptions()}</div>
    </div>` : "";
  screen.innerHTML = `<section class="details" aria-label="Личные данные">
    <div class="field-block region-picker">
      <button class="lookup-trigger" type="button" data-action="toggle-regions" aria-expanded="false">
        <span>${state.region ? escapeHtml(state.region) : "Выберите регион из списка"}</span>
        <img src="./assets/lookup.svg" width="12" height="9" alt="">
      </button>
      ${menu}
      <p class="helper-text">Определим налоговую для подачи заявления</p>
    </div>
    <div class="field-block">
      <input class="line-input" id="email" type="email" autocomplete="off" placeholder="Укажите электронную почту" value="${escapeHtml(state.email)}" aria-label="Электронная почта">
      <p class="helper-text">В настоящем сервисе сюда придет ссылка на заявку и ответ ФНС</p>
    </div>
    <p class="privacy-note">В демо данные остаются только в открытой вкладке: мы их не сохраняем и никуда не отправляем.</p>
  </section>${actions("Продолжить", !state.region || !validEmail(state.email))}`;
}

function regionOptions(query = "") {
  const filtered = regions.filter(region => region.toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru")));
  return filtered.map(region => `<button class="region-option" type="button" data-region="${escapeHtml(region)}">${escapeHtml(region)}</button>`).join("") || `<p class="helper-text">Регион не найден</p>`;
}

function renderEntity() {
  const sole = ["вы начинаете бизнес в одиночку", "риски минимальны", "планируется небольшой оборот", "быстро открыть и просто закрыть бизнес", "клиенты — физлица"];
  const company = ["важна защита личного имущества", "есть партнеры или инвесторы", "бизнес с крупными контрактами", "планируется масштабирование", "клиенты — компании"];
  screen.innerHTML = `<section class="details">
    <div class="choice-grid">
      ${entityCard("ИП", sole)}
      ${entityCard("ООО", company)}
    </div>
    <p class="privacy-note">Для демо мы показываем только общие варианты. Это не юридическая рекомендация.</p>
  </section>${actions("Продолжить")}`;
}

function entityCard(name, points) {
  const selected = state.entity === name;
  return `<button class="choice-card ${selected ? "selected" : ""}" type="button" data-entity="${name}" aria-pressed="${selected}">
    <span class="choice-head"><span class="radio-dot" aria-hidden="true"></span>${name}</span>
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
    <input class="activity-search" id="activitySearch" type="text" autocomplete="off" placeholder="Выберите выше или напишите, какой бизнес хотите открыть?" value="${escapeHtml(state.activityQuery)}" aria-label="Поиск вида деятельности">
    <div id="activitySuggestions"></div>
    ${state.selectedActivities.length ? `<p class="selected-summary">Выбрано: ${state.selectedActivities.map(escapeHtml).join(", ")}</p>` : ""}
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
  const label = state.selectedActivities.join(", ") || "Направление не выбрано";
  screen.innerHTML = `<section class="details">
    <p class="activity-label">${escapeHtml(state.entity === "ИП" ? "Индивидуальный предприниматель" : "Общество с ограниченной ответственностью")}</p>
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
  const revenue = state.revenue ? `${escapeHtml(state.revenue)} ₽` : "не указана";
  screen.innerHTML = `<section class="details">
    <p class="eyebrow">Выручка ${revenue}, ${state.noEmployees ? "без сотрудников" : "с сотрудниками"}</p>
    <div class="tax-list">
      ${taxCard("income", "УСН «Доходы» 6%", ["Налог платится со всех входящих денег, расходы бизнеса не учитываются", "Налог можно уменьшить на страховые взносы"], state.tax === "income", "Рекомендуем")}
      ${taxCard("income-expenses", "УСН «Доходы − Расходы» 15%", ["Налог платится с разницы между доходами и расходами", "Подтвержденные затраты снижают налоговую базу"], state.tax === "income-expenses")}
    </div>
    <p class="privacy-note">В макете показаны два варианта УСН. Перед реальной подачей условия нужно проверить для выбранного региона.</p>
  </section>${actions("Продолжить")}`;
}

function renderDocuments() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Документы для регистрации</h2>
    <p class="step-copy">В настоящем сервисе понадобятся паспорт и СНИЛС для выпуска электронной подписи.</p>
    <div class="document-list">
      <div class="document-row"><span class="document-icon" aria-hidden="true">▤</span><span><b>Паспорт РФ</b><small>В демо документ не запрашивается</small></span></div>
      <div class="document-row"><span class="document-icon" aria-hidden="true">▤</span><span><b>СНИЛС</b><small>В демо номер и изображение не вводятся</small></span></div>
    </div>
    <div class="notice">Макет содержит примеры персональных данных. В этой публикации они скрыты; файлы и номера документов не собираются.</div>
  </section>${actions("Продолжить")}`;
}

function renderBank() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Расчетный счет</h2>
    <p class="step-copy">Счет не нужен для государственной регистрации ИП. Его можно открыть позже, когда он понадобится бизнесу.</p>
    <div class="choice-grid">
      <button class="choice-card ${state.bank === "later" ? "selected" : ""}" type="button" data-bank="later" aria-pressed="${state.bank === "later"}"><span class="choice-head"><span class="radio-dot"></span>Открыть позже</span><span class="choice-points"><span>Продолжить регистрацию без счета</span></span></button>
      <button class="choice-card ${state.bank === "now" ? "selected" : ""}" type="button" data-bank="now" aria-pressed="${state.bank === "now"}"><span class="choice-head"><span class="radio-dot"></span>Подобрать счет</span><span class="choice-points"><span>В настоящем сервисе можно посмотреть условия банков</span></span></button>
    </div>
  </section>${actions("Продолжить")}`;
}

function renderSignature() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Электронная подпись</h2>
    <p class="step-copy">Для подачи заявления понадобится электронная подпись. В реальном процессе сервис предложит выбрать удобный способ ее выпуска.</p>
    <div class="notice">Сейчас показан только демонстрационный переход. Мы не выпускаем подпись и не назначаем встречу.</div>
    ${state.signatureReady ? `<p class="selected-summary">${state.signatureReady ? "В демо подпись отмечена как подготовленная." : ""}</p>` : ""}
  </section>${state.signatureReady ? actions("Перейти к заявлению") : `<div class="actions"><button class="secondary-button" type="button" data-action="back">Назад</button><button class="primary-button" type="button" data-action="prepare-signature">Подготовить подпись · демо</button></div>`}`;
}

function renderApplication() {
  screen.innerHTML = `<section class="details">
    <h2 class="step-heading">Заявление готово к отправке</h2>
    <p class="step-copy">Проверьте, что выбрали. Отправка в ФНС в этом прототипе отключена.</p>
    <div class="summary-list">
      <div class="summary-item"><span>Регион</span><strong>${escapeHtml(state.region || "Не выбран")}</strong></div>
      <div class="summary-item"><span>Форма бизнеса</span><strong>${escapeHtml(state.entity)}</strong></div>
      <div class="summary-item"><span>Деятельность</span><strong>${escapeHtml(state.selectedActivities.join(", ") || "Не выбрана")}</strong></div>
      <div class="summary-item"><span>Налоговый режим</span><strong>${state.tax === "income" ? "УСН «Доходы» 6%" : "УСН «Доходы − Расходы» 15%"}</strong></div>
    </div>
    <div class="notice">Кнопка ниже только завершит показ демо. Никакое заявление не будет сформировано или отправлено.</div>
  </section>${actions("Смоделировать отправку")}`;
}

function renderSuccess() {
  screen.innerHTML = `<section class="details success">
    <div class="success-mark" aria-hidden="true">✓</div>
    <h2>Демо завершено</h2>
    <p>Вы прошли основные этапы мастера регистрации. Данные не сохранялись и не отправлялись в государственные сервисы.</p>
    <button class="secondary-button" type="button" data-action="restart">Пройти ещё раз</button>
  </section>`;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function render() {
  renderNav();
  profileLine.textContent = profileCopy();
  const screens = [renderPersonal, renderEntity, renderActivities, renderBusinessDetails, renderTax, renderDocuments, renderBank, renderSignature, renderApplication, renderSuccess];
  screens[state.step]();
}

nav.addEventListener("click", event => {
  const button = event.target.closest("[data-nav-step]");
  if (!button || button.disabled) return;
  const step = Number(button.dataset.navStep);
  if (step <= state.step) { state.step = step; render(); }
});

screen.addEventListener("click", event => {
  const target = event.target.closest("button, [data-region]");
  if (!target) return;
  if (target.dataset.action === "next") {
    if (state.step === 0 && (!state.region || !validEmail(state.email))) return;
    if (state.step < 9) state.step++;
    render();
  } else if (target.dataset.action === "back") {
    state.step = Math.max(0, state.step - 1);
    render();
  } else if (target.dataset.action === "restart") {
    Object.assign(state, { step: 0, region: "", email: "", entity: "ИП", selectedActivities: [], activityQuery: "", revenue: "", noEmployees: true, employees: "", tax: "income", bank: "later", signatureReady: false });
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
