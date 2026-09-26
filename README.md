# Countersign

A neutral agreement layer for two organizations after a partnership meeting.

## The problem

After a partnership call, both sides walk away and write their own notes. Those
notes almost never match perfectly: dates get remembered differently, dollar
figures get transposed into another currency, one side jots down a commitment
the other never wrote down, and a hesitant "would it be possible to..." ask
quietly turns into an assumed yes on one side and a "we never agreed to that"
on the other. Weeks later, that drift becomes a real conflict.

Countersign gives both sides a neutral, third-party read of the same
conversation. Each side pastes in their own notes, an AI reconciles them into
one shared list of items, and both sides then have to explicitly confirm each
item before it's considered settled ("countersigned"). Nothing is locked in
until both sides agree it's accurate.

## How it works

1. **Intake** &mdash; each side enters their org name and pastes their raw call
   notes into a textarea. A "Load demo" button fills in a realistic example
   (a media company and a Swiss watch sponsor) so you can see the whole flow
   without writing anything.
2. **Reconcile** &mdash; both sets of notes are sent to `/api/reconcile`, which
   calls the Anthropic API (`claude-sonnet-5`) with a prompt that classifies
   every distinct point into one of four categories:
   - **Agreed** &mdash; both sides recorded the same commitment.
   - **Mismatch** &mdash; both sides discussed it, but the specifics conflict
     (e.g. two different deadlines).
   - **One-sided** &mdash; only one side's notes mention it at all.
   - **Soft ask** &mdash; a request phrased as a question ("would it be
     possible to...") that was never a firm commitment.

   The model is asked to return strict JSON. The response is parsed and
   validated; if the API key is missing, the call fails, or the JSON doesn't
   validate, the app **automatically falls back to a hardcoded demo result**,
   so the reconciliation step always works, live demo or not.
3. **Agreement board** &mdash; items are grouped by category and color-coded.
   Mismatches show both sides' versions side by side. Soft asks show the
   original question with two buttons: "It's a request" or "Just asking."
4. **Countersigning** &mdash; a toggle at the top switches between "Viewing as
   [Side A]" and "Viewing as [Side B]." From either view, that side can
   **Confirm** or **Edit** each item. An item is only locked once *both* sides
   have confirmed it. A progress bar shows "X of Y items countersigned."
5. **Team brief** &mdash; once every item is locked, "Generate team brief"
   becomes enabled. It calls `/api/brief` (same fallback-safe pattern) to turn
   the reconciled list into a plain-language brief for working teams:
   decisions, open items to resolve, open requests, owners, and next steps.
   It's shown on its own screen with a one-click copy button.

All state (notes, items, confirmations, the generated brief) lives in React
state on the client. There is no database and no authentication &mdash; this is
built as a live-demo tool, not a production system of record.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `@anthropic-ai/sdk` for the two API routes (`/api/reconcile`, `/api/brief`)

## Running locally

```bash
npm install
cp .env.example .env.local   # optional — add your ANTHROPIC_API_KEY here
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If you don't set
`ANTHROPIC_API_KEY`, the app still works end to end using the built-in
fallback data for both the reconcile and brief steps.

## Deploying to Vercel

1. Push this repository to GitHub (or import it directly from Git).
2. In [vercel.com/new](https://vercel.com/new), import the repo. Vercel
   auto-detects the Next.js framework &mdash; no build configuration needed.
3. Add an environment variable named `ANTHROPIC_API_KEY` with your Anthropic
   API key in the Vercel project settings (Settings &rarr; Environment
   Variables), for live AI reconciliation and briefs. This is optional: the
   app will still fully function via its fallback data if you skip it.
4. Deploy. That's it &mdash; zero extra configuration.

The API key is never read from or written into the codebase; it's only ever
read from `process.env.ANTHROPIC_API_KEY` inside the server-side API routes.
