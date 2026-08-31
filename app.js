/* =====================================================
   MURAD BARI SOCIAL WELFARE FUND
   FRONTEND v2 FINAL
===================================================== */

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


/* =====================================================
   TRANSLATION
===================================================== */

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

    donorsMenu:
      "দাতা",

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
      "যোগ করুন",

    edit:
      "এডিট",

    delete:
      "ডিলিট",

    save:
      "সংরক্ষণ"

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

    donorsMenu:
      "Donors",

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
      "Add",

    edit:
      "Edit",

    delete:
      "Delete",

    save:
      "Save"

  }

};


/* =====================================================
   JSONP API
===================================================== */

function api(action, payload = {}) {

  return new Promise(function(resolve) {

    const callbackName =
      "muradBariCallback_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() * 99999
      );


    const script =
      document.createElement("script");


    let finished = false;


    function cleanup() {

      if (finished)
        return;

      finished = true;


      try {

        delete window[
          callbackName
        ];

      } catch (e) {}


      if (
        script &&
        script.parentNode
      ) {

        script.parentNode
          .removeChild(script);

      }

    }


    window[callbackName] =
      function(result) {

        cleanup();

        resolve(
          result || {

            success: false,

            message:
              "Empty API response"

          }
        );

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
          value !== null &&
          typeof value === "object"
        ) {

          value =
            JSON.stringify(value);

        }


        params.set(
          key,
          String(
            value ?? ""
          )
        );

      });


    script.src =
      API_URL +
      "?" +
      params.toString();


    script.onerror =
      function() {

        cleanup();


        resolve({

          success: false,

          message:
            "API connection failed. Google Apps Script deployment/check করুন।"

        });

      };


    document.body.appendChild(
      script
    );


    setTimeout(
      function() {

        if (!finished) {

          cleanup();

          resolve({

            success: false,

            message:
              "API response timeout."

          });

        }

      },
      30000
    );

  });

}


