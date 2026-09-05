/* =====================================================
   MURAD BARI SOCIAL WELFARE FUND
   FRONTEND v2 - FIXED API VERSION
===================================================== */

const API_URL = "https://script.google.com/macros/s/AKfycbwym4UGgPQqmffw634faS0NplbfKLlsizzFI6cvO2l0nErvB1RPlHncmmeBXaTrOP6oCA/exec";

let lang = "bn";
let currentUser = null;

let data = {
  activities: [],
  donors: [],
  collections: [],
  expenses: [],
  custody: [],
  transfers: [],
  users: [],
  auditLog: [],
  settings: []
};


/* =====================================================
   TRANSLATION
===================================================== */

const T = {
  bn: {
    title: "মুরাদবাড়ি সামাজিক কল্যাণ ফান্ড",
    subtitle: "সামাজিক কল্যাণ ও আর্থিক সহায়তা ব্যবস্থাপনা",
    login: "লগইন",
    dashboard: "ড্যাশবোর্ড",
    activities: "কার্যক্রম",
    donorsMenu: "দাতা",
    collections: "দাতা ও সংগ্রহ",
    expenses: "খরচ ও সহায়তা",
    custody: "ফান্ড কোথায়",
    reports: "রিপোর্ট",
    security: "নিরাপত্তা",
    users: "ব্যবহারকারী",
    audit: "অডিট লগ",
    settings: "সেটিংস",
    totalCollection: "মোট সংগ্রহ",
    totalExpense: "মোট খরচ",
    currentFund: "বর্তমান ফান্ড",
    donors: "দাতা",
    yearSummary: "বছরভিত্তিক কার্যক্রম",
    add: "যোগ করুন",
    edit: "এডিট",
    delete: "ডিলিট",
    save: "সংরক্ষণ"
  },

  en: {
    title: "Murad Bari Social Welfare Fund",
    subtitle: "Social Welfare & Fund Management System",
    login: "Login",
    dashboard: "Dashboard",
    activities: "Activities",
    donorsMenu: "Donors",
    collections: "Donors & Collection",
    expenses: "Expenses & Assistance",
    custody: "Fund Custody",
    reports: "Reports",
    security: "Security",
    users: "Users",
    audit: "Audit Log",
    settings: "Settings",
    totalCollection: "Total Collection",
    totalExpense: "Total Expense",
    currentFund: "Current Fund",
    donors: "Donors",
    yearSummary: "Year-wise Activities",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save"
  }
};


/* =====================================================
   API
   CURRENT BACKEND USES doPost()
===================================================== */

async function api(action, payload = {}) {

  try {

    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify({
        action: action,
        payload: payload
      })
    });

    if (!response.ok) {
      throw new Error(
        "HTTP Error: " + response.status
      );
    }

    const result = await response.json();

    return result;

  } catch (error) {

    console.error("API ERROR:", error);

    return {
      success: false,
      ok: false,
      message:
        "API connection failed. Google Apps Script deployment/check করুন।"
    };
  }
}


/* =====================================================
   LOGIN
===================================================== */

async function doLogin() {

  const idEl =
    document.getElementById("loginId");

  const passwordEl =
    document.getElementById("loginPass");

  const msg =
    document.getElementById("msg");

  if (!idEl || !passwordEl) {
    alert("Login form পাওয়া যাচ্ছে না।");
    return;
  }

  const id =
    idEl.value.trim();

  const password =
    passwordEl.value;

  if (!id || !password) {

    if (msg) {
      msg.textContent =
        "Login ID এবং Password দিন।";
    }

    return;
  }

  if (msg) {
    msg.textContent =
      "Login হচ্ছে...";
  }

  const result =
    await api("login", {
      id: id,
      password: password
    });

  if (!result.ok && !result.success) {

    if (msg) {
      msg.textContent =
        result.message ||
        "Login failed";
    }

    return;
  }

  currentUser =
    result.user;

  const loginPage =
    document.getElementById("loginPage");

  const app =
    document.getElementById("app");

  if (loginPage)
    loginPage.hidden = true;

  if (app)
    app.hidden = false;

  const userEl =
    document.getElementById("user");

  if (userEl && currentUser) {

    userEl.textContent =
      currentUser.name +
      " (" +
      currentUser.role +
      ")";
  }

  setupAdminMenu();

  await load();
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

  currentUser = null;

  location.reload();
}


/* =====================================================
   LOAD DATA
===================================================== */

