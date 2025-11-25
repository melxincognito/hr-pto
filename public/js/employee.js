document.getElementById("dashboardBtn").addEventListener("click", () => {
  window.location.href = "/employee.html";
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  window.location.href = "/settings.html";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.location.href = "/login.html";
  window.sessionStorage.clear();
});

// MOBILE MENU ITEMS
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});

document.getElementById("dashboardMobile").addEventListener("click", () => {
  window.location.href = "/employee.html";
});

document.getElementById("settingsMobile").addEventListener("click", () => {
  window.location.href = "/settings.html";
});

document.getElementById("logoutMobile").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.location.href = "/login.html";
  window.sessionStorage.clear();
});

async function loadEmployeePTO() {
  const res = await fetch("/api/employee/summary");
  const data = await res.json();

  // Update PTO Overview
  document.getElementById("totalPto").textContent = data.total_pto_allowed;
  document.getElementById("usedPto").textContent = data.used;
  document.getElementById("remainingPto").textContent = data.remaining;

  // Load PTO History Table
  const table = document.querySelector("#historyTable tbody");
  table.innerHTML = "";

  // Check if there's no history
  if (data.history.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 20px; color: #64748b;">
          No PTO has been used yet
        </td>
      </tr>
    `;
    return;
  }

  // Create a row for each PTO entry
  data.history.forEach((entry) => {
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Convert hours to days
    const days = entry.hours_used / 8;
    let daysText;

    switch (days) {
      case 0:
        daysText = "Not counted towards PTO";
        break;
      case 1:
        daysText = "1 day";
        break;
      default:
        daysText = "Half day";
    }

    table.innerHTML += `
      <tr>
        <td>${formattedDate}</td>
        <td>${daysText}</td>
      </tr>
    `;
  });
}

async function loadPastYearPto() {
  const res = await fetch("/api/employee/previous-year-history");
  const data = await res.json();

  const table = document.querySelector("#lastYearPtoHistoryTable tbody");
  table.innerHTML = " ";

  // Check if employee is in first year
  if (data.message) {
    table.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 20px; color: #64748b;">
          ${data.message}
        </td>
      </tr>
    `;
    return;
  }

  // Check if there's no history
  if (data.history.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 20px; color: #64748b;">
          No PTO was used during ${data.lastWorkYear.startDate} to ${data.lastWorkYear.endDate}
        </td>
      </tr>
    `;
    return;
  }

  data.history.forEach((entry) => {
    const row = document.createElement("tr");

    // Format the date nicely
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const dateCell = document.createElement("td");
    dateCell.textContent = formattedDate;

    const hoursCell = document.createElement("td");
    const days = entry.hours_used / 8;
    let daysText;

    switch (days) {
      case 0:
        daysText = "Not counted towards PTO";
        break;
      case 1:
        daysText = "1 day";
        break;
      default:
        daysText = "Half day";
    }
    hoursCell.textContent = daysText;

    row.appendChild(dateCell);
    row.appendChild(hoursCell);

    table.appendChild(row);
  });
  //
  const carryOverCell = document.createElement("tr");
  const carryOverLabel = document.createElement("td");

  const carryOverDays = document.createElement("td");

  carryOverLabel.innerHTML = `<b>Days Carried Over:</b>`;
  carryOverDays.innerHTML = `<b>${data.carryOverTotal[0].carried_over} days</b>`;

  carryOverCell.appendChild(carryOverLabel);
  carryOverCell.appendChild(carryOverDays);

  table.appendChild(carryOverCell);
}

async function loadPolicies() {
  const res = await fetch("/api/policy");
  const data = await res.json();

  const tbody = document.querySelector("#policyTable tbody");
  tbody.innerHTML = "";
  data.forEach((p) => {
    tbody.innerHTML += `<tr><td>${p.years_of_service}</td><td>${p.days_allowed}</td><td>${p.notes}</td></tr>`;
  });

  // MOBILE DROPDOWN CARDS
  const mobileContainer = document.querySelector("#policyMobileContainer");
  mobileContainer.innerHTML = "";

  data.forEach((p) => {
    mobileContainer.innerHTML += `
    <div class="policyCard">
      <label class="policyHeader">
       ${p.years_of_service} Years
        <span class="arrowEmployee">▼</span>
      </label>

      <div class="policyBody">
        <label>Days Allowed</label>
        <h3 data-id="${p.id}">${p.days_allowed}</h3>
        <label>Notes</label>
        <h3 class="notesInput" data-id="${p.id}">${p.notes}</h3>
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
}

function loadHolidays() {
  let holidays = [
    "New Years Day",
    "Martin Luther King Day",
    "Memorial Day",
    "Independence Day",
    "Labor Day",
    "Thanksgiving Thursday",
    "Thanksgiving Friday",
    "Christmas Eve",
    "Christmas Day",
    "Your Birthday",
  ];

  let holidayObservance = [
    "When a holiday falls on a Saturday, it will be observed the preceding Friday.",
    "Holidays falling on a Sunday will be observed the following Monday.",
    "If you work on your birthday, you are allowed to request a different day off.",
  ];

  let paidHolidaysList = document.getElementById("paidHolidays");
  let holidayObservanceList = document.getElementById("holidayObservance");

  holidays.forEach((h) => {
    let listItem = document.createElement("li");
    listItem.innerHTML = h;
    paidHolidaysList.appendChild(listItem);
  });

  holidayObservance.forEach((ho) => {
    let listItem = document.createElement("li");
    listItem.innerHTML = ho;
    holidayObservanceList.appendChild(listItem);
  });
}

loadEmployeePTO();
loadPastYearPto();
loadPolicies();
loadHolidays();
