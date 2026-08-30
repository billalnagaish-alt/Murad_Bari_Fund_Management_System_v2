const API_URL =
"https://script.google.com/macros/s/AKfycbwym4UGgPQqmffw634faS0NplbfKLlsizzFI6cvO2l0nErvB1RPlHncmmeBXaTrOP6oCA/exec";

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


/* ==========================
   TRANSLATION
========================== */

const T = {

  bn: {
    title: "মুরাদবাড়ি সামাজিক কল্যাণ ফান্ড",
    subtitle: "সামাজিক কল্যাণ ও আর্থিক সহায়তা ব্যবস্থাপনা",
    login: "লগইন",
    dashboard: "ড্যাশবোর্ড",
    activities: "কার্যক্রম",
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
    add: "+ যোগ করুন",
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
    add: "+ Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save"
  }
};


/* ==========================
   JSONP API
========================== */

function api(action, payload = {}) {

  return new Promise(function(resolve) {

    const callbackName =
      "apiCallback_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 100000
      );


    const script =
      document.createElement("script");


    window[callbackName] =
      function(result) {

        try {
          resolve(result);
        } finally {

          delete window[callbackName];

          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }

        }

      };


    const params =
      new URLSearchParams();


    params.set(
      "action",
      action
    );


    params.set(
      "callback",
      callbackName
    );


    Object.keys(payload)
      .forEach(function(key) {

        let value =
          payload[key];


        if (
          typeof value ===
          "object"
        ) {

          value =
            JSON.stringify(value);

        }


        params.set(
          key,
          value
        );

      });


    script.src =
      API_URL +
      "?" +
      params.toString();


    script.onerror =
      function() {

        delete window[callbackName];

        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }


        resolve({

          success: false,

          message:
            "Google Apps Script connection failed."

        });

      };


    document.body.appendChild(
      script
    );

  });
}


/* ==========================
   LANGUAGE
========================== */

function toggleLang() {

  lang =
    lang === "bn"
      ? "en"
      : "bn";


  document
    .querySelectorAll(
      "[data-t]"
    )
    .forEach(function(el) {

      const key =
        el.dataset.t;

      if (T[lang][key]) {

        el.textContent =
          T[lang][key];

      }

    });


  const brand =
    document.getElementById(
      "brand"
    );


  if (brand) {

    brand.textContent =
      T[lang].title;

  }

}


/* ==========================
   LOGIN
========================== */

async function doLogin() {

  const id =
    document
      .getElementById(
        "loginId"
      )
      .value
      .trim();


  const password =
    document
      .getElementById(
        "loginPass"
      )
      .value;


  if (!id || !password) {

    document
      .getElementById(
        "msg"
      )
      .textContent =
        "ID এবং Password দিন";

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


  if (!result.success) {

    document
      .getElementById(
        "msg"
      )
      .textContent =
        result.message;

    return;

  }


  currentUser =
    result.user;


  document
    .getElementById(
      "loginPage"
    )
    .hidden = true;


  document
    .getElementById(
      "app"
    )
    .hidden = false;


  document
    .getElementById(
      "user"
    )
    .textContent =
      currentUser.name +
      " (" +
      currentUser.role +
      ")";


  load();

}


/* ==========================
   LOAD
========================== */

async function load() {

  const result =
    await api(
      "getData"
    );


  if (!result.success) {

    alert(result.message);

    return;

  }


  data =
    result;


  render();

}


/* ==========================
   RENDER
========================== */

function render() {

  const collection =
    data.collections
      .reduce(
        (s, x) =>
          s +
          Number(
            x.amount || 0
          ),
        0
      );


  const expense =
    data.expenses
      .reduce(
        (s, x) =>
          s +
          Number(
            x.amount || 0
          ),
        0
      );


  setText(
    "totalCollection",
    money(collection)
  );


  setText(
    "totalExpense",
    money(expense)
  );


  setText(
    "balance",
    money(
      collection -
      expense
    )
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
      "status"
    ],
    "Activities"
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
      "voucherNo"
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
      "status"
    ],
    "FundCustody"
  );


  renderUsers();

  renderAudit();

}


/* ==========================
   TABLE
========================== */

