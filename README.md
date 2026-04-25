# HR Automation System

A modern, full-stack HR platform that centralizes recruitment, onboarding, and leave management into a single operational hub.

🔗 **Live Demo:** https://hrautomate-3a4rraur.manus.space

---

## Overview

HR Automation System is designed to eliminate the fragmented, manual workflows that slow down HR teams. Instead of juggling spreadsheets and email threads, everything from candidate pipelines to leave approvals happens in one place.

---

## Features

### Dashboard
Real-time overview of open positions, total candidates, active onboarding processes, and pending leave requests.

### Applicant Tracking System (ATS)
Kanban-based recruitment pipeline with five stages: Application, Interview, Offer, Hired, and Rejected. Supports multiple concurrent job postings with independent candidate pipelines.

### Onboarding Management
Structured onboarding workflows with auto-generated task checklists, progress tracking, and status visibility across all new hires simultaneously.

### Leave Management
End-to-end leave request lifecycle — submission, approval, rejection, and balance tracking. Includes a calendar view for team-wide visibility.

### Role-Based Access Control
Two-tier permission system. Admins have full access across all modules. Employees are scoped to their own leave requests and balance data.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite |
| UI | shadcn/ui, Tailwind CSS |
| Backend | Node.js, tRPC |
| Database | SQLite, Drizzle ORM |
| Auth | OAuth 2.0 (Google, Microsoft, Apple, Facebook) |
| Testing | Vitest |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
git clone https://github.com/berknerkus-commits/hr-automation.git
cd hr-automation
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

### Running Tests

```bash
pnpm test
```

---

## Project Structure

```
hr-automation/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # ATS, Dashboard, Leave, Onboarding
│       ├── components/     # Shared UI components
│       └── lib/            # tRPC client, utilities
├── server/                 # Node.js backend
│   ├── _core/              # Auth, tRPC, database
│   ├── routers.ts          # API routes
│   └── hr.test.ts          # Unit tests
├── drizzle/                # Schema & migrations
└── shared/                 # Shared types
```

---

## Roadmap

- [ ] Public-facing job application form
- [ ] Email notifications for approvals
- [ ] PDF / Excel report exports
- [ ] Mobile optimization

---

## License

MIT
