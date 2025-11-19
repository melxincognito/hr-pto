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

---
