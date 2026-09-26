# Countersign

Countersign listens to your partner call and turns it into one record both
sides sign — each from their own device.

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
extracts every commitment, ambiguity, one-sided offer, and soft ask, and then
each organization signs from its own device, in its own shared room. Nothing
is locked in until both sides have explicitly signed the exact same wording.

## How it works

1. **Listen** &mdash; enter both org names, agree to the consent notice
   ("Everyone on this call must agree to it being transcribed"), and press
   **Begin listening**. Countersign uses the browser's built-in speech
   recognition (Chrome's Web Speech API) to transcribe the call live, with a
   calm pulsing indicator, a running timer, and a scrolling transcript panel
   with a timestamp column. If recognition stops on silence it automatically
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
3. **Create a shared room** &mdash; when Redis is configured (see below),
   analysis lands on a "Create shared room" screen. Creating one saves the
   items and org names under a random room id in Redis, with two private
   signing tokens, one per side. An invite panel then shows both private
   links (`/room/[id]?key=[token]`), each with a **Copy** button and a QR
   code (so a partner can open their link on a phone), and the note "Each
   link can only sign for its own side. No account needed." The creator
   continues into their own room; the other link is sent to the partner.
4. **Sign in your own room** &mdash; a room page is entirely scoped to
   whichever token opened it: there's no viewing-as toggle, because the link
   itself decides your identity. A persistent top banner reads "You are
   signing as [Your Org]" in that side's color (navy or gold) with a circular
   initials seal. Every card shows two labeled, timestamped seals (e.g.
   "Wildframe Media signed 8:42 AM" / "Aurel Watches — awaiting") and a
   **Sign as [Your Org]** button in place of a generic "Confirm." An item
   locks only once both sides have signed identical wording; if one side
   signs and the other edits to something different, the card flags itself
   "Mismatch — needs resolution" until the wording matches again. An
   **Activity panel** lists every action with side, item, and timestamp. The
   room polls every 3 seconds, so when the other side acts you see the card
   update and a toast (e.g. "Wildframe Media signed: Payment terms")
   automatically. An invalid or mistyped link shows a friendly error instead
   of the room.
5. **My commitments** &mdash; a tab next to the agreement board, always from
   your side's point of view, with explicit headings: "[Your Org] owes,"
   "Waiting on [Their Org]," and "Needs [Your Org]'s signature," each with a
   clear empty state. Marking a soft ask "It's a request" turns it into a
   commitment owned by the side it was asked of, with an optional due date
   entered inline; owed items can be checked off once done.
6. **Countersigned Record** &mdash; once every item is locked, a third tab
   unlocks: a certificate-style page listing every item with both sides'
   signature timestamps and all commitments with owners and due dates. A
   **Download PDF** button opens a print-formatted view (via the browser's
   print dialog) with all navigation and controls hidden. **Generate team
   brief** is still here too: it calls `/api/rooms/[id]/brief` to turn the
   reconciled, resolved list &mdash; plus every commitment's owner and due
   date &mdash; into a plain-language brief for working teams, shown with a
   one-click copy button and saved to the room so both sides see the same
   brief.

### Demo mode (no database configured)

If Redis isn't configured, Countersign automatically falls back to **Demo
mode (both sides on one screen)**: the original single-screen workflow with
a "Viewing as [Side A/B]" toggle, so you can still see and test the entire
flow &mdash; agreement board, commitments, team brief &mdash; without any
setup. This fallback is clearly labeled and only appears when no database is
configured; whenever Redis is available, shared rooms are the only path, so
point of view is always unambiguous.

All state for demo mode lives in React state on the client, with no
persistence. Shared rooms persist in Redis for 30 days and require no
authentication beyond each side's private link.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, with a warm ivory/navy/champagne-gold palette, Playfair
  Display (headings) and Inter (body) from Google Fonts
- Browser Web Speech API (`webkitSpeechRecognition`) for live transcription
- `@anthropic-ai/sdk` for reconciliation and brief generation
- `@upstash/redis` for shared room storage (optional — see below)
- `qrcode.react` for the invite panel's QR codes

## Browser support

Live listening requires a browser with `webkitSpeechRecognition` support
(Chrome). In any other browser, Countersign shows a friendly notice and you
can still use "paste or upload a transcript" or "play demo call" to see the
full flow.

## Shared rooms & storage

Shared rooms need a Redis-compatible REST database. Countersign reads
credentials in this order:

1. `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
2. `KV_REST_API_URL` / `KV_REST_API_TOKEN` (e.g. Vercel's Redis/KV
   integration, which sets these automatically)

If neither pair is present, `/api/config` reports rooms as disabled and the
app transparently uses Demo mode instead — nothing breaks, and no code
changes are needed either way.

To enable rooms locally or in production:

1. Create a free Redis database at [upstash.com](https://upstash.com) (or
   add Vercel's Redis/KV integration to your project).
2. Copy its REST URL and token into `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN` (in `.env.local` for local dev, or your
   deployment's environment variables).

## Running locally

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY and/or Redis credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome for live
listening. Without `ANTHROPIC_API_KEY` the app still works end to end via
fallback data; without Redis credentials it runs in Demo mode.

## Deploying to Vercel

1. Push this repository to GitHub (or import it directly from Git).
2. In [vercel.com/new](https://vercel.com/new), import the repo. Vercel
   auto-detects the Next.js framework &mdash; no build configuration needed.
3. Add `ANTHROPIC_API_KEY` in the Vercel project settings (Settings &rarr;
   Environment Variables) for live AI reconciliation and briefs. Optional:
   the app still fully functions via its fallback data if you skip it.
4. Add Redis credentials to enable real shared rooms: either add Vercel's
   Redis/KV integration (which sets `KV_REST_API_URL` /
   `KV_REST_API_TOKEN` automatically), or add your own Upstash database's
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Optional: without
   either, the app runs in Demo mode.
5. Deploy. That's it &mdash; zero extra configuration required.

Secrets are never read from or written into the codebase; they're only ever
read from `process.env` inside the server-side API routes.
