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

interface TranscriptLine {
  time: string | null;
  text: string;
}

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
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [interim, setInterim] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showPasteUpload, setShowPasteUpload] = useState(false);
  const [pasteDraft, setPasteDraft] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const keepListeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
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
  }, [lines, interim]);

  const startTimer = () => {
    stopTimer();
    elapsedRef.current = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const appendLine = (text: string, time: string | null) => {
    setLines((prev) => [...prev, { time, text }]);
  };

  const startListening = () => {
    if (!consentChecked || !speechSupported) return;
    setMicError(null);
    setLines([]);
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
        appendLine(finalChunk.trim(), formatTime(elapsedRef.current));
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

  const transcriptText = () => lines.map((l) => l.text).join("\n");

  const handleStopAndAnalyze = () => {
    if (mode === "listening") stopRecognitionOnly();
    setMode("idle");
    onAnalyze(transcriptText().trim());
  };

  const playDemoCall = () => {
    if (!orgA.trim()) onChangeOrg({ orgA: DEMO_ORG_A });
    if (!orgB.trim()) onChangeOrg({ orgB: DEMO_ORG_B });
    setLines([]);
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
      appendLine(`${speakerName}: ${line.text}`, formatTime(elapsedRef.current));
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
    const draftLines = pasteDraft
      .trim()
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((text) => ({ time: null, text }));
    setLines(draftLines);
    setShowPasteUpload(false);
  };

  const startOver = () => {
    stopRecognitionOnly();
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    stopTimer();
    setLines([]);
    setInterim("");
    setMode("idle");
    setElapsed(0);
  };

  const hasContent = lines.length > 0 || mode === "listening" || mode === "demo";

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header className="mb-10 text-center">
        <h1 className="mx-auto max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-wide text-navy sm:text-[2.75rem]">
          Countersign listens to your partner call and turns it into one record both sides sign.
        </h1>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-navy/10 bg-white p-4 shadow-hairline">
          <label className="tracking-caps mb-2 block text-[11px] font-semibold text-navy/45">Side A</label>
          <input
            value={orgA}
            onChange={(e) => onChangeOrg({ orgA: e.target.value })}
            placeholder="e.g. Wildframe Media"
            className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-4 shadow-hairline">
          <label className="tracking-caps mb-2 block text-[11px] font-semibold text-navy/45">Side B</label>
          <input
            value={orgB}
            onChange={(e) => onChangeOrg({ orgB: e.target.value })}
            placeholder="e.g. Aurel Watches"
            className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {!hasContent ? (
        <div className="rounded-lg border border-navy/10 bg-white p-10 text-center shadow-hairline">
          {!speechSupported && (
            <div className="mb-6 rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">
              Live listening isn&apos;t supported in this browser. Please use Chrome, or paste/upload a transcript
              below.
            </div>
          )}

          {micError && (
            <div className="mb-6 rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">
              {micError}
            </div>
          )}

          <label className="mx-auto mb-7 flex max-w-md items-start gap-3 rounded-lg bg-navy/[0.03] p-4 text-left text-sm text-navy/70">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
            />
            <span>Everyone on this call must agree to it being transcribed.</span>
          </label>

          <button
            onClick={startListening}
            disabled={!consentChecked || !speechSupported}
            className="rounded-lg bg-navy px-10 py-3.5 font-serif text-base font-semibold tracking-wide text-white shadow-hairline transition hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-navy/25"
          >
            Begin listening
          </button>

          <div className="mt-10 border-t border-gold/20 pt-6">
            <button
              onClick={() => setShowPasteUpload((v) => !v)}
              className="mb-3 text-sm font-medium text-navy/55 underline decoration-gold/40 underline-offset-4 hover:text-navy"
            >
              Paste or upload a transcript
            </button>
            {showPasteUpload && (
              <div className="mx-auto max-w-lg text-left">
                <textarea
                  value={pasteDraft}
                  onChange={(e) => setPasteDraft(e.target.value)}
                  placeholder="Paste the call transcript here…"
                  className="mb-2 h-32 w-full resize-none rounded-lg border border-navy/15 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
                <div className="mb-3 flex items-center justify-between gap-3">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="text-xs text-navy/60"
                  />
                  <button
                    onClick={useTranscriptDraft}
                    disabled={!pasteDraft.trim()}
                    className="rounded-lg bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-navy/30"
                  >
                    Use this transcript
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={playDemoCall}
              className="text-sm font-medium text-navy/55 underline decoration-gold/40 underline-offset-4 hover:text-navy"
            >
              Play demo call
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-navy/10 bg-white p-6 shadow-hairline">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {mode === "listening" && (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-crimson">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-crimson" />
                  </span>
                  Listening…
                </span>
              )}
              {mode === "demo" && (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy/60">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
                  </span>
                  Playing demo call…
                </span>
              )}
              {mode === "idle" && <span className="text-sm font-medium text-navy/50">Transcript ready</span>}
              <span className="font-serif text-sm text-navy/40">{formatTime(elapsed)}</span>
            </div>
            <button onClick={startOver} className="text-xs font-medium text-navy/40 hover:text-navy/70">
              Start over
            </button>
          </div>

          <div ref={panelRef} className="mb-4 h-72 overflow-y-auto rounded-lg bg-navy/[0.03] p-4 text-sm leading-relaxed">
            {lines.length === 0 && !interim ? (
              <p className="text-navy/30">Transcript will appear here as the call is heard…</p>
            ) : (
              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div key={i} className="flex gap-3">
                    {line.time && (
                      <span className="w-12 shrink-0 font-serif text-xs text-gold-dark/70">{line.time}</span>
                    )}
                    <span className="text-navy/80">{line.text}</span>
                  </div>
                ))}
                {interim && (
                  <div className="flex gap-3">
                    <span className="w-12 shrink-0 font-serif text-xs text-gold-dark/40">{formatTime(elapsed)}</span>
                    <span className="text-navy/40">{interim}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleStopAndAnalyze}
              disabled={mode === "demo" || lines.length === 0 || loading}
              className="rounded-lg bg-navy px-10 py-3.5 font-serif text-base font-semibold tracking-wide text-white shadow-hairline transition hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-navy/25"
            >
              {loading ? "Analyzing…" : mode === "demo" ? "Finishing demo call…" : "Stop & analyze"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
