# SchoolsPLP PTO Tracker

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
- Settings page to update password

## Access Control

### Authentication

- Unified login page for all users
- Role-based redirection after authentication
- Secure password system

### User Roles

- **Admins**: Melanie and Leah (full system access)
- **Employees**: Read-only access to personal information and password updates

## Installation

```bash
# npm install bcrypt bcryptjs body-parser dotenv express express-session mysql2 node-cron
# npm install --save-dev nodemon
# Configure environment variables
# npm run dev
```

## Configuration

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
- PTO entries table: **pto** (id, user_id, date, hours_used, created_at)
- PTO History table: **pto_history** (id, user_id, date, hours_used, created_at)
- PTO policies table: **policy** (id, years_of_service, days_allowed, carry_over, notes )

## Security

- Secure password storage (hashed with bcryptjs)
- Role-based access control
- Session management

## Onboarding Process

New employees receive login credentials as part of their onboarding package, similar to other company account information. Employees will be directed to update their password upon logging in so it's more secure and easy for them to remember.

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

1. Navigate to login page
2. Enter credentials
3. Redirected based on role (admin/employee)
4. EMPLOYEES - Upon login, employees are directed to a comprehensive, read-only dashboard providing complete visibility into their PTO status. The interface displays their total annual PTO allowance, days used, and remaining balance at a glance. A detailed usage history tracks all PTO taken throughout the year, while an information panel highlights key PTO policies, company holidays, and important guidelines. The dashboard also features real-time updates reflecting the current company PTO policy based on years of service. The only interactive element is a secure password change form accessible through the settings menu.
5. ADMIN - Administrators access a full-featured management portal with comprehensive control over the entire PTO system. The employee management section enables admins to onboard new team members by entering their full name, unique username, temporary password, and start date. All employee details remain editable to accommodate corrections, name changes, or role adjustments—including the ability to grant admin privileges or mark employees as inactive.
   The PTO entry interface allows admins to log time off on behalf of employees, while the summary view provides an at-a-glance overview of each employee's annual allowance, current usage, and remaining balance. The PTO Book functions as a chronological transaction ledger, displaying all upcoming and historical time-off entries in an intuitive feed format. Admins can edit entries directly within the book to correct clerical errors or update changed plans.
   The PTO History tab maintains a complete archive of all employee PTO records, including historical data for both active and former staff members. The PTO Policy section empowers admins to adjust allowances by years of service—changes automatically recalculate and update every affected employee's total allowance in real-time. Finally, a dedicated settings page provides secure password management for administrative accounts.

## Maintenance

- Regular backups
- User management procedures
- Policy update process

## Support

For technical issues or access problems, contact: Melanie Gonzalez melanie@schoolsplp.com
