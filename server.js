import express from "express";
import session from "express-session";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cron from "node-cron";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

// Authentication middleware
function ensureAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login.html");
  next();
}

function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin")
    return res.status(403).send("Access denied.");
  next();
}

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

app.get("/api/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

app.use((req, res, next) => {
  const publicPaths = [
    "/login.html",
    "/api/login",
    "/css/",
    "/js/",
    "/assets/",
    "/favicon.ico",
  ];

  if (publicPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  if (!req.session.user) {
    console.log("No session — redirecting to login:", req.path);
    return res.redirect("/login.html");
  }

  next();
});

app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");

  if (req.session.user.role === "admin") {
    return res.redirect("/admin.html");
  } else {
    return res.redirect("/employee.html");
  }
});

// KEEP THE EXPRESS STATIC IN THIS EXACT SPOT OR THE PAGES AREN'T PROTECTED. DO NOT MOVVEEE!!!
app.use(express.static("public"));

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
      "INSERT INTO users (full_name, username, password, role, start_date, total_pto_allowed) VALUES (?, ?, ?, 'employee', ?, 5)",

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
  try {
    await db.query(
      "INSERT INTO pto (user_id, date, hours_used) VALUES (?, ?, ?)",
      [user_id, date, hours_used]
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
    "SELECT id, full_name, start_date, total_pto_allowed FROM users WHERE role='employee'"
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

    // PTO used (current year)
    const [usedRows] = await db.query(
      "SELECT COUNT(*) AS used FROM pto WHERE user_id = ?",
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
    "SELECT u.full_name, p.date, p.id FROM pto p JOIN users u ON p.user_id = u.id WHERE p.date >= CURDATE() ORDER BY p.date ASC"
  );

  res.json(rows);
});

// Past Pto History PTO
app.get("/api/admin/pastptohistory", ensureAdmin, async (req, res) => {
  const [rows] = await db.query(
    "SELECT u.full_name, p.date, p.id FROM pto_history p JOIN users u ON p.user_id = u.id"
  );
  res.json(rows);
});

// PTO Policies (read-only)
app.get("/api/policy", ensureAuth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM policy ORDER BY years_of_service ASC"
  );
  res.json(rows);
});

// Delete PTO Entry from summary table
app.delete("/api/admin/pto/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM pto WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PTO entry not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting PTO entry:", err);
    res.sendStatus(500);
  }
});

// Employee summary route
app.get("/api/employee/summary", ensureAuth, async (req, res) => {
  const userId = req.session.user.id;

  const [userRows] = await db.query(
    "SELECT start_date, total_pto_allowed FROM users WHERE id = ?",
    [userId]
  );
  const user = userRows[0];
  const total_pto_allowed = user.total_pto_allowed;
  const [usedRows] = await db.query(
    "SELECT COUNT(*) AS used FROM pto WHERE user_id = ?",
    [userId]
  );

  const used = usedRows[0].used;

  const remaining = total_pto_allowed - used;

  // PTO history
  const [history] = await db.query(
    "SELECT date, hours_used FROM pto WHERE user_id = ? ORDER BY date DESC",
    [userId]
  );

  res.json({ used, remaining, history, total_pto_allowed });
});

// Change Password (Employee Only)
app.put("/api/employee/change-password", ensureAuth, async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.session.user.id;

  try {
    // Fetch existing password
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);
    if (!rows[0]) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(old_password, rows[0].password);
    if (!valid)
      return res.status(400).json({ error: "Old password is incorrect" });

    const hashed = await bcrypt.hash(new_password, 10);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      userId,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// updates carry overs and updates PTO based on anniversary year
async function updateCarryOvers() {
  const [users] = await db.query(
    "SELECT id, start_date, last_carry_year, last_policy_update_year FROM users WHERE role='employee'"
  );

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  for (const user of users) {
    const start = new Date(user.start_date);
    const annivMonth = start.getMonth() + 1;
    const annivDay = start.getDate();

    // Skip employees whose anniversary is NOT today
    if (annivMonth !== currentMonth || annivDay !== currentDay) continue;

    const yearsWorked = Math.floor(
      (today - start) / (1000 * 60 * 60 * 24 * 365)
    );

    //  1. Calculate if there is a carry over

    let carryOver = 0;

    // Only allow once per year
    if (user.last_carry_year !== currentYear) {
      const [currentPtoAllowed] = await db.query(
        "SELECT total_pto_allowed FROM users WHERE id = ?",
        [user.id]
      );
      // PTO used last year
      const [ptoUsed] = await db.query(
        "SELECT COUNT(*) AS used FROM pto WHERE user_id = ? AND YEAR(date) = ?",
        [user.id, currentYear /*- 1 commented out to see what happens */]
      );

      const currentPto = currentPtoAllowed[0].total_pto_allowed;
      const usedLastYear = ptoUsed[0].used;

      const unused = currentPto - usedLastYear;

      if (unused > 0) {
        carryOver = Math.min(unused, 3);
      }
    }

    //   2. GET POLICY TIER

    const [policies] = await db.query(
      "SELECT * FROM policy ORDER BY years_of_service ASC"
    );

    // Choose correct PTO policy tier based on years worked
    let allowedDays = 0;

    if (yearsWorked <= 3) {
      allowedDays = policies[yearsWorked].days_allowed;
    } else {
      allowedDays = policies[4].days_allowed;
    }

    // 3. UPDATE USER ALLOWED PTO

    // Only update PTO tier once per year
    const shouldUpdatePolicy = user.last_policy_update_year !== currentYear;

    if (shouldUpdatePolicy || user.last_carry_year !== currentYear) {
      const newTotalAllowed = allowedDays + carryOver;

      await db.query(
        `UPDATE users 
         SET total_pto_allowed = ?,
             last_carry_year = ?, 
             last_policy_update_year = ?
         WHERE id = ?`,
        [newTotalAllowed, currentYear, currentYear, user.id]
      );

      // MOVE OLD PTO INTO HISTORY
      await db.query(
        `INSERT INTO pto_history (user_id, date, hours_used, created_at)
          SELECT user_id, date, hours_used, created_at
          FROM pto
          WHERE user_id = ?;`,
        [user.id]
      );

      // DELETE OLD PTO FROM MAIN TABLE
      await db.query(
        `DELETE FROM pto
          WHERE user_id = ?`,
        [user.id]
      );
    }
  }
}

// cron job to run carry overs every day at midnight
cron.schedule("0 0 * * *", () => {
  updateCarryOvers().catch((err) => console.error("Carry-over error:", err));
});

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

// manual run carryover delete while in production just to go the endpoint /run-carryover to manually run this shit
app.get("/run-carryover", async (req, res) => {
  try {
    await updateCarryOvers();
    res.send("Carry-over job executed manually.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error running carry-over job.");
  }
});