function renderTable(
  elementId,
  rows,
  columns,
  sheetName
) {

  const el =
    document.getElementById(
      elementId
    );


  if (!el) return;


  if (!rows.length) {

    el.innerHTML =
      "<p>কোনো তথ্য নেই।</p>";

    return;

  }


  let html =
    "<table><thead><tr>";


  columns.forEach(function(col) {

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


    columns.forEach(function(col) {

      html +=
        "<td>" +
        escapeHtml(
          row[col] ?? ""
        ) +
        "</td>";

    });


    html +=
      "<td>" +

      `<button onclick="editRecord('${sheetName}','${escapeAttr(row.id)}')">✏️ ${T[lang].edit}</button>` +

      ` <button class="danger" onclick="deleteRecord('${sheetName}','${escapeAttr(row.id)}')">🗑️ ${T[lang].delete}</button>` +

      "</td>";


    html +=
      "</tr>";

  });


  html +=
    "</tbody></table>";


  el.innerHTML =
    html;

}


/* ==========================
   EDIT
========================== */

async function editRecord(
  sheetName,
  id
) {

  const rows =
    getRows(sheetName);


  const record =
    rows.find(function(x) {

      return String(x.id) ===
        String(id);

    });


  if (!record) {

    alert(
      "Record not found"
    );

    return;

  }


  const obj = {};


  Object.keys(record)
    .forEach(function(field) {

      if (
        field === "id" ||
        field === "createdAt"
      )
        return;


      const value =
        prompt(
          field,
          record[field] ?? ""
        );


      if (value === null)
        return;


      obj[field] =
        value;

    });


  const result =
    await api(
      "updateRecord",
      {
        sheetName,
        id,
        obj,
        userId:
          currentUser.id
      }
    );


  alert(
    result.message
  );


  if (result.success)
    load();

}


/* ==========================
   DELETE
========================== */

async function deleteRecord(
  sheetName,
  id
) {

  if (
    !confirm(
      "আপনি কি এই রেকর্ডটি ডিলিট করতে চান?"
    )
  )
    return;


  const password =
    prompt(
      "Admin Password দিন"
    );


  if (password === null)
    return;


  const result =
    await api(
      "deleteRecord",
      {
        sheetName,
        id,
        userId:
          currentUser.id,
        adminPassword:
          password
      }
    );


  alert(
    result.message
  );


  if (result.success)
    load();

}


/* ==========================
   USERS
========================== */

function renderUsers() {

  const el =
    document.getElementById(
      "usersTable"
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


  let html =
    `<table>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Name</th>
          <th>Role</th>
          <th>Active</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>`;


  data.users.forEach(
    function(user) {

      html +=
        `<tr>
          <td>${escapeHtml(user.id)}</td>
          <td>${escapeHtml(user.name)}</td>
          <td>${escapeHtml(user.role)}</td>
          <td>${user.active ? "✅" : "❌"}</td>
          <td>

            <button onclick="changeUserStatus('${escapeAttr(user.id)}',${!user.active})">
              ${user.active ? "Deactivate" : "Activate"}
            </button>

            <button onclick="resetUserPassword('${escapeAttr(user.id)}')">
              Reset Password
            </button>

            <button class="danger" onclick="deleteUser('${escapeAttr(user.id)}')">
              Delete
            </button>

          </td>
        </tr>`;

    }
  );


  html +=
    "</tbody></table>";


  el.innerHTML =
    html;

}


/* ==========================
   ADD USER
========================== */

async function addUser() {

  const password =
    prompt(
      "বর্তমান Admin Password"
    );


  if (password === null)
    return;


  const id =
    prompt(
      "নতুন User ID"
    );


  if (!id) return;


  const name =
    prompt(
      "User Name"
    );


  if (name === null)
    return;


  const userPassword =
    prompt(
      "নতুন User Password"
    );


  if (!userPassword)
    return;


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

        adminPassword:
          password,

        user: {

          id,

          name,

          password:
            userPassword,

          role:
            role || "user"

        }

      }
    );


  alert(
    result.message
  );


  if (result.success)
    load();

}


/* ==========================
   USER STATUS
========================== */

