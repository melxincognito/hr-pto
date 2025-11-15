# SchoolsPLP PTO App

Uses HTML, CSS, JavaScript, Node.JS and SQL to bring everything together.

App should remain simple, it's just used to track PTO and for employees to log in and see how much PTO they have left until their work anniversary.

Everyone uses the same login page and depending on if you're flagged as an admin or an employee will depend on what page you're redirected to after logging in.

Admins have the ability to add new employees, create a username and password, add PTO entrys, see a PTO summary of how many days every added employee has left, see upcoming PTO and change PTO policies.

Employees only have the ability to see a read only page showing how many days they have alloted for the year, how many they have used, how many days they have left, a summary of the PTO dates they've used in the past AND the ability to see current PTO policies put in place by the company. Any changes made from admins are automatically updated to each employee.

Admins should only be Melanie and Leah.

Each employee should be given a secure password to log in with upon onboarding, just like a bundle we give for all the company logins.

I'll help you create a comprehensive README! Here's a structured version with sections you should fill in:

# SchoolsPLP NAME PTO Tracker

A simple, secure employee PTO (Paid Time Off) tracking application for managing and monitoring vacation days across the organization.

## Overview

This application provides a centralized system for tracking employee PTO balances, usage, and policies. It features role-based access with separate admin and employee interfaces.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **Database**: SQL

## Features

### For Administrators

- Add new employees to the system
- Create secure login credentials for new hires
- Add and manage PTO entries
- View PTO summary across all employees
- Monitor upcoming PTO requests/usage
- Update company PTO policies
- Real-time updates pushed to all employee accounts

### For Employees

- View personal PTO dashboard (read-only)
- See annual PTO allowance
- Track used PTO days
- Monitor remaining PTO balance
- Review PTO usage history with dates
- Access current company PTO policies
- Automatic updates when policies change

## Access Control

### Authentication

- Unified login page for all users
- Role-based redirection after authentication
- Secure password system

### User Roles

- **Admins**: Melanie and Leah (full system access)
- **Employees**: Read-only access to personal information

## Installation

```bash
# npm install bcrypt bcryptjs body-parser dotenv express express-session mysql2 node-cron
# npm install --save-dev nodemon
# Configure environment variables
# npm run dev
```

## Configuration

_[TODO: Add configuration details]_

- Database connection settings
- Environment variables:
  - DB_HOST
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - DB_PORT
  - SESSION_SECRET

## Database Schema

- Users table: **users** (id, username, password, role, full_name, start_date, created_at, carry_over, total_pto_allowed, total_pto_used)
- PTO entries table: **pto** (id, user_id, date, hours_used, approved_by, created_at)
- PTO policies table: **policy** (id, years_of_service, days_allowed, carry_over, notes )

## Security

- Secure password storage (hashed with bcryptjs)
- Role-based access control
- Session management

## Onboarding Process

New employees receive secure login credentials as part of their onboarding package, similar to other company account information.

## PTO Calculation

The system tracks PTO based on work anniversary dates. Employees can see their:

- Total annual allocation
- Days used to date
- Remaining balance until next anniversary

## Deployment

_[TODO: Add deployment instructions]_

- Production environment setup
- Server requirements
- Backup procedures

## Usage

_[TODO: Add usage instructions or screenshots]_

1. Navigate to login page
2. Enter credentials
3. Redirected based on role (admin/employee)
4. [Continue with specific workflows]

## Maintenance

- Regular backups
- User management procedures
- Policy update process

## Support

For technical issues or access problems, contact: Melanie Gonzalez melanie@schoolsplp.com

## Future Enhancements

- PTO request/approval workflow
- Mobile responsive design

---
