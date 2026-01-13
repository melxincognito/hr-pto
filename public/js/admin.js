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

async function loadActivePtoUsers() {
  const res = await fetch("/api/admin/employees/active");
  const data = await res.json();
  const select = document.getElementById("ptoUser");
  select.innerHTML = "";
  data.forEach((emp) => {
    select.innerHTML += `<option value="${emp.id}">${emp.full_name}</option>`;
  });
}

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

// Fetch Employees for home add an employee page.
async function loadEmployees() {
  const res = await fetch("/api/admin/employees/active");
  const data = await res.json();

  // Desktop table
  const tbody = document.querySelector("#employeeTable tbody");
  tbody.innerHTML = "";

  // Mobile container
  let mobileContainer = document.querySelector(".mobileEmployees");
  if (!mobileContainer) {
    mobileContainer = document.createElement("div");
    mobileContainer.className = "mobileEmployees";
    document.querySelector("#employees").appendChild(mobileContainer);
  }
  mobileContainer.innerHTML = "";

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

    // Desktop table row
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

    // Mobile card
    const employeeCard = document.createElement("div");
    employeeCard.className = "employeeCard";
    employeeCard.dataset.id = emp.id;
    employeeCard.dataset.role = emp.role;
    employeeCard.dataset.inactive = emp.inactive;
    employeeCard.innerHTML = `
      <div class="employeeCardHeader">${emp.full_name}</div>
      <div class="employeeCardBody">
        <div class="employeeCardRow">
          <strong>Name:</strong>
          <span class="nameDisplay">${emp.full_name}</span>
          <input type="text" class="nameInput hidden" value="${
            emp.full_name
          }" />
        </div>
        <div class="employeeCardRow">
          <strong>Username:</strong>
          <span class="usernameDisplay">${emp.username}</span>
          <input type="text" class="usernameInput hidden" value="${
            emp.username
          }" />
        </div>
        <div class="employeeCardRow">
          <strong>Start Date:</strong>
          <span>${formattedDate}</span>
        </div>
        <div class="employeeCheckboxRow hidden">
          <label>
            <input type="checkbox" class="adminCheckbox" ${
              emp.role === "admin" ? "checked" : ""
            } />
            Admin
          </label>
          <label>
            <input type="checkbox" class="inactiveCheckbox" ${
              emp.inactive ? "checked" : ""
            } />
            Inactive
          </label>
        </div>
        <div class="employeeCardActions">
          <button class="editEmployeeBtn" data-id="${
            emp.id
          }">Edit Employee</button>
          <button class="saveEmployeeBtn hidden" data-id="${
            emp.id
          }">Save Changes</button>
          <button class="resetPasswordBtn hidden" data-id="${
            emp.id
          }">Reset Password</button>
          <button class="cancelEmployeeBtn hidden" data-id="${
            emp.id
          }">Cancel</button>
        </div>
      </div>
    `;

    mobileContainer.appendChild(employeeCard);
  });

  // Attach event listeners (works for both desktop and mobile)
  attachEmployeeEventListeners();
}

function attachEmployeeEventListeners() {
  // Edit buttons
  document.querySelectorAll(".editEmployeeBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const container = e.target.closest("tr, .employeeCard");
      enterEmployeeEditMode(container);
    });
  });

  // Save buttons
  document.querySelectorAll(".saveEmployeeBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const container = e.target.closest("tr, .employeeCard");
      const fullName = container.querySelector(".nameInput").value;
      const username = container.querySelector(".usernameInput").value;
      const isAdmin = container.querySelector(".adminCheckbox").checked;
      const isInactive = container.querySelector(".inactiveCheckbox").checked;

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
        await loadActivePtoUsers();
        await loadSummary();
      } else {
        alert("Error updating employee.");
      }
    });
  });

  // Cancel buttons
  document.querySelectorAll(".cancelEmployeeBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const container = e.target.closest("tr, .employeeCard");
      exitEmployeeEditMode(container);
    });
  });

  // Reset password buttons
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

