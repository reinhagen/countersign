"use client";

import { useState } from "react";
import { AgreementItem, ItemStatus, SoftAskDecision } from "@/lib/types";
import { initialStatusFor } from "@/lib/itemStatus";
import CallIntake from "./CallIntake";
import AgreementBoard from "./AgreementBoard";
import TeamBrief from "./TeamBrief";

type Step = "call" | "board" | "brief";

export default function App() {
  const [step, setStep] = useState<Step>("call");
  const [orgA, setOrgA] = useState("");
  const [orgB, setOrgB] = useState("");
  const [items, setItems] = useState<AgreementItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [viewingAs, setViewingAs] = useState<"A" | "B">("A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState("");

  const handleChangeOrg = (fields: { orgA?: string; orgB?: string }) => {
    if (fields.orgA !== undefined) setOrgA(fields.orgA);
    if (fields.orgB !== undefined) setOrgB(fields.orgB);
  };

  const handleAnalyze = async (transcript: string) => {
    if (!transcript.trim()) {
      setError("Nothing was captured yet — try listening again or paste a transcript.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgA: orgA || "Side A",
          orgB: orgB || "Side B",
          transcript,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.items) {
        throw new Error(data.error || "Analysis failed");
      }
      const fetchedItems = data.items as AgreementItem[];
      setItems(fetchedItems);
      const initialStatuses: Record<string, ItemStatus> = {};
      for (const item of fetchedItems) {
        initialStatuses[item.id] = initialStatusFor(item);
      }
      setStatuses(initialStatuses);
      setStep("board");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (id: string) => {
    setStatuses((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          aConfirmed: viewingAs === "A" ? true : current.aConfirmed,
          bConfirmed: viewingAs === "B" ? true : current.bConfirmed,
        },
      };
    });
  };

  const handleSaveEdit = (id: string, newText: string) => {
    setStatuses((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          aText: viewingAs === "A" ? newText : current.aText,
          bText: viewingAs === "B" ? newText : current.bText,
          aConfirmed: viewingAs === "A" ? false : current.aConfirmed,
          bConfirmed: viewingAs === "B" ? false : current.bConfirmed,
        },
      };
    });
  };

  const handleSoftAskDecision = (id: string, decision: SoftAskDecision) => {
    setStatuses((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, softAskDecision: decision } };
    });
  };

  const handleGenerateBrief = async () => {
    setBriefLoading(true);
    try {
      const resolvedItems = items.map((item) => ({
        ...item,
        text: statuses[item.id]?.aText ?? item.text,
      }));
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgA: orgA || "Side A", orgB: orgB || "Side B", items: resolvedItems }),
      });
      const data = await res.json();
      setBrief(data.brief || "");
      setStep("brief");
    } catch {
      setBrief("Could not generate the brief. Please try again.");
      setStep("brief");
    } finally {
      setBriefLoading(false);
    }
  };

  if (step === "call") {
    return (
      <CallIntake
        orgA={orgA}
        orgB={orgB}
        loading={loading}
        error={error}
        onChangeOrg={handleChangeOrg}
        onAnalyze={handleAnalyze}
      />
    );
  }

  if (step === "board") {
    return (
      <AgreementBoard
        items={items}
        statuses={statuses}
        viewingAs={viewingAs}
        orgA={orgA || "Side A"}
        orgB={orgB || "Side B"}
        onSetViewingAs={setViewingAs}
        onConfirm={handleConfirm}
        onSaveEdit={handleSaveEdit}
        onSoftAskDecision={handleSoftAskDecision}
        onGenerateBrief={handleGenerateBrief}
        briefLoading={briefLoading}
        onBack={() => setStep("call")}
      />
    );
  }

  return (
    <TeamBrief orgA={orgA || "Side A"} orgB={orgB || "Side B"} brief={brief} onBack={() => setStep("board")} />
  );
}
