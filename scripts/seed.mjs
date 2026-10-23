import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Torres Capitol College Inc. Database Seeder...');

  // Clean existing demonstration data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.academicTerm.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // System Settings
  await prisma.systemSetting.create({
    data: {
      id: 'tcci-settings',
      schoolName: 'Torres Capitol College Inc.',
      departmentName: 'Bachelor of Science in Information Technology',
      defaultGracePeriodMinutes: 15,
      defaultLateCutoffMinutes: 45,
      minimumAttendanceThreshold: 80.0,
      timeZone: 'Asia/Manila',
      qrRotationIntervalSeconds: 20,
    },
  });

  // Academic Term
  const term = await prisma.academicTerm.create({
    data: {
      academicYear: '2024-2025',
      semester: '1st Semester',
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-12-20'),
      isActive: true,
    },
  });

  // Sections
  const section1A = await prisma.section.create({
    data: { name: 'BSIT 1-A', program: 'BSIT', yearLevel: 1, termId: term.id },
  });
  const section2A = await prisma.section.create({
    data: { name: 'BSIT 2-A', program: 'BSIT', yearLevel: 2, termId: term.id },
  });
  const section3A = await prisma.section.create({
    data: { name: 'BSIT 3-A', program: 'BSIT', yearLevel: 3, termId: term.id },
  });
  const section4A = await prisma.section.create({
    data: { name: 'BSIT 4-A', program: 'BSIT', yearLevel: 4, termId: term.id },
  });

  // Subjects
  const subjIT101 = await prisma.subject.create({
    data: { code: 'IT101', name: 'Introduction to Computing', description: 'Foundations of computing, digital logic, and basic problem solving.', units: 3 },
  });
  const subjIT202 = await prisma.subject.create({
    data: { code: 'IT202', name: 'Data Structures & Algorithms', description: 'Linear and non-linear data structures, complexity analysis, and algorithms.', units: 3 },
  });
  const subjIT301 = await prisma.subject.create({
    data: { code: 'IT301', name: 'Web Systems and Technologies', description: 'Modern full-stack web application development, APIs, and client-server architecture.', units: 3 },
  });
  const subjIT305 = await prisma.subject.create({
    data: { code: 'IT305', name: 'Database Management Systems', description: 'Relational database design, normalization, SQL, indexing, and transaction management.', units: 3 },
  });
  const subjIT401 = await prisma.subject.create({
    data: { code: 'IT401', name: 'Capstone Project and Research', description: 'Culminating software engineering research and production deployment project.', units: 3 },
  });

  // Hash standard demo passwords
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const facultyPassword = await bcrypt.hash('Faculty123!', 10);
  const studentPassword = await bcrypt.hash('Student123!', 10);

  // 1. Create Administrator
  const adminUser = await prisma.user.create({
    data: {
      name: 'Gerald M. Bautista (System Admin)',
      email: 'admin@tcci.edu.ph',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. Create Faculty Members
  const facultyUser1 = await prisma.user.create({
    data: {
      name: 'Engr. Juan Dela Cruz, MSIT',
      email: 'prof.santos@tcci.edu.ph',
      passwordHash: facultyPassword,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
  });
  const facultyProfile1 = await prisma.facultyProfile.create({
    data: {
      userId: facultyUser1.id,
      facultyIdNumber: 'FAC-BSIT-001',
      department: 'BSIT Department',
    },
  });

  const facultyUser2 = await prisma.user.create({
    data: {
      name: 'Dr. Maria Elena Reyes, MIT',
      email: 'prof.reyes@tcci.edu.ph',
      passwordHash: facultyPassword,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
  });
  const facultyProfile2 = await prisma.facultyProfile.create({
    data: {
      userId: facultyUser2.id,
      facultyIdNumber: 'FAC-BSIT-002',
      department: 'BSIT Department',
    },
  });

  // 3. Class Schedules
  const schedule1 = await prisma.classSchedule.create({
    data: {
      subjectId: subjIT301.id,
      sectionId: section3A.id,
      facultyId: facultyProfile1.id,
      termId: term.id,
      dayOfWeek: 'Monday',
      startTime: '08:30',
      endTime: '11:30',
      room: 'ComLab 3 (3rd Flr)',
    },
  });

  const schedule2 = await prisma.classSchedule.create({
    data: {
      subjectId: subjIT305.id,
      sectionId: section3A.id,
      facultyId: facultyProfile1.id,
      termId: term.id,
      dayOfWeek: 'Wednesday',
      startTime: '13:00',
      endTime: '16:00',
      room: 'ComLab 2 (2nd Flr)',
    },
  });

  const schedule3 = await prisma.classSchedule.create({
    data: {
      subjectId: subjIT202.id,
      sectionId: section2A.id,
      facultyId: facultyProfile2.id,
      termId: term.id,
      dayOfWeek: 'Tuesday',
      startTime: '10:00',
      endTime: '12:00',
      room: 'Room 304 (Main Bldg)',
    },
  });

  // 4. Create Students (BSIT 3-A sample students)
  const sampleStudentsData = [
    { name: 'Mark Andrei Villanueva', email: 'student1@tcci.edu.ph', idNumber: 'TCCI-2022-0101', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Chloe Anne Mendoza', email: 'student2@tcci.edu.ph', idNumber: 'TCCI-2022-0102', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Jayson Kyle Ramirez', email: 'student3@tcci.edu.ph', idNumber: 'TCCI-2022-0103', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Bea Patricia Santos', email: 'student4@tcci.edu.ph', idNumber: 'TCCI-2022-0104', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Christian Dave Ocampo', email: 'student5@tcci.edu.ph', idNumber: 'TCCI-2022-0105', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Angelica Mae Cruz', email: 'student6@tcci.edu.ph', idNumber: 'TCCI-2022-0106', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Renz Carlo Garcia', email: 'student7@tcci.edu.ph', idNumber: 'TCCI-2022-0107', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Princess Nicole Ramos', email: 'student8@tcci.edu.ph', idNumber: 'TCCI-2022-0108', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Danielle John Perez', email: 'student9@tcci.edu.ph', idNumber: 'TCCI-2022-0109', sectionId: section3A.id, yearLevel: 3 },
    { name: 'Kathleen Joy Flores', email: 'student10@tcci.edu.ph', idNumber: 'TCCI-2022-0110', sectionId: section3A.id, yearLevel: 3 },
  ];

  const createdStudentProfiles = [];

  for (const s of sampleStudentsData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash: studentPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    const prof = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        studentIdNumber: s.idNumber,
        program: 'BSIT',
        yearLevel: s.yearLevel,
        sectionId: s.sectionId,
        enrollmentStatus: 'REGULAR',
      },
    });
    createdStudentProfiles.push(prof);

    // Enroll in IT301 and IT305
    await prisma.classEnrollment.create({
      data: {
        studentId: prof.id,
        subjectId: subjIT301.id,
        sectionId: section3A.id,
        termId: term.id,
      },
    });
    await prisma.classEnrollment.create({
      data: {
        studentId: prof.id,
        subjectId: subjIT305.id,
        sectionId: section3A.id,
        termId: term.id,
      },
    });
  }

  // 5. Create Past Attendance Sessions and realistic records
  const pastDates = [
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),  // 1 week ago
    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),  // 4 days ago
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),  // 2 days ago
  ];

  for (let i = 0; i < pastDates.length; i++) {
    const sDate = pastDates[i];
    const pastSession = await prisma.attendanceSession.create({
      data: {
        scheduleId: schedule1.id,
        facultyId: facultyProfile1.id,
        subjectId: subjIT301.id,
        sectionId: section3A.id,
        sessionDate: sDate,
        startTime: sDate,
        endTime: new Date(sDate.getTime() + 3 * 60 * 60 * 1000),
        qrToken: `TOKEN-PAST-${i}`,
        status: 'CLOSED',
        notes: `Regular Lecture & Laboratory Session #${i + 1}`,
      },
    });

    // Populate realistic attendance records for each student
    for (let j = 0; j < createdStudentProfiles.length; j++) {
      const student = createdStudentProfiles[j];
      let status = 'PRESENT';
      let checkInOffset = 5 + Math.floor(Math.random() * 8); // 5 to 13 mins

      if (j === 3 && i === 1) {
        status = 'LATE';
        checkInOffset = 25;
      } else if (j === 7 && i % 2 === 1) {
        status = 'ABSENT';
        checkInOffset = 0;
      } else if (j === 8 && i === 2) {
        status = 'EXCUSED';
        checkInOffset = 0;
      }

      await prisma.attendanceRecord.create({
        data: {
          sessionId: pastSession.id,
          studentId: student.id,
          status,
          checkInTime: status !== 'ABSENT' ? new Date(sDate.getTime() + checkInOffset * 60 * 1000) : null,
          submissionMethod: status === 'EXCUSED' ? 'EXCUSED_ENTRY' : status === 'ABSENT' ? 'AUTO_ABSENT' : 'QR_SCAN',
          correctionReason: status === 'EXCUSED' ? 'Approved medical certificate submitted to BSIT faculty office' : null,
        },
      });
    }
  }

  // 6. Create ACTIVE live Attendance Session for testing right now!
  const now = new Date();
  const activeSession = await prisma.attendanceSession.create({
    data: {
      scheduleId: schedule1.id,
      facultyId: facultyProfile1.id,
      subjectId: subjIT301.id,
      sectionId: section3A.id,
      sessionDate: now,
      startTime: now,
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // expires in 2 hours
      qrToken: 'LIVE_DEMO_QR_TOKEN_2024',
      status: 'ACTIVE',
      presentCutoffMinutes: 15,
      lateCutoffMinutes: 45,
      notes: 'Live Demo Attendance Session for Evaluation / Presentation',
    },
  });

  // Seed 2 initial attendees in the active session
  await prisma.attendanceRecord.create({
    data: {
      sessionId: activeSession.id,
      studentId: createdStudentProfiles[0].id,
      status: 'PRESENT',
      checkInTime: new Date(now.getTime() + 4 * 60 * 1000),
      submissionMethod: 'QR_SCAN',
    },
  });

  // 7. Initial notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        title: 'System Deployment Ready',
        message: 'The Torres Capitol College Inc. BSIT Attendance System is now operational.',
        type: 'SYSTEM',
      },
      {
        userId: createdStudentProfiles[0].userId,
        title: 'Attendance Confirmed: IT301',
        message: 'Your attendance for IT301 Web Systems and Technologies was successfully recorded as PRESENT.',
        type: 'ATTENDANCE_SUCCESS',
      },
      {
        userId: createdStudentProfiles[7].userId,
        title: 'Attendance Advisory Notice',
        message: 'Your attendance percentage in IT301 has dropped below 80%. Please consult your instructor.',
        type: 'ATTENDANCE_WARNING',
      },
    ],
  });

  // 8. Audit Log
  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      actorName: 'System Administrator',
      actorRole: 'ADMIN',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'SystemSetting',
      details: 'Demonstration seed database loaded with academic schedules, faculty, and students.',
    },
  });

  console.log('✅ Database seeded successfully with demonstration data!');
  console.log('---------------------------------------------------------');
  console.log('🔑 DEMO ACCOUNTS FOR EVALUATION / TESTING:');
  console.log('Administrator : admin@tcci.edu.ph    / Admin123!');
  console.log('Faculty       : prof.santos@tcci.edu.ph / Faculty123!');
  console.log('Student       : student1@tcci.edu.ph   / Student123!');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