async function load() {

  const result =
    await api("getData");

  if (!result.ok && !result.success) {

    alert(
      result.message ||
      "Data loading failed"
    );

    return;
  }

  data = {

    activities:
      result.activities || [],

    donors:
      result.donors || [],

    collections:
      result.collections || [],

    expenses:
      result.expenses || [],

    custody:
      result.custody || [],

    transfers:
      result.transfers || [],

    users:
      result.users || [],

    auditLog:
      result.auditLog || [],

    settings:
      result.settings || []
  };

  render();
}


/* =====================================================
   RENDER DASHBOARD
===================================================== */

function render() {

  const collectionTotal =
    data.collections.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const expenseTotal =
    data.expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const balance =
    collectionTotal -
    expenseTotal;

  setText(
    "totalCollection",
    money(collectionTotal)
  );

  setText(
    "totalExpense",
    money(expenseTotal)
  );

  setText(
    "balance",
    money(balance)
  );

  setText(
    "donorCount",
    data.donors.length
  );

  renderTable(
    "activitiesTable",
    data.activities,
    [
      "year",
      "name",
      "purpose",
      "openingBalance",
      "status"
    ],
    "Activities"
  );

  renderTable(
    "donorsTable",
    data.donors,
    [
      "name",
      "country",
      "area",
      "phone",
      "note"
    ],
    "Donors"
  );

  renderTable(
    "collectionsTable",
    data.collections,
    [
      "date",
      "donorId",
      "amount",
      "method",
      "note"
    ],
    "Collections"
  );

  renderTable(
    "expensesTable",
    data.expenses,
    [
      "date",
      "recipient",
      "category",
      "amount",
      "method",
      "voucherNo",
      "note"
    ],
    "Expenses"
  );

  renderTable(
    "custodyTable",
    data.custody,
    [
      "locationType",
      "custodianName",
      "amount",
      "date",
      "reason",
      "terms",
      "witnesses",
      "expectedReturnDate",
      "status",
      "note"
    ],
    "FundCustody"
  );

  renderYearSummary();
  renderUsers();
  renderAudit();
  loadSettingsToForm();
}


/* =====================================================
   TABLE
===================================================== */

function renderTable(
  elementId,
  rows,
  columns,
  sheetName
) {

  const element =
    document.getElementById(elementId);

  if (!element)
    return;

  if (!rows.length) {

    element.innerHTML =
      "<p>কোনো তথ্য পাওয়া যায়নি।</p>";

    return;
  }

  let html =
    "<div class='table-wrap'>" +
    "<table>" +
    "<thead><tr>";

  columns.forEach(column => {

    html +=
      "<th>" +
      escapeHtml(column) +
      "</th>";
  });

  html +=
    "</tr></thead><tbody>";

  rows.forEach(row => {

    html += "<tr>";

    columns.forEach(column => {

      let value =
        row[column];

      if (
        column === "amount" ||
        column === "openingBalance"
      ) {
        value =
          money(value);
      }

      html +=
        "<td>" +
        escapeHtml(value ?? "") +
        "</td>";
    });

    html += "</tr>";
  });

  html +=
    "</tbody></table></div>";

  element.innerHTML =
    html;
}


/* =====================================================
   YEAR SUMMARY
===================================================== */

function renderYearSummary() {

  const el =
    document.getElementById("yearSummary");

  if (!el)
    return;

  const summary = {};

  data.activities.forEach(item => {

    const year =
      item.year || "Unknown";

    summary[year] =
      (summary[year] || 0) + 1;
  });

  const years =
    Object.keys(summary)
      .sort()
      .reverse();

  if (!years.length) {

    el.innerHTML =
      "<p>কোনো কার্যক্রম নেই।";

    return;
  }

  let html =
    "<ul>";

  years.forEach(year => {

    html +=
      "<li>" +
      escapeHtml(year) +
      " : " +
      summary[year] +
      " টি কার্যক্রম" +
      "</li>";
  });

  html += "</ul>";

  el.innerHTML =
    html;
}


/* =====================================================
   ADMIN MENU
===================================================== */

function setupAdminMenu() {

  const isAdmin =
    currentUser &&
    String(currentUser.role)
      .toLowerCase() === "admin";

  [
    "usersNav",
    "auditNav",
    "settingsNav"
  ].forEach(id => {

    const el =
      document.getElementById(id);

    if (el)
      el.hidden = !isAdmin;
  });
}


/* =====================================================
   USERS
===================================================== */

