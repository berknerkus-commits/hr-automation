import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  candidates,
  jobPostings,
  leaveBalances,
  leaveRequests,
  notifications,
  onboardingEmployees,
  onboardingTasks,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    });
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ─── ATS: Job Postings ────────────────────────────────────────────────────────
export async function getJobPostings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
}

export async function getJobPostingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobPostings).where(eq(jobPostings.id, id)).limit(1);
  return result[0];
}

export async function createJobPosting(data: {
  title: string;
  department?: string;
  location?: string;
  description?: string;
  status?: "active" | "closed" | "draft";
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(jobPostings).values(data);
  return result;
}

export async function updateJobPosting(
  id: number,
  data: Partial<{ title: string; department: string; location: string; description: string; status: "active" | "closed" | "draft" }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(jobPostings).set(data).where(eq(jobPostings.id, id));
}

export async function deleteJobPosting(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(candidates).where(eq(candidates.jobPostingId, id));
  await db.delete(jobPostings).where(eq(jobPostings.id, id));
}

// ─── ATS: Candidates ──────────────────────────────────────────────────────────
export async function getCandidatesByJobPosting(jobPostingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(candidates)
    .where(eq(candidates.jobPostingId, jobPostingId))
    .orderBy(desc(candidates.createdAt));
}

export async function getAllCandidates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidates).orderBy(desc(candidates.createdAt));
}

export async function createCandidate(data: {
  jobPostingId: number;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  stage?: "yeni" | "mulakat" | "teklif" | "kabul" | "red";
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(candidates).values(data);
}

export async function updateCandidateStage(
  id: number,
  stage: "yeni" | "mulakat" | "teklif" | "kabul" | "red"
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(candidates).set({ stage }).where(eq(candidates.id, id));
}

export async function updateCandidate(
  id: number,
  data: Partial<{ name: string; email: string; phone: string; notes: string; stage: "yeni" | "mulakat" | "teklif" | "kabul" | "red" }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(candidates).set(data).where(eq(candidates.id, id));
}

export async function deleteCandidate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(candidates).where(eq(candidates.id, id));
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
export async function getOnboardingEmployees() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(onboardingEmployees).orderBy(desc(onboardingEmployees.createdAt));
}

export async function getOnboardingEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(onboardingEmployees)
    .where(eq(onboardingEmployees.id, id))
    .limit(1);
  return result[0];
}

export async function createOnboardingEmployee(data: {
  name: string;
  email?: string;
  department?: string;
  position?: string;
  startDate?: string;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const insertData: any = { ...data };
  if (data.startDate) insertData.startDate = new Date(data.startDate);
  await db.insert(onboardingEmployees).values(insertData);
}

export async function updateOnboardingEmployee(
  id: number,
  data: Partial<{ name: string; email: string; department: string; position: string; startDate: string; status: "beklemede" | "devam_ediyor" | "tamamlandi" }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const updateData: any = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  await db.update(onboardingEmployees).set(updateData).where(eq(onboardingEmployees.id, id));
}

export async function deleteOnboardingEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(onboardingTasks).where(eq(onboardingTasks.employeeId, id));
  await db.delete(onboardingEmployees).where(eq(onboardingEmployees.id, id));
}

export async function getOnboardingTasks(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(onboardingTasks)
    .where(eq(onboardingTasks.employeeId, employeeId))
    .orderBy(onboardingTasks.createdAt);
}

export async function createOnboardingTask(data: {
  employeeId: number;
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const insertData: any = { ...data };
  if (data.dueDate) insertData.dueDate = new Date(data.dueDate);
  await db.insert(onboardingTasks).values(insertData);
  // Update employee status to devam_ediyor
  await db
    .update(onboardingEmployees)
    .set({ status: "devam_ediyor" })
    .where(
      and(
        eq(onboardingEmployees.id, data.employeeId),
        eq(onboardingEmployees.status, "beklemede")
      )
    );
}

export async function toggleOnboardingTask(id: number, completed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(onboardingTasks).set({ completed }).where(eq(onboardingTasks.id, id));
}

export async function deleteOnboardingTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(onboardingTasks).where(eq(onboardingTasks.id, id));
}

// ─── Leave Management ─────────────────────────────────────────────────────────
export async function getLeaveRequests(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (userId) {
    return db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.userId, userId))
      .orderBy(desc(leaveRequests.createdAt));
  }
  return db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
}

export async function getLeaveRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.id, id))
    .limit(1);
  return result[0];
}

