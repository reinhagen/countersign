"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityEntry, AgreementItem, ItemStatus, Side, SoftAskDecision } from "@/lib/types";
import { isLocked } from "@/lib/itemStatus";
import { describeActivity } from "@/lib/activityDescribe";
import RoomBanner from "./RoomBanner";
import RoomBoard from "./RoomBoard";
import RoomCommitments from "./RoomCommitments";
import ActivityPanel from "./ActivityPanel";
import CountersignedRecord from "./CountersignedRecord";
import RoomError from "./RoomError";
import ToastStack, { ToastMessage } from "../Toast";

interface Props {
  roomId: string;
  roomKey: string;
}

type Tab = "board" | "commitments" | "record";

interface RoomState {
  side: Side;
  orgA: string;
  orgB: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
  activity: ActivityEntry[];
  brief: string | null;
}

const POLL_MS = 3000;

export default function RoomView({ roomId, roomKey }: Props) {
  const [state, setState] = useState<RoomState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("board");
  const [briefLoading, setBriefLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const stateRef = useRef<RoomState | null>(null);
  const seenActivityIds = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  const pushToast = (text: string, tone: "navy" | "gold" = "navy") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  const applyIncoming = useCallback((next: RoomState) => {
    const prevSide = stateRef.current?.side ?? next.side;
    for (const entry of next.activity) {
      if (seenActivityIds.current.has(entry.id)) continue;
      seenActivityIds.current.add(entry.id);
      if (!firstLoad.current && entry.side !== prevSide) {
        const orgName = entry.side === "A" ? next.orgA : next.orgB;
        pushToast(describeActivity(entry, orgName), entry.side === "A" ? "navy" : "gold");
      }
    }
    firstLoad.current = false;
    stateRef.current = next;
    setState(next);
  }, []);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}?key=${encodeURIComponent(roomKey)}`);
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || "This link isn't valid.");
        return;
      }
      applyIncoming(data as RoomState);
      setLoadError(null);
    } catch {
      setLoadError("Could not reach the room. Check your connection and try again.");
    }
  }, [roomId, roomKey, applyIncoming]);

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  const pendingKeys = useRef<Set<string>>(new Set());

  const sendAction = async (payload: Record<string, unknown>) => {
    if (!state) return;
    // Guard against a double-click (or an impatient repeat click) firing the
    // same action twice before the first request resolves.
    const key = JSON.stringify(payload);
    if (pendingKeys.current.has(key)) return;
    pendingKeys.current.add(key);
    try {
      const res = await fetch(`/api/rooms/${roomId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: roomKey, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || "That action didn't go through.");
        return;
      }
      applyIncoming(data as RoomState);
    } catch {
      pushToast("That action didn't go through — check your connection.", "navy");
    } finally {
      pendingKeys.current.delete(key);
    }
  };

  const handleConfirm = (itemId: string) => sendAction({ type: "confirm", itemId });
  const handleSaveEdit = (itemId: string, text: string) => sendAction({ type: "edit", itemId, text });
  const handleSoftAskDecision = (itemId: string, decision: SoftAskDecision) =>
    sendAction({ type: "soft_ask_decision", itemId, decision });
  const handleSetCommitmentDueDate = (itemId: string, dueDate: string) =>
    sendAction({ type: "set_due_date", itemId, dueDate });
  const handleToggleDone = (itemId: string) => sendAction({ type: "toggle_done", itemId });

  const handleGenerateBrief = async () => {
    if (!state) return;
    setBriefLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: roomKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setState((prev) => (prev ? { ...prev, brief: data.brief } : prev));
        if (stateRef.current) stateRef.current.brief = data.brief;
      }
    } catch {
      pushToast("Could not generate the brief — try again.", "navy");
    } finally {
      setBriefLoading(false);
    }
  };

  if (loadError && !state) {
    return <RoomError message={loadError} />;
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center text-sm text-navy/40">Loading your room…</div>
    );
  }

  const myOrgName = state.side === "A" ? state.orgA : state.orgB;
  const lockedCount = state.items.filter((i) => state.statuses[i.id] && isLocked(state.statuses[i.id])).length;
  const allLocked = lockedCount === state.items.length && state.items.length > 0;

  return (
    <div>
      <RoomBanner mySide={state.side} myOrgName={myOrgName} />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="no-print mb-6">
          <h1 className="mb-4 font-serif text-2xl font-semibold tracking-wide text-navy">
            {state.orgA} <span className="text-gold">&times;</span> {state.orgB}
          </h1>
          <div className="flex flex-wrap gap-6 border-b border-gold/25">
            <TabButton label="Agreement board" active={tab === "board"} onClick={() => setTab("board")} />
            <TabButton label="My commitments" active={tab === "commitments"} onClick={() => setTab("commitments")} />
            <TabButton
              label={allLocked ? "Countersigned Record" : `Countersigned Record (${lockedCount}/${state.items.length})`}
              active={tab === "record"}
              onClick={() => allLocked && setTab("record")}
              disabled={!allLocked}
            />
          </div>
        </div>

        {loadError && (
          <div className="no-print mb-6 rounded-lg border border-amber-border bg-amber-bg px-4 py-3 text-sm text-amber">
            {loadError}
          </div>
        )}

        {tab === "board" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <RoomBoard
              items={state.items}
              statuses={state.statuses}
              mySide={state.side}
              orgA={state.orgA}
              orgB={state.orgB}
              onConfirm={handleConfirm}
              onSaveEdit={handleSaveEdit}
              onSoftAskDecision={handleSoftAskDecision}
              onSetCommitmentDueDate={handleSetCommitmentDueDate}
            />
            <div className="no-print">
              <ActivityPanel activity={state.activity} orgA={state.orgA} orgB={state.orgB} />
            </div>
          </div>
        )}

        {tab === "commitments" && (
          <RoomCommitments
            items={state.items}
            statuses={state.statuses}
            mySide={state.side}
            orgA={state.orgA}
            orgB={state.orgB}
            onConfirm={handleConfirm}
            onToggleDone={handleToggleDone}
          />
        )}

        {tab === "record" && allLocked && (
          <CountersignedRecord
            orgA={state.orgA}
            orgB={state.orgB}
            items={state.items}
            statuses={state.statuses}
            brief={state.brief}
            briefLoading={briefLoading}
            onGenerateBrief={handleGenerateBrief}
          />
        )}
      </div>

      <ToastStack toasts={toasts} />
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative pb-3 text-sm font-semibold tracking-wide transition ${
        disabled ? "cursor-not-allowed text-navy/25" : active ? "text-navy" : "text-navy/40 hover:text-navy/70"
      }`}
    >
      {label}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />}
    </button>
  );
}
