# Torres Capitol College Inc. — BSIT Automated Attendance System
## Instructor & Evaluator Demonstration Guide

This guide is designed for BSIT students to present the **Automated Attendance System** effectively during oral defense, capstone evaluations, or laboratory demonstrations before faculty panels and department heads.

---

## 🎯 5-Phase Demonstration Script

### Phase 1: Problem Background & System Architecture (2 Minutes)
1. **The Problem:** Explain how traditional attendance sign-in sheets at Torres Capitol College Inc. create bottlenecks, risk illegible handwriting, enable "buddy punching" (signing for an absent friend), and require hours of manual transcription into spreadsheets.
2. **The Solution:** Present the modern, fully responsive web application built with Next.js 14, Tailwind CSS, Prisma ORM, and cryptographic QR verification with zero external hardware prerequisites.
3. **Data Privacy Compliance:** Emphasize compliance with the **Philippine Data Privacy Act of 2012 (RA 10173)** — all student records are confidential, authenticated via signed JWT tokens, and avoid intrusive biometric or GPS tracking.

---

### Phase 2: Administrator Governance (3 Minutes)
1. Navigate to the login page `http://localhost:3000/login`.
2. Click the **"Admin Portal"** 1-click demo button (or enter `admin@tcci.edu.ph` / `Admin123!`).
3. Point out:
   - **System Dashboard:** Overall attendance rate (%), total active students, faculty, and sessions held.
   - **Daily Attendance Trend Chart:** Built using Recharts to visualize turnout patterns over time.
   - **At-Risk Alert Widget:** Automatic detection of any student falling below the 80% college attendance requirement.
4. Open **Student Directory** (`/admin/students`):
   - Show how students can be searched in real time.
   - Demonstrate the **CSV Bulk Import** modal: explain that registrar lists can be imported in seconds.
   - Click **Export CSV** to download the clean student list.
5. Open **Attendance Records & Audits** (`/admin/records`):
   - Show how records are filtered by subject, section, and status.
   - Click **"Correct"** on any record to demonstrate the **Manual Correction Dialog**:
     - Change status (e.g., from `ABSENT` to `EXCUSED`).
     - Point out the **mandatory justification requirement** (e.g., "Presented approved medical certificate").
   - Open **Audit Logs** (`/admin/audit-logs`): Show that the correction was immediately recorded with timestamp, editor, and reason!

---

### Phase 3: Faculty Workflow & Live Dynamic QR Projection (4 Minutes)
1. Log out or open an incognito/second browser tab to `http://localhost:3000/login`.
2. Click the **"Faculty Portal"** demo button (`prof.santos@tcci.edu.ph` / `Faculty123!`).
3. Show the **Faculty Dashboard**:
   - Weekly teaching schedule (`IT301 Web Systems`, `IT305 DBMS`).
   - At-risk roster specific to their classes.
4. Click **"Launch New Attendance Session"**:
   - Select subject: `IT301 — Web Systems and Technologies`.
   - Section: `BSIT 3-A`.
   - Show the configurable rules: 90 min duration, 15 min on-time grace window, 45 min late cutoff.
   - Click **"Generate Dynamic QR Code"**.
5. You are now on the **Live QR Attendance Monitor** (`/faculty/session/[id]`):
   - Show the dynamic QR code designed to be displayed on the classroom projector.
   - Highlight the **20-Second Rotation Countdown**: Explain that every 20 seconds, the cryptographic token rolls over. **Even if a student takes a screenshot and sends it over Messenger to a friend outside campus, it expires before it can be used!**
   - Point out the **Live Sync Roster** on the right: real-time list of enrolled students.
   - Show the **"Copy Payload"** or manual code assistance for students with camera or device issues.

---

### Phase 4: Student Mobile Experience & QR Scan (3 Minutes)
1. In another browser window or on a mobile phone (connected to local Wi-Fi):
2. Log in as a BSIT student: click **"Student Portal"** (`student1@tcci.edu.ph` / `Student123!`).
3. Show the **Student Dashboard**:
   - Active Attendance Session banner immediately alerts the student that their class is open!
   - Subject-by-subject attendance progress bars.
4. Click **"Scan Live Attendance QR"** (`/student/scan`):
   - Show the Camera scanner interface with the animated laser reticle.
   - Switch to **"Manual Code Entry"** tab to paste the session token/payload.
   - Click **"Submit Attendance Record"**.
5. Show the **Instant Animated Confirmation Card**:
   - Green badge: **PRESENT** (or amber **LATE** if after the grace period).
   - Timestamp and subject code.
6. Switch back to the Faculty projector screen:
   - Point out that the student's status immediately updated to **PRESENT** in the classroom roster!
7. **Attempt Duplicate Submission:**
   - Scan or submit the code a second time.
   - Show the error alert: *"Duplicate Submission Prevented: You have already checked in for this session."*
   - Explain to evaluators that this is strictly enforced by a database-level unique constraint (`sessionId` + `studentId`).

---

### Phase 5: Session Closure, Auto-Absences & PDF Report (2 Minutes)
1. On the Faculty screen, click **"Close & Finalize Absences"**:
   - Show the confirmation prompt.
   - Explain that all unrecorded students are automatically marked as **ABSENT** with reason *"Auto-marked absent: No submission recorded prior to session closing"*.
2. Open **Reports & Analytics** (`/admin/reports` or `/faculty/reports`):
   - Select the **"Students Below Attendance Threshold (< 80%)"** tab.
   - Click **"Print Official Report"** to show the print-ready institutional report layout with college department letterhead.
3. Conclude by showing the terminal running the automated test suite (`npm test`) with 9/9 passing tests.

---

## 💡 Anticipated Evaluator Questions & Answers

**Q1: How does the system prevent students from sharing QR code screenshots with absent classmates?**
> *Answer:* The system implements **dynamic short-lived rolling tokens**. The classroom projector displays a QR code that rotates every 20 seconds. An expired token is rejected by the server even if submitted seconds later. Furthermore, duplicate submissions for the same student are blocked by database constraints.

**Q2: What happens if a student has no smartphone or their camera is broken?**
> *Answer:* The system provides two fail-safe mechanisms:
> 1. The student can switch to the **Manual Code Entry** tab and type the short session code.
> 2. The faculty member can click **"Manual Check-in"** next to the student's name on their live roster and record an authorized entry with a documented reason.

**Q3: Can a student edit their own records or view other students' grades/attendance?**
> *Answer:* No. The application enforces server-side Role-Based Access Control (RBAC). Student queries are strictly filtered by `studentProfileId` at the database level. Students have read-only access to their own attendance records.

**Q4: How does the system handle students who are absent due to medical or official college events?**
> *Answer:* Authorized faculty members or administrators can mark the student as **EXCUSED** via the Correction Modal. This requires entering a documented explanation (e.g., "Presented approved medical certificate") which is permanently logged in the audit trail.

**Q5: What database does this run on?**
> *Answer:* It uses Prisma ORM with SQLite for zero-configuration local evaluation, and is fully configured to connect to PostgreSQL (Supabase, Neon, or institutional PostgreSQL servers) simply by setting the `DATABASE_URL` in `.env`.
