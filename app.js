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
  auditLog: []
};


/* =========================
   TRANSLATIONS
========================= */

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
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    confirmDelete: "আপনি কি এই রেকর্ডটি মুছে ফেলতে চান?",
    adminId: "অ্যাডমিন ID",
    adminPassword: "অ্যাডমিন Password",

    systemName: "সিস্টেমের নাম",
    language: "ভাষা",

    userId: "User ID",
    userName: "নাম",
    role: "Role",
    active: "Active",
    password: "Password",

    action: "কাজ",
    entity: "বিষয়",
    entityId: "Record ID",
    details: "বিস্তারিত",
    dateTime: "তারিখ ও সময়"
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
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Do you want to delete this record?",
    adminId: "Admin ID",
    adminPassword: "Admin Password",

    systemName: "System Name",
    language: "Language",

    userId: "User ID",
    userName: "Name",
    role: "Role",
    active: "Active",
    password: "Password",

    action: "Action",
    entity: "Entity",
    entityId: "Record ID",
    details: "Details",
    dateTime: "Date & Time"
  }

};


/* =========================
   LANGUAGE
========================= */

function toggleLang() {

  lang = lang === "bn" ? "en" : "bn";

  document
    .querySelectorAll("[data-t]")
    .forEach(function (e) {

      const key = e.dataset.t;

      if (T[lang][key]) {
        e.textContent = T[lang][key];
      }

    });

  const brand = document.getElementById("brand");

  if (brand) {
    brand.textContent = T[lang].title;
  }
}


/* =========================
   LOGIN
========================= */

function doLogin() {

  const id = document
    .getElementById("loginId")
    .value
    .trim();

  const p = document
    .getElementById("loginPass")
    .value;

  if (!id || !p) {

    document.getElementById("msg").textContent =
      lang === "bn"
        ? "ID এবং Password দিন"
        : "Enter ID and Password";

    return;
  }


  google.script.run

    .withSuccessHandler(function (r) {

      if (r.success) {

        currentUser = r.user;

        const loginPage =
          document.getElementById("loginPage");

        const app =
          document.getElementById("app");

        if (loginPage) loginPage.hidden = true;
        if (app) app.hidden = false;


        const user =
          document.getElementById("user");

        if (user) {
          user.textContent =
            r.user.name + " (" + r.user.role + ")";
        }


        load();

      } else {

        document.getElementById("msg").textContent =
          r.message;

      }

    })

    .withFailureHandler(function (err) {

      alert(err.message || err);

    })

    .login(id, p);
}


/* =========================
   LOAD ALL DATA
========================= */

function load() {

  google.script.run

    .withSuccessHandler(function (r) {

      data = r || {};

      data.activities ||= [];
      data.donors ||= [];
      data.collections ||= [];
      data.expenses ||= [];
      data.custody ||= [];
      data.transfers ||= [];
      data.users ||= [];
      data.auditLog ||= [];

      render();

    })

    .withFailureHandler(function (err) {

      alert(err.message || err);

    })

    .getData();
}


/* =========================
   MONEY
========================= */

function money(n) {

  return "৳" +
    Number(n || 0)
      .toLocaleString();
}


/* =========================
   DASHBOARD
========================= */

