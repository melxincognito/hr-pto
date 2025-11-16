// UNIVERSAL TAB SWITCHING
function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((c) => {
    c.classList.add("hidden");
  });
  document.getElementById(tabName).classList.remove("hidden");
}

document.getElementById("employeeSettings")?.addEventListener("click", () => {
  showTab("settings");
  document.getElementById("mobileMenu").classList.add("hidden");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.location.href = "/login.html";
});
// MOBILE MENU TOGGLE
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});

// MOBILE LOGOUT
document.getElementById("logoutMobile").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.localStorage.clear();
  window.location.href = "/login.html";
});

async function loadEmployeePTO() {
  const res = await fetch("/api/employee/summary");
  const data = await res.json();

  document.getElementById("total").textContent = data.total_pto_allowed;
  document.getElementById("used").textContent = data.used;
  document.getElementById("remaining").textContent = data.remaining;

  const table = document.querySelector("#historyTable tbody");
  table.innerHTML = "";
  data.history.forEach((row) => {
    table.innerHTML += `<tr><td>${row.date.slice(0, 10)}</td><td>${
      row.hours_used
    }</td></tr>`;
  });
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
    <div class="policy-card">
      <label class="policy-header">
       ${p.years_of_service} Years
        <span class="arrow-employee">▼</span>
      </label>

      <div class="policy-body">
        <label>Days Allowed</label>
        <h3 data-id="${p.id}"/>${p.days_allowed} </h3>
        <label>Notes</label>
        <h3 class="notesInput" data-id="${p.id}" > ${p.notes} </h3>
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
}

// password settings

document.getElementById("saveSettings").addEventListener("click", async () => {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("All fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match");
    return;
  }

  try {
    const res = await fetch("/api/employee/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      alert("Password updated successfully!");
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    } else if (res.status === 401) {
      alert("Current password is incorrect");
    } else {
      alert("Error updating password");
    }
  } catch (err) {
    console.error(err);
    alert("Error updating password");
  }
});

loadEmployeePTO();
loadPolicies();
