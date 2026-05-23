# Local Transcript Generator

A local web app for creating, editing, previewing, and exporting student transcripts using browser storage.

## Overview

This Next.js application lets users manage student records and academic grades locally in the browser. It supports:

- Adding and editing student information
- Selecting transcript templates for G9–G12, G10–G12, G11–G12, and G12
- Entering grades by subject, semester, and grade level
- Previewing a printable transcript layout
- Exporting the transcript as a Word document (`.docx`)
- Exporting and importing all data as JSON
- Persisting student records in browser localStorage

## Features

- Student form with name, gender, age, and template selection
- Grade input flow that adapts to the selected grade template
- Transcript preview with printable layout and export options
- Data management panel for JSON export, import, and clearing all data
- Search, filter, and manage saved student records

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- `docx` for Word export
- `file-saver` for client-side downloads
- `lucide-react` icons
- `next-themes` for theming support

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Usage

1. Open the app and create a new student record.
2. Enter the student full name, gender, age, and transcript template.
3. Save the student and switch to the Grades tab to input academic scores.
4. Use the Preview & Export tab to view the transcript and print it.
5. Export student data as JSON or import an existing JSON dataset from the Data Management tab.
6. Clear all data if needed using the Data Management controls.

## Data Storage

Student records are stored in browser localStorage under the key `transcript-students`.

This means data is saved locally in the current browser profile and does not require a backend server.

## Project Structure

- `app/page.tsx` - main app shell with tabs, filters, and student state management
- `components/student-form.tsx` - student details and validation
- `components/grades-input.tsx` - grade matrix and summary calculations
- `components/print-preview.tsx` - transcript preview and print workflow
- `components/word-export.tsx` - export transcript to Word file
- `components/data-manager.tsx` - JSON import/export and data clearing
- `lib/file-manager.ts` - browser storage utilities for saving and loading student records
- `components/ui/*` - shared UI primitives for buttons, inputs, tables, cards, and alerts

## Notes

- Student names are validated to include first, middle, and last names.
- Grade templates adjust the available grade years accordingly.
- The app is intended for local use and does not send data to any external service.

## License

This repository does not include a license file by default. Add one if you want to make the project open source.