function render() {

  const collection =
    data.collections.reduce(
      (s, x) => s + Number(x.amount || 0),
      0
    );

  const expense =
    data.expenses.reduce(
      (s, x) => s + Number(x.amount || 0),
      0
    );


  const balance = collection - expense;


  const totalCollection =
    document.getElementById("totalCollection");

  const totalExpense =
    document.getElementById("totalExpense");

  const balanceEl =
    document.getElementById("balance");

  const donorCount =
    document.getElementById("donorCount");


  if (totalCollection)
    totalCollection.textContent = money(collection);

  if (totalExpense)
    totalExpense.textContent = money(expense);

  if (balanceEl)
    balanceEl.textContent = money(balance);

  if (donorCount)
    donorCount.textContent =
      data.donors.length;


  table(
    "activitiesTable",
    data.activities,
    ["year", "name", "purpose", "status"],
    "Activities"
  );


  table(
    "collectionsTable",
    data.collections,
    ["date", "donorId", "amount", "method", "note"],
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


/* =========================
   TABLE
========================= */

function table(id, rows, cols, entity) {

  const el =
    document.getElementById(id);

  if (!el) return;


  if (!rows || !rows.length) {

    el.innerHTML =
      "<p>" +
      (lang === "bn"
        ? "কোনো তথ্য নেই।"
        : "No data yet.") +
      "</p>";

    return;
  }


  let html = `
    <table>
      <thead>
        <tr>
  `;


  cols.forEach(function (c) {

    html += `<th>${escapeHtml(c)}</th>`;

  });


  html += "<th>Action</th></tr></thead><tbody>";


  rows.forEach(function (r) {

    html += "<tr>";


    cols.forEach(function (c) {

      html +=
        `<td>${escapeHtml(r[c] ?? "")}</td>`;

    });


    html += `
      <td>
        <button onclick="editRecord('${entity}','${r.id}')">
          ${T[lang].edit}
        </button>

        <button onclick="deleteRecord('${entity}','${r.id}')">
          ${T[lang].delete}
        </button>
      </td>
    `;


    html += "</tr>";

  });


  html += "</tbody></table>";

  el.innerHTML = html;
}


/* =========================
   EDIT RECORD
========================= */

function editRecord(sheetName, id) {

  const rows = getRowsBySheet(sheetName);

  const record =
    rows.find(x => String(x.id) === String(id));

  if (!record) {

    alert(
      lang === "bn"
        ? "রেকর্ড পাওয়া যায়নি।"
        : "Record not found."
    );

    return;
  }


  const fields =
    Object.keys(record)
      .filter(k =>
        k !== "id" &&
        k !== "createdAt"
      );


  const obj = {};


  for (const field of fields) {

    let value = prompt(
      field,
      record[field] ?? ""
    );


    if (value === null) {
      return;
    }


    obj[field] = value;
  }


  google.script.run

    .withSuccessHandler(function (r) {

      alert(r.message);

      if (r.success) {
        load();
      }

    })

    .withFailureHandler(function (err) {

      alert(err.message || err);

    })

    .updateRecord(
      sheetName,
      id,
      obj,
      currentUser.id
    );
}


/* =========================
   DELETE RECORD
========================= */

function deleteRecord(sheetName, id) {

  if (!confirm(T[lang].confirmDelete)) {
    return;
  }


  const adminId =
    prompt(T[lang].adminId);

  if (adminId === null) return;


  const password =
    prompt(T[lang].adminPassword);

  if (password === null) return;


  google.script.run

    .withSuccessHandler(function (r) {

      alert(r.message);

      if (r.success) {
        load();
      }

    })

    .withFailureHandler(function (err) {

      alert(err.message || err);

    })

    .deleteRecord(
      sheetName,
      id,
      adminId,
      password
    );
}


/* =========================
   GET ROWS
========================= */

function getRowsBySheet(sheetName) {

  const map = {

    Activities: data.activities,

    Donors: data.donors,

    Collections: data.collections,

    Expenses: data.expenses,

    FundCustody: data.custody,

    FundTransfers: data.transfers,

    Users: data.users,

    AuditLog: data.auditLog

  };


  return map[sheetName] || [];
}


/* =========================
   USERS
========================= */

function renderUsers() {

  const el =
    document.getElementById("usersTable");

  if (!el) return;


  if (!data.users.length) {

    el.innerHTML =
      "<p>No users found.</p>";

    return;
  }


  let html = `
    <table>
      <thead>
        <tr>
          <th>${T[lang].userId}</th>
          <th>${T[lang].userName}</th>
          <th>${T[lang].role}</th>
          <th>${T[lang].active}</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;


  data.users.forEach(function (u) {

    html += `
      <tr>

        <td>${escapeHtml(u.id)}</td>

        <td>${escapeHtml(u.name)}</td>

        <td>${escapeHtml(u.role)}</td>

        <td>${u.active ? "✅" : "❌"}</td>

        <td>

          <button
            onclick="changeUserStatus('${escapeAttr(u.id)}',${!u.active})">
            ${u.active ? "Deactivate" : "Activate"}
          </button>

          <button
            onclick="resetUserPassword('${escapeAttr(u.id)}')">
            Reset Password
          </button>

          <button
            onclick="deleteUser('${escapeAttr(u.id)}')">
            Delete
          </button>

        </td>

      </tr>
    `;

  });


  html += "</tbody></table>";

  el.innerHTML = html;
}


/* =========================
   ADD USER
========================= */

function addUser() {

  const adminPassword =
    prompt(T[lang].adminPassword);

  if (adminPassword === null) return;


  const id =
    prompt("User ID");

  if (!id) return;


  const name =
    prompt("Name");

  if (name === null) return;


  const password =
    prompt("Password");

  if (!password) return;


  const role =
    prompt("Role: admin / user", "user");


  google.script.run

    .withSuccessHandler(function (r) {

      alert(r.message);

      if (r.success) load();

    })

    .addUser(
      currentUser.id,
      adminPassword,
      {
        id: id,
        name: name,
        password: password,
        role: role || "user",
        active: true
      }
    );
}


/* =========================
   USER STATUS
========================= */

function changeUserStatus(userId, active) {

  const password =
    prompt(T[lang].adminPassword);

  if (password === null) return;


  google.script.run

    .withSuccessHandler(function (r) {

      alert(r.message);

      if (r.success) load();

    })

    .setUserStatus(
      currentUser.id,
      password,
      userId,
      active
    );
}


/* =========================
   RESET PASSWORD
========================= */

function resetUserPassword(userId) {

  const adminPassword =
    prompt(T[lang].adminPassword);

  if (adminPassword === null) return;


  const newPassword =
    prompt(
      lang === "bn"
        ? "নতুন Password দিন"
        : "Enter new password"
    );

  if (!newPassword) return;


  google.script.run

    .withSuccessHandler(function (r) {

      alert(r.message);

    })

    .resetUserPassword(
      currentUser.id,
      adminPassword,
      userId,
      newPassword
    );
}


/* =========================
   DELETE USER
========================= */

function deleteUser(userId) {

  if (
    !confirm(
      lang === "bn"
        ? "এই User মুছে ফেলবেন?"
        : "Delete this user?"
    )
  ) {
    return;
  }


  const password =
    prompt(T[lang].adminPassword);

  if (password === null) return;


  google.script.run

    .withSuccessHandler(function (r) {

      alert(r.message);

      if (r.success) load();

    })

    .deleteUser(
      currentUser.id,
      password,
      userId
    );
}


/* =========================
   AUDIT LOG
========================= */

function renderAuditLog() {

  const el =
    document.getElementById("auditTable");

  if (!el) return;


  if (!data.auditLog.length) {

    el.innerHTML =
      "<p>No audit records.</p>";

    return;
  }


  let html = `
    <table>

      <thead>

        <tr>
          <th>${T[lang].dateTime}</th>
          <th>${T[lang].userId}</th>
          <th>${T[lang].action}</th>
          <th>${T[lang].entity}</th>
          <th>${T[lang].entityId}</th>
          <th>${T[lang].details}</th>
        </tr>

      </thead>

      <tbody>
  `;


  data.auditLog
    .slice()
    .reverse()
    .forEach(function (a) {

      html += `
        <tr>

          <td>${escapeHtml(a.createdAt ?? "")}</td>

          <td>${escapeHtml(a.userId ?? "")}</td>

          <td>${escapeHtml(a.action ?? "")}</td>

          <td>${escapeHtml(a.entity ?? "")}</td>

          <td>${escapeHtml(a.entityId ?? "")}</td>

          <td>${escapeHtml(a.details ?? "")}</td>

        </tr>
      `;

    });


  html += "</tbody></table>";

  el.innerHTML = html;
}


/* =========================
   SETTINGS
========================= */

function saveSettings() {

  const systemName =
    document.getElementById("systemName");

  const language =
    document.getElementById("systemLanguage");


  if (!systemName || !language) {
    return;
  }


  const password =
    prompt(T[lang].adminPassword);

  if (password === null) return;


  const settings = {

    systemName:
      systemName.value.trim(),

    language:
      language.value

  };


  google.script.run

    .withSuccessHandler(function (r) {

      alert(
        r.message ||
        "Settings saved."
      );

    })

    .saveSettings(
      currentUser.id,
      password,
      settings
    );
}


/* =========================
   PROTECTED ACTION
========================= */

function protectedAction(action) {

  const id =
    prompt(T[lang].adminId);

  if (id === null) return;


  const p =
    prompt(T[lang].adminPassword);

  if (p === null) return;


  if (
    !confirm(
      "Confirm " + action + "?"
    )
  ) {
    return;
  }


  google.script.run

    .withSuccessHandler(function (r) {

      alert(r.message);

    })

    .adminAction(
      id,
      p,
      action
    );
}


/* =========================
   NAVIGATION
========================= */

function show(id) {

  document
    .querySelectorAll("main>section")
    .forEach(function (s) {

      s.hidden = true;

    });


  const el =
    document.getElementById(id);

  if (el) {
    el.hidden = false;
  }


  if (id === "users") {

    if (
      !currentUser ||
      currentUser.role !== "admin"
    ) {

      alert(
        lang === "bn"
          ? "শুধু Admin এই অংশ দেখতে পারবেন।"
          : "Only Admin can access this section."
      );

      return;
    }

    load();

  }


  if (id === "audit") {

    if (
      !currentUser ||
      currentUser.role !== "admin"
    ) {

      alert(
        lang === "bn"
          ? "শুধু Admin এই অংশ দেখতে পারবেন।"
          : "Only Admin can access this section."
      );

      return;
    }

    load();

  }

}


/* =========================
   HTML SECURITY
========================= */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeAttr(value) {

  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}


/* =========================
   DEMO ADD
========================= */

function addDemo(sheet) {

  alert(
    lang === "bn"
      ? "Database/API প্রস্তুত আছে। এখন এই অংশের পূর্ণ input form যুক্ত করা যাবে।"
      : "Database/API is ready. The full input form can now be connected."
  );

}
