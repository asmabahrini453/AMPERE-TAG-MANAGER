"use client"

import { useMemo, useState } from "react"
import { PLAN_VIEWBOX, PlanAmp2, SLOTS } from "@/components/plan-amp2"
import {
  INITIAL_PLACEMENTS,
  TAGS,
  TAGS_BY_ID,
  TAG_KIND_LABEL,
  formatDate,
  formatTime,
  type Placement,
  type Tag,
} from "@/lib/tags"

const KIND_STYLES: Record<Tag["kind"], { chip: string; dot: string; text: string }> = {
  palette: { chip: "bg-aodt-navy text-white", dot: "bg-aodt-navy", text: "text-aodt-navy" },
  chariot: { chip: "bg-aodt-red text-white", dot: "bg-aodt-red", text: "text-aodt-red" },
  bac: { chip: "bg-foreground text-background", dot: "bg-foreground", text: "text-foreground" },
}

const TAG_COLOR_STYLES: Record<Tag["color"], { chip: string; dot: string }> = {
  bleu: { chip: "bg-blue-800 text-white", dot: "bg-blue-800" },
  orange: { chip: "bg-orange-500 text-black", dot: "bg-orange-500" },
  violet: { chip: "bg-purple-600 text-white", dot: "bg-purple-600" },
  vert: { chip: "bg-green-700 text-white", dot: "bg-green-700" },
  rouge: { chip: "bg-red-600 text-white", dot: "bg-red-600" },
}

