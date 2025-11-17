// UNIVERSAL TAB SWITCHING

function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((c) => {
    c.classList.add("hidden");
  });
  document.getElementById(tabName).classList.remove("hidden");
}

// DESKTOP TABS
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    showTab(btn.dataset.tab);
  });
});

// DESKTOP LOGOUT
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.sessionStorage.clear();
  window.location.href = "/login.html";
});

// MOBILE MENU TOGGLE
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});

// MOBILE TABS
document.querySelectorAll(".mobile-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    showTab(btn.dataset.tab);
    document.getElementById("mobileMenu").classList.add("hidden");
  });
});

// MOBILE LOGOUT
document.getElementById("logoutMobile").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.sessionStorage.clear();
  window.location.href = "/login.html";
});

// Fetch Employees
async function loadEmployees() {
  const res = await fetch("/api/admin/employees");
  const data = await res.json();

  const tbody = document.querySelector("#employeeTable tbody");
  const select = document.getElementById("pto_user");
  tbody.innerHTML = "";
  select.innerHTML = "";

  data.forEach((emp) => {
    tbody.innerHTML += `<tr><td>${emp.full_name}</td><td>${
      emp.username
    }</td><td>${emp.start_date.slice(0, 10)}</td></tr>`;
    select.innerHTML += `<option value="${emp.id}">${emp.full_name}</option>`;
  });
}

// Add Employee
document
  .getElementById("addEmployeeForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      full_name: document.getElementById("full_name").value,
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      start_date: document.getElementById("start_date").value,
    };

    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Employee added successfully!");
      document.getElementById("full_name").value = "";
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
      document.getElementById("start_date").value = "";
      await loadEmployees(), loadSummary();
    } else {
      alert("Error adding employee.");
    }
  });

// Add PTO Entry
document.getElementById("addPtoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    user_id: document.getElementById("pto_user").value,
    date: document.getElementById("pto_date").value,
    hours_used: document.getElementById("pto_hours").value,
  };

  const res = await fetch("/api/admin/pto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    alert("PTO entry added!");
    document.getElementById("pto_date").value = "";
    document.getElementById("pto_hours").value = 8;
    await loadSummary(), loadUpcoming();
  } else {
    alert("Error adding PTO entry.");
  }
});

// Load Summary
async function loadSummary() {
  const res = await fetch("/api/admin/summary");
  const data = await res.json();
  // Desktop Layout
  const tbody = document.querySelector("#summaryTable tbody");
  tbody.innerHTML = "";
  data.forEach((row) => {
    tbody.innerHTML += `<tr><td>${row.full_name}</td><td>${row.total_allowed}</td><td>${row.used}</td><td>${row.remaining}</td></tr>`;
  });
  // MOBILE CARDS
  const mobileContainer = document.querySelector("#summaryMobileContainer");
  mobileContainer.innerHTML = "";

  data.forEach((row) => {
    mobileContainer.innerHTML += `
      <div class="summary-card">
        <button class="summary-header">
          <span>${row.full_name}</span>
          <span class="arrow">▼</span>
        </button>

        <div class="summary-body">
          <div><strong>Total Allowed:</strong> ${row.total_allowed}</div>
          <div><strong>Used:</strong> ${row.used}</div>
          <div><strong>Remaining:</strong> ${row.remaining}</div>
        </div>
      </div>
    `;
  });

  // Enable expand/collapse
  document.querySelectorAll(".summary-header").forEach((header) => {
    header.addEventListener("click", () => {
      const body = header.nextElementSibling;
      const arrow = header.querySelector(".arrow");

      body.classList.toggle("open");
      arrow.classList.toggle("rotated");
    });
  });
}

