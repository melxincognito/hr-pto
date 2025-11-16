document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.location.href = "/login.html";
  window.sessionStorage.clear();
});
// MOBILE MENU TOGGLE
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});

// MOBILE LOGOUT
document.getElementById("logoutMobile").addEventListener("click", async () => {
  await fetch("/api/logout");
  window.location.href = "/login.html";
  window.sessionStorage.clear();
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

loadEmployeePTO();
loadPolicies();
