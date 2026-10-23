export type TagKind = "palette" | "chariot" | "bac"

export type Tag = {
  id: string
  code: string
  kind: TagKind
  ref: string
  anchor: string
  plannedPosition: string
}

/** Placement d'un tag sur un emplacement du plan (1 tag = 1 emplacement) */
export type Placement = {
  tagId: string
  /** Horodatage ISO du dépôt */
  placedAt: string
}

export const TAG_KIND_LABEL: Record<TagKind, string> = {
  palette: "Palette",
  chariot: "Chariot",
  bac: "Bac",
}

export const TAGS: Tag[] = [
  { id: "t-1", code: "61599A75", kind: "palette", ref: "599R", anchor: "AP-TAG3", plannedPosition: "C1 proche bordure, proche E1" },
  { id: "t-2", code: "33D7160F", kind: "palette", ref: "599R", anchor: "AP-TAG5", plannedPosition: "D1 proche D2 et C2" },
  { id: "t-3", code: "34D8405", kind: "palette", ref: "599R", anchor: "AP-TAG2", plannedPosition: "D1 proche bordure E1" },
  { id: "t-4", code: "3C316AD5", kind: "chariot", ref: "599R", anchor: "AP-TAG1", plannedPosition: "C1 proche C2, B2" },
  { id: "t-5", code: "7B35730F", kind: "chariot", ref: "599R", anchor: "AP-TAG4", plannedPosition: "E1 milieu côté D1" },
]

export const TAGS_BY_ID: Record<string, Tag> = Object.fromEntries(TAGS.map((t) => [t.id, t]))

/** Placements initiaux (dates figées pour éviter tout écart d'hydratation) */
export const INITIAL_PLACEMENTS: Record<string, Placement> = {
  E1: { tagId: "t-1", placedAt: "2026-08-26T06:42:00" },
  D2: { tagId: "t-2", placedAt: "2026-08-26T06:45:00" },
  D1: { tagId: "t-3", placedAt: "2026-08-26T06:48:00" },
  C1: { tagId: "t-4", placedAt: "2026-08-26T07:15:00" },
  F1: { tagId: "t-5", placedAt: "2026-08-26T07:18:00" },
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" })

export function formatDate(iso: string) {
  return DATE_FMT.format(new Date(iso))
}

export function formatTime(iso: string) {
  return TIME_FMT.format(new Date(iso))
}
