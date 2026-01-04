# 🇲🇾 MyPeta - Malaysian Project Management Dashboard

A modern, full-stack web application for managing construction and machinery projects across Malaysia with real-time data synchronization and interactive visualizations.

## ✨ Features

### 📊 Project Management Dashboard
- Interactive Malaysia map showing project distribution by state
- Real-time project statistics and analytics
- Project filtering by state, type, and status
- Beautiful charts and visualizations powered by Recharts
- Responsive design optimized for all devices
- Live database integration with Supabase

### 🔄 Google Sheets Integration
- **Auto-sync** from Google Sheets to database
- Service account authentication for secure access
- Automatic data mapping and validation
- Support for decimal budget values
- Progress tracking with planned vs actual metrics
- See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for setup instructions

### 📥 Excel Import/Export
- Upload Excel files (.xlsx) to bulk import projects
- Export all projects to Excel format
- Automatic field mapping and validation
- Support for large datasets
- Real-time upload progress tracking

### 🗂️ Project Fields
- **Core Information**: Name, Description, Location, Branch
- **Classification**: Type (Construction/Machinery), Status, State
- **Financial**: Budget, Disbursed amount
- **Timeline**: Start date, End date
- **Progress Tracking**: Current progress, Planned progress
- **Management**: Contractor, Officer in charge

### 📈 Advanced Analytics
- Project status breakdown (In Progress, Completed, On Hold)
- Budget distribution by state
- Progress delay tracking and visualization
- Project type distribution charts
- State-wise project filtering

### 🔐 Authentication & Authorization
- Secure user authentication with Clerk
- Admin-only access for project sync and management
- Row-Level Security (RLS) with Supabase
- Service role for admin operations

### 🌐 Multi-page Application
- **Dashboard** (`/`) - Interactive map and quick stats
- **All Projects** (`/projects`) - Searchable, filterable project list
- **Statistics** (`/statistics`) - Detailed analytics and charts
- **Admin Panel** (`/admin`) - Project management and sync controls

### 🎨 Modern UI/UX
- Dark mode / Light mode toggle
- Smooth animations and transitions
- Glass morphism design elements
- Mobile-responsive with bottom navigation
- Sidebar with filters and quick stats

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account
- Clerk account
- Google Service Account (for Sheets sync)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zaidrozali/project-technical-management.git
cd mypeta
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Google Sheets Sync
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

4. Run database migrations:

Execute the SQL migrations in order:
```bash
# 1. Create base schema
psql -h your-host -U postgres -d your-db -f database/schema.sql

# 2. Add new fields (location, branch, disbursed, officer)
psql -h your-host -U postgres -d your-db -f database/migrations/20260104_add_new_fields.sql

# 3. Fix budget type and progress function
psql -h your-host -U postgres -d your-db -f database/migrations/20260104_fix_budget_and_function.sql
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
mypeta/
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── DashboardSidebar/  # Sidebar with filters
│   ├── MalaysiaMap/       # Interactive state map
│   ├── ProjectList/       # Project list panel
│   ├── ProjectStatsCharts/ # Analytics charts
│   └── ...
├── pages/                 # Next.js pages
│   ├── api/              # API routes
│   │   ├── projects/     # Project CRUD operations
│   │   │   ├── index.ts          # List/Create projects
│   │   │   ├── sync-google-sheets.ts  # Google Sheets sync
│   │   │   ├── upload-excel.ts        # Excel upload
│   │   │   └── export-excel.ts        # Excel export
│   │   └── cron/         # Scheduled tasks
│   ├── index.tsx         # Dashboard home
│   ├── projects.tsx      # All projects page
│   ├── statistics.tsx    # Analytics page
│   └── admin.tsx         # Admin panel
├── hooks/                # Custom React hooks
│   └── useProjects.ts    # Project data fetching
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Database client
│   └── projects-db.ts    # Database operations
├── database/             # Database schema & migrations
│   ├── schema.sql        # Base schema
│   └── migrations/       # Database migrations
├── data/                 # Static data
│   └── states.ts         # Malaysian states data
└── public/               # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **File Processing**: xlsx, ExcelJS
- **Google Sheets**: googleapis

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network

## 🎯 Key Pages

- `/` - Dashboard with interactive map and stats
- `/projects` - All projects with search and filters
- `/statistics` - Detailed analytics and charts
- `/admin` - Admin panel for project management and sync

## 🔌 API Endpoints

### Projects API
```
GET  /api/projects              # List all projects
POST /api/projects              # Create new project
PUT  /api/projects              # Update project
DELETE /api/projects            # Delete project
```

### Google Sheets Sync
```
POST /api/projects/sync-google-sheets
Body: {
  spreadsheetId: "1RvYdQhOTkjDT9fMiJHf_9TITjqnbJgAo",
  sheetName: "Sheet1"  // optional
}
```

### Excel Import/Export
```
POST /api/projects/upload-excel  # Upload Excel file
GET  /api/projects/export-excel  # Download Excel file
```

### Cron Jobs
```
GET /api/cron/sync-sheets        # Automated Google Sheets sync
```

## 📊 Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  state_id TEXT NOT NULL,
  location TEXT,
  branch TEXT,
  type TEXT NOT NULL,            -- 'construction' | 'machinery'
  status TEXT NOT NULL,          -- 'planning' | 'in-progress' | 'completed' | 'on-hold'
  start_date DATE NOT NULL,
  end_date DATE,
  budget NUMERIC(15,2) NOT NULL,  -- Supports decimal values
  disbursed NUMERIC(15,2),
  contractor TEXT NOT NULL,
  officer TEXT,
  progress NUMERIC NOT NULL,      -- 0-100
  planned_progress NUMERIC NOT NULL,  -- 0-100
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📚 Documentation

- [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) - Google Sheets integration guide
- [CREATE_GOOGLE_SHEET.md](./CREATE_GOOGLE_SHEET.md) - How to create Google Sheets template
- [NEW_FIELDS_UPDATE.md](./NEW_FIELDS_UPDATE.md) - New fields documentation

## 🔄 Recent Updates (January 2026)

### Google Sheets Integration
- ✅ Auto-sync with service account authentication
- ✅ Automatic data mapping and validation
- ✅ Support for 90+ projects in single sync
- ✅ Error handling and reporting

### Database Improvements
- ✅ Migrated budget from BIGINT to NUMERIC(15,2) for decimal support
- ✅ Added 4 new fields: location, branch, disbursed, officer
- ✅ Fixed calculate_progress_delay function for NUMERIC parameters
- ✅ Progress percentages rounded to 2 decimal places

### Live Data Migration
- ✅ All components now use live database instead of hardcoded data
- ✅ Created useProjects() hook for centralized data fetching
- ✅ DashboardSidebar, MalaysiaMap, ProjectList use live data
- ✅ Fixed field name consistency (stateId → state_id, startDate → start_date)

### Features Added
- ✅ Excel upload and export functionality
- ✅ Service role Supabase client for admin operations
- ✅ Admin authentication checks
- ✅ Real-time UI updates after sync

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Malaysian states data and mapping
- UI components from shadcn/ui
- Icons from Lucide React
- Charts from Recharts
- Database by Supabase
- Authentication by Clerk
- Built with love for Malaysian project management

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

**Repository**: https://github.com/zaidrozali/project-technical-management

---

**Built with ❤️ for Malaysia**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