function enterEmployeeEditMode(container) {
  // Hide display spans, show input fields
  container.querySelectorAll(".nameDisplay, .usernameDisplay").forEach((el) => {
    el.classList.add("hidden");
  });
  container.querySelectorAll(".nameInput, .usernameInput").forEach((el) => {
    el.classList.remove("hidden");
  });

  // Show checkboxes
  const checkboxRow = container.querySelector(".employeeCheckboxRow");
  if (checkboxRow) {
    checkboxRow.classList.remove("hidden");
  }

  // Toggle buttons
  container.querySelector(".editEmployeeBtn").classList.add("hidden");
  container
    .querySelectorAll(".saveEmployeeBtn, .resetPasswordBtn, .cancelEmployeeBtn")
    .forEach((el) => {
      el.classList.remove("hidden");
    });

  // Add editMode class for mobile styling
  if (container.classList.contains("employeeCard")) {
    container.classList.add("editMode");
  }
}

function exitEmployeeEditMode(container) {
  // Show display spans, hide input fields
  container.querySelectorAll(".nameDisplay, .usernameDisplay").forEach((el) => {
    el.classList.remove("hidden");
  });
  container.querySelectorAll(".nameInput, .usernameInput").forEach((el) => {
    el.classList.add("hidden");
  });

  // Hide checkboxes
  const checkboxRow = container.querySelector(".employeeCheckboxRow");
  if (checkboxRow) {
    checkboxRow.classList.add("hidden");
  }

  // Toggle buttons
  container.querySelector(".editEmployeeBtn").classList.remove("hidden");
  container
    .querySelectorAll(".saveEmployeeBtn, .resetPasswordBtn, .cancelEmployeeBtn")
    .forEach((el) => {
      el.classList.add("hidden");
    });

  // Remove editMode class for mobile styling
  if (container.classList.contains("employeeCard")) {
    container.classList.remove("editMode");
  }

  // Reload to restore original values
  loadEmployees();
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
    notes: document.getElementById("ptoNotes").value.trim() || null,
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
    document.getElementById("ptoNotes").value = "";
    await loadSummary();
    await loadPtoBook();
  } else {
    alert("Error adding PTO entry.");
  }
});

// PTO BOOK

async function loadPtoBook() {
  const res = await fetch("/api/admin/upcoming");
  const data = await res.json();

  // Desktop table
  const tbody = document.querySelector("#upcomingTable tbody");
  tbody.innerHTML = "";

  // Mobile container
  let mobileContainer = document.querySelector(".mobilePtoBook");
  if (!mobileContainer) {
    mobileContainer = document.createElement("div");
    mobileContainer.className = "mobilePtoBook";
    document.querySelector("#upcoming").appendChild(mobileContainer);
  }
  mobileContainer.innerHTML = "";

  // Group PTO entries by month
  const groupedByMonth = {};
  const monthOrder = [];

  data.forEach((pto) => {
    const dateParts = pto.date.split("T")[0].split("-");
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const monthYear = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!groupedByMonth[monthYear]) {
      groupedByMonth[monthYear] = [];
      monthOrder.push(monthYear);
    }
    groupedByMonth[monthYear].push(pto);
  });

  // Render for both desktop and mobile
  monthOrder.forEach((monthYear) => {
    // Desktop table rows
    tbody.innerHTML += `
      <tr class="monthHeader">
        <td colspan="5"><strong>${monthYear}</strong></td>
      </tr>
    `;

    // Mobile month section
    const monthCard = document.createElement("div");
    monthCard.className = "ptoCard";
    monthCard.innerHTML = `<div class="ptoMonthHeader">${monthYear}</div>`;

    groupedByMonth[monthYear].forEach((pto) => {
      const dateParts = pto.date.split("T")[0].split("-");
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const isoDate = pto.date.split("T")[0];

      // Desktop table row
      tbody.innerHTML += `
        <tr data-id="${pto.id}">
          <td>${pto.full_name}</td>
          <td class="dateCell">
            <span class="dateDisplay">${formattedDate}</span>
            <input type="date" class="dateInput hidden" value="${isoDate}" />
          </td>
          <td class="hoursCell">
            <span class="hoursDisplay">${pto.hours_used} hours</span>
            <input type="number" class="hoursInput hidden" value="${
              pto.hours_used
            }" min="0" step="0.5" />
          </td>
          <td class="notesCell">
            <span class="notesDisplay">${pto.notes || "-"}</span>
          </td>
          <td class="actions">
            <button class="editBtn" data-id="${pto.id}">Edit</button>
            <button class="saveBtn hidden" data-id="${pto.id}">Save</button>
            <button class="deleteBtn hidden" data-id="${pto.id}">Delete</button>
            <button class="cancelBtn hidden" data-id="${pto.id}">Cancel</button>
          </td>
        </tr>
      `;

      // Mobile card
      const entryCard = document.createElement("div");
      entryCard.className = "ptoEntryCard";
      entryCard.dataset.id = pto.id;
      entryCard.innerHTML = `
        <div class="ptoCardRow">
          <strong>Employee:</strong>
          <span class="nameDisplay">${pto.full_name}</span>
        </div>
        <div class="ptoCardRow">
          <strong>Date:</strong>
          <span class="dateDisplay">${formattedDate}</span>
          <input type="date" class="dateInput hidden" value="${isoDate}" />
        </div>
        <div class="ptoCardRow">
          <strong>Hours:</strong>
          <span class="hoursDisplay">${pto.hours_used} hours</span>
          <input type="number" class="hoursInput hidden" value="${
            pto.hours_used
          }" min="0" step="0.5" />
        </div>
        <div class="ptoCardRow">
          <strong>Notes:</strong>
          <span class="notesDisplay">${pto.notes || "-"}</span>
        </div>
        <div class="ptoCardActions">
          <button class="editBtn" data-id="${pto.id}">Edit</button>
          <button class="saveBtn hidden" data-id="${pto.id}">Save</button>
          <button class="deleteBtn hidden" data-id="${pto.id}">Delete</button>
          <button class="cancelBtn hidden" data-id="${pto.id}">Cancel</button>
        </div>
      `;

      monthCard.appendChild(entryCard);
    });

    mobileContainer.appendChild(monthCard);
  });

  // Attach event listeners (works for both desktop and mobile)
  attachPtoEventListeners();
}

