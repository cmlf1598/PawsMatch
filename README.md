# PawsMatch

A web app that shows a dog's picture and lets you **Like** it (to adopt) or **Pass**.

## Tech stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| UI library | [React](https://react.dev/) | 19 | Function components and hooks |
| State management | [Zustand](https://zustand.docs.pmnd.rs/) | 5.x | Global stores, e.g. liked and passed dogs |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS, loaded through `@tailwindcss/vite` |
| Language | [TypeScript](https://www.typescriptlang.org/) | 7.0 | Type safety, checked with `tsc -b` during the build |
| Build tool / dev server | [Vite](https://vite.dev/) | 8.x | Fast dev server with hot module replacement, plus production builds |
| Unit testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [jest-dom](https://github.com/testing-library/jest-dom) + jsdom | 5.x / 16.x | Tests for components and stores in a simulated DOM |
| Linting | [Oxlint](https://oxc.rs/docs/guide/usage/linter) | 1.x | Fast code-quality checks, including the React hooks rules |

## Project structure

The root component is the default export of `src/App.tsx`.

```text
src/
├── App.tsx               # Root component (default export)
├── main.tsx              # App bootstrap: renders <App /> and loads CSS
├── index.css             # Tailwind entry point (@import 'tailwindcss')
├── setupTests.ts         # Vitest setup: jest-dom matchers and cleanup after each test
├── components/           # UI components
│   └── PetCard.tsx       # Pet profile card: image, bio, and Like/Pass buttons
├── hooks/                # Custom hooks
│   └── usePetDeck.ts     # usePetDeck(): current pet, loading/error state, like() and pass()
├── services/             # API and data fetching
│   └── petService.ts     # getPets(): loads the pet profiles (async, so it can later call a real API)
├── types/                # TypeScript definitions in pet.ts
│   └── pet.ts            # Pet interface (shape of each profile in pets.json)
├── data/                 # Mock data in mockData.ts and pets.json
│   ├── mockData.ts       # Typed mock data (exports mockPets)
│   └── pets.json         # 50 dog profiles: id, name, 3-line adoption bio (Spanish) and Dog CEO image URL
└── stores/
    └── matchStore.ts     # Zustand store: ids of liked and passed pets
```

Tests (`*.test.ts` / `*.test.tsx`) live next to the file they test. Outside `src/`, [scripts/generate-pets.mjs](scripts/generate-pets.mjs) is a standalone Node script that regenerates `pets.json`; it is not part of the app.

## Getting started

```sh
npm install
npm run dev
```

The dev server prints the local URL, which is usually http://localhost:5173.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Type-checks the code and builds for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm test` | Runs the unit tests with Vitest (watch mode); use `npx vitest run` for a single run |
| `npm run lint` | Runs Oxlint |
| `npm run generate:pets` | Regenerates `src/data/pets.json` from `scripts/generate-pets.mjs`, fetching a new Dog CEO image for every profile (overwrites the current images) |

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) with the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension.
