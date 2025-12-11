// UNIVERSAL TAB SWITCHING
function showTab(tabName) {
  document.querySelectorAll(".tabContent").forEach((c) => {
    c.classList.add("hidden");
  });
  document.getElementById(tabName).classList.remove("hidden");
}

// DESKTOP TABS
document.querySelectorAll(".tabBtn").forEach((btn) => {
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
document.querySelectorAll(".mobileTabBtn").forEach((btn) => {
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
  const select = document.getElementById("ptoUser");
  tbody.innerHTML = "";
  select.innerHTML = "";

  data.forEach((emp) => {
    // Format date nicely
    const dateParts = emp.start_date.split("T")[0].split("-");
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    tbody.innerHTML += `
      <tr data-id="${emp.id}" data-role="${emp.role}" data-inactive="${emp.inactive}">
        <td class="nameCell">
          <span class="nameDisplay">${emp.full_name}</span>
          <input type="text" class="nameInput hidden" value="${emp.full_name}" />
        </td>
        <td class="usernameCell">
          <span class="usernameDisplay">${emp.username}</span>
          <input type="text" class="usernameInput hidden" value="${emp.username}" />
        </td>
        <td>${formattedDate}</td>
        <td class="actions">
          <button class="editEmployeeBtn" data-id="${emp.id}">Edit</button>
          <button class="saveEmployeeBtn hidden" data-id="${emp.id}">Save</button>
          <button class="resetPasswordBtn hidden" data-id="${emp.id}">Reset Password</button> 
          <button class="cancelEmployeeBtn hidden" data-id="${emp.id}">Cancel</button>
        </td>
      </tr>
    `;

    select.innerHTML += `<option value="${emp.id}">${emp.full_name}</option>`;
  });

  // Attach edit event listeners
  document.querySelectorAll(".editEmployeeBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      enterEmployeeEditMode(row);
    });
  });

  // Attach save event listeners
  document.querySelectorAll(".saveEmployeeBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const row = e.target.closest("tr");
      const fullName = row.querySelector(".nameInput").value;
      const username = row.querySelector(".usernameInput").value;
      const isAdmin = row.querySelector(".adminCheckbox").checked;
      const isInactive = row.querySelector(".inactiveCheckbox").checked;

      const res = await fetch(`/api/admin/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username: username,
          role: isAdmin ? "admin" : "employee",
          inactive: isInactive,
        }),
      });

      if (res.ok) {
        alert("Employee updated successfully!");
        await loadEmployees();
      } else {
        alert("Error updating employee.");
      }
    });
  });

  // Attach cancel event listeners
  document.querySelectorAll(".cancelEmployeeBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      exitEmployeeEditMode(row);
    });
  });

  // Attach reset password event listeners
  document.querySelectorAll(".resetPasswordBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (
        confirm(
          "Are you sure you want to reset this employee's password to 'schoolsplp'?"
        )
      ) {
        const res = await fetch(`/api/admin/employees/${id}/reset-password`, {
          method: "PUT",
        });

        if (res.ok) {
          alert("Password reset successfully!");
        } else {
          alert("Error resetting password.");
        }
      }
    });
  });
}

function enterEmployeeEditMode(row) {
  const role = row.dataset.role;
  const inactive = row.dataset.inactive === "1";

  // Hide display elements and show input fields
  row.querySelector(".nameDisplay").classList.add("hidden");
  row.querySelector(".nameInput").classList.remove("hidden");
  row.querySelector(".usernameDisplay").classList.add("hidden");
  row.querySelector(".usernameInput").classList.remove("hidden");

  // Insert checkbox columns before actions column
  const actionsCell = row.querySelector(".actions");

  // Admin checkbox cell
  const adminCell = document.createElement("td");
  adminCell.className = "checkboxCell";
  adminCell.innerHTML = `
    <label class="checkboxLabel">
      <input type="checkbox" class="adminCheckbox" ${
        role === "admin" ? "checked" : ""
      } />
      <span>Admin</span>
    </label>
  `;
  actionsCell.parentNode.insertBefore(adminCell, actionsCell);

  // Inactive checkbox cell
  const inactiveCell = document.createElement("td");
  inactiveCell.className = "checkboxCell";
  inactiveCell.innerHTML = `
    <label class="checkboxLabel">
      <input type="checkbox" class="inactiveCheckbox" ${
        inactive ? "checked" : ""
      } />
      <span>Inactive</span>
    </label>
  `;
  actionsCell.parentNode.insertBefore(inactiveCell, actionsCell);

  // Show header columns
  document.querySelectorAll(".editModeColumn").forEach((col) => {
    col.classList.remove("hidden");
  });

  // Toggle buttons
  row.querySelector(".editEmployeeBtn").classList.add("hidden");
  row.querySelector(".saveEmployeeBtn").classList.remove("hidden");
  row.querySelector(".cancelEmployeeBtn").classList.remove("hidden");
  row.querySelector(".resetPasswordBtn").classList.remove("hidden");
}

function exitEmployeeEditMode(row) {
  // Show display elements and hide input fields
  row.querySelector(".nameDisplay").classList.remove("hidden");
  row.querySelector(".nameInput").classList.add("hidden");
  row.querySelector(".usernameDisplay").classList.remove("hidden");
  row.querySelector(".usernameInput").classList.add("hidden");

  // Remove checkbox cells
  row.querySelectorAll(".checkboxCell").forEach((cell) => {
    cell.remove();
  });

  // Hide header columns
  document.querySelectorAll(".editModeColumn").forEach((col) => {
    col.classList.add("hidden");
  });

  // Toggle buttons
  row.querySelector(".editEmployeeBtn").classList.remove("hidden");
  row.querySelector(".saveEmployeeBtn").classList.add("hidden");
  row.querySelector(".cancelEmployeeBtn").classList.add("hidden");
  row.querySelector(".resetPasswordBtn").classList.add("hidden");

  // Reload to reset values
  loadEmployees();
}
// Add Employee
document
  .getElementById("addEmployeeForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      full_name: document.getElementById("fullName").value,
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      start_date: document.getElementById("startDate").value,
    };

    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Employee added successfully!");
      document.getElementById("fullName").value = "";
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
      document.getElementById("startDate").value = "";
      await loadEmployees();
      await loadSummary();
    } else {
      alert("Error adding employee.");
    }
  });

// Add PTO Entry
document.getElementById("addPtoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    user_id: document.getElementById("ptoUser").value,
    date: document.getElementById("ptoDate").value,
    hours_used: document.getElementById("ptoHours").value,
  };

  const res = await fetch("/api/admin/pto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    alert("PTO entry added!");
    document.getElementById("ptoDate").value = "";
    document.getElementById("ptoHours").value = 8;
    await loadSummary();
    await loadPtoBook();
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
      <div class="summaryCard">
        <button class="summaryHeader">
          <span>${row.full_name}</span>
          <span class="arrow">▼</span>
        </button>

        <div class="summaryBody">
          <div><strong>Total Allowed:</strong> ${row.total_allowed}</div>
          <div><strong>Used:</strong> ${row.used}</div>
          <div><strong>Remaining:</strong> ${row.remaining}</div>
        </div>
      </div>
    `;
  });

  // Enable expand/collapse
  document.querySelectorAll(".summaryHeader").forEach((header) => {
    header.addEventListener("click", () => {
      const body = header.nextElementSibling;
      const arrow = header.querySelector(".arrow");

      body.classList.toggle("open");
      arrow.classList.toggle("rotated");
    });
  });
}
async function loadPtoBook() {
  const res = await fetch("/api/admin/upcoming");
  const data = await res.json();
  const tbody = document.querySelector("#upcomingTable tbody");
  tbody.innerHTML = "";

  // Group PTO entries by month
  const groupedByMonth = {};
  const monthOrder = []; // Track the order of months

  data.forEach((pto) => {
    const dateParts = pto.date.split("T")[0].split("-");
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const monthYear = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!groupedByMonth[monthYear]) {
      groupedByMonth[monthYear] = [];
      monthOrder.push(monthYear); // Keep track of month order
    }
    groupedByMonth[monthYear].push(pto);
  });

  // Render each month group in the order they appear (already newest first)
  monthOrder.forEach((monthYear) => {
    // Add month header row
    tbody.innerHTML += `
      <tr class="monthHeader">
        <td colspan="4"><strong>${monthYear}</strong></td>
      </tr>
    `;

    // Add PTO entries for this month
    groupedByMonth[monthYear].forEach((pto) => {
      const dateParts = pto.date.split("T")[0].split("-");
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const isoDate = pto.date.split("T")[0]; // YYYY-MM-DD format for input

      tbody.innerHTML += `
        <tr data-id="${pto.id}">
          <td>${pto.full_name}</td>
          <td class="dateCell">
            <span class="dateDisplay">${formattedDate}</span>
            <input type="date" class="dateInput hidden" value="${isoDate}" />
          </td>
          <td class="hoursCell">
            <span class="hoursDisplay">${pto.hours_used} hours</span>
            <input type="number" class="hoursInput hidden" value="${pto.hours_used}" min="0" step="0.5" />
          </td>
          <td class="actions">
            <button class="editBtn" data-id="${pto.id}">Edit</button>
            <button class="saveBtn hidden" data-id="${pto.id}">Save</button>
            <button class="deleteBtn hidden" data-id="${pto.id}">Delete</button>
            <button class="cancelBtn hidden" data-id="${pto.id}">Cancel</button>
          </td>
        </tr>
      `;
    });
  });

  // Attach edit event listeners
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      enterEditMode(row);
    });
  });

  // Attach save event listeners
  document.querySelectorAll(".saveBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const row = e.target.closest("tr");
      const newDate = row.querySelector(".dateInput").value;
      const newHours = row.querySelector(".hoursInput").value;

      const res = await fetch(`/api/admin/pto/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, hours_used: newHours }),
      });

      if (res.ok) {
        alert("PTO entry updated!");
        await loadPtoBook();
        await loadSummary();
      } else {
        alert("Error updating PTO entry.");
      }
    });
  });

  // Attach cancel event listeners
  document.querySelectorAll(".cancelBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      exitEditMode(row);
    });
  });

  // Attach delete event listeners
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this PTO entry?")) {
        const res = await fetch(`/api/admin/pto/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("PTO entry deleted!");
          await loadPtoBook();
          await loadSummary();
        } else {
          alert("Error deleting PTO entry.");
        }
      }
    });
  });
}

