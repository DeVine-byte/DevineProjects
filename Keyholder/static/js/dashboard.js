document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     STATE
  ============================================================ */

  let allAccounts = [];
  let editMode = false;
  let editAccountId = null;
  let deleteId = null;

  /* ============================================================
     ELEMENTS
  ============================================================ */

  const accountsList = document.getElementById("accountsList");
  const searchInput = document.getElementById("searchInput");

  const accName = document.getElementById("accName");
  const passwordInput = document.getElementById("accPassword");

  const saveBtn = document.getElementById("saveBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const togglePasswordBtn = document.getElementById("togglePasswordBtn");

  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");

  const deleteModal = document.getElementById("deleteModal");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelDelete = document.getElementById("cancelDelete");

  /* ============================================================
     NOTIFICATIONS
  ============================================================ */

  function notify(message, color = "green") {

    const div = document.createElement("div");

    div.textContent = message;

    div.style.position = "fixed";
    div.style.top = "20px";
    div.style.right = "20px";
    div.style.background = color;
    div.style.color = "white";
    div.style.padding = "10px 15px";
    div.style.borderRadius = "6px";
    div.style.zIndex = "9999";
    div.style.fontWeight = "bold";

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 3000);

  }
  const API_BASE = "/keyholder";

  /* ============================================================
     CSRF TOKEN
  ============================================================ */

  function getCSRFToken() {

    const match = document.cookie.match(/X-CSRF-Token=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : "";

  }

  /* ============================================================
     RESET FORM
  ============================================================ */

  function resetForm() {

    accName.value = "";
    passwordInput.value = "";

    passwordInput.type = "password";

    togglePasswordBtn.textContent = "👁";

    editMode = false;
    editAccountId = null;

    saveBtn.textContent = "Save Account";

    resetStrength();

  }

  /* ============================================================
     RESET STRENGTH
  ============================================================ */

  function resetStrength() {

    strengthBar.style.width = "0%";
    strengthText.textContent = "";

  }

  /* ============================================================
     LOAD USERNAME
  ============================================================ */

  async function loadUsername() {

    try {

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();

      if (!data.success) {

        window.location.href = "/";
        return;

      }

      document.getElementById("usernameDisplay").textContent =
        data.username || "User";

    } catch (err) {

      console.error(err);

    }

  }

  /* ============================================================
     LOAD ACCOUNTS
  ============================================================ */

  async function loadAccounts() {

    try {

      const res = await fetch(`${API_BASE}/api/password/list`, {
        method: "GET",
        credentials: "include"
      });

      if (res.status === 401) {

        window.location.href = "/";
        return;

      }

      const data = await res.json();

      if (!data.success) {

        notify(data.message || "Failed loading accounts", "red");
        return;

      }

      allAccounts = data.accounts || [];

      renderAccounts(allAccounts);

    } catch (err) {

      console.error(err);

      notify("Could not load accounts", "red");

    }

  }

  /* ============================================================
     RENDER ACCOUNTS
  ============================================================ */

  function renderAccounts(accounts) {

    accountsList.innerHTML = "";

    if (!accounts.length) {

      accountsList.innerHTML = `
        <p>No accounts saved.</p>
      `;

      return;

    }

    accounts.forEach(acc => {

      const div = document.createElement("div");

      div.className = "account-box";

      div.dataset.id = acc.id;

      div.innerHTML = `
        <div style="
          border:1px solid #ccc;
          padding:15px;
          border-radius:10px;
          margin-bottom:15px;
        ">

          <h3>${acc.account_name}</h3>

          <p 
            id="pw-${acc.id}" 
            style="
              display:none;
              margin-top:10px;
              word-break:break-all;
            "
          ></p>

          <div style="
            display:flex;
            gap:10px;
            margin-top:10px;
            flex-wrap:wrap;
          ">

            <button class="btn-show">
              Show
            </button>

            <button class="btn-copy">
              Copy
            </button>

            <button class="btn-edit">
              Edit
            </button>

            <button 
              class="btn-delete"
              style="
                background:red;
                color:white;
              "
            >
              Delete
            </button>

          </div>

        </div>
      `;

      accountsList.appendChild(div);

    });

  }

  /* ============================================================
     PASSWORD TOGGLE
  ============================================================ */

  togglePasswordBtn.addEventListener("click", () => {

    if (passwordInput.type === "password") {

      passwordInput.type = "text";

      togglePasswordBtn.textContent = "🙈";

    } else {

      passwordInput.type = "password";

      togglePasswordBtn.textContent = "👁";

    }

  });

  /* ============================================================
     PASSWORD STRENGTH
  ============================================================ */

  passwordInput.addEventListener("input", () => {

    const value = passwordInput.value;

    let score = 0;

    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const widths = [
      "0%",
      "25%",
      "50%",
      "75%",
      "100%"
    ];

    const texts = [
      "",
      "Weak",
      "Fair",
      "Good",
      "Strong"
    ];

    strengthBar.style.width = widths[score];

    strengthText.textContent = texts[score];

  });

  /* ============================================================
     SAVE / UPDATE ACCOUNT
  ============================================================ */

  saveBtn.addEventListener("click", async () => {

    try {

      const name = accName.value.trim();

      const password = passwordInput.value.trim();

      if (!name || !password) {

        notify("All fields required", "red");

        return;

      }

      /* =========================
         UPDATE
      ========================= */

      if (editMode) {

        const res = await fetch(`${API_BASE}/api/password/edit/${editAccountId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": getCSRFToken()
          },
          body: JSON.stringify({
            account_name: name,
            account_password: password
          })
        });

        const data = await res.json();

        if (data.success) {

          notify("Account updated");

          resetForm();

          loadAccounts();

        } else {

          notify(data.message || "Update failed", "red");

        }

        return;

      }

      /* =========================
         CREATE
      ========================= */

      const res = await fetch(`${API_BASE}/api/password/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCSRFToken()
        },
        body: JSON.stringify({
          account_name: name,
          account_password: password
        })
      });

      const data = await res.json();

      if (data.success) {

        notify("Account saved");

        resetForm();

        loadAccounts();

      } else {

        notify(data.message || "Save failed", "red");

      }

    } catch (err) {

      console.error(err);

      notify("Save failed", "red");

    }

  });

  /* ============================================================
     SHOW PASSWORD
  ============================================================ */

  async function togglePassword(id) {

    try {

      const pw = document.getElementById(`pw-${id}`);

      if (pw.style.display === "block") {

        pw.style.display = "none";

        return;

      }

      const res = await fetch(`${API_BASE}/api/password/show/${id}`, {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();

      if (!data.success) {

        notify(data.message || "Could not retrieve password", "red");

        return;

      }

      pw.textContent = data.password;

      pw.style.display = "block";

    } catch (err) {

      console.error(err);

      notify("Error showing password", "red");

    }

  }

  /* ============================================================
     COPY PASSWORD
  ============================================================ */

  async function copyPassword(id) {

    try {

      const res = await fetch(`${API_BASE}/api/password/show/${id}`, {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();

      if (!data.success) {

        notify(data.message || "Copy failed", "red");

        return;

      }

      await navigator.clipboard.writeText(data.password);

      notify("Password copied");

    } catch (err) {

      console.error(err);

      notify("Copy failed", "red");

    }

  }

  /* ============================================================
     EDIT ACCOUNT
  ============================================================ */

  function editAccount(id) {

    const account = allAccounts.find(acc =>
      String(acc.id) === String(id)
    );

    if (!account) return;

    accName.value = account.account_name;

    passwordInput.value = "";

    editMode = true;

    editAccountId = id;

    saveBtn.textContent = "Update Account";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }

  /* ============================================================
     DELETE ACCOUNT
  ============================================================ */

  function deleteAccount(id) {

    deleteId = id;

    deleteModal.style.display = "flex";

  }

  confirmDelete.addEventListener("click", async () => {

    try {

      const res = await fetch(`${API_BASE}/api/password/delete/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCSRFToken()
        }
      });

      const data = await res.json();

      if (data.success) {

        notify("Account deleted");

        loadAccounts();

      } else {

        notify(data.message || "Delete failed", "red");

      }

    } catch (err) {

      console.error(err);

      notify("Delete failed", "red");

    }

    deleteModal.style.display = "none";

    deleteId = null;

  });

  cancelDelete.addEventListener("click", () => {

    deleteModal.style.display = "none";

    deleteId = null;

  });

  /* ============================================================
     EVENT DELEGATION
  ============================================================ */

  accountsList.addEventListener("click", (e) => {

    const btn = e.target;

    const box = btn.closest(".account-box");

    if (!box) return;

    const id = box.dataset.id;

    if (btn.classList.contains("btn-show")) {

      togglePassword(id);

    }

    else if (btn.classList.contains("btn-copy")) {

      copyPassword(id);

    }

    else if (btn.classList.contains("btn-edit")) {

      editAccount(id);

    }

    else if (btn.classList.contains("btn-delete")) {

      deleteAccount(id);

    }

  });

  /* ============================================================
     SEARCH
  ============================================================ */

  searchInput.addEventListener("input", () => {

    const query = searchInput.value.toLowerCase();

    const filtered = allAccounts.filter(acc =>
      acc.account_name.toLowerCase().includes(query)
    );

    renderAccounts(filtered);

  });

  /* ============================================================
     LOGOUT
  ============================================================ */

  logoutBtn.addEventListener("click", async () => {

    try {

      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCSRFToken()
        }
      });

    } catch (err) {

      console.error(err);

    }

    window.location.href = "/keyholder";

  });

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  loadUsername();

  loadAccounts();

});
