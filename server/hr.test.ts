import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB module ───────────────────────────────────────────────────────────
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    // ATS
    getJobPostings: vi.fn().mockResolvedValue([
      { id: 1, title: "Frontend Dev", department: "Eng", location: "Remote", status: "active", createdBy: 1, createdAt: new Date(), updatedAt: new Date() },
    ]),
    getJobPostingById: vi.fn().mockResolvedValue({ id: 1, title: "Frontend Dev", status: "active" }),
    createJobPosting: vi.fn().mockResolvedValue(undefined),
    updateJobPosting: vi.fn().mockResolvedValue(undefined),
    deleteJobPosting: vi.fn().mockResolvedValue(undefined),
    getAllCandidates: vi.fn().mockResolvedValue([]),
    getCandidatesByJobPosting: vi.fn().mockResolvedValue([
      { id: 1, jobPostingId: 1, name: "Ahmet Yılmaz", email: "ahmet@test.com", stage: "yeni", createdAt: new Date() },
    ]),
    createCandidate: vi.fn().mockResolvedValue(undefined),
    updateCandidateStage: vi.fn().mockResolvedValue(undefined),
    updateCandidate: vi.fn().mockResolvedValue(undefined),
    deleteCandidate: vi.fn().mockResolvedValue(undefined),
    // Onboarding
    getOnboardingEmployees: vi.fn().mockResolvedValue([
      { id: 1, name: "Ayşe Kaya", status: "devam_ediyor", createdAt: new Date() },
    ]),
    getOnboardingEmployeeById: vi.fn().mockResolvedValue({ id: 1, name: "Ayşe Kaya", status: "devam_ediyor" }),
    createOnboardingEmployee: vi.fn().mockResolvedValue(undefined),
    updateOnboardingEmployee: vi.fn().mockResolvedValue(undefined),
    deleteOnboardingEmployee: vi.fn().mockResolvedValue(undefined),
    getOnboardingTasks: vi.fn().mockResolvedValue([
      { id: 1, employeeId: 1, title: "Bilgisayar kurulumu", completed: false, createdAt: new Date() },
    ]),
    createOnboardingTask: vi.fn().mockResolvedValue(undefined),
    toggleOnboardingTask: vi.fn().mockResolvedValue(undefined),
    deleteOnboardingTask: vi.fn().mockResolvedValue(undefined),
    // Leave
    getLeaveRequests: vi.fn().mockResolvedValue([
      { id: 1, userId: 2, leaveType: "yillik", startDate: new Date(), endDate: new Date(), days: 3, status: "beklemede", createdAt: new Date() },
    ]),
    getLeaveRequestById: vi.fn().mockResolvedValue({ id: 1, userId: 2, days: 3, status: "beklemede" }),
    getLeaveBalance: vi.fn().mockResolvedValue({ id: 1, userId: 2, totalDays: 20, usedDays: 5, pendingDays: 3 }),
    getAllLeaveBalances: vi.fn().mockResolvedValue([]),
    createLeaveRequest: vi.fn().mockResolvedValue(undefined),
    reviewLeaveRequest: vi.fn().mockResolvedValue(undefined),
    // Notifications
    getNotifications: vi.fn().mockResolvedValue([]),
    getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
    markNotificationRead: vi.fn().mockResolvedValue(undefined),
    markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
    createNotification: vi.fn().mockResolvedValue(undefined),
    // Admin
    getAllUsers: vi.fn().mockResolvedValue([
      { id: 1, openId: "admin-1", name: "Admin", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      { id: 2, openId: "user-2", name: "User", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    ]),
    updateUserRole: vi.fn().mockResolvedValue(undefined),
    // Dashboard
    getDashboardStats: vi.fn().mockResolvedValue({ openPositions: 2, totalCandidates: 5, pendingOnboarding: 1, pendingLeaves: 3 }),
  };
});

