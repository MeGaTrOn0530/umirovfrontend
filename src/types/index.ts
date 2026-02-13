export type Role = "TEACHER" | "STUDENT";

export type Group = {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  createdAt: string;
};

export type GroupMember = {
  id: string;
  groupId: string;
  studentId: string;
  createdAt: string;
};

export type User = {
  id: string;
  username: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
  createdAt: string;
};

export type UserPublic = Omit<User, "password">;

export type Subject = {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  createdAt: string;
};

export type Semester = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type Lesson = {
  id: string;
  subjectId: string;
  teacherId: string;
  dateTime: string;
  topic: string;
  createdAt: string;
};

export type FileKind = "document" | "slides" | "video" | "archive" | "other";

export type FileAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeKb: number;
  kind: FileKind;
  url?: string;
};

export type Assignment = {
  id: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  deadline: string;
  maxScore: number;
  attachments?: FileAttachment[];
  targetType?: "GROUP" | "STUDENT";
  targetId?: string | null;
  isLab?: boolean;
  labEditor?: "word" | "excel";
  teacherName?: string | null;
  createdAt: string;
};

export type AttendanceStatus = "ABSENT" | "ONTIME" | "LATE";

export type AttendanceRecord = {
  id: string;
  lessonId: string;
  studentId: string;
  status: AttendanceStatus;
  recordedAt: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  text: string;
  files?: FileAttachment[];
  isLate: boolean;
  contentHtml?: string | null;
  sheetJson?: unknown;
};

export type TaskType = "word" | "excel";

export type Task = {
  id: string;
  title: string;
  instruction?: string;
  type: TaskType;
  createdAt: string;
};

export type TaskSubmission = {
  id: string;
  taskId: string;
  userId: string;
  type: TaskType;
  contentHtml?: string;
  sheetJson?: unknown;
  createdAt: string;
};

export type GradeScale = "FAIL" | "3" | "4" | "5";

export type Grade = {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;
  grade: GradeScale;
  gradedAt: string;
  teacherId: string;
};

export type DB = {
  users: User[];
  groups: Group[];
  groupMembers: GroupMember[];
  subjects: Subject[];
  semesters: Semester[];
  lessons: Lesson[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  submissions: Submission[];
  grades: Grade[];
  updatedAt: string;
};