export function PlanBoard() {
  const [placements, setPlacements] = useState<Record<string, Placement>>(INITIAL_PLACEMENTS)
  const [armedTagId, setArmedTagId] = useState<string | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const slotByTag = useMemo(() => {
    const map: Record<string, string> = {}
    for (const [slotId, p] of Object.entries(placements)) map[p.tagId] = slotId
    return map
  }, [placements])

  const pool = TAGS.filter((t) => !slotByTag[t.id])
  const placedList = Object.entries(placements)
    .map(([slotId, p]) => ({ slotId, tag: TAGS_BY_ID[p.tagId], placedAt: p.placedAt }))
    .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1))

  function placeTag(tagId: string, slotId: string) {
    setPlacements((prev) => {
      const next = { ...prev }
      const previousSlot = Object.keys(next).find((s) => next[s].tagId === tagId)
      if (previousSlot) delete next[previousSlot]
      next[slotId] = { tagId, placedAt: new Date().toISOString() }
      return next
    })
    setArmedTagId(null)
    setSelectedSlot(slotId)
  }

  function removeTag(slotId: string) {
    setPlacements((prev) => {
      const next = { ...prev }
      delete next[slotId]
      return next
    })
    setSelectedSlot(null)
  }

  function handleSlotClick(slotId: string) {
    if (armedTagId) {
      placeTag(armedTagId, slotId)
      return
    }
    setSelectedSlot((prev) => (prev === slotId ? null : slotId))
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* ---------------- plan + calque de pins ---------------- */}
      <section className="relative min-w-0 flex-1 rounded-lg border border-border bg-card">
        <div className="relative">
          <PlanAmp2 />

          <div className="absolute inset-0">
            {SLOTS.map((slot) => {
              const placement = placements[slot.id]
              const tag = placement ? TAGS_BY_ID[placement.tagId] : null
              const isTarget = dragOverSlot === slot.id
              const isSelected = selectedSlot === slot.id

              return (
                <div
                  key={slot.id}
                  className="absolute"
                  style={{
                    left: `${(slot.x / PLAN_VIEWBOX.width) * 100}%`,
                    top: `${(slot.y / PLAN_VIEWBOX.height) * 100}%`,
                    width: `${(slot.w / PLAN_VIEWBOX.width) * 100}%`,
                    height: `${(slot.h / PLAN_VIEWBOX.height) * 100}%`,
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverSlot(slot.id)
                  }}
                  onDragLeave={() => setDragOverSlot((prev) => (prev === slot.id ? null : prev))}
                  onDrop={(e) => {
                    e.preventDefault()
                    const tagId = e.dataTransfer.getData("text/plain")
                    setDragOverSlot(null)
                    if (tagId) placeTag(tagId, slot.id)
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSlotClick(slot.id)}
                    aria-label={
                      tag
                        ? `Emplacement ${slot.id} — tag ${tag.code}, posé le ${formatDate(placement!.placedAt)} à ${formatTime(placement!.placedAt)} — ${tag.plannedPosition}`
                        : `Emplacement ${slot.id} — libre`
                    }
                    draggable={Boolean(tag)}
                    onDragStart={(e) => {
                      if (tag) e.dataTransfer.setData("text/plain", tag.id)
                    }}
                    className={`group absolute inset-0 flex items-center justify-center transition-colors ${
                      isTarget
                        ? "bg-aodt-red/20 ring-2 ring-aodt-red"
                        : isSelected
                          ? "ring-2 ring-aodt-navy"
                          : armedTagId
                            ? "hover:bg-aodt-navy/10"
                            : ""
                    }`}
                  >
                    {tag && placement ? (
                      <span className="flex flex-col items-center leading-none">
                        <span
                          className={`flex flex-col items-center rounded-[3px] px-[3px] py-[2px] shadow-sm ${TAG_COLOR_STYLES[tag.color].chip}`}
                        >
                          <span className="font-mono text-[7.5px] font-bold tracking-tight">{tag.code}</span>
                          <span className="font-mono text-[7px] tabular-nums opacity-80">
                            {formatTime(placement.placedAt)}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`-mt-[2px] size-[5px] rotate-45 ${TAG_COLOR_STYLES[tag.color].dot}`}
                        />

                        {/* info-bulle au survol */}
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-left shadow-md group-hover:block">
                          <span className="block font-mono text-[10px] font-bold text-popover-foreground">
                            {tag.code} · {slot.id}
                          </span>
                          
                          <span className="block font-mono text-[9px] text-muted-foreground">
                            {formatDate(placement.placedAt)} — {formatTime(placement.placedAt)}
                          </span>
                          <span className="block max-w-[220px] truncate font-mono text-[9px] text-muted-foreground">
                            {tag.anchor} · {tag.plannedPosition}
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span className="sr-only">Libre</span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* barre d'état sous le plan */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {armedTagId
              ? `Tag ${TAGS_BY_ID[armedTagId].code} armé — touchez un emplacement`
              : "Glissez un tag depuis la liste vers un emplacement"}
          </p>
          <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {placedList.length}/{TAGS.length} tags positionnés
          </p>
        </div>
      </section>

      {/* ---------------- panneau des tags ---------------- */}
      <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-foreground">Tags en attente</h2>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pool.length}</span>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {pool.map((tag) => {
              const armed = armedTagId === tag.id
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", tag.id)}
                    onClick={() => setArmedTagId((prev) => (prev === tag.id ? null : tag.id))}
                    className={`flex cursor-grab items-center gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors active:cursor-grabbing ${
                      armed ? "border-aodt-red bg-aodt-red/10" : "border-border bg-background hover:border-aodt-navy"
                    }`}
                  >
                    <span aria-hidden="true" className={`size-2 rounded-full ${TAG_COLOR_STYLES[tag.color].dot}`} />
                    <span className="font-mono text-[11px] font-bold text-foreground">{tag.code}</span>
                  </button>
                </li>
              )
            })}
            {pool.length === 0 && (
              <li className="font-mono text-[11px] text-muted-foreground">Tous les tags sont positionnés.</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-foreground">Positionnés</h2>
            {placedList.length > 0 && (
              <button
                type="button"
                onClick={() => setPlacements({})}
                className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground underline decoration-dotted hover:text-aodt-red"
              >
                Tout retirer
              </button>
            )}
          </div>

          <ul className="mt-3 flex flex-col divide-y divide-border">
            {placedList.map(({ slotId, tag, placedAt }) => (
              <li key={slotId} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onMouseEnter={() => setSelectedSlot(slotId)}
                  onClick={() => setSelectedSlot(slotId)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-[4px] font-mono text-[10px] font-bold ${TAG_COLOR_STYLES[tag.color].chip}`}
                  >
                    {slotId}
                  </span>
                                   <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate font-mono text-[11px] font-bold text-foreground">
                      Tag {tag.code} positionné à {slotId}
                    </span>
                    <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                      le {formatDate(placedAt)} à {formatTime(placedAt)} · {tag.anchor}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeTag(slotId)}
                  aria-label={`Retirer le tag ${tag.code} de l'emplacement ${slotId}`}
                  className="shrink-0 rounded-md border border-border px-1.5 py-1 font-mono text-[10px] text-muted-foreground hover:border-aodt-red hover:text-aodt-red"
                >
                  ✕
                </button>
              </li>
            ))}
            {placedList.length === 0 && (
              <li className="font-mono text-[11px] text-muted-foreground">Aucun tag sur le plan.</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  )
}
