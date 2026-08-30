/* =========================================
   MURAD BARI FUND MANAGEMENT
   GitHub Frontend + Google Apps Script API
========================================= */


/* ========= API URL ========= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbwym4UGgPQqmffw634faS0NplbfKLlsizzFI6cvO2l0nErvB1RPlHncmmeBXaTrOP6oCA/exec";


/* ========= APP STATE ========= */

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


/* ========= TRANSLATION ========= */

const T = {

  bn: {

    title:
      "মুরাদবাড়ি সামাজিক কল্যাণ ফান্ড",

    subtitle:
      "সামাজিক কল্যাণ ও আর্থিক সহায়তা ব্যবস্থাপনা",

    login:
      "লগইন",

    dashboard:
      "ড্যাশবোর্ড",

    activities:
      "কার্যক্রম",

    collections:
      "দাতা ও সংগ্রহ",

    expenses:
      "খরচ ও সহায়তা",

    custody:
      "ফান্ড কোথায়",

    reports:
      "রিপোর্ট",

    security:
      "নিরাপত্তা",

    users:
      "ব্যবহারকারী",

    audit:
      "অডিট লগ",

    settings:
      "সেটিংস",

    totalCollection:
      "মোট সংগ্রহ",

    totalExpense:
      "মোট খরচ",

    currentFund:
      "বর্তমান ফান্ড",

    donors:
      "দাতা",

    yearSummary:
      "বছরভিত্তিক কার্যক্রম",

    add:
      "+ যোগ করুন",

    edit:
      "এডিট",

    delete:
      "ডিলিট",

    save:
      "সংরক্ষণ",

    cancel:
      "বাতিল",

    adminId:
      "অ্যাডমিন ID",

    adminPassword:
      "অ্যাডমিন Password",

    confirmDelete:
      "আপনি কি এই রেকর্ডটি মুছে ফেলতে চান?",

    userId:
      "User ID",

    userName:
      "নাম",

    role:
      "Role",

    active:
      "Active",

    action:
      "কাজ",

    entity:
      "বিষয়",

    entityId:
      "Record ID",

    details:
      "বিস্তারিত",

    dateTime:
      "তারিখ ও সময়",

    systemName:
      "সিস্টেমের নাম",

    language:
      "ভাষা"

  },


  en: {

    title:
      "Murad Bari Social Welfare Fund",

    subtitle:
      "Social Welfare & Fund Management System",

    login:
      "Login",

    dashboard:
      "Dashboard",

    activities:
      "Activities",

    collections:
      "Donors & Collection",

    expenses:
      "Expenses & Assistance",

    custody:
      "Fund Custody",

    reports:
      "Reports",

    security:
      "Security",

    users:
      "Users",

    audit:
      "Audit Log",

    settings:
      "Settings",

    totalCollection:
      "Total Collection",

    totalExpense:
      "Total Expense",

    currentFund:
      "Current Fund",

    donors:
      "Donors",

    yearSummary:
      "Year-wise Activities",

    add:
      "+ Add",

    edit:
      "Edit",

    delete:
      "Delete",

    save:
      "Save",

    cancel:
      "Cancel",

    adminId:
      "Admin ID",

    adminPassword:
      "Admin Password",

    confirmDelete:
      "Do you want to delete this record?",

    userId:
      "User ID",

    userName:
      "Name",

    role:
      "Role",

    active:
      "Active",

    action:
      "Action",

    entity:
      "Entity",

    entityId:
      "Record ID",

    details:
      "Details",

    dateTime:
      "Date & Time",

    systemName:
      "System Name",

    language:
      "Language"

  }

};


/* =========================================
   API REQUEST
========================================= */

async function api(action, payload = {}) {

  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify({
        action,
        ...payload
      })

    });


    const result =
      await response.json();


    return result;

  } catch (error) {

    console.error(error);

    return {
      success: false,
      message:
        "API connection failed: " +
        error.message
    };

  }
}


/* =========================================
   LANGUAGE
========================================= */

function toggleLang() {

  lang =
    lang === "bn"
      ? "en"
      : "bn";


  document
    .querySelectorAll("[data-t]")
    .forEach(function(el) {

      const key =
        el.dataset.t;

      if (T[lang][key]) {

        el.textContent =
          T[lang][key];

      }

    });


  const brand =
    document.getElementById("brand");

  if (brand) {

    brand.textContent =
      T[lang].title;

  }

}