function enterEditMode(row) {
  // Hide display elements and show input fields
  row.querySelector(".dateDisplay").classList.add("hidden");
  row.querySelector(".dateInput").classList.remove("hidden");
  row.querySelector(".hoursDisplay").classList.add("hidden");
  row.querySelector(".hoursInput").classList.remove("hidden");

  // Toggle buttons
  row.querySelector(".editBtn").classList.add("hidden");
  row.querySelector(".saveBtn").classList.remove("hidden");
  row.querySelector(".cancelBtn").classList.remove("hidden");
  row.querySelector(".deleteBtn").classList.remove("hidden");
}

function exitEditMode(row) {
  // Show display elements and hide input fields
  row.querySelector(".dateDisplay").classList.remove("hidden");
  row.querySelector(".dateInput").classList.add("hidden");
  row.querySelector(".hoursDisplay").classList.remove("hidden");
  row.querySelector(".hoursInput").classList.add("hidden");

  // Toggle buttons
  row.querySelector(".editBtn").classList.remove("hidden");
  row.querySelector(".saveBtn").classList.add("hidden");
  row.querySelector(".cancelBtn").classList.add("hidden");
  row.querySelector(".deleteBtn").classList.add("hidden");
}
/*
// Load PTO Book, this is the PTO history for just the year - Grouped by Month
async function loadPtoBook() {
  const res = await fetch("/api/admin/upcoming");
  const data = await res.json();

  const tbody = document.querySelector("#upcomingTable tbody");
  tbody.innerHTML = "";

  // Group PTO entries by month
  const groupedByMonth = {};

  data.forEach((pto) => {
    const dateParts = pto.date.split("T")[0].split("-");
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    const monthYear = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!groupedByMonth[monthYear]) {
      groupedByMonth[monthYear] = [];
    }
    groupedByMonth[monthYear].push(pto);
  });

  // Render each month group
  Object.keys(groupedByMonth).forEach((monthYear) => {
    // Add month header row
    tbody.innerHTML += `
      <tr class="monthHeader">
        <td colspan="4"><strong>${monthYear}</strong></td>
      </tr>
    `;

    // Add PTO entries for this month
    groupedByMonth[monthYear].forEach((pto) => {
      const dateParts = pto.date.split("T")[0].split("-");
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      tbody.innerHTML += `
        <tr>
          <td>${pto.full_name}</td>
          <td>${formattedDate}</td>
          <td>${pto.hours_used} hours </td>
          <td>
            <button class="deleteBtn" data-id="${pto.id}">X</button>
          </td>
        </tr>
      `;
    });
  });

  // Attach delete event listeners
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this PTO entry?")) {
        const res = await fetch(`/api/admin/pto/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("PTO entry deleted!");
          await loadPtoBook();
          await loadSummary();
        } else {
          alert("Error deleting PTO entry.");
        }
      }
    });
  });
}
 */
