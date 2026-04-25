import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createCandidate,
  createJobPosting,
  createLeaveRequest,
  createNotification,
  createOnboardingEmployee,
  createOnboardingTask,
  deleteCandidate,
  deleteJobPosting,
  deleteOnboardingEmployee,
  deleteOnboardingTask,
  getAllCandidates,
  getAllLeaveBalances,
  getAllUsers,
  getCandidatesByJobPosting,
  getDashboardStats,
  getRecentActivity,
  getJobPostingById,
  getJobPostings,
  getLeaveBalance,
  getLeaveRequests,
  getNotifications,
  getOnboardingEmployeeById,
  getOnboardingEmployees,
  getOnboardingTasks,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  reviewLeaveRequest,
  toggleOnboardingTask,
  updateCandidate,
  updateCandidateStage,
  updateJobPosting,
  updateOnboardingEmployee,
  updateUserRole,
} from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Yönetici yetkisi gerekli" });
  }
  return next({ ctx });
});

// ─── ATS Router ───────────────────────────────────────────────────────────────
const atsRouter = router({
  // Job Postings
  listPostings: protectedProcedure.query(async ({ ctx }) => {
    return getJobPostings();
  }),

  getPosting: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const posting = await getJobPostingById(input.id);
      if (!posting) throw new TRPCError({ code: "NOT_FOUND" });
      return posting;
    }),

  createPosting: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        department: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "closed", "draft"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createJobPosting({ ...input, createdBy: ctx.user.id });
      return { success: true };
    }),

  updatePosting: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        department: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "closed", "draft"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateJobPosting(id, data);
      return { success: true };
    }),

  deletePosting: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteJobPosting(input.id);
      return { success: true };
    }),

  // Candidates
  listCandidates: protectedProcedure
    .input(z.object({ jobPostingId: z.number().optional() }))
    .query(async ({ input }) => {
      if (input.jobPostingId) {
        return getCandidatesByJobPosting(input.jobPostingId);
      }
      return getAllCandidates();
    }),

  createCandidate: adminProcedure
    .input(
      z.object({
        jobPostingId: z.number(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
        stage: z.enum(["yeni", "mulakat", "teklif", "kabul", "red"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createCandidate(input);
      return { success: true };
    }),

  updateCandidateStage: adminProcedure
    .input(
      z.object({
        id: z.number(),
        stage: z.enum(["yeni", "mulakat", "teklif", "kabul", "red"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateCandidateStage(input.id, input.stage);
      return { success: true };
    }),

  updateCandidate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
        stage: z.enum(["yeni", "mulakat", "teklif", "kabul", "red"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCandidate(id, data);
      return { success: true };
    }),

  deleteCandidate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteCandidate(input.id);
      return { success: true };
    }),
});

// ─── Onboarding Router ────────────────────────────────────────────────────────
const onboardingRouter = router({
  listEmployees: protectedProcedure.query(async () => {
    return getOnboardingEmployees();
  }),

  getEmployee: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const emp = await getOnboardingEmployeeById(input.id);
      if (!emp) throw new TRPCError({ code: "NOT_FOUND" });
      return emp;
    }),

  createEmployee: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        startDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createOnboardingEmployee(input);
      return { success: true };
    }),

  updateEmployee: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        startDate: z.string().optional(),
        status: z.enum(["beklemede", "devam_ediyor", "tamamlandi"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateOnboardingEmployee(id, data);
      return { success: true };
    }),

  deleteEmployee: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteOnboardingEmployee(input.id);
      return { success: true };
    }),

  listTasks: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return getOnboardingTasks(input.employeeId);
    }),

  createTask: adminProcedure
    .input(
      z.object({
        employeeId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        assignedTo: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createOnboardingTask(input);
      // Notify assigned user
      if (input.assignedTo) {
        await createNotification({
          userId: input.assignedTo,
          title: "Yeni Onboarding Görevi",
          message: `"${input.title}" görevi size atandı.`,
          type: "onboarding",
        });
      }
      return { success: true };
    }),

  toggleTask: protectedProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      await toggleOnboardingTask(input.id, input.completed);
      return { success: true };
    }),

  deleteTask: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteOnboardingTask(input.id);
      return { success: true };
    }),
});

// ─── Leave Router ─────────────────────────────────────────────────────────────
const leaveRouter = router({
  listRequests: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") {
      return getLeaveRequests();
    }
    return getLeaveRequests(ctx.user.id);
  }),

  myBalance: protectedProcedure.query(async ({ ctx }) => {
    return getLeaveBalance(ctx.user.id);
  }),

  allBalances: adminProcedure.query(async () => {
    return getAllLeaveBalances();
  }),

  createRequest: protectedProcedure
    .input(
      z.object({
        leaveType: z.enum(["yillik", "hastalik", "mazeret", "ucretsiz"]),
        startDate: z.string(),
        endDate: z.string(),
        days: z.number().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createLeaveRequest({ ...input, userId: ctx.user.id });
      // Notify admins - we'll create a system notification for the requesting user
      await createNotification({
        userId: ctx.user.id,
        title: "İzin Talebiniz Alındı",
        message: `${input.days} günlük izin talebiniz yöneticiye iletildi.`,
        type: "izin",
      });
      return { success: true };
    }),

  reviewRequest: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["onaylandi", "reddedildi"]),
        reviewNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await reviewLeaveRequest(
        input.id,
        input.status,
        ctx.user.id,
        input.reviewNote
      );
      // Get the leave request to notify the user
      const lr = await import("./db").then((m) => m.getLeaveRequestById(input.id));
      if (lr) {
        const statusText = input.status === "onaylandi" ? "onaylandı" : "reddedildi";
        await createNotification({
          userId: lr.userId,
          title: `İzin Talebiniz ${statusText === "onaylandı" ? "Onaylandı" : "Reddedildi"}`,
          message: `${lr.days} günlük izin talebiniz ${statusText}.${input.reviewNote ? ` Not: ${input.reviewNote}` : ""}`,
          type: "izin",
          relatedId: lr.id,
        });
      }
      return { success: true };
    }),
});

// ─── Notifications Router ─────────────────────────────────────────────────────
const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getNotifications(ctx.user.id);
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return getUnreadNotificationCount(ctx.user.id);
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await markNotificationRead(input.id, ctx.user.id);
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsRead(ctx.user.id);
    return { success: true };
  }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────
const adminRouter = router({
  listUsers: adminProcedure.query(async () => {
    return getAllUsers();
  }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),
});
// ─── Dashboard Router ──────────────────────────────────────────────────────────
const dashboardRouter = router({
  stats: protectedProcedure.query(async () => {
    return getDashboardStats();
  }),
  recentActivity: adminProcedure.query(async () => {
    return getRecentActivity(10);
  }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ats: atsRouter,
  onboarding: onboardingRouter,
  leave: leaveRouter,
  notifications: notificationsRouter,
  admin: adminRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