/* =========================================
   LOGIN
========================================= */

async function doLogin() {

  const id =
    document
      .getElementById("loginId")
      .value
      .trim();


  const password =
    document
      .getElementById("loginPass")
      .value;


  if (!id || !password) {

    document
      .getElementById("msg")
      .textContent =
        lang === "bn"
          ? "ID এবং Password দিন"
          : "Enter ID and Password";

    return;

  }


  const result =
    await api(
      "login",
      {
        id,
        password
      }
    );


  if (result.success) {

    currentUser =
      result.user;


    document
      .getElementById("loginPage")
      .hidden = true;


    document
      .getElementById("app")
      .hidden = false;


    document
      .getElementById("user")
      .textContent =
        currentUser.name +
        " (" +
        currentUser.role +
        ")";


    load();

  } else {

    document
      .getElementById("msg")
      .textContent =
        result.message;

  }

}


/* =========================================
   LOAD
========================================= */

async function load() {

  const result =
    await api("getData");


  if (!result.success) {

    alert(result.message);

    return;

  }


  data = result;


  render();

}


/* =========================================
   MONEY
========================================= */

function money(value) {

  return "৳" +
    Number(value || 0)
      .toLocaleString();

}


/* =========================================
   RENDER
========================================= */

function render() {

  const totalCollection =
    data.collections.reduce(
      (sum, x) =>
        sum +
        Number(x.amount || 0),
      0
    );


  const totalExpense =
    data.expenses.reduce(
      (sum, x) =>
        sum +
        Number(x.amount || 0),
      0
    );


  const balance =
    totalCollection -
    totalExpense;


  setText(
    "totalCollection",
    money(totalCollection)
  );


  setText(
    "totalExpense",
    money(totalExpense)
  );


  setText(
    "balance",
    money(balance)
  );


  setText(
    "donorCount",
    data.donors.length
  );


  table(
    "activitiesTable",
    data.activities,
    [
      "year",
      "name",
      "purpose",
      "status"
    ],
    "Activities"
  );


  table(
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


  table(
    "expensesTable",
    data.expenses,
    [
      "date",
      "recipient",
      "category",
      "amount",
      "method",
      "voucherNo"
    ],
    "Expenses"
  );


  table(
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
      "status"
    ],
    "FundCustody"
  );


  renderUsers();

  renderAuditLog();

}


/* =========================================
   SET TEXT
========================================= */

function setText(id, value) {

  const el =
    document.getElementById(id);

  if (el)
    el.textContent = value;

}


/* =========================================
   TABLE
========================================= */

function table(
  id,
  rows,
  cols,
  entity
) {

  const el =
    document.getElementById(id);


  if (!el) return;


  if (!rows || !rows.length) {

    el.innerHTML =
      `<p>${
        lang === "bn"
          ? "কোনো তথ্য নেই।"
          : "No data yet."
      }</p>`;

    return;

  }


  let html =
    "<table><thead><tr>";


  cols.forEach(function(col) {

    html +=
      "<th>" +
      escapeHtml(col) +
      "</th>";

  });


  html +=
    "<th>Action</th>";

  html +=
    "</tr></thead><tbody>";


  rows.forEach(function(row) {

    html += "<tr>";


    cols.forEach(function(col) {

      html +=
        "<td>" +
        escapeHtml(
          row[col] ?? ""
        ) +
        "</td>";

    });


    html += `
      <td class="actions">
        <button
          onclick="editRecord('${entity}','${escapeAttr(row.id)}')">
          ${T[lang].edit}
        </button>

        <button
          class="danger"
          onclick="deleteRecord('${entity}','${escapeAttr(row.id)}')">
          ${T[lang].delete}
        </button>
      </td>
    `;


    html += "</tr>";

  });


  html +=
    "</tbody></table>";


  el.innerHTML = html;

}


/* =========================================
   EDIT
========================================= */

async function editRecord(
  sheetName,
  id
) {

  const rows =
    getRowsBySheet(sheetName);


  const record =
    rows.find(
      x =>
        String(x.id) ===
        String(id)
    );


  if (!record) {

    alert("Record not found");

    return;

  }


  const fields =
    Object.keys(record)
      .filter(function(key) {

        return (
          key !== "id" &&
          key !== "createdAt"
        );

      });


  const updated = {};


  for (const field of fields) {

    const value =
      prompt(
        field,
        record[field] ?? ""
      );


    if (value === null)
      return;


    updated[field] =
      value;

  }


  const result =
    await api(
      "updateRecord",
      {
        sheetName,
        id,
        obj: updated,
        userId:
          currentUser.id
      }
    );


  alert(result.message);


  if (result.success)
    load();

}


