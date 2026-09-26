"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_CALL_LINES, DEMO_ORG_A, DEMO_ORG_B } from "@/lib/demoCall";

interface Props {
  orgA: string;
  orgB: string;
  loading: boolean;
  error: string | null;
  onChangeOrg: (fields: { orgA?: string; orgB?: string }) => void;
  onAnalyze: (transcript: string) => void;
}

type Mode = "idle" | "listening" | "demo";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function CallIntake({ orgA, orgB, loading, error, onChangeOrg, onAnalyze }: Props) {
  const [mode, setMode] = useState<Mode>("idle");
  const [consentChecked, setConsentChecked] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showPasteUpload, setShowPasteUpload] = useState(false);
  const [pasteDraft, setPasteDraft] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const keepListeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
    setSpeechSupported(Boolean(SpeechRecognition));
    return () => {
      stopTimer();
      if (recognitionRef.current) {
        keepListeningRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [transcript, interim]);

  const startTimer = () => {
    stopTimer();
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startListening = () => {
    if (!consentChecked || !speechSupported) return;
    setMicError(null);
    setTranscript("");
    setInterim("");
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interimChunk += result[0].transcript;
        }
      }
      if (finalChunk.trim()) {
        setTranscript((prev) => (prev ? `${prev}\n${finalChunk.trim()}` : finalChunk.trim()));
      }
      setInterim(interimChunk);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone access was denied. Please allow microphone access and try again.");
        keepListeningRef.current = false;
        setMode("idle");
        stopTimer();
      }
      // other errors (e.g. "no-speech") are handled by onend, which restarts.
    };

    recognition.onend = () => {
      if (keepListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore — recognition may already be starting
        }
      }
    };

    keepListeningRef.current = true;
    recognitionRef.current = recognition;
    recognition.start();
    setMode("listening");
    startTimer();
  };

  const stopRecognitionOnly = () => {
    keepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    stopTimer();
  };

  const handleStopAndAnalyze = () => {
    if (mode === "listening") stopRecognitionOnly();
    setMode("idle");
    onAnalyze(transcript.trim());
  };

  const playDemoCall = () => {
    if (!orgA.trim()) onChangeOrg({ orgA: DEMO_ORG_A });
    if (!orgB.trim()) onChangeOrg({ orgB: DEMO_ORG_B });
    setTranscript("");
    setInterim("");
    setMode("demo");
    startTimer();

    const effectiveA = orgA.trim() || DEMO_ORG_A;
    const effectiveB = orgB.trim() || DEMO_ORG_B;

    let index = 0;
    const pushNextLine = () => {
      if (index >= DEMO_CALL_LINES.length) {
        stopTimer();
        setMode("idle");
        return;
      }
      const line = DEMO_CALL_LINES[index];
      const speakerName = line.speaker === "A" ? effectiveA : effectiveB;
      setTranscript((prev) => (prev ? `${prev}\n${speakerName}: ${line.text}` : `${speakerName}: ${line.text}`));
      index += 1;
      demoTimeoutRef.current = setTimeout(pushNextLine, 1000);
    };
    pushNextLine();
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setPasteDraft(text);
    };
    reader.readAsText(file);
  };

  const useTranscriptDraft = () => {
    setTranscript(pasteDraft.trim());
    setShowPasteUpload(false);
  };

  const startOver = () => {
    stopRecognitionOnly();
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    stopTimer();
    setTranscript("");
    setInterim("");
    setMode("idle");
    setElapsed(0);
  };

  const hasContent = transcript.trim().length > 0 || mode === "listening" || mode === "demo";

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm font-medium text-ink/70 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Countersign
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Countersign listens to your partner call and turns it into one record both sides sign.
        </h1>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/50">Side A</label>
          <input
            value={orgA}
            onChange={(e) => onChangeOrg({ orgA: e.target.value })}
            placeholder="e.g. Wildframe Media"
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
          />
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/50">Side B</label>
          <input
            value={orgB}
            onChange={(e) => onChangeOrg({ orgB: e.target.value })}
            placeholder="e.g. Aurel Watches"
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
          />
        </div>
      </div>

      {!hasContent ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-sm">
          {!speechSupported && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Live listening isn&apos;t supported in this browser. Please use Chrome, or paste/upload a transcript
              below.
            </div>
          )}

          {micError && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {micError}
            </div>
          )}

          <label className="mx-auto mb-6 flex max-w-md items-start gap-3 rounded-lg bg-ink/[0.03] p-4 text-left text-sm text-ink/70">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>Everyone on this call must agree to it being transcribed.</span>
          </label>

          <button
            onClick={startListening}
            disabled={!consentChecked || !speechSupported}
            className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            Start listening
          </button>

          <div className="mt-8 border-t border-ink/10 pt-6">
            <button
              onClick={() => setShowPasteUpload((v) => !v)}
              className="mb-3 text-sm font-medium text-ink/60 underline decoration-ink/20 underline-offset-4 hover:text-ink"
            >
              Paste or upload a transcript
            </button>
            {showPasteUpload && (
              <div className="mx-auto max-w-lg text-left">
                <textarea
                  value={pasteDraft}
                  onChange={(e) => setPasteDraft(e.target.value)}
                  placeholder="Paste the call transcript here…"
                  className="mb-2 h-32 w-full resize-none rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
                />
                <div className="mb-3 flex items-center justify-between gap-3">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="text-xs text-ink/60"
                  />
                  <button
                    onClick={useTranscriptDraft}
                    disabled={!pasteDraft.trim()}
                    className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30"
                  >
                    Use this transcript
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={playDemoCall}
              className="text-sm font-medium text-ink/60 underline decoration-ink/20 underline-offset-4 hover:text-ink"
            >
              Play demo call
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {mode === "listening" && (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                  </span>
                  Listening…
                </span>
              )}
              {mode === "demo" && (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-600" />
                  </span>
                  Playing demo call…
                </span>
              )}
              {mode === "idle" && <span className="text-sm font-medium text-ink/50">Transcript ready</span>}
              <span className="font-mono text-sm text-ink/40">{formatTime(elapsed)}</span>
            </div>
            <button onClick={startOver} className="text-xs font-medium text-ink/40 hover:text-ink/70">
              Start over
            </button>
          </div>

          <div
            ref={panelRef}
            className="mb-4 h-72 overflow-y-auto rounded-lg bg-ink/[0.03] p-4 text-sm leading-relaxed text-ink/80"
          >
            {transcript ? (
              <p className="whitespace-pre-wrap">{transcript}</p>
            ) : (
              <p className="text-ink/30">Transcript will appear here as the call is heard…</p>
            )}
            {interim && <p className="whitespace-pre-wrap text-ink/40">{interim}</p>}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleStopAndAnalyze}
              disabled={mode === "demo" || !transcript.trim() || loading}
              className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              {loading ? "Analyzing…" : mode === "demo" ? "Finishing demo call…" : "Stop & analyze"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
