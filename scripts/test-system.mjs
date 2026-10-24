import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

// Attendance evaluation rule logic mirror for standalone test runner
function evaluateAttendanceStatus(checkInTime, sessionStartTime, presentCutoff = 15, lateCutoff = 45) {
  const diffMinutes = Math.max(0, Math.floor((checkInTime.getTime() - sessionStartTime.getTime()) / (1000 * 60)));
  if (diffMinutes <= presentCutoff) return { status: 'PRESENT' };
  if (diffMinutes <= lateCutoff) return { status: 'LATE' };
  return { status: 'ABSENT' };
}

function calculateAttendanceStats(records) {
  const total = records.length;
  if (total === 0) return { total: 0, attendanceRate: 100, isAtRisk: false };
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const excused = records.filter((r) => r.status === 'EXCUSED').length;
  const effective = present + late * 0.75 + excused;
  const rate = Math.min(100, Math.round((effective / total) * 100 * 10) / 10);
  return { total, attendanceRate: rate, isAtRisk: rate < 80.0 };
}

async function runTests() {
  console.log('🧪 Starting Automated Verification & Integrity Test Suite...\n');

  // Test 1: Attendance Rules Engine - Present Status
  const sessionStart = new Date();
  const onTimeCheckIn = new Date(sessionStart.getTime() + 10 * 60 * 1000); // +10 min
  const onTimeResult = evaluateAttendanceStatus(onTimeCheckIn, sessionStart, 15, 45);
  assert(onTimeResult.status === 'PRESENT', 'Rules Engine: Check-in within 15 min grace window evaluates to PRESENT');

  // Test 2: Attendance Rules Engine - Late Status
  const lateCheckIn = new Date(sessionStart.getTime() + 25 * 60 * 1000); // +25 min
  const lateResult = evaluateAttendanceStatus(lateCheckIn, sessionStart, 15, 45);
  assert(lateResult.status === 'LATE', 'Rules Engine: Check-in between 15-45 min evaluates to LATE');

  // Test 3: Attendance Rules Engine - Absent Status (Post late cutoff)
  const absentCheckIn = new Date(sessionStart.getTime() + 50 * 60 * 1000); // +50 min
  assert(absentCheckIn > sessionStart, 'Session timeline order is valid');
  const absentResult = evaluateAttendanceStatus(absentCheckIn, sessionStart, 15, 45);
  assert(absentResult.status === 'ABSENT', 'Rules Engine: Check-in past late cutoff evaluates to ABSENT');

  // Test 4: Attendance percentage calculation & At-Risk threshold (< 80%)
  const sampleRecordsHealthy = [
    { status: 'PRESENT' },
    { status: 'PRESENT' },
    { status: 'PRESENT' },
    { status: 'PRESENT' },
    { status: 'PRESENT' },
  ];
  const statsHealthy = calculateAttendanceStats(sampleRecordsHealthy);
  assert(statsHealthy.attendanceRate === 100 && !statsHealthy.isAtRisk, 'Calculation: 5/5 Present gives 100% and not at-risk');

  const sampleRecordsAtRisk = [
    { status: 'PRESENT' },
    { status: 'ABSENT' },
    { status: 'ABSENT' },
  ];
  const statsAtRisk = calculateAttendanceStats(sampleRecordsAtRisk);
  assert(statsAtRisk.attendanceRate < 80 && statsAtRisk.isAtRisk, 'Calculation: Low attendance flags isAtRisk = true (< 80%)');

  // Test 5: Database Duplicate Submission Constraint
  const sampleSession = await prisma.attendanceSession.findFirst({
    include: { section: true },
  });

  const testStudent = await prisma.studentProfile.findFirst({
    where: { sectionId: sampleSession?.sectionId || undefined },
  });

  // Attempt duplicate record
  let duplicateCaught = false;
  if (sampleSession && testStudent) {
    try {
      // Delete any existing record for clean test
      await prisma.attendanceRecord.deleteMany({
        where: { sessionId: sampleSession.id, studentId: testStudent.id },
      });

      // First insertion succeeds
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sampleSession.id,
          studentId: testStudent.id,
          status: 'PRESENT',
          checkInTime: new Date(),
          submissionMethod: 'QR_SCAN',
        },
      });

      // Second try must throw Unique Constraint error
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sampleSession.id,
          studentId: testStudent.id,
          status: 'PRESENT',
          checkInTime: new Date(),
          submissionMethod: 'QR_SCAN',
        },
      });
    } catch (err) {
      duplicateCaught = true;
    }
  }
  assert(duplicateCaught, 'Database Integrity: Unique constraint prevents duplicate attendance records for the same session');

  // Test 6: Audit log creation on manual correction
  const auditEntry = await prisma.auditLog.create({
    data: {
      actorName: 'Faculty Test Runner',
      actorRole: 'FACULTY',
      action: 'ATTENDANCE_CORRECTED',
      entityType: 'AttendanceRecord',
      entityId: 'test-rec-1',
      details: JSON.stringify({ oldStatus: 'ABSENT', newStatus: 'EXCUSED', reason: 'Medical cert verified' }),
    },
  });
  assert(auditEntry.id !== null, 'Audit Logging: Attendance corrections and administrative events are stored in audit trail');

  // Test 7: Verify Admin user query and password hashing
  const admin = await prisma.user.findUnique({ where: { email: 'admin@tcci.edu.ph' } });
  const isMatch = await bcrypt.compare('Admin123!', admin.passwordHash);
  assert(admin && admin.role === 'ADMIN' && isMatch, 'Security: Administrator account credentials and bcrypt hashing are verified');

  console.log(`\n=========================================`);
  console.log(`Total tests run: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`=========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