// ─── Context helpers ──────────────────────────────────────────────────────────
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1, openId: "admin-user", email: "admin@test.com", name: "Admin User",
    loginMethod: "manus", role: "admin",
    createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(id = 2): TrpcContext {
  const user: AuthenticatedUser = {
    id, openId: `user-${id}`, email: `user${id}@test.com`, name: `Test User ${id}`,
    loginMethod: "manus", role: "user",
    createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const ctx: TrpcContext = {
      ...createAdminContext(),
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("auth.me", () => {
  it("returns current user for authenticated session", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const me = await caller.auth.me();
    expect(me?.role).toBe("admin");
  });

  it("returns null for unauthenticated session", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const me = await appRouter.createCaller(ctx).auth.me();
    expect(me).toBeNull();
  });
});

// ─── ATS Tests ────────────────────────────────────────────────────────────────
describe("ats.listPostings", () => {
  it("returns postings for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const postings = await caller.ats.listPostings();
    expect(Array.isArray(postings)).toBe(true);
    expect(postings.length).toBeGreaterThan(0);
  });

  it("returns postings for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const postings = await caller.ats.listPostings();
    expect(Array.isArray(postings)).toBe(true);
  });
});

describe("ats.createPosting - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.ats.createPosting({ title: "Test Position" })).rejects.toThrow();
  });

  it("allows admin to create posting", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.ats.createPosting({ title: "New Position", department: "Engineering" });
    expect(result.success).toBe(true);
  });
});

describe("ats.updatePosting - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.ats.updatePosting({ id: 1, title: "Updated" })).rejects.toThrow();
  });

  it("allows admin to update posting", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.ats.updatePosting({ id: 1, status: "closed" });
    expect(result.success).toBe(true);
  });
});

describe("ats.deletePosting - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.ats.deletePosting({ id: 1 })).rejects.toThrow();
  });

  it("allows admin to delete posting", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.ats.deletePosting({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("ats.listCandidates", () => {
  it("returns candidates for a job posting", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const candidates = await caller.ats.listCandidates({ jobPostingId: 1 });
    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates[0]?.name).toBe("Ahmet Yılmaz");
  });
});

describe("ats.createCandidate - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.ats.createCandidate({ jobPostingId: 1, name: "Test" })).rejects.toThrow();
  });

  it("allows admin to create candidate", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.ats.createCandidate({ jobPostingId: 1, name: "Mehmet Demir" });
    expect(result.success).toBe(true);
  });
});

describe("ats.updateCandidateStage - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.ats.updateCandidateStage({ id: 1, stage: "mulakat" })).rejects.toThrow();
  });

  it("allows admin to update stage", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.ats.updateCandidateStage({ id: 1, stage: "mulakat" });
    expect(result.success).toBe(true);
  });
});

describe("ats.deleteCandidate - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.ats.deleteCandidate({ id: 1 })).rejects.toThrow();
  });

  it("allows admin to delete candidate", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.ats.deleteCandidate({ id: 1 });
    expect(result.success).toBe(true);
  });
});

// ─── Onboarding Tests ─────────────────────────────────────────────────────────
describe("onboarding.listEmployees", () => {
  it("returns employees for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const employees = await caller.onboarding.listEmployees();
    expect(Array.isArray(employees)).toBe(true);
    expect(employees[0]?.name).toBe("Ayşe Kaya");
  });
});

describe("onboarding.createEmployee - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.onboarding.createEmployee({ name: "Test Employee" })).rejects.toThrow();
  });

  it("allows admin to create employee", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.onboarding.createEmployee({ name: "Zeynep Arslan", department: "HR" });
    expect(result.success).toBe(true);
  });
});

describe("onboarding.updateEmployee - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.onboarding.updateEmployee({ id: 1, status: "tamamlandi" })).rejects.toThrow();
  });

  it("allows admin to update employee status", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.onboarding.updateEmployee({ id: 1, status: "tamamlandi" });
    expect(result.success).toBe(true);
  });
});

describe("onboarding.listTasks", () => {
  it("returns tasks for an employee", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const tasks = await caller.onboarding.listTasks({ employeeId: 1 });
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks[0]?.title).toBe("Bilgisayar kurulumu");
  });
});

