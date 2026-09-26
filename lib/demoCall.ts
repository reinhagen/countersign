export const DEMO_ORG_A = "Wildframe Media";
export const DEMO_ORG_B = "Aurel Watches";

export interface DemoLine {
  speaker: "A" | "B";
  text: string;
}

// A fictional partnership call. Contains 3 clear agreements, 2 vague/ambiguous
// moments, 1 commitment only one side voices, and 2 soft asks phrased as
// questions by the Aurel side.
export const DEMO_CALL_LINES: DemoLine[] = [
  { speaker: "A", text: "Thanks for hopping on — let's lock in the details for the Season Three sponsorship." },
  { speaker: "B", text: "Of course, we're excited. So to confirm, our logo runs as a five-second bumper at the open and close of every episode?" },
  { speaker: "A", text: "Exactly — five seconds each, open and close, every episode." },
  { speaker: "B", text: "Perfect, and we get one round of brand-safety notes per episode before it's locked, right?" },
  { speaker: "A", text: "Yes, one round of notes per episode, that's agreed." },
  { speaker: "A", text: "On payment — fifty percent deposit upfront, fifty percent on final delivery, and we'd want that deposit wired within ten business days of signing." },
  { speaker: "B", text: "That works for us — fifty-fifty, ten business days after signing." },
  { speaker: "A", text: "For delivery, we should have the first cut ready sometime in March." },
  { speaker: "B", text: "Great, so that lines up with the Basel show — that's the first week of March, so we'd have it in hand well before then." },
  { speaker: "A", text: "On the sponsorship number, we've been planning around one-eighty for the season." },
  { speaker: "B", text: "Right, we've got roughly one-sixty-five pencilled in on our end for this." },
  { speaker: "A", text: "We'll also throw in three extra behind-the-scenes clips for your socials at no additional cost, on top of everything else." },
  { speaker: "B", text: "Oh, one more thing — would it be possible to consider featuring our new Chrono model on camera in at least one episode?" },
  { speaker: "A", text: "Let me take that back to the team, I can't promise anything yet." },
  { speaker: "B", text: "Understood. And could we possibly get an early look at the trailer before it goes public?" },
  { speaker: "A", text: "We can look into that — no promises yet." },
  { speaker: "A", text: "Great, I think that covers everything for today." },
  { speaker: "B", text: "Sounds good, talk soon." },
];

export function demoTranscriptText(orgA: string = DEMO_ORG_A, orgB: string = DEMO_ORG_B): string {
  return DEMO_CALL_LINES.map((line) => `${line.speaker === "A" ? orgA : orgB}: ${line.text}`).join("\n");
}

/**
 * True if a transcript is exactly the built-in demo call (regardless of which
 * org names were used), so the API can skip the Anthropic call entirely.
 */
export function isDemoTranscript(transcript: string): boolean {
  const lines = transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length !== DEMO_CALL_LINES.length) return false;
  return lines.every((line, i) => {
    const sepIndex = line.indexOf(": ");
    const text = sepIndex === -1 ? line : line.slice(sepIndex + 2);
    return text.trim() === DEMO_CALL_LINES[i].text.trim();
  });
}
