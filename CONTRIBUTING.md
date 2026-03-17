# Contributing to RAG Inspector

Thank you for your interest in contributing to RAG Inspector! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database (for backend)

### Development Setup

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/RAGInspector.git
   cd RAGInspector
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Verify your setup**:
   ```bash
   npm run build      # Should complete with zero errors
   npm run lint       # Should pass with no warnings
   npm run type-check # Should pass with no errors
   ```

## How to Contribute

### Reporting Bugs

- Use the [GitHub Issues](https://github.com/artypratham/RAGInspector/issues) page
- Include steps to reproduce, expected behavior, and actual behavior
- Include browser/OS information and screenshots if relevant

### Suggesting Features

- Open an issue with the `enhancement` label
- Describe the use case and why it would be valuable
- If possible, outline a proposed implementation approach

### Submitting Code

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines below

3. **Verify your changes**:
   ```bash
   npm run type-check  # TypeScript type checking
   npm run lint        # ESLint
   npm run build       # Full build
   ```

4. **Commit with a clear message**:
   ```bash
   git commit -m "Add feature: brief description of what and why"
   ```

5. **Push and open a Pull Request** against `main`

## Code Style Guidelines

### TypeScript

- Use strict TypeScript — avoid `any` types where possible
- Define interfaces for component props and API responses
- Use `type` imports for type-only imports

### React

- Functional components only (no class components except ErrorBoundary)
- Use Recoil for shared state, `useState` for local state
- Prefer `useMemo` for expensive computations
- Use lazy loading for route-level components

### CSS / Styling

- Tailwind CSS utility classes only — no custom CSS files
- Follow the existing dark theme with slate/cyan/emerald color palette
- Use responsive prefixes (`md:`, `lg:`) for layout breakpoints

### File Organization

```
src/
├── app/          # App root and routing
├── components/   # Reusable UI components
│   ├── common/   # Shared (Header, Sidebar, etc.)
│   ├── records/  # Record display and annotation
│   ├── metrics/  # Metrics dashboard
│   ├── analysis/ # Error analysis
│   └── diagnostics/ # Pipeline diagnostics
├── hooks/        # Custom React hooks
├── logic/        # Pure business logic (parser, transformer, metrics)
├── pages/        # Route-level page components
├── services/     # API client
├── state/        # Recoil atoms and selectors
├── types/        # TypeScript type definitions
└── utils/        # Utility functions (PDF generation, etc.)
```

### Naming Conventions

- Components: `PascalCase` (e.g., `RecordCard.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAuthInit.ts`)
- Logic/utils: `camelCase` (e.g., `parser.ts`)
- Types: `PascalCase` for interfaces, `camelCase` for files

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Ensure all checks pass (TypeScript, ESLint, build)
- Update documentation if your change affects user-facing behavior

## Code of Conduct

Be respectful, constructive, and inclusive. We're building tools for the community — treat everyone the way you'd want to be treated.

## Questions?

Open a [discussion](https://github.com/artypratham/RAGInspector/issues) or reach out via the issue tracker.