function attachPtoEventListeners() {
  // Edit buttons
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const container = e.target.closest("tr, .ptoEntryCard");
      enterEditMode(container);
    });
  });

  // Save buttons
  document.querySelectorAll(".saveBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const container = e.target.closest("tr, .ptoEntryCard");
      const newDate = container.querySelector(".dateInput").value;
      const newHours = container.querySelector(".hoursInput").value;

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

  // Cancel buttons
  document.querySelectorAll(".cancelBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const container = e.target.closest("tr, .ptoEntryCard");
      exitEditMode(container);
    });
  });

  // Delete buttons
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

function enterEditMode(container) {
  container
    .querySelectorAll(".dateDisplay, .hoursDisplay, .notesDisplay")
    .forEach((el) => {
      el.classList.add("hidden");
    });
  container.querySelectorAll(".dateInput, .hoursInput").forEach((el) => {
    el.classList.remove("hidden");
  });
  container.querySelector(".editBtn").classList.add("hidden");
  container
    .querySelectorAll(".saveBtn, .cancelBtn, .deleteBtn")
    .forEach((el) => {
      el.classList.remove("hidden");
    });

  // Add editMode class for mobile styling
  if (container.classList.contains("ptoEntryCard")) {
    container.classList.add("editMode");
  }
}

