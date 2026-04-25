# HR Automation System 🚀

A modern, full-stack HR automation platform built to streamline core human resources operations — from candidate tracking to leave management.

**Live Demo:** https://hrautomate-3a4rraur.manus.space

---

## Features

### 📊 Dashboard
Central command center with real-time metrics — open positions, total candidates, active onboarding processes, and pending leave requests at a glance.

### 🎯 Applicant Tracking System (ATS)
- Create and manage job postings
- Kanban pipeline with 5 stages: **Application → Interview → Offer → Hired → Rejected**
- Drag-and-drop candidate management
- Multi-position tracking

### 👤 Onboarding Management
- New employee registration and tracking
- Auto-generated task checklists per employee
- Progress tracking with completion percentages
- Status pipeline: Pending → In Progress → Completed

### 🏖️ Leave Management
- Leave request submission and approval workflow
- Balance tracking (annual, sick, unpaid, emergency)
- Calendar view for team visibility
- Admin approval/rejection with notifications

### 🔐 Role-Based Access Control
| Feature | Admin | Employee |
|---------|-------|----------|
| All modules | ✅ | ❌ |
| User management | ✅ | ❌ |
| Leave approval | ✅ | ❌ |
| Own leave requests | ✅ | ✅ |
| Own balance view | ✅ | ✅ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI Components | shadcn/ui + Tailwind CSS |
| Backend | Node.js + tRPC |
| Database | SQLite + Drizzle ORM |
| Auth | OAuth (Google, Microsoft, Apple, Facebook) |
| Testing | Vitest (49 unit tests) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/berknerkus-commits/hr-automation.git
cd hr-automation

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

App runs at `http://localhost:3000`

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
│   ├── _core/              # Auth, tRPC setup, DB connection
│   ├── routers.ts          # API route definitions
│   └── hr.test.ts          # Unit tests (49 tests)
├── drizzle/                # Database schema & migrations
└── shared/                 # Shared types between client/server
```

---

## Roadmap

- [ ] Fix remaining 5 failing unit tests
- [ ] Demo seed data (100+ employees, candidates, leave requests)
- [ ] Email notifications for leave approvals
- [ ] Public job application form (careers page)
- [ ] Export reports (PDF/Excel)
- [ ] Mobile responsive improvements

---

## Screenshots

| Dashboard | ATS Kanban | Leave Management |
|-----------|-----------|-----------------|
| Real-time metrics | 5-stage pipeline | Balance tracking |

---

## License

MIT

---

*Built with [Manus](https://manus.im)*
