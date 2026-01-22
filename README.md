# Clinical Review Scheduling App (MVP)

A spreadsheet-style scheduling tool for Clinical Review teams. Built with **React + TypeScript + Vite + Tailwind** and prepared for **Firebase Firestore**.

## Features
- Published schedule view (read-only) with filters + print-friendly layout
- Supervisor mode (password **1234**) for CRUD on employees, entities, schedules, assignments, time off, and productivity
- Flexible 2‑month schedule cycles with dynamic DAR/Incoming column counts
- Per-cycle header group texts for entity grouping history
- Copy-forward schedule cycles (columns + assignments)
- Basic coverage warnings
- History snapshots per person and per entity

## Quick start
```bash
npm install
npm run dev
```

The app runs in **local mode** with seed data if Firebase env vars are not set.

## Firebase setup (Firestore)
1. Create a Firebase project and Firestore database.
2. Add a web app in Firebase to get config values.
3. Create a `.env` file in the project root:
```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
4. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

> **Note**: The included `firestore.rules` allows public writes for MVP convenience. Replace with auth / server-side validation before production use.

## Data model
Firestore collections:
- `employees`
- `entities`
- `scheduleCycles`
- `assignments`
- `timeOff`
- `productivity`

The shape is defined in `src/lib/types.ts` and seeded in `src/data/seed.ts`.

## GitHub Pages deployment
This repo is ready for GitHub Pages with relative paths.

```bash
npm run build
```

Deploy with the output in `dist/`. You can publish the `dist` folder using GitHub Pages settings or a `gh-pages` action.

## Notes / assumptions
- Supervisor password is hard-coded (`1234`) for MVP only.
- If Firebase is not configured, the app uses local seed data and writes are in-memory only.
- Use the schedule grid to edit assignments; changes persist to Firestore when configured.

## Print view
Use the **Print View** button in the header for a print/PDF-friendly layout.