function exitEditMode(container) {
  container
    .querySelectorAll(".dateDisplay, .hoursDisplay, .notesDisplay")
    .forEach((el) => {
      el.classList.remove("hidden");
    });
  container.querySelectorAll(".dateInput, .hoursInput").forEach((el) => {
    el.classList.add("hidden");
  });
  container.querySelector(".editBtn").classList.remove("hidden");
  container
    .querySelectorAll(".saveBtn, .cancelBtn, .deleteBtn")
    .forEach((el) => {
      el.classList.add("hidden");
    });

  // Remove editMode class for mobile styling
  if (container.classList.contains("ptoEntryCard")) {
    container.classList.remove("editMode");
  }
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
// PTO Past Years History
async function loadPastPtoHistory() {
  const res = await fetch("/api/admin/pastptohistory");
  const data = await res.json();

  const container = document.getElementById("pastPtoContainer");
  container.innerHTML = "";

  // Group by employee name
  const grouped = {};
  data.forEach((entry) => {
    if (!grouped[entry.full_name]) {
      grouped[entry.full_name] = {
        start_date: entry.start_date,
        entries: [],
      };
    }
    grouped[entry.full_name].entries.push(entry);
  });

  Object.keys(grouped).forEach((name) => {
    const employeeData = grouped[name];
    const startDate = new Date(employeeData.start_date);

    // Group entries by work year
    const yearGroups = {};

    employeeData.entries.forEach((pto) => {
      const ptoDate = new Date(pto.date);

      // Calculate which work year this PTO falls into
      let yearsSinceStart = ptoDate.getFullYear() - startDate.getFullYear();

      // Adjust if the PTO date is before the anniversary month
      if (
        ptoDate.getMonth() < startDate.getMonth() ||
        (ptoDate.getMonth() === startDate.getMonth() &&
          ptoDate.getDate() < startDate.getDate())
      ) {
        yearsSinceStart--;
      }

      const workYear = yearsSinceStart + 1; // Work year starts at 1

      if (!yearGroups[workYear]) {
        yearGroups[workYear] = [];
      }
      yearGroups[workYear].push(pto);
    });

    // Build accordion section
    const section = document.createElement("div");
    section.classList.add("accordionItem");

    let bodyContent = "";

    // Sort work years in descending order (most recent first)
    const sortedYears = Object.keys(yearGroups).sort((a, b) => b - a);

    sortedYears.forEach((workYear) => {
      const entries = yearGroups[workYear];

      // DEBUG: Log entries for this work year

      const totalHours = entries.reduce((sum, entry) => {
        const hours = Number(entry.hours_used) || 0;
        return sum + hours;
      }, 0);

      const totalDays = totalHours / 8;

      bodyContent += `
        <div class="workYearSection">
          <h4>Year ${workYear} - ${totalDays} PTO day${
        totalDays !== 1 ? "s" : ""
      } taken</h4>
          <div class="ptoEntries">
            ${entries
              .map((pto) => {
                const dateParts = pto.date.split("T")[0].split("-");
                const date = new Date(
                  dateParts[0],
                  dateParts[1] - 1,
                  dateParts[2]
                );
                const formattedDate = date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const hours = Number(pto.hours_used) || 0;
                const days = hours / 8;
                return `
                <div class="historyRow">
                  <span class="historyDate">${formattedDate}</span> - 
                  <span class="historyHours">${hours} hours - (${days} day${
                  days !== 1 ? "s" : ""
                })</span>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `;
    });

    section.innerHTML = `
      <button class="accordionHeader">${name}</button>
      <div class="accordionBody hidden">
        ${bodyContent}
      </div>
    `;

    container.appendChild(section);
  });

  // Attach accordion toggle listeners
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

      if (
        confirm(
          "This will update the policy and recalculate PTO for all affected employees. Continue?"
        )
      ) {
        const res = await fetch(`/api/admin/policy/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days_allowed: days, notes }),
        });

        if (res.ok) {
          alert("Policy updated and employee PTO recalculated!");
          await loadPolicies();
          await loadSummary(); // Refresh the summary to show updated totals
        } else {
          alert("Error updating policy");
        }
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

      if (
        confirm(
          "This will update the policy and recalculate PTO for all affected employees. Continue?"
        )
      ) {
        const res = await fetch(`/api/admin/policy/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days_allowed: days, notes }),
        });

        if (res.ok) {
          alert("Policy updated and employee PTO recalculated!");
          await loadPolicies();
          await loadSummary();
        } else {
          alert("Error updating policy");
        }
      }
    });
  });
}
// Handle password update
document
  .getElementById("passwordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    const res = await fetch("/api/employee/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await res.json();
    const error = document.getElementById("settingsError");
    const success = document.getElementById("settingsSuccess");

    error.textContent = "";
    success.textContent = "";

    if (data.error) {
      error.textContent = data.error;
    } else {
      success.textContent = "Password updated successfully!";
      document.getElementById("passwordForm").reset();
    }
  });

loadEmployees();
loadActivePtoUsers();
loadSummary();
loadPtoBook();
loadPastPtoHistory();
loadPolicies();
