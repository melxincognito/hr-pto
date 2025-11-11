// Tab navigation
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.add("hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  });
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout");
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

      loadEmployees();
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
  } else {
    alert("Error adding PTO entry.");
  }
});

// Load Summary
async function loadSummary() {
  const res = await fetch("/api/admin/summary");
  const data = await res.json();

  const tbody = document.querySelector("#summaryTable tbody");
  tbody.innerHTML = "";
  data.forEach((row) => {
    tbody.innerHTML += `<tr><td>${row.full_name}</td><td>${row.total_allowed}</td><td>${row.used}</td><td>${row.remaining}</td></tr>`;
  });
}

// Load Upcoming PTO
async function loadUpcoming() {
  const res = await fetch("/api/admin/upcoming");
  const data = await res.json();

  const tbody = document.querySelector("#upcomingTable tbody");
  tbody.innerHTML = "";
  data.forEach((pto) => {
    tbody.innerHTML += `<tr><td>${pto.full_name}</td><td>${pto.date.slice(
      0,
      10
    )}</td></tr>`;
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

      if (res.ok) alert("Policy updated!");
      else alert("Error updating policy");
    });
  });
}

// Load all on startup
loadEmployees();
loadSummary();
loadUpcoming();
loadPolicies();