// PTO Past Years History
async function loadPastPtoHistory() {
  const res = await fetch("/api/admin/pastptohistory");
  const data = await res.json();

  const container = document.getElementById("pastPtoContainer");
  container.innerHTML = "";

  const grouped = {};
  data.forEach((entry) => {
    if (!grouped[entry.full_name]) grouped[entry.full_name] = [];
    grouped[entry.full_name].push(entry);
  });

  Object.keys(grouped).forEach((name) => {
    const section = document.createElement("div");
    section.classList.add("accordionItem");

    section.innerHTML = `
      <button class="accordionHeader">${name}</button>
      <div class="accordionBody hidden">
        ${grouped[name]
          .map((pto) => `<p class="historyRow">${pto.date.slice(0, 10)}</p>`)
          .join("")}
      </div>
    `;

    container.appendChild(section);
  });

  document.querySelectorAll(".accordionHeader").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = btn.nextElementSibling;
      body.classList.toggle("hidden");
      btn.classList.toggle("open");
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
      } else {
        alert("Error updating policy");
      }
    });
  });

  // MOBILE DROPDOWN CARDS
  const mobileContainer = document.querySelector("#policyMobileContainer");
  mobileContainer.innerHTML = "";

  data.forEach((p) => {
    mobileContainer.innerHTML += `
    <div class="policyCard">
      <button class="policyHeader">
        <span>${p.years_of_service} Years</span>
        <span class="arrow">▼</span>
      </button>

      <div class="policyBody">
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
  document.querySelectorAll(".policyHeader").forEach((header) => {
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
      } else {
        alert("Error updating policy");
      }
    });
  });
}

loadEmployees();
loadSummary();
loadPtoBook();
loadPastPtoHistory();
loadPolicies();
