import {
  boolean,
  date,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  department: varchar("department", { length: 128 }),
  position: varchar("position", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── ATS: Job Postings ────────────────────────────────────────────────────────
export const jobPostings = mysqlTable("job_postings", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  department: varchar("department", { length: 128 }),
  location: varchar("location", { length: 128 }),
  description: text("description"),
  status: mysqlEnum("status", ["active", "closed", "draft"]).default("active").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = typeof jobPostings.$inferInsert;

// ─── ATS: Candidates ──────────────────────────────────────────────────────────
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  jobPostingId: int("jobPostingId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  resumeUrl: text("resumeUrl"),
  stage: mysqlEnum("stage", ["yeni", "mulakat", "teklif", "kabul", "red"])
    .default("yeni")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

// ─── Onboarding: Employees ────────────────────────────────────────────────────
export const onboardingEmployees = mysqlTable("onboarding_employees", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }),
  department: varchar("department", { length: 128 }),
  position: varchar("position", { length: 128 }),
  startDate: date("startDate"),
  status: mysqlEnum("status", ["beklemede", "devam_ediyor", "tamamlandi"])
    .default("beklemede")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingEmployee = typeof onboardingEmployees.$inferSelect;
export type InsertOnboardingEmployee = typeof onboardingEmployees.$inferInsert;

// ─── Onboarding: Tasks ────────────────────────────────────────────────────────
export const onboardingTasks = mysqlTable("onboarding_tasks", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  dueDate: date("dueDate"),
  assignedTo: int("assignedTo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type InsertOnboardingTask = typeof onboardingTasks.$inferInsert;

// ─── Leave Management ─────────────────────────────────────────────────────────
export const leaveRequests = mysqlTable("leave_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leaveType: mysqlEnum("leaveType", ["yillik", "hastalik", "mazeret", "ucretsiz"])
    .default("yillik")
    .notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  days: int("days").notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["beklemede", "onaylandi", "reddedildi"])
    .default("beklemede")
    .notNull(),
  reviewedBy: int("reviewedBy"),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;

// ─── Leave Balances ───────────────────────────────────────────────────────────
export const leaveBalances = mysqlTable("leave_balances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  totalDays: int("totalDays").default(20).notNull(),
  usedDays: int("usedDays").default(0).notNull(),
  pendingDays: int("pendingDays").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = typeof leaveBalances.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["izin", "onboarding", "ats", "sistem"]).default("sistem").notNull(),
  read: boolean("read").default(false).notNull(),
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
