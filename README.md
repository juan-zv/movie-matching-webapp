# Movie Matching Webapp

A React + TypeScript web application that collects user movie ratings to generate personalized, algorithm-driven recommendations for films they haven't seen, while also supporting pair-based matching that computes joint preference profiles to suggest movies optimized for two users watching together.

## Tech Stack

### Frontend
- **React 19** - UI library with hooks-based architecture
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework

### UI Components
- **shadcn/ui** - Accessible, customizable component library built on:
  - Radix UI primitives
  - Class Variance Authority (CVA) for variant styling
- Components implemented: Alert, Button, Card, Input, Label, Progress

### Backend
- **Supabase** - Backend-as-a-service providing:
  - Authentication (email/password)
  - PostgreSQL database
  - Real-time subscriptions

### Package Management
- **pnpm** - Fast, disk space efficient package manager with workspace support

## Current Implementations

### Authentication System
- **Login Component** (`src/pages/Login.tsx`) - Email/password sign-in form
- **SignUp Component** (`src/pages/SignUp.tsx`) - User registration form
- **AuthContext** (`src/contexts/AuthContext.tsx`) - React context for auth state management
- **Supabase Client** (`src/lib/supabase.ts`) - Configured Supabase connection

### Movie Catalog
- **CSV Parser** (`src/lib/parseCSV.ts`) - Parses TMDB 5000 movies dataset with:
  - Proper handling of quoted fields and nested JSON
  - Extracts: id, title, overview, release_date, vote_average, runtime, genres, tagline
- **MoviesPage** (`src/pages/MoviesPage.tsx`) - Main movies display featuring:
  - Fetches and parses `/tmdb_5000_movies.csv` on mount
  - Responsive grid layout (1/2/3 columns)
  - **Infinite scroll** using Intersection Observer API
  - Loads 12 movies at a time for smooth performance
  - Loading states and error handling

### Movie Rating System
- **MovieCard** (`src/components/MovieCard.tsx`) - Individual movie display with:
  - Title, year, runtime, TMDB rating
  - Tagline and overview (truncated)
  - Genre tags
  - **Interactive 5-star rating** with hover states
- **4-Star Tracking** - Movies rated exactly 4 stars are tracked and displayed in a highlighted section

### App Shell
- **Progress Loader** - Animated progress bar during initial auth loading
- **Navigation** - Header with app title, user email, and sign-out button
- **Responsive Layout** - Max-width container with proper padding

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── progress.tsx
│   └── MovieCard.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── parseCSV.ts
│   ├── supabase.ts
│   └── utils.ts
├── pages/
│   ├── Login.tsx
│   ├── MoviesPage.tsx
│   └── SignUp.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Recommendation Work

*To be implemented*