// CSRF TOKEN READER
function getCSRFToken() {
  const name = "X-CSRF-Token=";
  const cookies = decodeURIComponent(document.cookie).split(";");

  for (let c of cookies) {
    c = c.trim();

    if (c.startsWith(name)) {
      return c.substring(name.length);
    }
  }

  return "";
}

// PASSWORD VALIDATION
function validatePassword(password) {
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!strongRegex.test(password)) {
    return "Password must include uppercase, lowercase, number, and special character.";
  }

  return null;
}

document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------
  // Modal Handling
  // ---------------------------
  const authBtns = document.getElementsByClassName("authBtn");
  const modal = document.getElementById("authModal");
  const closeBtn = document.querySelector(".close");

  Array.from(authBtns).forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.style.display = "block";
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // ---------------------------
  // Tab Switching
  // ---------------------------
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.add("active");
    loginForm.classList.remove("active");
  });

  // ---------------------------
  // API Endpoint
  // ---------------------------
  const API_URL = "/api/auth";

  /* ============================================================
     🔐 PASSWORD SHOW/HIDE (LOGIN + REGISTER)
     ============================================================ */

  function attachToggle(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Show";
    btn.style.marginLeft = "8px";
    btn.style.cursor = "pointer";

    input.parentNode.appendChild(btn);

    btn.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.textContent = isHidden ? "Hide" : "Show";
    });
  }

  attachToggle("loginPassword");
  attachToggle("registerPassword");

  /* ============================================================
     📊 PASSWORD STRENGTH (REGISTER ONLY)
     ============================================================ */

  const registerPassword = document.getElementById("registerPassword");

  const strengthBar = document.createElement("div");
  const strengthText = document.createElement("small");

  strengthBar.style.height = "5px";
  strengthBar.style.width = "0%";
  strengthBar.style.background = "red";
  strengthBar.style.marginTop = "5px";
  strengthBar.style.transition = "0.3s";

  registerPassword.parentNode.appendChild(strengthBar);
  registerPassword.parentNode.appendChild(strengthText);

  registerPassword.addEventListener("input", () => {
    const password = registerPassword.value;

    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        strengthBar.style.width = "20%";
        strengthBar.style.background = "red";
        strengthText.textContent = "Very Weak";
        break;

      case 2:
        strengthBar.style.width = "40%";
        strengthBar.style.background = "orange";
        strengthText.textContent = "Weak";
        break;

      case 3:
        strengthBar.style.width = "60%";
        strengthBar.style.background = "yellow";
        strengthText.textContent = "Medium";
        break;

      case 4:
        strengthBar.style.width = "80%";
        strengthBar.style.background = "blue";
        strengthText.textContent = "Strong";
        break;

      case 5:
        strengthBar.style.width = "100%";
        strengthBar.style.background = "green";
        strengthText.textContent = "Very Strong";
        break;
    }
  });

  // ---------------------------
  // REGISTER
  // ---------------------------
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    const error = validatePassword(password);

    if (error) {
      alert(error);
      return;
    }

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCSRFToken()
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "/dashboard";
    } else {
      alert(data.message || "Registration failed.");
    }
  });

  // ---------------------------
  // LOGIN
  // ---------------------------
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCSRFToken()
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "/dashboard";
    } else {
      alert(data.message || "Login failed.");
    }
  });

});