/* =========================================
   DELETE
========================================= */

async function deleteRecord(
  sheetName,
  id
) {

  if (
    !confirm(
      T[lang].confirmDelete
    )
  ) return;


  const adminId =
    prompt(
      T[lang].adminId
    );


  if (adminId === null)
    return;


  const password =
    prompt(
      T[lang].adminPassword
    );


  if (password === null)
    return;


  const result =
    await api(
      "deleteRecord",
      {
        sheetName,
        id,
        userId: adminId,
        adminPassword: password
      }
    );


  alert(result.message);


  if (result.success)
    load();

}


/* =========================================
   ROW MAP
========================================= */

function getRowsBySheet(sheetName) {

  const map = {

    Activities:
      data.activities,

    Donors:
      data.donors,

    Collections:
      data.collections,

    Expenses:
      data.expenses,

    FundCustody:
      data.custody,

    FundTransfers:
      data.transfers,

    Users:
      data.users,

    AuditLog:
      data.auditLog

  };


  return map[sheetName] || [];

}


/* =========================================
   USERS
========================================= */

function renderUsers() {

  const el =
    document.getElementById(
      "usersTable"
    );


  if (!el) return;


  if (!currentUser ||
      currentUser.role !== "admin") {

    el.innerHTML =
      "<p>Admin access required.</p>";

    return;

  }


  if (!data.users.length) {

    el.innerHTML =
      "<p>No users found.</p>";

    return;

  }


  let html = `
    <table>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Name</th>
          <th>Role</th>
          <th>Active</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;


  data.users.forEach(function(user) {

    html += `
      <tr>

        <td>
          ${escapeHtml(user.id)}
        </td>

        <td>
          ${escapeHtml(user.name)}
        </td>

        <td>
          ${escapeHtml(user.role)}
        </td>

        <td>
          ${
            user.active
              ? "✅"
              : "❌"
          }
        </td>

        <td>

          <button
            onclick="changeUserStatus(
              '${escapeAttr(user.id)}',
              ${!user.active}
            )">
            ${
              user.active
                ? "Deactivate"
                : "Activate"
            }
          </button>


          <button
            onclick="resetUserPassword(
              '${escapeAttr(user.id)}'
            )">
            Reset Password
          </button>


          <button
            class="danger"
            onclick="deleteUser(
              '${escapeAttr(user.id)}'
            )">
            Delete
          </button>

        </td>

      </tr>
    `;

  });


  html +=
    "</tbody></table>";


  el.innerHTML = html;

}


/* =========================================
   ADD USER
========================================= */

async function addUser() {

  if (
    !currentUser ||
    currentUser.role !== "admin"
  ) {

    alert("Admin access required.");

    return;

  }


  const adminPassword =
    prompt(
      T[lang].adminPassword
    );


  if (adminPassword === null)
    return;


  const id =
    prompt("User ID");


  if (!id) return;


  const name =
    prompt("Name");


  if (name === null)
    return;


  const password =
    prompt("Password");


  if (!password) return;


  const role =
    prompt(
      "Role: admin / user",
      "user"
    );


  const result =
    await api(
      "addUser",
      {
        adminId:
          currentUser.id,

        adminPassword,

        user: {
          id,
          name,
          password,
          role:
            role || "user",
          active: true
        }
      }
    );


  alert(result.message);


  if (result.success)
    load();

}


/* =========================================
   USER STATUS
========================================= */

async function changeUserStatus(
  userId,
  active
) {

  const password =
    prompt(
      T[lang].adminPassword
    );


  if (password === null)
    return;


  const result =
    await api(
      "setUserStatus",
      {
        adminId:
          currentUser.id,

        adminPassword:
          password,

        userId,

        active
      }
    );


  alert(result.message);


  if (result.success)
    load();

}


/* =========================================
   RESET PASSWORD
========================================= */

async function resetUserPassword(
  userId
) {

  const adminPassword =
    prompt(
      T[lang].adminPassword
    );


  if (adminPassword === null)
    return;


  const newPassword =
    prompt(
      lang === "bn"
        ? "নতুন Password দিন"
        : "Enter new password"
    );


  if (!newPassword)
    return;


  const result =
    await api(
      "resetUserPassword",
      {
        adminId:
          currentUser.id,

        adminPassword,

        userId,

        newPassword
      }
    );


  alert(result.message);

}


/* =========================================
   DELETE USER
========================================= */

async function deleteUser(
  userId
) {

  if (
    !confirm(
      lang === "bn"
        ? "এই User মুছে ফেলবেন?"
        : "Delete this user?"
    )
  ) return;


  const password =
    prompt(
      T[lang].adminPassword
    );


  if (password === null)
    return;


  const result =
    await api(
      "deleteUser",
      {
        adminId:
          currentUser.id,

        adminPassword:
          password,

        userId
      }
    );


  alert(result.message);


  if (result.success)
    load();

}


/* =========================================
   AUDIT LOG
========================================= */

function renderAuditLog() {

  const el =
    document.getElementById(
      "auditTable"
    );


  if (!el) return;


  if (
    !currentUser ||
    currentUser.role !== "admin"
  ) {

    el.innerHTML =
      "<p>Admin access required.</p>";

    return;

  }


  if (!data.auditLog.length) {

    el.innerHTML =
      "<p>No audit records.</p>";

    return;

  }


  let html = `
    <table>

      <thead>

        <tr>

          <th>Date</th>
          <th>User</th>
          <th>Action</th>
          <th>Entity</th>
          <th>Record ID</th>
          <th>Details</th>

        </tr>

      </thead>

      <tbody>
  `;


  data.auditLog
    .slice()
    .reverse()
    .forEach(function(log) {

      html += `
        <tr>

          <td>
            ${escapeHtml(
              log.createdAt ?? ""
            )}
          </td>

          <td>
            ${escapeHtml(
              log.userId ?? ""
            )}
          </td>

          <td>
            ${escapeHtml(
              log.action ?? ""
            )}
          </td>

          <td>
            ${escapeHtml(
              log.entity ?? ""
            )}
          </td>

          <td>
            ${escapeHtml(
              log.entityId ?? ""
            )}
          </td>

          <td>
            ${escapeHtml(
              log.details ?? ""
            )}
          </td>

        </tr>
      `;

    });


  html +=
    "</tbody></table>";


  el.innerHTML = html;

}


/* =========================================
   SETTINGS
========================================= */

async function saveSettings() {

  if (
    !currentUser ||
    currentUser.role !== "admin"
  ) {

    alert("Admin access required.");

    return;

  }


  const systemName =
    document.getElementById(
      "systemName"
    );


  const systemLanguage =
    document.getElementById(
      "systemLanguage"
    );


  const adminPassword =
    prompt(
      T[lang].adminPassword
    );


  if (adminPassword === null)
    return;


  const result =
    await api(
      "saveSettings",
      {
        adminId:
          currentUser.id,

        adminPassword,

        settings: {

          systemName:
            systemName
              ? systemName.value
              : "",

          language:
            systemLanguage
              ? systemLanguage.value
              : lang

        }
      }
    );


  alert(result.message);

}


/* =========================================
   NAVIGATION
========================================= */

function show(id) {

  document
    .querySelectorAll(
      "main > section"
    )
    .forEach(function(section) {

      section.hidden = true;

    });


  const target =
    document.getElementById(id);


  if (target)
    target.hidden = false;


  if (
    id === "users" ||
    id === "audit" ||
    id === "settings"
  ) {

    if (
      !currentUser ||
      currentUser.role !== "admin"
    ) {

      alert(
        lang === "bn"
          ? "শুধু Admin এই অংশ দেখতে পারবেন।"
          : "Only Admin can access this section."
      );

      target.hidden = true;

      return;

    }

  }

}


/* =========================================
   PROTECTED ACTION
========================================= */

async function protectedAction(
  action
) {

  const id =
    prompt(
      T[lang].adminId
    );


  if (id === null)
    return;


  const password =
    prompt(
      T[lang].adminPassword
    );


  if (password === null)
    return;


  if (
    !confirm(
      "Confirm " + action + "?"
    )
  ) return;


  alert(
    lang === "bn"
      ? action +
        " এর জন্য backend প্রস্তুত আছে।"
      : "Backend is ready for " +
        action
  );

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttr(value) {

  return String(value)
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    );

}
