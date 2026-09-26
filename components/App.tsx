"use client";

import { useEffect, useState } from "react";
import { AgreementItem, ItemStatus, SoftAskDecision } from "@/lib/types";
import {
  initialStatusFor,
  isLocked,
  otherSide,
  commitmentsCount,
  effectiveOwnerLabel,
  effectiveDueDate,
  applyConfirm,
  applyEdit,
} from "@/lib/itemStatus";
import type { BriefCommitment } from "@/lib/fallback";
import CallIntake from "./CallIntake";
import CreateRoomScreen from "./CreateRoomScreen";
import InvitePanel from "./InvitePanel";
import AgreementBoard from "./AgreementBoard";
import CommitmentsView from "./CommitmentsView";
import WorkspaceHeader from "./WorkspaceHeader";
import TeamBrief from "./TeamBrief";
import ToastStack, { ToastMessage } from "./Toast";

type Step = "call" | "create-room" | "invite" | "workspace" | "brief";
type WorkspaceTab = "board" | "commitments";

interface Props {
  autoPlayDemo?: boolean;
}

export default function App({ autoPlayDemo }: Props) {
  const [step, setStep] = useState<Step>("call");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("board");
  const [orgA, setOrgA] = useState("");
  const [orgB, setOrgB] = useState("");
  const [items, setItems] = useState<AgreementItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [viewingAs, setViewingAs] = useState<"A" | "B">("A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [roomsEnabled, setRoomsEnabled] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomLinks, setRoomLinks] = useState<{ linkA: string; linkB: string } | null>(null);

  const effectiveOrgA = orgA || "Side A";
  const effectiveOrgB = orgB || "Side B";

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setRoomsEnabled(Boolean(data.roomsEnabled)))
      .catch(() => setRoomsEnabled(false));
  }, []);

  const pushToast = (text: string, tone: "navy" | "gold" = "navy") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  };

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
          orgA: effectiveOrgA,
          orgB: effectiveOrgB,
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
      setWorkspaceTab("board");
      setStep(roomsEnabled ? "create-room" : "workspace");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setCreatingRoom(true);
    setRoomError(null);
    try {
      const initialStatuses: Record<string, ItemStatus> = {};
      for (const item of items) {
        initialStatuses[item.id] = initialStatusFor(item);
      }
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgA: effectiveOrgA,
          orgB: effectiveOrgB,
          transcript: "",
          items,
          statuses: initialStatuses,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || "Could not create the room.");
      }
      const origin = window.location.origin;
      setRoomLinks({
        linkA: `${origin}/room/${data.id}?key=${data.tokenA}`,
        linkB: `${origin}/room/${data.id}?key=${data.tokenB}`,
      });
      setStep("invite");
    } catch (e) {
      setRoomError(e instanceof Error ? e.message : "Could not create the room. Please try again.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleConfirm = (id: string) => {
    const current = statuses[id];
    if (!current) return;
    const next = applyConfirm(current, viewingAs);
    setStatuses((prev) => ({ ...prev, [id]: next }));
    if (isLocked(next)) {
      pushToast("Countersigned — both sides have signed.", "gold");
    } else {
      pushToast(`Confirmed as ${viewingAs === "A" ? effectiveOrgA : effectiveOrgB}.`, "navy");
    }
  };

  const handleSaveEdit = (id: string, newText: string) => {
    setStatuses((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: applyEdit(current, viewingAs, newText) };
    });
  };

  const handleSoftAskDecision = (id: string, decision: SoftAskDecision) => {
    const item = items.find((i) => i.id === id);
    setStatuses((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const commitmentOwner = decision === "request" && item?.raised_by ? otherSide(item.raised_by) : null;
      return { ...prev, [id]: { ...current, softAskDecision: decision, commitmentOwner } };
    });
    if (decision === "request") pushToast("Marked as a commitment.", "navy");
  };

  const handleSetCommitmentDueDate = (id: string, dueDate: string) => {
    setStatuses((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, commitmentDueDate: dueDate || null } };
    });
  };

  const handleToggleDone = (id: string) => {
    setStatuses((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, done: !current.done } };
    });
  };

  const buildCommitments = (): BriefCommitment[] => {
    const commitments: BriefCommitment[] = [];
    for (const item of items) {
      const status = statuses[item.id];
      if (!status || !isLocked(status)) continue;
      const ownerLabel = effectiveOwnerLabel(item, status, effectiveOrgA, effectiveOrgB);
      if (!ownerLabel) continue;
      commitments.push({ text: item.text, ownerLabel, dueDate: effectiveDueDate(item, status) });
    }
    return commitments;
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
        body: JSON.stringify({
          orgA: effectiveOrgA,
          orgB: effectiveOrgB,
          items: resolvedItems,
          commitments: buildCommitments(),
        }),
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
      <>
        <CallIntake
          orgA={orgA}
          orgB={orgB}
          loading={loading}
          error={error}
          onChangeOrg={handleChangeOrg}
          onAnalyze={handleAnalyze}
          autoPlayDemo={autoPlayDemo}
        />
        <ToastStack toasts={toasts} />
      </>
    );
  }

  if (step === "create-room") {
    return (
      <CreateRoomScreen
        orgA={effectiveOrgA}
        orgB={effectiveOrgB}
        itemCount={items.length}
        creating={creatingRoom}
        error={roomError}
        onCreateRoom={handleCreateRoom}
        onUseDemoMode={() => setStep("workspace")}
        showDemoFallback={Boolean(roomError)}
      />
    );
  }

  if (step === "invite" && roomLinks) {
    return (
      <InvitePanel
        orgA={effectiveOrgA}
        orgB={effectiveOrgB}
        linkA={roomLinks.linkA}
        linkB={roomLinks.linkB}
        onContinue={() => {
          window.location.href = roomLinks.linkA;
        }}
      />
    );
  }

  if (step === "workspace") {
    const count = commitmentsCount(items, statuses, viewingAs, effectiveOrgA, effectiveOrgB);
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <WorkspaceHeader
          orgA={effectiveOrgA}
          orgB={effectiveOrgB}
          viewingAs={viewingAs}
          onSetViewingAs={setViewingAs}
          tab={workspaceTab}
          onSetTab={setWorkspaceTab}
          commitmentsCount={count}
          onBack={() => setStep("call")}
          demoMode={!roomsEnabled}
        />
        {workspaceTab === "board" ? (
          <AgreementBoard
            items={items}
            statuses={statuses}
            viewingAs={viewingAs}
            orgA={effectiveOrgA}
            orgB={effectiveOrgB}
            onConfirm={handleConfirm}
            onSaveEdit={handleSaveEdit}
            onSoftAskDecision={handleSoftAskDecision}
            onSetCommitmentDueDate={handleSetCommitmentDueDate}
            onGenerateBrief={handleGenerateBrief}
            briefLoading={briefLoading}
          />
        ) : (
          <CommitmentsView
            items={items}
            statuses={statuses}
            viewingAs={viewingAs}
            orgA={effectiveOrgA}
            orgB={effectiveOrgB}
            onConfirm={handleConfirm}
            onToggleDone={handleToggleDone}
          />
        )}
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  return (
    <>
      <TeamBrief orgA={effectiveOrgA} orgB={effectiveOrgB} brief={brief} onBack={() => setStep("workspace")} />
      <ToastStack toasts={toasts} />
    </>
  );
}
