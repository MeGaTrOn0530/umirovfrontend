import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  NotebookPen,
  UserCircle,
  Users,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export const teacherNav: NavItem[] = [
  { title: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/teacher/students", icon: Users },
  { title: "Groups", href: "/teacher/groups", icon: FolderKanban },
  { title: "Subjects", href: "/teacher/subjects", icon: BookOpen },
  { title: "Lessons", href: "/teacher/lessons", icon: NotebookPen },
  {
    title: "Assignments",
    href: "/teacher/assignments",
    icon: ClipboardList,
  },
];

export const studentNav: NavItem[] = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Profile", href: "/student/profile", icon: UserCircle },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: ClipboardList,
  },
  { title: "Grades", href: "/student/grades", icon: BadgeCheck },
];
