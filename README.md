# Countersign

**Live demo:** [https://countersign-rouge.vercel.app](https://countersign-rouge.vercel.app)

A supervisor's guide to what Countersign is, the problem it came from, how to
run the demo end to end, and where it goes next.

## The problem

This idea came out of a customer discovery call with a brand partnerships PM
at National Geographic. Her team runs a steady stream of sponsorship and
co-marketing calls with outside brands — content deals, licensing, event
tie-ins. After every call, both sides write up their own notes and send them
around internally. Those notes almost never match: a delivery date one side
remembers as "sometime in Q4" the other remembers as "before the holidays,"
a dollar figure gets quoted in different currencies with no conversion
written down, one side offers something as a throw-in that the other side
never actually agreed to, and a soft "would it be possible to feature the
new product?" quietly turns into an assumed yes on one side and "we never
agreed to that" on the other. None of this is bad faith — it's just two
people writing down their own memory of the same conversation. By the time
anyone notices the mismatch, weeks have passed and it's a real conflict
instead of a two-line clarification.

Countersign removes the step where that drift gets introduced. Nobody
writes notes. Countersign listens to the call itself, has a neutral AI
reconcile it into a single list of commitments, ambiguities, one-sided
offers, and soft asks, and then has each organization sign off on that list
from its own device. Nothing is final until both sides have explicitly
signed the exact same wording.

## Try it: a full walkthrough

This is the fastest way to see the whole product. It takes about two
minutes and needs no login, no data entry, and no real call.

1. Open the [live demo](https://countersign-rouge.vercel.app) and click
   **Try the demo** on the landing page.
2. On the call screen, click **Play demo call**. A fictional sponsorship
   call between "Wildframe Media" and "Aurel Watches" streams into the
   transcript panel line by line, as if it were being heard live (about 18
   seconds).
3. Once it finishes, click **Stop & analyze**. Countersign reconciles the
   transcript into a list of items — agreed points, two ambiguous ones
   (a vague date, a figure with no currency conversion), a one-sided offer,
   and two soft asks — grouped and color-coded on the agreement board.
4. Click **Create shared room**. This is the core idea: instead of both
   companies looking at one shared screen, each one gets its own private
   link, and only that link can sign for that side.
5. You'll land on an **invite panel** with two links, each with a QR code
   and a copy button. **Open the "Your link" one in your current
   browser/device, and open the "Partner's link" one in a different browser
   (or an incognito window, or your phone) — this simulates the two real
   companies, each on their own device.** Each link is scoped to one side
   only; opening the wrong link can never sign for the other company.
6. In either window, try the actions: **Edit** a card's wording, **Sign as
   [Your Org]**, or mark a soft ask **"It's a request"** (which turns it
   into a commitment with a due date). Actions sync to the other window
   within a few seconds — watch a toast appear there confirming what you
   just did.
7. Once every item is signed identically by both sides, a **Countersigned
   Record** tab unlocks: a certificate-style summary with every item's dual
   signature timestamps, all commitments, and a **Download PDF** button.
8. Check the **My commitments** tab (phrased from whichever side's link you
   opened — "X owes" / "Waiting on Y" / "Needs X's signature"), and click
   **Generate team brief** on the Countersigned Record page for a
   plain-language summary either side can paste into Slack or email.
9. Back out to **Open workspace** from the landing page to see this new
   room listed alongside two seeded example partnerships, plus a
   cross-partnership Commitments view and an Activity feed.

## How live listening works

The **Begin listening** button (instead of the demo call) uses Chrome's
built-in speech recognition (`webkitSpeechRecognition`) to transcribe a real
call live, right in the browser — no server-side audio processing, no
recording stored anywhere. It shows a consent notice first ("Everyone on
this call must agree to it being transcribed"), then a pulsing indicator, a
running timer, and a scrolling transcript with timestamps. If it goes quiet
for a moment it automatically restarts, so it keeps listening for the whole
call until you click **Stop & analyze**. This only works in Chrome (or other
`webkitSpeechRecognition`-capable browsers); anywhere else, Countersign
shows a friendly notice and falls back to pasting or uploading a transcript.

## How the partner flow works in real life

In practice, **only the host runs Countersign during the call** — the
partner company doesn't install anything, sign up for anything, or do
anything differently on the call itself. After the call, the host clicks
**Create shared room** and sends the partner their link (by email, Slack,
whatever they'd already use). The partner opens that one link, on any
device, and it just works: no account, no password, nothing to configure.
They see only their own "Sign as [Their Org]" actions and can't act on the
host's behalf, or vice versa. This is deliberate — it mirrors how a
counter-signed paper contract works today (one copy, two signature lines)
rather than asking a partner to adopt a new tool.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**, deployed on **Vercel**
- **Tailwind CSS**, with a warm ivory/navy/champagne-gold visual system,
  Playfair Display (headings) and Inter (body) from Google Fonts
- **Chrome's Web Speech API** (`webkitSpeechRecognition`) for live, in-browser
  transcription — no audio ever leaves the browser as audio
- **Anthropic API** (`claude-sonnet-5`) for call reconciliation and
  plain-language team briefs, via `@anthropic-ai/sdk`
- **Upstash Redis** (`@upstash/redis`) for shared-room storage — optional;
  without it the app runs in a single-screen "Demo mode" instead
- **qrcode.react** for the invite panel's QR codes

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have. Both are
optional — Countersign is designed to fully work with neither set.

| Variable | Required for | If unset |
|---|---|---|
| `ANTHROPIC_API_KEY` | Live call reconciliation and team briefs | Falls back to a hardcoded demo result, so the flow still works end to end. The built-in demo call always skips the API regardless, to keep it free and immune to downtime. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Real two-party shared rooms | Falls back to "Demo mode" — the original single-screen workflow with a "Viewing as [Side A/B]" toggle, so the whole flow is still testable with zero setup. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Same as above | Used automatically if the `UPSTASH_*` pair isn't set — this is what Vercel's own Redis/KV integration sets for you. |

Secrets are only ever read from `process.env` inside server-side API routes
— never in client code or committed to the repo.

## Deploying

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel
   auto-detects Next.js, no build configuration needed.
3. Add `ANTHROPIC_API_KEY` in the Vercel project's environment variables for
   live reconciliation and briefs (optional).
4. Add Redis credentials for real shared rooms (optional): either add
   Vercel's Redis/KV integration (sets `KV_REST_API_URL` /
   `KV_REST_API_TOKEN` automatically), or your own Upstash database's
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
5. Deploy. That's it — zero required configuration to see the full demo.

To run locally:

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome for live
listening.

## Roadmap

Things we'd build next, roughly in order of what a real partnerships team
would ask for first:

- **A Zoom (and Google Meet/Teams) bot** that joins the call automatically
  and starts listening, so nobody has to remember to click "Begin
  listening" — this is the single biggest friction point in the current
  flow.
- **Email-based sign-in** for the partner link, so a signature is tied to a
  verified email address instead of just possession of a URL — closer to
  how e-signature tools (DocuSign, etc.) establish who actually signed.
- **Slack integration**: post the team brief and commitment reminders
  directly into a deal's Slack channel, and let someone mark a commitment
  done from Slack.
- **Airtable / CRM integration**: sync partnerships, commitments, and due
  dates into whatever system a partnerships team already tracks deals in,
  instead of Countersign being one more standalone place to check.
- **Multi-call partnerships**: today each room is one call; most real
  partnerships span several calls over time, so rooms should be able to
  accumulate items across multiple sessions.
- **Team accounts**: today "Wildframe Media" in the workspace sidebar is a
  fixed demo label with no login; a real deployment needs actual accounts
  and permissions per organization.
