export type TagKind = "palette" | "chariot" | "bac"

export type Tag = {
  id: string
  code: string
  kind: TagKind
  ref: string
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
  { id: "t-1", code: "TG-1042", kind: "palette", ref: "OF 88-201" },
  { id: "t-2", code: "TG-1043", kind: "palette", ref: "OF 88-204" },
  { id: "t-3", code: "TG-1057", kind: "palette", ref: "OF 88-209" },
  { id: "t-4", code: "TG-2011", kind: "chariot", ref: "CH-04" },
  { id: "t-5", code: "TG-2014", kind: "chariot", ref: "CH-07" },
  { id: "t-6", code: "TG-3320", kind: "bac", ref: "BAC-118" },
  { id: "t-7", code: "TG-3325", kind: "bac", ref: "BAC-131" },
  { id: "t-8", code: "TG-1061", kind: "palette", ref: "OF 88-216" },
  { id: "t-9", code: "TG-1066", kind: "palette", ref: "OF 88-222" },
  { id: "t-10", code: "TG-2019", kind: "chariot", ref: "CH-11" },
]

export const TAGS_BY_ID: Record<string, Tag> = Object.fromEntries(TAGS.map((t) => [t.id, t]))

/** Placements initiaux (dates figées pour éviter tout écart d'hydratation) */
export const INITIAL_PLACEMENTS: Record<string, Placement> = {
  C3: { tagId: "t-1", placedAt: "2026-08-26T06:42:00" },
  E2: { tagId: "t-4", placedAt: "2026-08-26T07:15:00" },
  A1: { tagId: "t-6", placedAt: "2026-08-25T21:58:00" },
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
const TIME_FMT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" })

export function formatDate(iso: string) {
  return DATE_FMT.format(new Date(iso))
}

export function formatTime(iso: string) {
  return TIME_FMT.format(new Date(iso))
}
