import { ActivityEntry } from "./types";

export function describeActivity(entry: ActivityEntry, orgName: string): string {
  switch (entry.action) {
    case "room_created":
      return "Room created";
    case "signed":
      return `${orgName} signed: ${entry.itemText ?? "an item"}`;
    case "edited":
      return `${orgName} edited: ${entry.itemText ?? "an item"}`;
    case "marked_request":
      return `${orgName} marked as a commitment: ${entry.itemText ?? "an item"}`;
    case "marked_question":
      return `${orgName} left as just a question: ${entry.itemText ?? "an item"}`;
    case "set_due_date":
      return `${orgName} set a due date${entry.detail ? ` (${entry.detail})` : ""}: ${entry.itemText ?? "an item"}`;
    case "toggled_done":
      return `${orgName} checked off: ${entry.itemText ?? "an item"}`;
    case "generated_brief":
      return `${orgName} generated the team brief`;
    default:
      return `${orgName} took an action`;
  }
}
