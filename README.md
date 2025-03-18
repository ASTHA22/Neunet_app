# Neunet Frontend Application

A modern React-based web application for job posting and candidate management, built with TypeScript and Chakra UI.

## Tech Stack

### Frontend Framework
- React (v18.2.0) - A JavaScript library for building user interfaces
- TypeScript (v5.2.2) - Typed superset of JavaScript
- Vite (v5.1.0) - Next generation frontend tooling

### UI Components
- Chakra UI (v2.8.2) - A simple, modular component library
- Framer Motion (v10.18.0) - A production-ready motion library
- React Icons (v5.0.1) - Popular icon packs
- @iconify/react (v5.2.0) - Icon component library

### Routing & State Management
- React Router DOM (v6.22.1) - Declarative routing for React
- Axios (v1.8.3) - Promise based HTTP client

### Development Tools
- ESLint - TypeScript linting
- TypeScript ESLint Plugin - TypeScript-specific linting rules

## Project Structure

```
neunet_app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   │   ├── CreateJob.tsx
│   │   └── JobListings.tsx
│   ├── services/        # API service layer
│   │   └── api.ts
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Root component
├── public/             # Static assets
├── package.json        # Dependencies and scripts
└── README.md
```

## Features

1. Job Management
   - Create new job postings
   - View and manage job listings
   - Edit job details and requirements

2. Application Handling
   - View candidate applications
   - Track application status
   - Process applications

3. User Interface
   - Modern, responsive design
   - Intuitive navigation
   - Interactive components
   - Loading states and error handling

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Development

The application is built with modern React practices:
- Functional components with hooks
- TypeScript for type safety
- Component-based architecture
- Responsive design with Chakra UI

## API Integration

The frontend communicates with the Neunet AI Services backend through:
- RESTful API endpoints
- Axios for HTTP requests
- TypeScript interfaces for type safety

## Styling

- Uses Chakra UI's component library
- Consistent theming across the application
- Responsive design patterns
- Custom component styling when needed

## Best Practices

- TypeScript for type safety
- ESLint for code quality
- Component reusability
- Proper error handling
- Loading states for better UX
- Responsive design
- Accessibility considerations
