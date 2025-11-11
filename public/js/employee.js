document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout");
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
}

loadEmployeePTO();
loadPolicies();
