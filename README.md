# Torres Capitol College Inc. — BSIT Automated Attendance System

![Torres Capitol College Inc.](https://img.shields.io/badge/Institution-Torres%20Capitol%20College%20Inc.-800020?style=for-the-badge)
![Department](https://img.shields.io/badge/Department-BSIT%20Program-slate?style=for-the-badge)
![Status](https://img.shields.io/badge/System-Production%20Ready-emerald?style=for-the-badge)

A comprehensive, responsive, and secure **Automated Attendance System** engineered specifically for the Bachelor of Science in Information Technology (BSIT) department of **Torres Capitol College Inc. (TCCI)**.

Built with **Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, and SQLite/PostgreSQL**, this platform replaces traditional paper-based sign-in sheets with cryptographically rotating QR codes, server-side rule enforcement, audit trails, and role-based analytical dashboards.

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
- **Administrator Portal:** System-wide attendance analytics, student & faculty directories, curriculum subjects, class sections, schedule assignments, system policy rules, CSV bulk imports, audit trail logs, and PDF/CSV reporting.
- **Faculty Portal:** Teaching schedule overview, dynamic class attendance launcher, live classroom attendee monitor with 20s token auto-rotation, authorized manual corrections (with mandatory justification for the audit trail), and at-risk student rosters.
- **Student Portal:** Personalized dashboard, camera-based QR scanner with manual token fallback, subject-by-subject attendance rate progress bars, historical records, weekly timetables, and automated threshold alerts.

### 2. Anti-Impersonation Dynamic QR Engine
- Rotating QR code refresh every 20 seconds prevents screenshot sharing outside the physical lecture room.
- Strict server-side verification: identity, academic term, subject enrollment, time-window validity, and duplicate submission prevention.
- Database-level unique constraint (`sessionId` + `studentId`) ensures zero duplicate attendance events.

### 3. Institutional Attendance Policy Engine
- **Present:** Check-in within the configured grace period (default: 15 minutes).
- **Late:** Check-in between the grace period and late cutoff (default: 15–45 minutes).
- **Absent:** Check-in past late cutoff or automatically finalized when the session is closed.
- **Excused:** Authorized faculty or admin approval with recorded justification and permanent audit log entry.
- **At-Risk Detection:** Students falling below the 80% policy threshold are automatically flagged on all dashboards.
- **PST / UTC+8 Alignment:** All timestamps adhere to Philippine Standard Time (`Asia/Manila`).

### 4. Philippine Data Privacy Act Compliance
- Adheres to Republic Act No. 10173 (Data Privacy Act of 2012).
- Does not collect intrusive GPS tracking or unnecessary biometrics.
- Session tokens are signed via HS256 JWTs with HTTP-only cookies and bcrypt-hashed passwords.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18.17+ or v20+
- npm v10+

### Installation & Database Initialization

```bash
# 1. Clone or navigate to the workspace
cd "d:\Projects\Automated attendace systen"

# 2. Install dependencies (already prepared)
npm install

# 3. Synchronize database schema (SQLite out-of-the-box or PostgreSQL)
npx prisma generate
npx prisma db push

# 4. Populate realistic demonstration data (BSIT classes, faculty & students)
npm run db:seed

# 5. Run the Automated Integrity Test Suite
npm test

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demonstration Accounts

The database comes pre-loaded with realistic accounts:

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@tcci.edu.ph` | `Admin123!` | Full governance, audit logs, student & faculty directories |
| **Faculty Instructor** | `prof.santos@tcci.edu.ph` | `Faculty123!` | IT301 & IT305 instructor, live QR projector controls |
| **Faculty Instructor 2** | `prof.reyes@tcci.edu.ph` | `Faculty123!` | IT202 Data Structures instructor |
| **BSIT Student** | `student1@tcci.edu.ph` | `Student123!` | Mark Andrei Villanueva (BSIT 3-A, ID: TCCI-2022-0101) |

> **Tip:** The login page features **1-Click Demo Fill buttons** for immediate presentation without manual typing!

---

## 📂 Project Architecture

```
├── prisma/
│   ├── schema.prisma          # Database models, indexes & unique constraints
│   └── dev.db                 # SQLite development database
├── scripts/
│   ├── seed.mjs               # Comprehensive demonstration data seeder
│   └── test-system.mjs        # 9 automated integrity & security test assertions
├── src/
│   ├── app/
│   │   ├── api/               # Server-side REST endpoints (Auth, Attendance, Admin, Faculty)
│   │   ├── admin/             # Administrator dashboard & management pages
│   │   ├── faculty/           # Faculty classes, sessions & live QR display
│   │   ├── student/           # Student mobile dashboard & camera QR scanner
│   │   ├── login/             # Authentication page with demo switchers
│   │   └── globals.css        # Tailwind styling & institutional color theme
│   ├── components/
│   │   ├── charts/            # Recharts attendance analytics & area charts
│   │   ├── layout/            # Responsive sidebar & top navigation
│   │   ├── qr/                # Dynamic rotating QR display & Camera scanner
│   │   └── ui/                # Stat cards, badges & correction modals
│   └── lib/
│       ├── attendance-engine.ts # Rules engine for Present/Late/Absent evaluation
│       ├── auth.ts            # JWT session handling & bcrypt encryption
│       ├── audit.ts           # Tamper-evident administrative audit logging
│       ├── prisma.ts          # Singleton Prisma database client
│       └── qr.ts              # Cryptographic QR token generator
```

---

## ⚙️ Environment Variables (`.env`)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tcci-bsit-super-secure-attendance-system-token-key-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SCHOOL_NAME="Torres Capitol College Inc."
NEXT_PUBLIC_DEPARTMENT_NAME="College of Computer Studies — BSIT Department"
```

To switch to **PostgreSQL** in production (e.g. Neon, Supabase, Railway):
1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Update `DATABASE_URL` to your PostgreSQL connection string:
   `DATABASE_URL="postgresql://user:password@host:5432/tcci_attendance?schema=public"`
3. Run `npx prisma db push`.

---

## 🧪 Automated Test Suite

Run the automated verification suite anytime:

```bash
npm test
```

Verifies:
1. On-time check-in within grace window evaluates to `PRESENT`.
2. Check-in between grace window and cutoff evaluates to `LATE`.
3. Check-in past cutoff window evaluates to `ABSENT`.
4. Attendance rate calculation & `< 80%` At-Risk detection.
5. Database unique constraint prevents duplicate attendance submissions.
6. Audit logs are written upon manual attendance corrections.
7. Role credentials & bcrypt hashing verification.

---

## 📄 License & Attribution
Developed for **Torres Capitol College Inc. — College of Computer Studies (BSIT Department)**.
Educational capstone & institutional demonstration software.
