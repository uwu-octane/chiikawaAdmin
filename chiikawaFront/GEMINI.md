# Project Overview

This is a React + TypeScript project built with Vite. It uses Ant Design and Ant Design Pro for UI components and layout. The project is structured with a clear separation of concerns, with dedicated folders for routing, components, layouts, pages, and stores.

## Main Technologies

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **UI Library:** Ant Design, Ant Design Pro
*   **Routing:** React Router 6
*   **State Management:** React Query
*   **Styling:** UnoCSS

# Building and Running

## Development

To run the project in development mode:

```bash
bun dev
```

## Build

To build the project for production:

```bash
bun build
```

## Lint

To lint the project:

```bash
bun lint
```

To lint and fix issues:
```bash
bun lint:fix
```

## Formatting

To format the code:
```bash
bun format
```

# Development Conventions

*   **Routing:** Routes are defined in `src/router/routes.tsx`. The menu is generated from these routes.
*   **Layouts:** The application uses three layouts: `BasicLayout` for the main application, `UserLayout` for user-related pages, and `BlankLayout` for other pages like 404.
*   **Styling:** The project uses UnoCSS for styling.
*   **State Management:** React Query is used for data fetching and state management.
