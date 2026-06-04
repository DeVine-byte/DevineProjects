const APP_PREFIX = "/finance";
const API = `${window.location.origin}${APP_PREFIX}`;
let pieChart, barChart;

// ========================
// CSRF HELPER
// ========================
function getCSRF() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("csrf_token="))
        ?.split("=")[1];
}

// ========================
// TOAST SYSTEM
// ========================
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");

    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}

// ========================
// FETCH WRAPPER (FIXED)
// ========================
async function apiFetch(url, options = {}) {
    const config = {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": getCSRF(),
            ...(options.headers || {})
        },
        ...options
    };

    let res = await fetch(url, config);

    // AUTO REFRESH
    if (res.status === 401) {
        const refresh = await fetch(`${API}/auth/refresh`, {
            method: "POST",
            credentials: "include"
        });

        if (!refresh.ok) {
            showAuthModal();
            showToast("Session expired. Please login again.", "error");
            throw new Error("Session expired");
        }

        res = await fetch(url, config);
    }

    let data = null;

    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        throw new Error(data?.detail || data?.msg || "Request failed");
    }

    return data;
}

// ========================
// BOOT
// ========================
document.addEventListener("DOMContentLoaded", async () => {
    showAuthModal();

    const isLoggedIn = await checkAuth();

    if (!isLoggedIn) return;

    await loadAll();
    showApp();
});

// ========================
// AUTH CHECK
// ========================
async function checkAuth() {
    try {
        await apiFetch(`${API}/auth/me`);
        return true;
    } catch {
        return false;
    }
}

// ========================
// UI
// ========================
function showAuthModal() {
    document.getElementById("authModal").classList.remove("hidden");
}

function showApp() {
    document.getElementById("authModal").classList.add("hidden");
}

// ========================
// LOGIN
// ========================
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) return showToast("Enter email and password", "error");

    try {
        await apiFetch(`${API}/auth/login`, {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        showToast("Login successful", "success");

        await loadAll();
        showApp();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ========================
// SIGNUP
// ========================
async function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) return showToast("Enter email and password", "error");

    try {
        await apiFetch(`${API}/auth/signup`, {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        showToast("Account created", "success");

        await loadAll();
        showApp();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ========================
// LOAD ALL
// ========================
async function loadAll() {
    await loadReport("weekly");
    await loadTransactions();
}

// ========================
// TRANSACTIONS
// ========================
async function addIncome() {
    const amount = document.getElementById("incomeAmount").value;
    const desc = document.getElementById("incomeDesc").value;

    await apiFetch(`${API}/transactions/income`, {
        method: "POST",
        body: JSON.stringify({
            amount: Number(amount),
            description: desc,
            date: new Date().toISOString()
        })
    });

    document.getElementById("incomeAmount").value = "";
    document.getElementById("incomeDesc").value = "";

    await loadAll();
}

async function addExpense() {
    const amount = document.getElementById("expenseAmount").value;
    const desc = document.getElementById("expenseDesc").value;

    await apiFetch(`${API}/transactions/expense`, {
        method: "POST",
        body: JSON.stringify({
            amount: Number(amount),
            category: document.getElementById("category").value,
            description: desc,
            date: new Date().toISOString()
        })
    });

    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDesc").value = "";

    await loadAll();
}

// ========================
// LOAD TRANSACTIONS (FIXED BUG)
// ========================
async function loadTransactions() {
    const data = await apiFetch(`${API}/transactions`);

    const container = document.getElementById("transactionList");
    container.innerHTML = "";

    data.reverse().forEach(t => {
        const row = document.createElement("div");

        row.innerHTML = `
            <span>${t.date ? t.date.split("T")[0] : "-"}</span>
            <span>${t.type}</span>
            <span>₦${t.amount}</span>
            <span>${t.category || "-"}</span>
            <span>${t.description || "-"}</span>
        `;

        container.appendChild(row);
    });
}

// ========================
// REPORTS
// ========================
async function loadReport(range) {
    const data = await apiFetch(`${API}/reports/summary?range=${range}`);

    document.getElementById("balance").innerText = data.balance || 0;
    document.getElementById("totalIncome").innerText = data.total_income || 0;
    document.getElementById("totalExpense").innerText = data.total_expense || 0;

    updateCharts(data);
}

// ========================
// CHARTS
// ========================
function updateCharts(data) {
    const categories = data.category_breakdown || {};

    const pieCanvas = document.getElementById("pieChart");
    const barCanvas = document.getElementById("barChart");

    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    pieChart = new Chart(pieCanvas, {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories)
            }]
        }
    });

    barChart = new Chart(barCanvas, {
        type: "bar",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [
                    data.total_income || 0,
                    data.total_expense || 0
                ]
            }]
        }
    });
}

// ========================
// EXPORT
// ========================
async function exportMonthly() {
    const month = document.getElementById("monthFilter").value;

    const data = await apiFetch(`${API}/transactions`);

    const filtered = data.filter(t =>
        new Date(t.date).toISOString().slice(0, 7) === month
    );

    renderPrintableTransactions(filtered, month);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => window.print());
    });
}

function renderPrintableTransactions(transactions, month) {
    const container = document.getElementById("printSection");

    container.innerHTML = `
        <h2>${month}</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(t => `
                    <tr>
                        <td>${t.date ? t.date.split("T")[0] : "-"}</td>
                        <td>${t.type}</td>
                        <td>${t.amount}</td>
                        <td>${t.description || "-"}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
                     }
