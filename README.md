# LearnAgain

A spaced repetition study app that turns your PDFs and DOCX files into flashcards. Upload a document, generate cards with AI or create them manually, then review daily with smart scheduling that adapts to how well you know each card.

**Live demo:** https://learnagain-89ir-i3ks08wq7-tylerp63s-projects.vercel.app/

## Features

- **File upload** — Drag-and-drop PDF or DOCX files to extract text
- **AI flashcard generation** — Automatically generates study cards from your content using the Claude API
- **Manual card creation** — Select text from the document to create cards yourself
- **Spaced repetition (SM-2)** — Cards you know well appear less often; cards you struggle with come back quickly
- **Daily study sessions** — Review due cards with Again/Hard/Good/Easy ratings
- **Keyboard shortcuts** — Space to reveal, 1-4 to rate
- **Deck management** — Rename, edit, and delete decks and cards from the dashboard

## How it works

The app uses the SM-2 spaced repetition algorithm to schedule reviews:

1. Upload a document and create flashcards (AI-generated or manual)
2. New cards are immediately due for review
3. Rate your recall: **Again** resets the card, **Good/Easy** pushes it further out
4. Intervals grow with each successful review (1 day, 6 days, then multiplied by an easiness factor)
5. Cards you find difficult stay in tight rotation; well-known cards drift out to weeks or months

## Getting started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/) (for AI flashcard generation)

### Setup

```bash
git clone https://github.com/tylerp63/learnagain.git
cd learnagain
npm install
```

Create a `.env.local` file with your API key:

```
ANTHROPIC_API_KEY=your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Claude API** for AI flashcard generation
- **pdfjs-dist** for PDF text extraction
- **mammoth** for DOCX text extraction
- **localStorage** for client-side persistence
