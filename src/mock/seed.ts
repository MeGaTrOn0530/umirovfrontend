import type {
  DB,
  User,
  Group,
  GroupMember,
  Subject,
  Semester,
  Lesson,
  Assignment,
  AttendanceRecord,
  Submission,
  Grade,
  FileAttachment,
} from "@/types";

const now = new Date();
const days = (value: number) => new Date(now.getTime() + value * 86400000);

const teacherId = "user-teacher-01";
const studentId = "user-student-01";

const users: User[] = [
  {
    id: teacherId,
    username: "teacher",
    password: "Teacher123!",
    role: "TEACHER",
    firstName: "Laylo",
    lastName: "Karimova",
    mustChangePassword: false,
    createdAt: now.toISOString(),
  },
  {
    id: studentId,
    username: "student",
    password: "Student123!",
    role: "STUDENT",
    firstName: "Aziz",
    lastName: "Saidov",
    mustChangePassword: true,
    createdAt: now.toISOString(),
  },
];

const groups: Group[] = [];

const groupMembers: GroupMember[] = [];

const subjects: Subject[] = [
  {
    id: "sub-math-01",
    name: "Applied Mathematics",
    code: "MATH-301",
    teacherId,
    createdAt: now.toISOString(),
  },
  {
    id: "sub-ux-01",
    name: "UX Foundations",
    code: "UX-220",
    teacherId,
    createdAt: now.toISOString(),
  },
  {
    id: "sub-eng-01",
    name: "Academic English",
    code: "ENG-110",
    teacherId,
    createdAt: now.toISOString(),
  },
];

const semesters: Semester[] = [
  {
    id: "sem-2025-fall",
    name: "2025 Fall",
    startDate: new Date("2025-09-01T00:00:00.000Z").toISOString(),
    endDate: new Date("2026-01-15T00:00:00.000Z").toISOString(),
    isCurrent: false,
  },
  {
    id: "sem-2026-spring",
    name: "2026 Spring",
    startDate: new Date("2026-02-01T00:00:00.000Z").toISOString(),
    endDate: new Date("2026-06-20T00:00:00.000Z").toISOString(),
    isCurrent: true,
  },
];

const lessons: Lesson[] = [
  {
    id: "lesson-01",
    subjectId: "sub-math-01",
    teacherId,
    dateTime: days(-3).toISOString(),
    topic: "Optimization strategies",
    createdAt: now.toISOString(),
  },
  {
    id: "lesson-02",
    subjectId: "sub-ux-01",
    teacherId,
    dateTime: days(2).toISOString(),
    topic: "User flows & testing",
    createdAt: now.toISOString(),
  },
  {
    id: "lesson-03",
    subjectId: "sub-eng-01",
    teacherId,
    dateTime: days(6).toISOString(),
    topic: "Presentation skills",
    createdAt: now.toISOString(),
  },
];

const assignments: Assignment[] = [
  {
    id: "assign-01",
    subjectId: "sub-math-01",
    teacherId,
    title: "Linear regression lab",
    description: "Submit analysis with charts and summary.",
    deadline: days(5).toISOString(),
    maxScore: 100,
    attachments: [
      {
        id: "file-assign-01-1",
        name: "dataset.csv",
        mimeType: "text/csv",
        sizeKb: 420,
        kind: "document",
      },
      {
        id: "file-assign-01-2",
        name: "lab-instructions.pdf",
        mimeType: "application/pdf",
        sizeKb: 860,
        kind: "document",
      },
    ],
    createdAt: now.toISOString(),
  },
  {
    id: "assign-02",
    subjectId: "sub-ux-01",
    teacherId,
    title: "Prototype critique",
    description: "Upload critique with insights.",
    deadline: days(-1).toISOString(),
    maxScore: 100,
    attachments: [
      {
        id: "file-assign-02-1",
        name: "ux-critique-guide.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sizeKb: 320,
        kind: "document",
      },
      {
        id: "file-assign-02-2",
        name: "critique-session.mp4",
        mimeType: "video/mp4",
        sizeKb: 12450,
        kind: "video",
      },
    ],
    createdAt: now.toISOString(),
  },
  {
    id: "assign-03",
    subjectId: "sub-eng-01",
    teacherId,
    title: "Essay outline",
    description: "Submit outline and thesis.",
    deadline: days(10).toISOString(),
    maxScore: 100,
    attachments: [
      {
        id: "file-assign-03-1",
        name: "outline-template.pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        sizeKb: 540,
        kind: "slides",
      },
    ],
    createdAt: now.toISOString(),
  },
];

const attendance: AttendanceRecord[] = [
  {
    id: "att-01",
    lessonId: "lesson-01",
    studentId,
    status: "ONTIME",
    recordedAt: days(-3).toISOString(),
  },
  {
    id: "att-02",
    lessonId: "lesson-02",
    studentId,
    status: "LATE",
    recordedAt: days(2).toISOString(),
  },
];

const submissions: Submission[] = [
  {
    id: "subm-01",
    assignmentId: "assign-02",
    studentId,
    submittedAt: days(0).toISOString(),
    text: "Prototype critique draft and notes.",
    files: [
      {
        id: "file-subm-01-1",
        name: "critique.pdf",
        mimeType: "application/pdf",
        sizeKb: 780,
        kind: "document",
      },
    ],
    isLate: true,
  },
];

const grades: Grade[] = [
  {
    id: "grade-01",
    assignmentId: "assign-02",
    studentId,
    score: 86,
    grade: "4",
    gradedAt: days(0).toISOString(),
    teacherId,
  },
];

export function createSeed(): DB {
  return {
    users,
    groups,
    groupMembers,
    subjects,
    semesters,
    lessons,
    assignments,
    attendance,
    submissions,
    grades,
    updatedAt: now.toISOString(),
  };
}
