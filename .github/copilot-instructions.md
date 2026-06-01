# Next.js Library Management Frontend Project

## Project Overview
This is a Next.js frontend project for SE313 Library Management system, built with TypeScript, ESLint, and Tailwind CSS using the App Router pattern.

## Technology Stack
- **Framework**: Next.js 16+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint with Next.js configuration
- **Package Manager**: npm
- **Node Version**: 18+ recommended

## Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable React components
└── lib/               # Utility functions and helpers
public/               # Static assets
```

## Development Guidelines

### Coding Standards
- Use TypeScript for type safety - avoid `any` types where possible
- Follow ESLint rules configured in eslint.config.mjs
- Use Tailwind CSS utility classes for styling
- Place reusable components in `/src/components`
- Use App Router for routing (Next.js 13+ pattern)
- Use absolute imports with `@/` alias

### File Naming
- Components: PascalCase (e.g., `UserCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Styles: match component name with `.module.css` extension

## Available Scripts
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint checks
- `npm run lint -- --fix` - Fix ESLint issues automatically

## Installation & Setup
1. Dependencies are already installed via npm
2. Run `npm run dev` to start the development server
3. Open http://localhost:3000 in your browser

## Building for Production
1. Run `npm run build` to create optimized production build
2. Run `npm start` to run the production server

## Troubleshooting
- Clear `.next` cache: `rm -r .next` (or `Remove-Item -Recurse .next` on Windows)
- Reinstall dependencies: `rm -r node_modules package-lock.json && npm install`
- Reset TypeScript: `npm run build` regenerates `next-env.d.ts`

## Git Configuration
- Repository initialized automatically
- Use conventional commits: feat:, fix:, docs:, style:, refactor:, test:, chore:
