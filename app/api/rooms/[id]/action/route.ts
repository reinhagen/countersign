import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom, sideForToken } from "@/lib/rooms";
import {
  applyConfirm,
  applyEdit,
  applySetCommitmentDueDate,
  applySoftAskDecision,
  applyToggleDone,
  initialStatusFor,
} from "@/lib/itemStatus";
import { ActivityAction, ActivityEntry, RoomView, SoftAskDecision } from "@/lib/types";

export const runtime = "nodejs";

type ActionType = "confirm" | "edit" | "soft_ask_decision" | "set_due_date" | "toggle_done";

interface ActionBody {
  key: string;
  type: ActionType;
  itemId: string;
  text?: string;
  decision?: SoftAskDecision;
  dueDate?: string;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: ActionBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const room = await getRoom(params.id);
  if (!room) {
    return NextResponse.json({ error: "This room doesn't exist or has expired." }, { status: 404 });
  }

  const side = sideForToken(room, body.key);
  if (!side) {
    return NextResponse.json({ error: "This link isn't valid for this room." }, { status: 403 });
  }

  const item = room.items.find((i) => i.id === body.itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const current = room.statuses[body.itemId] ?? initialStatusFor(item);
  const now = Date.now();
  let action: ActivityAction;
  let detail: string | undefined;

  switch (body.type) {
    case "confirm": {
      room.statuses[body.itemId] = applyConfirm(current, side);
      action = "signed";
      break;
    }
    case "edit": {
      if (typeof body.text !== "string") {
        return NextResponse.json({ error: "Missing text" }, { status: 400 });
      }
      room.statuses[body.itemId] = applyEdit(current, side, body.text);
      action = "edited";
      break;
    }
    case "soft_ask_decision": {
      room.statuses[body.itemId] = applySoftAskDecision(current, body.decision ?? null, item.raised_by);
      action = body.decision === "request" ? "marked_request" : "marked_question";
      break;
    }
    case "set_due_date": {
      room.statuses[body.itemId] = applySetCommitmentDueDate(current, body.dueDate ?? "");
      action = "set_due_date";
      detail = body.dueDate;
      break;
    }
    case "toggle_done": {
      room.statuses[body.itemId] = applyToggleDone(current);
      action = "toggled_done";
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown action type" }, { status: 400 });
  }

  const entry: ActivityEntry = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    side,
    action,
    itemId: item.id,
    itemText: item.text,
    detail,
    timestamp: now,
  };
  room.activity.push(entry);

  await saveRoom(room);

  const view: RoomView = {
    side,
    orgA: room.orgA,
    orgB: room.orgB,
    items: room.items,
    statuses: room.statuses,
    activity: room.activity,
    brief: room.brief,
  };

  return NextResponse.json(view);
}
