// server.js
import express from "express";
import session from "express-session";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cron from "node-cron";

/* MAKE SURE TO UNCOMMENT THE ENSURE ADMIN ONCE YOU SET UP YOUR USERNAME AND PASSWORD AFTER TESTING */
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files
app.use(express.static("public"));

// Authentication middleware
function ensureAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login.html");
  next();
}

// Role-based guard
function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.status(403).send("Access denied.");
  next();
}

// Login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  const user = rows[0];
  if (!user)
    return res.status(400).json({ error: "Invalid username or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ error: "Invalid username or password" });

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ success: true, role: user.role });
});

// Logout route
app.get("/api/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});
/*
// Fallback redirect
app.get(/.*/ /*, (req, res) => {
  if (!req.session || !req.session.user) {
    console.log("No session found — redirecting to login");
    return res.redirect("/login.html");
  }

  if (req.session.user.role === "admin") {
    console.log("Redirecting admin to dashboard");
    return res.redirect("/admin.html");
  } else {
    console.log("Redirecting employee to dashboard");
    return res.redirect("/employee.html");
  }
});
*/

// Example protected routes
app.get("/api/employee/pto", ensureAuth, async (req, res) => {
  const userId = req.session.user.id;
  const [rows] = await db.query("SELECT * FROM pto WHERE user_id = ?", [
    userId,
  ]);
  res.json(rows);
});

app.get("/api/admin/pto", ensureAdmin, async (req, res) => {
  const [rows] = await db.query(
    "SELECT p.id, u.full_name, p.date, p.hours_used FROM pto p JOIN users u ON p.user_id = u.id ORDER BY p.date ASC"
  );
  res.json(rows);
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

// ADMIN ROUTES
app.get("/api/admin/employees", ensureAdmin, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, full_name, username, start_date FROM users WHERE role='employee'"
  );
  res.json(rows);
});

app.post("/api/admin/employees", ensureAdmin, async (req, res) => {
  const { full_name, username, password, start_date } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const clean_date = new Date(start_date).toISOString().split("T")[0];

  try {
    await db.query(
      "INSERT INTO users (full_name, username, password, role, start_date) VALUES (?, ?, ?, 'employee', ?)",

      [full_name, username, hashed, clean_date]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Add PTO Entry
app.post("/api/admin/pto", ensureAdmin, async (req, res) => {
  const { user_id, date, hours_used } = req.body;
  const admin_id = 3; //req.session.user.id; <- this is the original code it wasn't sending I just added my own ID as a temp fix. I might just get rid of the approved by column all together.
  try {
    await db.query(
      "INSERT INTO pto (user_id, date, hours_used, approved_by) VALUES (?, ?, ?, ?)",
      [user_id, date, hours_used, admin_id]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// PTO Summary
app.get("/api/admin/summary", async (req, res) => {
  const [employees] = await db.query(
    "SELECT id, full_name, start_date, total_pto_allowed, carry_over FROM users WHERE role='employee'"
  );

  const [policies] = await db.query(
    "SELECT * FROM policy ORDER BY years_of_service ASC"
  );

  const summary = [];

  for (const emp of employees) {
    const years = Math.floor(
      (Date.now() - new Date(emp.start_date)) / (1000 * 60 * 60 * 24 * 365)
    );

    // Find applicable policy based on years of service
    const policy =
      policies.find((p) => years >= p.years_of_service) || policies[0];

    // Use manual override if it exists, otherwise policy days
    let total_allowed = emp.total_pto_allowed ?? policy.days_allowed;

    // Include carry over (max 1)
    if (emp.carry_over > 0) {
      total_allowed += Math.min(emp.carry_over, 1);
    }

    // PTO used (current year)
    const [usedRows] = await db.query(
      "SELECT COUNT(*) AS used FROM pto WHERE user_id = ? AND YEAR(date) = YEAR(CURDATE())",
      [emp.id]
    );

    const used = usedRows[0].used;
    const remaining = Math.max(total_allowed - used, 0);

    summary.push({
      full_name: emp.full_name,
      total_allowed,
      used,
      remaining,
    });
  }

  res.json(summary);
});

// Upcoming PTO
app.get("/api/admin/upcoming", ensureAdmin, async (req, res) => {
  const [rows] = await db.query(
    "SELECT u.full_name, p.date FROM pto p JOIN users u ON p.user_id = u.id WHERE p.date >= CURDATE() ORDER BY p.date ASC"
  );
  res.json(rows);
});

// PTO Policies (read-only for now)
app.get("/api/policy", ensureAuth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM policy ORDER BY years_of_service ASC"
  );
  res.json(rows);
});

// Delete PTO Entry from summary table (Admin only)
app.delete("/api/admin/pto/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM pto WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PTO entry not found" });
    }
    res.sendStatus(204); // success, no content
  } catch (err) {
    console.error("Error deleting PTO entry:", err);
    res.sendStatus(500);
  }
});

// Employee summary route
app.get("/api/employee/summary", ensureAuth, async (req, res) => {
  const userId = req.session.user.id;

  const [userRows] = await db.query(
    "SELECT start_date, carry_over, total_pto_allowed FROM users WHERE id = ?",
    [userId]
  );
  const user = userRows[0];
  const startDate = user.start_date;
  const total_pto_allowed = user.total_pto_allowed;

  const today = new Date();
  const years = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 365));

  // Get applicable PTO policy
  const [policies] = await db.query(
    "SELECT * FROM policy ORDER BY years_of_service ASC"
  );
  const policy =
    policies.find((p) => years >= p.years_of_service) || policies[0];
  let total_allowed = policy.days_allowed;

  // Include carried-over days (max 1)
  if (user.carry_over > 0) total_allowed += Math.min(user.carry_over, 1);

  // PTO used this current year only
  const [usedRows] = await db.query(
    "SELECT COUNT(*) AS used FROM pto WHERE user_id = ? AND YEAR(date) = YEAR(CURDATE())",
    [userId]
  );
  const used = usedRows[0].used;

  const remaining = Math.max(total_pto_allowed - used, 0);

  // PTO history (all years)
  const [history] = await db.query(
    "SELECT date, hours_used FROM pto WHERE user_id = ? ORDER BY date DESC",
    [userId]
  );

  res.json({ total_allowed, used, remaining, history, total_pto_allowed });
});

