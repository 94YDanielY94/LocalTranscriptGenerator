# Contributing to Local Transcript Generator

Thank you for your interest in contributing! This guide will help you get set up and start making changes.

## Development Setup

### Prerequisites

- Node.js (version 18 or higher)
- Git

### Getting Started

1. Fork this repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/94YDanielY94/LocalTranscriptGenerator.git
   cd LocalTranscriptGenerator
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the development server:
   ```bash
   bun run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to see the app

## Project Structure

- `app/page.tsx` - Main app shell with tabs, filters, and student state management
- `components/student-form.tsx` - Student details form and validation
- `components/grades-input.tsx` - Grade matrix and summary calculations
- `components/print-preview.tsx` - Transcript preview and print workflow
- `components/word-export.tsx` - Export transcript to Word file
- `components/data-manager.tsx` - JSON import/export and data clearing
- `lib/file-manager.ts` - Browser storage utilities for saving and loading records
- `components/ui/*` - Shared UI primitives (buttons, inputs, tables, cards)

## How to Contribute

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and test them locally
3. Commit with a clear message:
   ```bash
   git commit -m "feat: describe what you changed"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request on GitHub describing your changes

## Notes

- Student names are validated to include first, middle, and last names
- Grade templates adjust the available grade years automatically
- The app stores data in localStorage only. No external API calls are made