export async function createLeaveRequest(data: {
  userId: number;
  leaveType: "yillik" | "hastalik" | "mazeret" | "ucretsiz";
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(leaveRequests).values({
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  } as any);
  // Update pending balance
  await ensureLeaveBalance(data.userId);
  await db
    .update(leaveBalances)
    .set({ pendingDays: sql`pendingDays + ${data.days}` })
    .where(
      and(
        eq(leaveBalances.userId, data.userId),
        eq(leaveBalances.year, new Date().getFullYear())
      )
    );
}

export async function reviewLeaveRequest(
  id: number,
  status: "onaylandi" | "reddedildi",
  reviewedBy: number,
  reviewNote?: string
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const request = await getLeaveRequestById(id);
  if (!request) throw new Error("Leave request not found");

  await db
    .update(leaveRequests)
    .set({ status, reviewedBy, reviewNote: reviewNote ?? null })
    .where(eq(leaveRequests.id, id));

  await ensureLeaveBalance(request.userId);

  if (status === "onaylandi") {
    await db
      .update(leaveBalances)
      .set({
        usedDays: sql`usedDays + ${request.days}`,
        pendingDays: sql`GREATEST(0, pendingDays - ${request.days})`,
      })
      .where(
        and(
          eq(leaveBalances.userId, request.userId),
          eq(leaveBalances.year, new Date().getFullYear())
        )
      );
  } else {
    await db
      .update(leaveBalances)
      .set({
        pendingDays: sql`GREATEST(0, pendingDays - ${request.days})`,
      })
      .where(
        and(
          eq(leaveBalances.userId, request.userId),
          eq(leaveBalances.year, new Date().getFullYear())
        )
      );
  }
}

export async function ensureLeaveBalance(userId: number) {
  const db = await getDb();
  if (!db) return;
  const year = new Date().getFullYear();
  const existing = await db
    .select()
    .from(leaveBalances)
    .where(and(eq(leaveBalances.userId, userId), eq(leaveBalances.year, year)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(leaveBalances).values({ userId, year, totalDays: 20, usedDays: 0, pendingDays: 0 });
  }
}

export async function getLeaveBalance(userId: number) {
  const db = await getDb();
  if (!db) return null;
  await ensureLeaveBalance(userId);
  const year = new Date().getFullYear();
  const result = await db
    .select()
    .from(leaveBalances)
    .where(and(eq(leaveBalances.userId, userId), eq(leaveBalances.year, year)))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllLeaveBalances() {
  const db = await getDb();
  if (!db) return [];
  const year = new Date().getFullYear();
  return db
    .select()
    .from(leaveBalances)
    .where(eq(leaveBalances.year, year));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function createNotification(data: {
  userId: number;
  title: string;
  message: string;
  type: "izin" | "onboarding" | "ats" | "sistem";
  relatedId?: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return result[0]?.count ?? 0;
}

// ─── Recent Activity ────────────────────────────────────────────────────────────
export async function getRecentActivity(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  // Gather recent events from multiple tables
  const [recentLeaves, recentCandidates, recentEmployees] = await Promise.all([
    db.select({
      id: leaveRequests.id,
      type: sql<string>`'izin'`,
      title: sql<string>`CONCAT('İzin talebi: ', leaveType)`,
      description: sql<string>`CONCAT(days, ' günlük izin talebi - ', status)`,
      createdAt: leaveRequests.createdAt,
    }).from(leaveRequests).orderBy(desc(leaveRequests.createdAt)).limit(5),

    db.select({
      id: candidates.id,
      type: sql<string>`'ats'`,
      title: sql<string>`CONCAT('Yeni aday: ', name)`,
      description: sql<string>`CONCAT('Aşama: ', stage)`,
      createdAt: candidates.createdAt,
    }).from(candidates).orderBy(desc(candidates.createdAt)).limit(5),

    db.select({
      id: onboardingEmployees.id,
      type: sql<string>`'onboarding'`,
      title: sql<string>`CONCAT('Onboarding: ', name)`,
      description: sql<string>`CONCAT('Durum: ', status)`,
      createdAt: onboardingEmployees.createdAt,
    }).from(onboardingEmployees).orderBy(desc(onboardingEmployees.createdAt)).limit(5),
  ]);

  const all = [...recentLeaves, ...recentCandidates, ...recentEmployees]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return all;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { openPositions: 0, pendingOnboarding: 0, pendingLeaves: 0, totalCandidates: 0 };

  const [openPos] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(jobPostings)
    .where(eq(jobPostings.status, "active"));

  const [pendingOnb] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(onboardingEmployees)
    .where(eq(onboardingEmployees.status, "devam_ediyor"));

  const [pendingLeave] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leaveRequests)
    .where(eq(leaveRequests.status, "beklemede"));

  const [totalCand] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(candidates);

  return {
    openPositions: openPos?.count ?? 0,
    pendingOnboarding: pendingOnb?.count ?? 0,
    pendingLeaves: pendingLeave?.count ?? 0,
    totalCandidates: totalCand?.count ?? 0,
  };
}