async function updateCarryOvers() {
  const [users] = await db.query(
    "SELECT id, start_date FROM users WHERE role='employee'"
  );

  for (const user of users) {
    const [pto] = await db.query(
      "SELECT COUNT(*) AS used FROM pto WHERE user_id = ? AND YEAR(date) = YEAR(CURDATE()) - 1",
      [user.id]
    );

    const [policies] = await db.query(
      "SELECT * FROM policy ORDER BY years_of_service ASC"
    );
    const years = Math.floor(
      (Date.now() - new Date(user.start_date)) / (1000 * 60 * 60 * 24 * 365)
    );
    const policy =
      policies.find((p) => years >= p.years_of_service) || policies[0];
    const total = policy.days_allowed;
    const unused = Math.max(total - pto[0].used, 0);

    // carry over only 1 day if they had unused days
    const carry = unused >= 1 ? 1 : 0;
    await db.query("UPDATE users SET carry_over = ? WHERE id = ?", [
      carry,
      user.id,
    ]);
  }
}

//FIND BETTER PLACE TO UPDATE THE CARRY OVERS. THIS WAS ADDING IT ON EVERY STARTUP.
updateCarryOvers(); // call on startup

app.put("/api/admin/policy/:id", ensureAdmin, async (req, res) => {
  const { id } = req.params;
  const { days_allowed, notes } = req.body;
  try {
    await db.query(
      "UPDATE policy SET days_allowed = ?, notes = ? WHERE id = ?",
      [days_allowed, notes, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Run daily to check for employee anniversaries
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily anniversary check...");
  try {
    await checkAnniversaries();
  } catch (err) {
    console.error("Error checking anniversaries:", err);
  }
});

async function checkAnniversaries() {
  const [users] = await db.query(
    "SELECT id, start_date FROM users WHERE role = 'employee'"
  );

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  for (const user of users) {
    const start = new Date(user.start_date);

    // Check if today is their anniversary month/day
    if (start.getMonth() === todayMonth && start.getDate() === todayDate) {
      console.log(`🎉 Updating PTO for ${user.id} (Anniversary Today)`);

      // Calculate unused days from last year
      const [policies] = await db.query(
        "SELECT * FROM policy ORDER BY years_of_service ASC"
      );
      const years = Math.floor((today - start) / (1000 * 60 * 60 * 24 * 365));
      const policy =
        policies.find((p) => years >= p.years_of_service) || policies[0];
      const totalAllowed = policy.days_allowed;

      // PTO used this past year
      const [usedRows] = await db.query(
        "SELECT COUNT(*) AS used FROM pto WHERE user_id = ? AND YEAR(date) = YEAR(CURDATE()) - 1",
        [user.id]
      );
      const usedLastYear = usedRows[0].used;
      const unused = Math.max(totalAllowed - usedLastYear, 0);
      const carry = unused >= 1 ? 1 : 0;

      await db.query("UPDATE users SET carry_over = ? WHERE id = ?", [
        carry,
        user.id,
      ]);
    }
  }
}
