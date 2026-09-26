# Countersign

Countersign listens to your partner call and turns it into one record both
sides sign.

## The problem

After a partnership call, both sides walk away with their own memory of what
was said. Dates get remembered differently, dollar figures get transposed
into another currency, one side voices a commitment the other never
acknowledges, and a hesitant "would it be possible to..." ask quietly turns
into an assumed yes on one side and a "we never agreed to that" on the other.
Weeks later, that drift becomes a real conflict — and it started the moment
everyone hung up and wrote down their own version of the call.

Countersign removes that step entirely. Nobody writes notes. Countersign
listens to the call itself (or a demo/pasted transcript), a neutral AI
extracts every commitment, ambiguity, one-sided offer, and soft ask, and both
sides then have to explicitly confirm each item before it's considered
settled ("countersigned"). Nothing is locked in until both sides agree it's
accurate.

## How it works

1. **Listen** &mdash; enter both org names, agree to the consent notice
   ("Everyone on this call must agree to it being transcribed"), and press
   **Start listening**. Countersign uses the browser's built-in speech
   recognition (Chrome's Web Speech API) to transcribe the call live, with a
   pulsing "Listening…" indicator, a running timer, and a scrolling
   transcript panel. If recognition stops on silence it automatically
   restarts, so it keeps listening for the whole call until you press
   **Stop & analyze**. Two secondary options let you skip listening
   altogether: **paste or upload a transcript** (.txt), or **play a demo
   call** that streams a realistic fictional Wildframe Media × Aurel Watches
   sponsorship call into the transcript panel line by line, as if it were
   being heard live.
2. **Reconcile** &mdash; the full transcript plus both org names are sent to
   `/api/reconcile`, which calls the Anthropic API (`claude-sonnet-5`) with a
   prompt that infers who's speaking for which org from context, then
   classifies every distinct point into one of four categories:
   - **Agreed** &mdash; both sides clearly voiced the same commitment.
   - **Ambiguous** &mdash; both sides discussed it, but the language could
     reasonably be understood two different ways (e.g. "sometime in March"
     meaning different things to each side). Both interpretations are kept.
   - **One-sided** &mdash; only one side voiced a commitment or offer; the
     other side never acknowledged it.
   - **Soft ask** &mdash; a request phrased as a question ("would it be
     possible to...") that was never a firm commitment.

   The model is asked to return strict JSON. The response is parsed and
   validated; if the API key is missing, the call fails, or the JSON doesn't
   validate, the app **automatically falls back to a hardcoded demo result**
   that matches the built-in demo call, so the reconciliation step always
   works, live demo or not.
3. **Agreement board** &mdash; items are grouped by category and color-coded.
   Ambiguous items show both possible interpretations side by side. Soft asks
   show the original question with two buttons: "It's a request" or "Just
   asking."
4. **Countersigning** &mdash; a toggle at the top switches between "Viewing as
   [Side A]" and "Viewing as [Side B]." From either view, that side can
   **Confirm** or **Edit** each item's text. An item is only locked once
   *both* sides have confirmed the exact same text. If one side confirms an
   item and the other side edits it to something different, the card flags
   itself **"Mismatch — needs resolution"** and shows both versions until the
   two sides land on identical wording. A progress bar shows "X of Y items
   countersigned."
5. **Team brief** &mdash; once every item is locked, "Generate team brief"
   becomes enabled. It calls `/api/brief` (same fallback-safe pattern) to turn
   the reconciled, resolved list into a plain-language brief for working
   teams: decisions, open items to resolve, open requests, and next steps.
   It's shown on its own screen with a one-click copy button.

All state (transcript, items, confirmations, the generated brief) lives in
React state on the client. There is no database and no authentication &mdash;
this is built as a live-demo tool, not a production system of record.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Browser Web Speech API (`webkitSpeechRecognition`) for live transcription
- `@anthropic-ai/sdk` for the two API routes (`/api/reconcile`, `/api/brief`)

## Browser support

Live listening requires a browser with `webkitSpeechRecognition` support
(Chrome). In any other browser, Countersign shows a friendly notice and you
can still use "paste or upload a transcript" or "play demo call" to see the
full flow.

## Running locally

```bash
npm install
cp .env.example .env.local   # optional — add your ANTHROPIC_API_KEY here
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome for live
listening. If you don't set `ANTHROPIC_API_KEY`, the app still works end to
end using the built-in fallback data for both the reconcile and brief steps.

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
