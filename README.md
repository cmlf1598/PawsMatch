# PawsMatch

A mobile-first web app that shows dogs up for adoption one card at a time. Swipe right (or tap **Adoptar**) to adopt, or swipe left (or tap **Pasar**) to skip. Adopting opens a details screen with the shelter's contact info, location and visiting hours, where you can schedule a visit.

The UI is in Spanish (Guatemala, `es-GT`); the code and docs are in English.

## Tech stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| UI library | [React](https://react.dev/) | 19 | Function components and hooks |
| State management | [Zustand](https://zustand.docs.pmnd.rs/) | 5.x | Global stores, e.g. liked and passed dogs |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS, loaded through `@tailwindcss/vite` |
| Animation | [Framer Motion](https://motion.dev/) | 14.x | Swipe gestures, card fly-out, stack and screen transitions, bottom sheet |
| Icons | [Lucide React](https://lucide.dev/) | 1.x | Tree-shakable SVG icons |
| Language | [TypeScript](https://www.typescriptlang.org/) | 7.0 | Type safety, checked with `tsc -b` during the build |
| Build tool / dev server | [Vite](https://vite.dev/) | 8.x | Fast dev server with hot module replacement, plus production builds |
| Unit testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [jest-dom](https://github.com/testing-library/jest-dom) + jsdom | 5.x / 16.x | Tests for components, hooks, services and stores in a simulated DOM |
| Linting | [Oxlint](https://oxc.rs/docs/guide/usage/linter) | 1.x | Fast code-quality checks, including the React hooks rules |

## Project structure

The root component is the default export of `src/App.tsx`.

```text
src/
├── App.tsx                    # Root component: app shell and navigation between the deck and the adoption screen
├── main.tsx                   # App bootstrap: renders <App /> in StrictMode and loads CSS
├── index.css                  # Tailwind entry point plus base styles (dark color scheme, no overscroll bounce)
├── setupTests.ts              # Vitest setup: jest-dom matchers, cleanup, instant framer-motion animations
├── components/                # UI components
│   ├── AppBackground.tsx      # Blurred warm light blobs behind the glass surfaces
│   ├── DeckScreen.tsx         # Main screen: header, swipeable card stack, loading/error/empty states
│   ├── PetCard.tsx            # Glassmorphism pet card: photo, bio, swipe gestures, Adoptar/Pasar actions
│   ├── AdoptionDetails.tsx    # Adoption screen: shelter, location, contact, visiting hours, Agendar visita / Seguir explorando
│   └── ScheduleVisitSheet.tsx # Bottom sheet to pick a visit day and time
├── hooks/                     # Custom hooks
│   ├── useLivePet.ts          # useLivePet(): pre-fetch stack with live Dog API images, like/pass, reload
│   └── usePetDeck.ts          # usePetDeck(): simpler deck over getPets() (not used by the UI)
├── services/                  # API and data access
│   ├── petProvider.ts         # The Dog API integration: fetches a live image of each pet's breed and merges it with the local profile
│   ├── petImageCache.ts       # Remembers each pet's live photo (localStorage) so it never changes
│   ├── petService.ts          # getPets(): loads the pet profiles
│   └── shelterService.ts      # Shelter for each pet, Google Maps link, available visit slots
├── types/                     # TypeScript definitions
│   ├── pet.ts                 # Pet interface (shape of each profile in pets.json)
│   └── shelter.ts             # Shelter, VisitingHours, VisitDay and ScheduledVisit
├── data/                      # Local data
│   ├── mockData.ts            # Typed pet profiles (exports mockPets)
│   ├── pets.json              # 50 dog profiles: id, name, Dog CEO breed, 3-line adoption bio (Spanish) and fallback image URL
│   └── shelters.ts            # Fictional Guatemalan shelters (see "Data sources")
├── utils/
│   └── format.ts              # es-GT date and time formatting (Intl.DateTimeFormat)
└── stores/
    └── matchStore.ts          # Zustand store: ids of liked and passed pets
```

Tests (`*.test.ts` / `*.test.tsx`) live next to the file they test. Outside `src/`, [scripts/generate-pets.mjs](scripts/generate-pets.mjs) is a standalone Node script that regenerates `pets.json`; it is not part of the app.

### Layering

Components only render and handle gestures. Data flows one way through the layers:

```text
types → data → services → hooks / stores → components
```

New UI follows this split: anything that fetches or derives data goes in a service (no React), stateful logic goes in a hook, and components stay presentational.

## User flow

1. **Deck** (`DeckScreen`): the top card shows the dog's photo, name and bio. Swipe or use the buttons.
2. **Pasar**: the card flies off to the left and the next dog steps up.
3. **Adoptar**: the card flies off to the right, the dog is saved as liked, and the **adoption screen** slides in from the right.
4. **Adoption screen** (`AdoptionDetails`): shows the shelter's name, address (with a **Cómo llegar** link to Google Maps), phone and email (tap to call or write), and visiting hours.
   - **Agendar visita** opens a bottom sheet with the shelter's open days for the next week and one-hour slots inside its visiting hours. Confirming shows a **¡Visita agendada!** summary.
   - **Seguir explorando** (or the back arrow) slides the screen away and returns to the deck.
5. When every dog has been reviewed, the deck shows a summary with **Empezar de nuevo**.

The adoption screen is rendered as an overlay on top of the deck rather than replacing it, so the deck's pre-fetched stack survives the round trip. While it is open, the deck is marked `inert`, so it can't be focused or clicked.

## Card stack architecture: Pre-fetch Stack (Approach 2)

PawsMatch uses a **Pre-fetch Stack** pattern with a bounded buffer of 3 upcoming pets:

* **Zero-latency transitions**: When a user likes or passes, the top card pops off and the next card (`stack[1]`) immediately steps up to the active slot with 0ms network latency.
* **Image preloading**: Background jobs warm the browser cache via `preloadImage()` as soon as Dog API image URLs are resolved, preventing image pop-in or blank cards.
* **Background replenishment**: As cards are decided, the hook automatically fetches the next candidate profile to maintain 3 buffered dogs in memory until the deck is completed.
* **Visual card stacking**: The next card peeks from behind the active card (scaled down and dimmed). Cards are keyed by pet id, so when the top card leaves, the same element animates forward into the active slot.

### StrictMode-safe initialization

`main.tsx` renders the app in `<StrictMode>`, which runs every effect twice on mount in development. Effects that perform one-time initialization use a `useRef` guard so the work happens once:

* `useLivePet`: the initial buffer load runs once per load key (`reloadKey` + `initialPetId`). Because the guarded second run never happens, the first run can't be cancelled from the effect cleanup. A request-id ref drops results only when a newer load (a reload) has started.
* `usePetDeck`: loads `getPets()` once.
* `AdoptionDetails` / `ScheduleVisitSheet`: move focus into the new screen or dialog once.

`useLivePet` also reads liked/passed ids from the store at load time (`useMatchStore.getState()`) instead of listing them as effect dependencies, so liking or passing doesn't re-run the initial load and replace the stack.

Tests render the hooks inside `StrictMode` and assert the number of fetches.

## Swipe gestures and animations

All motion uses Framer Motion:

* **Swipe** (`PetCard`): the top card drags horizontally and rotates with the drag. **ADOPTAR** / **PASAR** stamps fade in as it moves. Releasing past 110px, or flicking faster than 600px/s, decides; otherwise the card springs back.
* **Fly-out**: buttons and swipes share one path. The card animates off-screen first, then reports the decision, so the stack never jumps mid-animation. Repeated taps during the fly-out are ignored. On Android, a short vibration confirms the decision.
* **Screen transitions**: the adoption screen slides in and out horizontally, like a native push navigation.
* **Bottom sheet**: slides up, and can be dismissed by dragging down, tapping the backdrop or pressing Escape.
* **Reduced motion**: `<MotionConfig reducedMotion="user">` respects the OS "reduce motion" setting.

## Mobile-first, native feel

* Full-height layout with `h-dvh` (no jump when mobile browser bars show or hide), and safe-area insets (`viewport-fit=cover` + `env(safe-area-inset-*)`) for notched phones.
* Dark theme with glassmorphism surfaces (`backdrop-blur`, translucent white fills, hairline borders) over warm blurred light blobs.
* Large touch targets (44–56px), press feedback on buttons, no tap highlight, no overscroll bounce, no text selection or image ghost-dragging on cards.
* `theme-color` and home-screen web-app meta tags in `index.html`.
* Layout is capped at `max-w-md` and centered on larger screens.

## Localization (es-GT)

* All UI text is Spanish as spoken in Guatemala; `<html lang="es-GT">`.
* Dates and times use `Intl.DateTimeFormat('es-GT')` in [`src/utils/format.ts`](src/utils/format.ts) (for example "jueves, 22 de octubre" and "9:00 a. m.").
* Pet bios avoid Mexican regionalisms: *apartamento* instead of *departamento* (a state-level region in Guatemala).

## Data sources & The Dog API integration

1. **Local profiles as Source of Truth**: [`src/data/pets.json`](src/data/pets.json) defines each dog's `id`, `name`, `breed` (a Dog CEO breed path such as `labrador`, `retriever/golden` or `mix`) and 3-line Spanish `bio`.
2. **Live Image Provider**: [`src/services/petProvider.ts`](src/services/petProvider.ts) calls [The Dog API](https://dog.ceo/dog-api/) for the pet's own breed (`https://dog.ceo/api/breed/{breed}/images/random`), extracting the image URL at `$.message` and merging it into the [`Pet`](src/types/pet.ts) contract, so the photo always matches the breed in the bio.
3. **One dog, one photo**: each pet's live image is fetched **once** and remembered by [`src/services/petImageCache.ts`](src/services/petImageCache.ts) in `localStorage` (key `pawsmatch:pet-images`). Later loads, reloads and visits reuse it, so a dog never changes appearance. There is intentionally no "new photo" button: the API returns photos of *different* dogs of the breed, which would make the profile look like another animal. If a new photo is already shown for another pet (several dogs share the `mix` breed), the provider fetches again, up to 3 attempts. If storage is unavailable (private mode), photos still stay stable for the session. To get new photos, clear the site data or remove that key.
4. **Resilient Fallback**: If the network or Dog API is unavailable, `petProvider` automatically falls back to the bundled image in `pets.json` (picked for the same breed), ensuring the UI never displays broken content. The fallback isn't remembered, so a later visit can still pick a live photo.
5. **Shelters**: [`src/data/shelters.ts`](src/data/shelters.ts) holds four **fictional** shelters in Guatemala City, Antigua Guatemala, Quetzaltenango and Mixco. Phone numbers use the unassigned `+502 0` prefix and emails use the reserved `.example` domain, so they can't reach anyone real. `getShelterForPet()` assigns each pet a shelter by id. Scheduled visits are kept only in the adoption screen's state; nothing is sent anywhere.

## Getting started

```sh
npm install
npm run dev
```

The dev server prints the local URL, which is usually http://localhost:5173. To try the app on a phone on the same network, run `npm run dev -- --host` and open the printed network URL.

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
