document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (data.success) {
    if (data.role === "admin") {
      window.location.href = "/admin.html";
    } else {
      window.location.href = "/employee.html";
    }
  } else {
    document.getElementById("errorMessage").textContent = data.error;
  }
});