describe("onboarding.createTask - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.onboarding.createTask({ employeeId: 1, title: "Test Task" })).rejects.toThrow();
  });

  it("allows admin to create task", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.onboarding.createTask({ employeeId: 1, title: "E-posta kurulumu" });
    expect(result.success).toBe(true);
  });
});

describe("onboarding.toggleTask", () => {
  it("allows any authenticated user to toggle task", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.onboarding.toggleTask({ id: 1, completed: true });
    expect(result.success).toBe(true);
  });
});

describe("onboarding.deleteTask - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.onboarding.deleteTask({ id: 1 })).rejects.toThrow();
  });

  it("allows admin to delete task", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.onboarding.deleteTask({ id: 1 });
    expect(result.success).toBe(true);
  });
});

// ─── Leave Tests ──────────────────────────────────────────────────────────────
describe("leave.listRequests", () => {
  it("returns all requests for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const requests = await caller.leave.listRequests();
    expect(Array.isArray(requests)).toBe(true);
  });

  it("returns only own requests for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext(2));
    const requests = await caller.leave.listRequests();
    expect(Array.isArray(requests)).toBe(true);
  });
});

describe("leave.myBalance", () => {
  it("returns balance for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext(2));
    const balance = await caller.leave.myBalance();
    expect(balance).toBeDefined();
    expect(balance?.totalDays).toBe(20);
    expect(balance?.usedDays).toBe(5);
  });
});

describe("leave.createRequest - validation", () => {
  it("rejects request with 0 days", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.leave.createRequest({ leaveType: "yillik", startDate: "2026-01-01", endDate: "2026-01-01", days: 0 })
    ).rejects.toThrow();
  });

  it("allows valid leave request creation", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.leave.createRequest({
      leaveType: "yillik", startDate: "2026-05-01", endDate: "2026-05-05", days: 3,
    });
    expect(result.success).toBe(true);
  });
});

describe("leave.reviewRequest - RBAC", () => {
  it("throws FORBIDDEN for regular user trying to review", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.leave.reviewRequest({ id: 1, status: "onaylandi" })).rejects.toThrow();
  });

  it("allows admin to approve request", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.leave.reviewRequest({ id: 1, status: "onaylandi" });
    expect(result.success).toBe(true);
  });

  it("allows admin to reject request with note", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.leave.reviewRequest({ id: 1, status: "reddedildi", reviewNote: "Yoğun dönem" });
    expect(result.success).toBe(true);
  });
});

describe("leave.allBalances - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.leave.allBalances()).rejects.toThrow();
  });

  it("allows admin to view all balances", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const balances = await caller.leave.allBalances();
    expect(Array.isArray(balances)).toBe(true);
  });
});

// ─── Notifications Tests ──────────────────────────────────────────────────────
describe("notifications", () => {
  it("returns notifications for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const notifs = await caller.notifications.list();
    expect(Array.isArray(notifs)).toBe(true);
  });

  it("returns unread count", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const count = await caller.notifications.unreadCount();
    expect(typeof count).toBe("number");
  });

  it("marks notification as read", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.notifications.markRead({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("marks all notifications as read", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.notifications.markAllRead();
    expect(result.success).toBe(true);
  });
});

// ─── Admin Tests ──────────────────────────────────────────────────────────────
describe("admin.listUsers - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.listUsers()).rejects.toThrow();
  });

  it("allows admin to list users", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const users = await caller.admin.listUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(2);
  });
});

describe("admin.updateUserRole - RBAC", () => {
  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.updateUserRole({ userId: 2, role: "admin" })).rejects.toThrow();
  });

  it("allows admin to update user role", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.updateUserRole({ userId: 2, role: "admin" });
    expect(result.success).toBe(true);
  });
});

// ─── Dashboard Tests ──────────────────────────────────────────────────────────
describe("dashboard.stats", () => {
  it("returns stats for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const stats = await caller.dashboard.stats();
    expect(stats.openPositions).toBe(2);
    expect(stats.totalCandidates).toBe(5);
    expect(stats.pendingOnboarding).toBe(1);
    expect(stats.pendingLeaves).toBe(3);
  });
});
