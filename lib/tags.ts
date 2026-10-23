export type TagKind = "palette" | "chariot" | "bac"

export type Tag = {
  id: string
  code: string
  kind: TagKind
  ref: string
  color: string
  textColor: string
}

/** Un placement = un tag posé sur un emplacement, avec un décalage dans la cellule */
export type Placement = {
  tagId: string
  slotId: string
  /** Horodatage ISO du dépôt */
  placedAt: string
  /** Décalage du pin à l'intérieur de sa cellule */
  offset?: { x: number; y: number }
}

export const TAGS: Tag[] = [
  { id: "tag3", code: "AP-TAG3", kind: "palette", ref: "61599A75 · 1633262197", color: "#ef3f36", textColor: "#ffffff" },
  { id: "tag1", code: "AP-TAG1", kind: "palette", ref: "3C316AD5 · 1009871573", color: "#347fe8", textColor: "#ffffff" },
  { id: "tag5", code: "AP-TAG5", kind: "palette", ref: "33D7160F · 869733903", color: "#ff9900", textColor: "#111111" },
  { id: "tag2", code: "AP-TAG2", kind: "palette", ref: "34D8405 · 55411717", color: "#e800e8", textColor: "#ffffff" },
  { id: "tag4", code: "AP-TAG4", kind: "palette", ref: "7B35730F · 2067100431", color: "#17df16", textColor: "#111111" },
]

export const TAGS_BY_ID: Record<string, Tag> = Object.fromEntries(TAGS.map((t) => [t.id, t]))

/** Placements initiaux : plusieurs tags peuvent partager un emplacement. */
export const INITIAL_PLACEMENTS: Record<string, Placement> = {
  tag3: { tagId: "tag3", slotId: "C1", placedAt: "2026-10-09T08:00:00", offset: { x: 0.85, y: 0.5 } },
  tag1: { tagId: "tag1", slotId: "C1", placedAt: "2026-10-09T08:05:00", offset: { x: 0.15, y: 0.15 } },
  tag5: { tagId: "tag5", slotId: "D1", placedAt: "2026-10-09T08:10:00", offset: { x: 0.15, y: 0.15 } },
  tag2: { tagId: "tag2", slotId: "D1", placedAt: "2026-10-09T08:15:00", offset: { x: 0.85, y: 0.85 } },
  tag4: { tagId: "tag4", slotId: "E1", placedAt: "2026-10-09T08:20:00", offset: { x: 0.5, y: 0.5 } },
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" })

export function formatDate(iso: string) {
  return DATE_FMT.format(new Date(iso))
}

export function formatTime(iso: string) {
  return TIME_FMT.format(new Date(iso))
}
