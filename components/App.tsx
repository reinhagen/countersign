"use client";

import { useState } from "react";
import { AgreementItem, ItemStatus, SoftAskDecision } from "@/lib/types";
import { demoDefaults } from "./IntakeForm";
import IntakeForm from "./IntakeForm";
import AgreementBoard from "./AgreementBoard";
import TeamBrief from "./TeamBrief";

type Step = "intake" | "board" | "brief";

export default function App() {
  const [step, setStep] = useState<Step>("intake");
  const [orgA, setOrgA] = useState("");
  const [orgB, setOrgB] = useState("");
  const [notesA, setNotesA] = useState("");
  const [notesB, setNotesB] = useState("");
  const [items, setItems] = useState<AgreementItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [viewingAs, setViewingAs] = useState<"A" | "B">("A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState("");

  const handleChange = (fields: Partial<{ orgA: string; orgB: string; notesA: string; notesB: string }>) => {
    if (fields.orgA !== undefined) setOrgA(fields.orgA);
    if (fields.orgB !== undefined) setOrgB(fields.orgB);
    if (fields.notesA !== undefined) setNotesA(fields.notesA);
    if (fields.notesB !== undefined) setNotesB(fields.notesB);
  };

  const handleLoadDemo = () => {
    const d = demoDefaults();
    setOrgA(d.orgA);
    setOrgB(d.orgB);
    setNotesA(d.notesA);
    setNotesB(d.notesB);
    setError(null);
  };

  const handleReconcile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgA: orgA || "Side A",
          orgB: orgB || "Side B",
          notesA,
          notesB,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.items) {
        throw new Error(data.error || "Reconciliation failed");
      }
      setItems(data.items as AgreementItem[]);
      const initialStatuses: Record<string, ItemStatus> = {};
      for (const item of data.items as AgreementItem[]) {
        initialStatuses[item.id] = { aConfirmed: false, bConfirmed: false, softAskDecision: null };
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
      const current = prev[id] ?? { aConfirmed: false, bConfirmed: false, softAskDecision: null };
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
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              side_a_version: viewingAs === "A" ? newText : item.side_a_version,
              side_b_version: viewingAs === "B" ? newText : item.side_b_version,
            }
          : item
      )
    );
    setStatuses((prev) => {
      const current = prev[id] ?? { aConfirmed: false, bConfirmed: false, softAskDecision: null };
      return {
        ...prev,
        [id]: {
          ...current,
          aConfirmed: viewingAs === "A" ? false : current.aConfirmed,
          bConfirmed: viewingAs === "B" ? false : current.bConfirmed,
        },
      };
    });
  };

  const handleSoftAskDecision = (id: string, decision: SoftAskDecision) => {
    setStatuses((prev) => {
      const current = prev[id] ?? { aConfirmed: false, bConfirmed: false, softAskDecision: null };
      return { ...prev, [id]: { ...current, softAskDecision: decision } };
    });
  };

  const handleGenerateBrief = async () => {
    setBriefLoading(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgA: orgA || "Side A", orgB: orgB || "Side B", items }),
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

  if (step === "intake") {
    return (
      <IntakeForm
        orgA={orgA}
        orgB={orgB}
        notesA={notesA}
        notesB={notesB}
        loading={loading}
        error={error}
        onChange={handleChange}
        onLoadDemo={handleLoadDemo}
        onReconcile={handleReconcile}
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
        onBack={() => setStep("intake")}
      />
    );
  }

  return (
    <TeamBrief orgA={orgA || "Side A"} orgB={orgB || "Side B"} brief={brief} onBack={() => setStep("board")} />
  );
}