async function changeUserStatus(
  userId,
  active
) {

  const password =
    prompt(
      "Admin Password"
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


  alert(
    result.message
  );


  if (result.success)
    load();

}


/* ==========================
   RESET USER PASSWORD
========================== */

async function resetUserPassword(
  userId
) {

  const password =
    prompt(
      "Admin Password"
    );


  if (password === null)
    return;


  const newPassword =
    prompt(
      "নতুন Password"
    );


  if (!newPassword)
    return;


  const result =
    await api(
      "resetUserPassword",
      {

        adminId:
          currentUser.id,

        adminPassword:
          password,

        userId,

        newPassword

      }
    );


  alert(
    result.message
  );

}


/* ==========================
   DELETE USER
========================== */

async function deleteUser(
  userId
) {

  if (
    !confirm(
      "এই User-কে Delete করবেন?"
    )
  )
    return;


  const password =
    prompt(
      "Admin Password"
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


  alert(
    result.message
  );


  if (result.success)
    load();

}


/* ==========================
   AUDIT
========================== */

function renderAudit() {

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


  let html =
    `<table>
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
      <tbody>`;


  data.auditLog
    .slice()
    .reverse()
    .forEach(function(log) {

      html +=
        `<tr>
          <td>${escapeHtml(log.createdAt ?? "")}</td>
          <td>${escapeHtml(log.userId ?? "")}</td>
          <td>${escapeHtml(log.action ?? "")}</td>
          <td>${escapeHtml(log.entity ?? "")}</td>
          <td>${escapeHtml(log.entityId ?? "")}</td>
          <td>${escapeHtml(log.details ?? "")}</td>
        </tr>`;

    });


  html +=
    "</tbody></table>";


  el.innerHTML =
    html;

}


/* ==========================
   SETTINGS
========================== */

async function saveSettings() {

  const password =
    prompt(
      "Admin Password"
    );


  if (password === null)
    return;


  const systemName =
    document.getElementById(
      "systemName"
    ).value;


  const language =
    document.getElementById(
      "systemLanguage"
    ).value;


  const result =
    await api(
      "saveSettings",
      {

        adminId:
          currentUser.id,

        adminPassword:
          password,

        settings: {

          systemName,

          language

        }

      }
    );


  alert(
    result.message
  );


  if (result.success) {

    lang =
      language;

    toggleLang();

  }

}


/* ==========================
   NAVIGATION
========================== */

function show(id) {

  const target =
    document.getElementById(id);


  if (!target)
    return;


  if (
    [
      "users",
      "audit",
      "settings"
    ].includes(id)
  ) {

    if (
      !currentUser ||
      currentUser.role !== "admin"
    ) {

      alert(
        "শুধুমাত্র Admin এই অংশ দেখতে পারবেন।"
      );

      return;

    }

  }


  document
    .querySelectorAll(
      "main > section"
    )
    .forEach(function(s) {

      s.hidden = true;

    });


  target.hidden = false;

}


/* ==========================
   ADD BUTTON
========================== */

function addDemo(sheetName) {

  if (sheetName === "Activities") {

    addSimpleRecord(
      "Activities",
      {
        year:
          prompt("Year"),
        name:
          prompt("Activity Name"),
        purpose:
          prompt("Purpose"),
        openingBalance:
          prompt("Opening Balance") || 0,
        status:
          prompt("Status", "Active")
      }
    );

    return;
  }


  if (sheetName === "Collections") {

    addSimpleRecord(
      "Collections",
      {
        activityId:
          prompt("Activity ID"),
        donorId:
          prompt("Donor ID"),
        amount:
          prompt("Amount"),
        method:
          prompt("Method"),
        date:
          prompt("Date"),
        note:
          prompt("Note")
      }
    );

    return;
  }


  if (sheetName === "Expenses") {

    addSimpleRecord(
      "Expenses",
      {
        activityId:
          prompt("Activity ID"),
        date:
          prompt("Date"),
        recipient:
          prompt("Recipient"),
        category:
          prompt("Category"),
        amount:
          prompt("Amount"),
        method:
          prompt("Method"),
        voucherNo:
          prompt("Voucher No"),
        note:
          prompt("Note")
      }
    );

    return;
  }


  if (sheetName === "FundCustody") {

    addSimpleRecord(
      "FundCustody",
      {
        locationType:
          prompt(
            "Location: Self / Bank / Person"
          ),

        custodianName:
          prompt(
            "Custodian Name"
          ),

        amount:
          prompt("Amount"),

        date:
          prompt("Date"),

        reason:
          prompt("Reason"),

        terms:
          prompt("Terms"),

        witnesses:
          prompt("Witnesses"),

        expectedReturnDate:
          prompt(
            "Expected Return Date"
          ),

        status:
          prompt(
            "Status",
            "Active"
          ),

        note:
          prompt("Note")
      }
    );

  }

}


async function addSimpleRecord(
  sheetName,
  obj
) {

  const result =
    await api(
      "addRecord",
      {

        sheetName,

        obj,

        userId:
          currentUser.id

      }
    );


  alert(
    result.message
  );


  if (result.success)
    load();

}


/* ==========================
   HELPERS
========================== */

function getRows(sheetName) {

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
      data.custody

  };


  return map[sheetName] || [];

}


function money(n) {

  return "৳" +
    Number(n || 0)
      .toLocaleString();

}


function setText(
  id,
  value
) {

  const el =
    document.getElementById(id);

  if (el)
    el.textContent =
      value;

}


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