// Load Upcoming PTO
async function loadUpcoming() {
  const res = await fetch("/api/admin/upcoming");
  const data = await res.json();

  const tbody = document.querySelector("#upcomingTable tbody");
  tbody.innerHTML = "";
  data.forEach((pto) => {
    console.log(pto.id);
    tbody.innerHTML += `<tr><td>${pto.full_name}</td><td>${pto.date.slice(
      0,
      10
    )}</td>
      <td>
        <button class="delete-btn" data-id="${pto.id}">X</button>
      </td>
    </tr>`;
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this PTO entry?")) {
        const res = await fetch(`/api/admin/pto/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("PTO entry deleted!");
          await loadUpcoming(), loadSummary();
        } else {
          alert("Error deleting PTO entry.");
        }
      }
    });
  });
}

// PTO Past Years History

async function loadPastPtoHistory() {
  const res = await fetch("/api/admin/pastptohistory");
  const data = await res.json();

  const tbody = document.querySelector("#pastPtoTable tbody");
  tbody.innerHTML = "";
  data.forEach((pto) => {
    console.log(pto.id);
    tbody.innerHTML += `<tr><td>${pto.full_name}</td><td>${pto.date.slice(
      0,
      10
    )}</td>
    </tr>`;
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this PTO entry?")) {
        const res = await fetch(`/api/admin/pto/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("PTO entry deleted!");
          await loadUpcoming(), loadSummary();
        } else {
          alert("Error deleting PTO entry.");
        }
      }
    });
  });
}

// Load PTO Policies
async function loadPolicies() {
  const res = await fetch("/api/policy");
  const data = await res.json();

  const tbody = document.querySelector("#policyTable tbody");
  tbody.innerHTML = "";
  data.forEach((p) => {
    tbody.innerHTML += `
      <tr>
        <td>${p.years_of_service}</td>
        <td><input type="number" class="daysInput" data-id="${p.id}" value="${p.days_allowed}" /></td>
        <td><input type="text" class="notesInput" data-id="${p.id}" value="${p.notes}" /></td>
        <td><button class="savePolicy" data-id="${p.id}">Save</button></td>
      </tr>`;
  });

  document.querySelectorAll(".savePolicy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const days = document.querySelector(`.daysInput[data-id="${id}"]`).value;
      const notes = document.querySelector(
        `.notesInput[data-id="${id}"]`
      ).value;

      const res = await fetch(`/api/admin/policy/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days_allowed: days, notes }),
      });

      if (res.ok) {
        alert("Policy updated!");
        await loadPolicies();
      } else alert("Error updating policy");
    });
  });

  // MOBILE DROPDOWN CARDS
  const mobileContainer = document.querySelector("#policyMobileContainer");
  mobileContainer.innerHTML = "";

  data.forEach((p) => {
    mobileContainer.innerHTML += `
    <div class="policy-card">
      <button class="policy-header">
        <span>${p.years_of_service} Years</span>
        <span class="arrow">▼</span>
      </button>

      <div class="policy-body">
        <label>Days Allowed</label>
        <input type="number" class="daysInput" data-id="${p.id}" value="${p.days_allowed}" />

        <label>Notes</label>
        <input type="text" class="notesInput" data-id="${p.id}" value="${p.notes}" />

        <button class="savePolicy" data-id="${p.id}">Save</button>
      </div>
    </div>
  `;
  });

  // Enable dropdown behavior
  document.querySelectorAll(".policy-header").forEach((header) => {
    header.addEventListener("click", () => {
      const body = header.nextElementSibling;
      body.classList.toggle("open");
    });
  });

  // Attach savePolicy click events for mobile
  mobileContainer.querySelectorAll(".savePolicy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const days = mobileContainer.querySelector(
        `.daysInput[data-id="${id}"]`
      ).value;
      const notes = mobileContainer.querySelector(
        `.notesInput[data-id="${id}"]`
      ).value;

      const res = await fetch(`/api/admin/policy/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days_allowed: days, notes }),
      });

      if (res.ok) {
        alert("Policy updated!");
        await loadPolicies();
      } else alert("Error updating policy");
    });
  });
}

// Load all on startup
loadEmployees();
loadSummary();
loadUpcoming();
loadPastPtoHistory();
loadPolicies();
