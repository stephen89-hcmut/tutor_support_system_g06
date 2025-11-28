# Tutor Support System - Setup Guide

## Project Overview

A React application built with Vite + TypeScript, featuring:
- **Tailwind CSS** for styling with HCMUT Blue color scheme (#0A84D6, #074E91)
- **Shadcn/UI** components
- **Lucide React** icons
- **Role-based navigation** (Student, Tutor, Manager)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Shadcn/UI components
│   └── AppLayout.tsx # Main layout with sidebar
├── contexts/
│   └── RoleContext.tsx # Role-based context
├── lib/
│   └── utils.ts      # Utility functions
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles with Tailwind
```

## Features

### Role-Based Navigation

The sidebar dynamically renders menu items based on the current role:

- **Student**: Dashboard, Meetings, Find Tutors, My Progress, Library, Settings
- **Tutor**: Dashboard, Meetings, My Students, Feedback, Library, Settings
- **Manager**: Dashboard, Meetings, Users, Permissions, Analytics, Library, Settings

### Navigation Logic

The `handleNavigate` function in `App.tsx` includes:
- Explicit handling for 'students' and 'feedback' pages to avoid navigation bugs
- Page name normalization and mapping
- Robust error handling

## Design System

- **Primary Colors**: HCMUT Blue (#0A84D6, #074E91)
- **Layout**: Fixed left sidebar with scrollable main content
- **Icons**: Lucide React

## Changing Roles

To change the current role, modify the initial state in `src/contexts/RoleContext.tsx`:

```typescript
const [role, setRole] = useState<Role>('Student'); // Change to 'Tutor' or 'Manager'
```