/* =====================================================
   LOGIN
===================================================== */

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


  const msg =
    document.getElementById(
      "msg"
    );


  if (!id || !password) {

    msg.textContent =
      "Login ID এবং Password দিন।";

    return;

  }


  msg.textContent =
    "Login হচ্ছে...";


  const result =
    await api(
      "login",
      {
        id,
        password
      }
    );


  if (!result.success) {

    msg.textContent =
      result.message ||
      "Login failed";

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
    await api(
      "getData"
    );


  if (!result.success) {

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
   RENDER
===================================================== */

function render() {

  const collectionTotal =
    data.collections.reduce(
      function(sum, item) {

        return sum +
          Number(
            item.amount || 0
          );

      },
      0
    );


  const expenseTotal =
    data.expenses.reduce(
      function(sum, item) {

        return sum +
          Number(
            item.amount || 0
          );

      },
      0
    );


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
    money(
      collectionTotal -
      expenseTotal
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
    document.getElementById(
      elementId
    );


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
    "<thead>" +
    "<tr>";


  columns.forEach(
    function(column) {

      html +=
        "<th>" +
        escapeHtml(
          column
        ) +
        "</th>";

    }
  );


  html +=
    "<th>Action</th>";

  html +=
    "</tr>" +
    "</thead>" +
    "<tbody>";


  rows.forEach(
    function(row) {

      html +=
        "<tr>";


      columns.forEach(
        function(column) {

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
            escapeHtml(
              value ?? ""
            ) +
            "</td>";

        }
      );


      const id =
        row.id;


      html +=
        "<td class='actions'>" +

        "<button " +
        "onclick=\"editRecord('" +
        escapeJs(sheetName) +
        "','" +
        escapeJs(id) +
        "')\">" +

        "✏️ " +
        T[lang].edit +

        "</button>" +

        " " +

        "<button " +
        "class='danger' " +
        "onclick=\"deleteRecord('" +
        escapeJs(sheetName) +
        "','" +
        escapeJs(id) +
        "')\">" +

        "🗑️ " +
        T[lang].delete +

        "</button>" +

        "</td>";


      html +=
        "</tr>";

    }
  );


  html +=
    "</tbody>" +
    "</table>" +
    "</div>";


  element.innerHTML =
    html;

}


/* =====================================================
   YEAR SUMMARY
===================================================== */

function renderYearSummary() {

  const el =
    document.getElementById(
      "yearSummary"
    );


  if (!el)
    return;


  const summary = {};


  data.activities.forEach(
    function(item) {

      const year =
        item.year || "Unknown";


      summary[year] =
        (summary[year] || 0) +
        1;

    }
  );


  const years =
    Object.keys(summary)
      .sort()
      .reverse();


  if (!years.length) {

    el.innerHTML =
      "<p>কোনো কার্যক্রম নেই।</p>";

    return;

  }


  let html =
    "<ul>";


  years.forEach(
    function(year) {

      html +=
        "<li>" +
        escapeHtml(year) +
        " : " +
        summary[year] +
        " টি কার্যক্রম" +
        "</li>";

    }
  );


  html +=
    "</ul>";


  el.innerHTML =
    html;

}


/* =====================================================
   ADD RECORD
===================================================== */

async function addDemo(
  sheetName
) {

  let obj = null;


  if (
    sheetName ===
    "Activities"
  ) {

    obj = {

      year:
        prompt(
          "Year",
          new Date()
            .getFullYear()
        ),

      name:
        prompt(
          "Activity Name"
        ),

      purpose:
        prompt(
          "Purpose"
        ),

      openingBalance:
        prompt(
          "Opening Balance",
          "0"
        ),

      status:
        prompt(
          "Status",
          "Active"
        )

    };

  }


  else if (
    sheetName ===
    "Donors"
  ) {

    obj = {

      name:
        prompt(
          "Donor Name"
        ),

      country:
        prompt(
          "Country"
        ),

      area:
        prompt(
          "Area"
        ),

      phone:
        prompt(
          "Phone"
        ),

      note:
        prompt(
          "Note"
        )

    };

  }


  else if (
    sheetName ===
    "Collections"
  ) {

    obj = {

      activityId:
        prompt(
          "Activity ID"
        ),

      donorId:
        prompt(
          "Donor ID"
        ),

      amount:
        prompt(
          "Amount"
        ),

      method:
        prompt(
          "Method"
        ),

      date:
        prompt(
          "Date",
          today()
        ),

      note:
        prompt(
          "Note"
        )

    };

  }


  else if (
    sheetName ===
    "Expenses"
  ) {

    obj = {

      activityId:
        prompt(
          "Activity ID"
        ),

      date:
        prompt(
          "Date",
          today()
        ),

      recipient:
        prompt(
          "Recipient"
        ),

      category:
        prompt(
          "Category"
        ),

      amount:
        prompt(
          "Amount"
        ),

      method:
        prompt(
          "Method"
        ),

      voucherNo:
        prompt(
          "Voucher No"
        ),

      note:
        prompt(
          "Note"
        )

    };

  }


  else if (
    sheetName ===
    "FundCustody"
  ) {

    obj = {

      locationType:
        prompt(
          "Location Type: Self / Bank / Person",
          "Self"
        ),

      custodianName:
        prompt(
          "Custodian Name"
        ),

      amount:
        prompt(
          "Amount"
        ),

      date:
        prompt(
          "Date",
          today()
        ),

      reason:
        prompt(
          "Reason"
        ),

      terms:
        prompt(
          "Terms"
        ),

      witnesses:
        prompt(
          "Witnesses"
        ),

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
        prompt(
          "Note"
        )

    };

  }


  if (!obj)
    return;


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
    result.message ||
    "Saved"
  );


  if (result.success)
    await load();

}


/* =====================================================
   EDIT RECORD
===================================================== */

async function editRecord(
  sheetName,
  id
) {

  const rows =
    getRows(sheetName);


  const record =
    rows.find(
      function(item) {

        return String(item.id) ===
          String(id);

      }
    );


  if (!record) {

    alert(
      "Record not found"
    );

    return;

  }


  const obj = {};


  const editableFields =
    Object.keys(record)
      .filter(
        function(field) {

          return (
            field !== "id" &&
            field !== "createdAt"
          );

        }
      );


  for (
    const field of editableFields
  ) {

    const answer =
      prompt(
        "Edit: " + field,
        record[field] ?? ""
      );


    if (answer === null) {

      return;

    }


    obj[field] =
      answer;

  }


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
    result.message ||
    "Updated"
  );


  if (result.success)
    await load();

}


/* =====================================================
   DELETE RECORD
===================================================== */

async function deleteRecord(
  sheetName,
  id
) {

  if (
    currentUser.role !==
    "admin"
  ) {

    alert(
      "শুধুমাত্র Admin Delete করতে পারবেন।"
    );

    return;

  }


  if (
    !confirm(
      "আপনি কি নিশ্চিতভাবে এই record Delete করতে চান?"
    )
  ) {

    return;

  }


  const password =
    prompt(
      "Admin Password দিন:"
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
    result.message ||
    "Delete completed"
  );


  if (result.success)
    await load();

}


/* =====================================================
   USERS
===================================================== */

function setupAdminMenu() {

  const isAdmin =
    currentUser &&
    String(
      currentUser.role
    ).toLowerCase() ===
    "admin";


  [
    "usersNav",
    "auditNav",
    "settingsNav"
  ]
  .forEach(
    function(id) {

      const el =
        document.getElementById(
          id
        );

      if (el) {

        el.hidden =
          !isAdmin;

      }

    }
  );

}


function renderUsers() {

  const el =
    document.getElementById(
      "usersTable"
    );


  if (!el)
    return;


  if (
    !currentUser ||
    currentUser.role !==
    "admin"
  ) {

    el.innerHTML =
      "<p>Admin access required.</p>";

    return;

  }


  if (!data.users.length) {

    el.innerHTML =
      "<p>No users found.</p>";

    return;

  }


  let html =
    "<div class='table-wrap'>" +
    "<table>" +
    "<thead>" +
    "<tr>" +
    "<th>User ID</th>" +
    "<th>Name</th>" +
    "<th>Role</th>" +
    "<th>Status</th>" +
    "<th>Action</th>" +
    "</tr>" +
    "</thead>" +
    "<tbody>";


  data.users.forEach(
    function(user) {

      const active =
        user.active === true ||
        String(
          user.active
        ).toLowerCase() ===
        "true";


      html +=
        "<tr>" +

        "<td>" +
        escapeHtml(
          user.id
        ) +
        "</td>" +

        "<td>" +
        escapeHtml(
          user.name
        ) +
        "</td>" +

        "<td>" +
        escapeHtml(
          user.role
        ) +
        "</td>" +

        "<td>" +
        (
          active
            ? "✅ Active"
            : "❌ Inactive"
        ) +
        "</td>" +

        "<td>" +

        "<button onclick=\"changeUserStatus('" +
        escapeJs(user.id) +
        "'," +
        (!active) +
        ")\">" +

        (
          active
            ? "Deactivate"
            : "Activate"
        ) +

        "</button>" +

        " " +

        "<button onclick=\"resetUserPassword('" +
        escapeJs(user.id) +
        "')\">" +

        "🔑 Reset Password" +

        "</button>" +

        " " +

        "<button class='danger' onclick=\"deleteUser('" +
        escapeJs(user.id) +
        "')\">" +

        "🗑️ Delete" +

        "</button>" +

        "</td>" +

        "</tr>";

    }
  );


  html +=
    "</tbody>" +
    "</table>" +
    "</div>";


  el.innerHTML =
    html;

}


/* =====================================================
   ADD USER
===================================================== */

async function addUser() {

  if (
    currentUser.role !==
    "admin"
  ) {

    alert(
      "Admin access required."
    );

    return;

  }


  const adminPassword =
    prompt(
      "আপনার Admin Password:"
    );


  if (adminPassword === null)
    return;


  const id =
    prompt(
      "নতুন User ID:"
    );


  if (!id)
    return;


  const name =
    prompt(
      "User Name:"
    );


  if (name === null)
    return;


  const password =
    prompt(
      "নতুন User Password:"
    );


  if (!password)
    return;


  const role =
    prompt(
      "Role: admin অথবা user",
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
            role || "user"

        }

      }
    );


  alert(
    result.message
  );


  if (result.success)
    await load();

}


