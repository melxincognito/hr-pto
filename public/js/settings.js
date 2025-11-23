document.getElementById("dashboardBtn").addEventListener("click", () => {
  window.location.href = "/employee.html";
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  window.location.href = "/settings.html";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout");
  sessionStorage.clear();
  window.location.href = "/login.html";
});

document.getElementById("dashboardMobile").addEventListener("click", () => {
  window.location.href = "/employee.html";
});

document.getElementById("settingsMobile").addEventListener("click", () => {
  window.location.href = "/settings.html";
});

document.getElementById("logoutMobile").addEventListener("click", async () => {
  await fetch("/api/logout");
  sessionStorage.clear();
  window.location.href = "/login.html";
});

// Mobile menu toggle
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});

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