function renderUsers() {

  const el =
    document.getElementById("usersTable");

  if (!el)
    return;

  if (
    !currentUser ||
    String(currentUser.role)
      .toLowerCase() !== "admin"
  ) {

    el.innerHTML =
      "<p>Admin access required.</p>";

    return;
  }

  if (!data.users.length) {

    el.innerHTML =
      "<p>বর্তমানে User API থেকে পাওয়া যাচ্ছে না।</p>";

    return;
  }

  let html =
    "<div class='table-wrap'>" +
    "<table>" +
    "<thead><tr>" +
    "<th>User ID</th>" +
    "<th>Name</th>" +
    "<th>Role</th>" +
    "<th>Status</th>" +
    "</tr></thead><tbody>";

  data.users.forEach(user => {

    const active =
      user.active === true ||
      String(user.active).toLowerCase() === "true";

    html +=
      "<tr>" +
      "<td>" + escapeHtml(user.id) + "</td>" +
      "<td>" + escapeHtml(user.name) + "</td>" +
      "<td>" + escapeHtml(user.role) + "</td>" +
      "<td>" +
      (active ? "✅ Active" : "❌ Inactive") +
      "</td>" +
      "</tr>";
  });

  html +=
    "</tbody></table></div>";

  el.innerHTML =
    html;
}


/* =====================================================
   AUDIT
===================================================== */

function renderAudit() {

  const el =
    document.getElementById("auditTable");

  if (!el)
    return;

  if (!data.auditLog.length) {

    el.innerHTML =
      "<p>কোনো Audit Log নেই।</p>";

    return;
  }

  let html =
    "<div class='table-wrap'>" +
    "<table>" +
    "<thead><tr>" +
    "<th>Date</th>" +
    "<th>User</th>" +
    "<th>Action</th>" +
    "<th>Entity</th>" +
    "<th>Details</th>" +
    "</tr></thead><tbody>";

  data.auditLog
    .slice()
    .reverse()
    .forEach(log => {

      html +=
        "<tr>" +

        "<td>" +
        escapeHtml(log.createdAt ?? "") +
        "</td>" +

        "<td>" +
        escapeHtml(log.userId ?? "") +
        "</td>" +

        "<td>" +
        escapeHtml(log.action ?? "") +
        "</td>" +

        "<td>" +
        escapeHtml(log.entity ?? "") +
        "</td>" +

        "<td>" +
        escapeHtml(log.details ?? "") +
        "</td>" +

        "</tr>";
    });

  html +=
    "</tbody></table></div>";

  el.innerHTML =
    html;
}


/* =====================================================
   SETTINGS
===================================================== */

function loadSettingsToForm() {

  const settings =
    getSettingsObject();

  const nameInput =
    document.getElementById("systemName");

  const languageInput =
    document.getElementById("systemLanguage");

  if (
    nameInput &&
    settings.systemName
  ) {
    nameInput.value =
      settings.systemName;
  }

  if (
    languageInput &&
    settings.language
  ) {
    languageInput.value =
      settings.language;
  }
}


/* =====================================================
   LANGUAGE
===================================================== */

function toggleLang() {

  lang =
    lang === "bn"
      ? "en"
      : "bn";

  document
    .querySelectorAll("[data-t]")
    .forEach(el => {

      const key =
        el.dataset.t;

      if (
        T[lang] &&
        T[lang][key]
      ) {

        el.textContent =
          T[lang][key];
      }
    });

  const brand =
    document.getElementById("brand");

  if (brand) {

    const settings =
      getSettingsObject();

    brand.textContent =
      settings.systemName ||
      T[lang].title;
  }
}


/* =====================================================
   NAVIGATION
===================================================== */

function show(id) {

  const target =
    document.getElementById(id);

  if (!target)
    return;

  if (
    ["users","audit","settings"]
      .includes(id)
  ) {

    if (
      !currentUser ||
      String(currentUser.role)
        .toLowerCase() !== "admin"
    ) {

      alert(
        "শুধুমাত্র Admin এই অংশ দেখতে পারবেন।"
      );

      return;
    }
  }

  document
    .querySelectorAll("main > section")
    .forEach(section => {

      section.hidden =
        true;
    });

  target.hidden =
    false;
}


/* =====================================================
   HELPERS
===================================================== */

function getSettingsObject() {

  const obj = {};

  data.settings.forEach(item => {

    obj[item.key] =
      item.value;
  });

  return obj;
}


function money(value) {

  return (
    "৳" +
    Number(value || 0)
      .toLocaleString("bn-BD")
  );
}


function today() {

  return new Date()
    .toISOString()
    .slice(0,10);
}


function setText(id,value) {

  const el =
    document.getElementById(id);

  if (el)
    el.textContent =
      value;
}


function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


/* =====================================================
   ENTER KEY
===================================================== */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Enter"
    ) {

      const loginPage =
        document.getElementById(
          "loginPage"
        );

      if (
        loginPage &&
        loginPage.hidden === false
      ) {

        doLogin();
      }
    }
  }
);