/* =====================================================
   CHANGE USER STATUS
===================================================== */

async function changeUserStatus(
  userId,
  active
) {

  const password =
    prompt(
      "Admin Password:"
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
    await load();

}


/* =====================================================
   RESET PASSWORD
===================================================== */

async function resetUserPassword(
  userId
) {

  const adminPassword =
    prompt(
      "Admin Password:"
    );


  if (adminPassword === null)
    return;


  const newPassword =
    prompt(
      "নতুন Password:"
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


  alert(
    result.message
  );

}


/* =====================================================
   DELETE USER
===================================================== */

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
      "Admin Password:"
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
    await load();

}


/* =====================================================
   AUDIT LOG
===================================================== */

function renderAudit() {

  const el =
    document.getElementById(
      "auditTable"
    );


  if (!el)
    return;


  if (
    !currentUser ||
    currentUser.role !==
    "admin"
  ) {

    el.innerHTML =
      "<p>Admin access required.</p>";

    return;

  }


  if (!data.auditLog.length) {

    el.innerHTML =
      "<p>কোনো Audit Log নেই।</p>";

    return;

  }


  let html =
    "<div class='table-wrap'>" +
    "<table>" +
    "<thead>" +
    "<tr>" +

    "<th>Date</th>" +
    "<th>User</th>" +
    "<th>Action</th>" +
    "<th>Entity</th>" +
    "<th>Record ID</th>" +
    "<th>Details</th>" +

    "</tr>" +
    "</thead>" +
    "<tbody>";


  data.auditLog
    .slice()
    .reverse()
    .forEach(
      function(log) {

        html +=
          "<tr>" +

          "<td>" +
          escapeHtml(
            log.createdAt ?? ""
          ) +
          "</td>" +

          "<td>" +
          escapeHtml(
            log.userId ?? ""
          ) +
          "</td>" +

          "<td>" +
          escapeHtml(
            log.action ?? ""
          ) +
          "</td>" +

          "<td>" +
          escapeHtml(
            log.entity ?? ""
          ) +
          "</td>" +

          "<td>" +
          escapeHtml(
            log.entityId ?? ""
          ) +
          "</td>" +

          "<td>" +
          escapeHtml(
            log.details ?? ""
          ) +
          "</td>" +

          "</tr>";

      }
    );


  html +=
    "</tbody>" +
    "</table>" +
    "</div>";


  el.innerHTML =
    html;

}


/* =====================================================
   SETTINGS
===================================================== */

function loadSettingsToForm() {

  if (
    !currentUser ||
    currentUser.role !==
    "admin"
  )
    return;


  const settings = {};


  data.settings.forEach(
    function(item) {

      settings[
        item.key
      ] =
        item.value;

    }
  );


  const nameInput =
    document.getElementById(
      "systemName"
    );


  const languageInput =
    document.getElementById(
      "systemLanguage"
    );


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


async function saveSettings() {

  if (
    !currentUser ||
    currentUser.role !==
    "admin"
  ) {

    alert(
      "শুধুমাত্র Admin Settings পরিবর্তন করতে পারবেন।"
    );

    return;

  }


  const password =
    prompt(
      "Admin Password:"
    );


  if (password === null)
    return;


  const systemName =
    document
      .getElementById(
        "systemName"
      )
      .value
      .trim();


  const language =
    document
      .getElementById(
        "systemLanguage"
      )
      .value;


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


  if (
    result.success
  ) {

    document.title =
      systemName;

    document
      .getElementById(
        "brand"
      )
      .textContent =
      systemName;

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
    .querySelectorAll(
      "[data-t]"
    )
    .forEach(
      function(el) {

        const key =
          el.dataset.t;


        if (
          T[lang] &&
          T[lang][key]
        ) {

          el.textContent =
            T[lang][key];

        }

      }
    );


  const brand =
    document.getElementById(
      "brand"
    );


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
    document.getElementById(
      id
    );


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
      currentUser.role !==
      "admin"
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
    .forEach(
      function(section) {

        section.hidden =
          true;

      }
    );


  target.hidden =
    false;

}


/* =====================================================
   HELPERS
===================================================== */

function getRows(
  sheetName
) {

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


  return map[
    sheetName
  ] || [];

}


function getSettingsObject() {

  const obj = {};


  data.settings.forEach(
    function(item) {

      obj[
        item.key
      ] =
        item.value;

    }
  );


  return obj;

}


function money(value) {

  return (
    "৳" +
    Number(
      value || 0
    ).toLocaleString(
      "en-US"
    )
  );

}


function today() {

  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );

}


function setText(
  id,
  value
) {

  const el =
    document.getElementById(
      id
    );


  if (el)
    el.textContent =
      value;

}


function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
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


function escapeJs(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    )
    .replace(
      /\r/g,
      "\\r"
    )
    .replace(
      /\n/g,
      "\\n"
    );

}


/* =====================================================
   ENTER KEY LOGIN
===================================================== */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key ===
      "Enter" &&
      document
        .getElementById(
          "loginPage"
        )
        .hidden === false
    ) {

      doLogin();

    }

  }
);
