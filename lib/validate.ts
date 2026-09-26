import { AgreementItem, Category } from "./types";

const CATEGORIES: Category[] = ["agreed", "mismatch", "one_sided", "soft_ask"];

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

export function parseReconcileJson(raw: string): AgreementItem[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return null;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  const arr = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { items?: unknown })?.items)
    ? (parsed as { items: unknown[] }).items
    : null;

  if (!arr) return null;

  const items: AgreementItem[] = [];
  for (const raw of arr) {
    if (typeof raw !== "object" || raw === null) return null;
    const o = raw as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.text !== "string") return null;
    if (typeof o.category !== "string" || !CATEGORIES.includes(o.category as Category)) return null;
    if (!isNullableString(o.side_a_version ?? null)) return null;
    if (!isNullableString(o.side_b_version ?? null)) return null;
    if (!isNullableString(o.owner ?? null)) return null;
    if (!isNullableString(o.due_date ?? null)) return null;
    if (o.clarification_question !== undefined && !isNullableString(o.clarification_question)) return null;

    items.push({
      id: o.id,
      text: o.text,
      category: o.category as Category,
      side_a_version: (o.side_a_version as string | null) ?? null,
      side_b_version: (o.side_b_version as string | null) ?? null,
      owner: (o.owner as string | null) ?? null,
      due_date: (o.due_date as string | null) ?? null,
      clarification_question: (o.clarification_question as string | null | undefined) ?? null,
    });
  }

  if (items.length === 0) return null;
  return items;
}
