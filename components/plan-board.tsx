"use client"

import { useMemo, useState } from "react"
import { PLAN_VIEWBOX, PlanAmp2, SLOTS } from "@/components/plan-amp2"
import {
  INITIAL_PLACEMENTS,
  TAGS,
  TAGS_BY_ID,
  formatDate,
  formatTime,
  type Placement,
} from "@/lib/tags"

export function PlanBoard() {
  /** Indexé par tagId : un slot peut contenir plusieurs tags */
  const [placements, setPlacements] = useState<Record<string, Placement>>(INITIAL_PLACEMENTS)
  const [armedTagId, setArmedTagId] = useState<string | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const placementsBySlot = useMemo(() => {
    const map: Record<string, Placement[]> = {}
    for (const p of Object.values(placements)) {
      ;(map[p.slotId] ??= []).push(p)
    }
    return map
  }, [placements])

  const pool = TAGS.filter((t) => !placements[t.id])
  const placedList = Object.values(placements)
    .map((p) => ({ tag: TAGS_BY_ID[p.tagId], placement: p }))
    .sort((a, b) => (a.placement.placedAt < b.placement.placedAt ? 1 : -1))

  function placeTag(tagId: string, slotId: string) {
    setPlacements((prev) => ({
      ...prev,
      [tagId]: { tagId, slotId, placedAt: new Date().toISOString() },
    }))
    setArmedTagId(null)
    setSelectedSlot(slotId)
  }

  function removeTag(tagId: string) {
    setPlacements((prev) => {
      const next = { ...prev }
      delete next[tagId]
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
              const slotPlacements = placementsBySlot[slot.id] ?? []
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
                      slotPlacements.length > 0
                        ? `Emplacement ${slot.id} — ${slotPlacements.length} tag(s) : ${slotPlacements
                            .map((p) => TAGS_BY_ID[p.tagId].code)
                            .join(", ")}`
                        : `Emplacement ${slot.id} — libre`
                    }
                    className={`group absolute inset-0 transition-colors ${
                      isTarget
                        ? "bg-aodt-red/20 ring-2 ring-aodt-red"
                        : isSelected
                          ? "ring-2 ring-aodt-navy"
                          : armedTagId
                            ? "hover:bg-aodt-navy/10"
                            : ""
                    }`}
                  >
                    {slotPlacements.map((placement) => {
                      const tag = TAGS_BY_ID[placement.tagId]
                      return (
                        <span
                          key={placement.tagId}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation()
                            e.dataTransfer.setData("text/plain", tag.id)
                          }}
                          className="group/pin absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center p-2 active:cursor-grabbing"
                          style={{
                            left: `${(placement.offset?.x ?? 0.5) * 100}%`,
                            top: `${(placement.offset?.y ?? 0.5) * 100}%`,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="block size-[9px] rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: tag.color }}
                          />

                          {/* info-bulle au survol */}
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-left shadow-md group-hover/pin:block">
                            <span className="block font-mono text-[10px] font-bold text-popover-foreground">
                              {tag.code} · {slot.id}
                            </span>
                            <span className="block font-mono text-[9px] text-muted-foreground">
                              {formatDate(placement.placedAt)} — {formatTime(placement.placedAt)}
                            </span>
                          </span>
                        </span>
                      )
                    })}
                    {slotPlacements.length === 0 && <span className="sr-only">Libre</span>}
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
                    <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />
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
            {placedList.map(({ tag, placement }) => (
              <li key={placement.tagId} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onMouseEnter={() => setSelectedSlot(placement.slotId)}
                  onClick={() => setSelectedSlot(placement.slotId)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-[4px] font-mono text-[10px] font-bold"
                    style={{ backgroundColor: tag.color, color: tag.textColor }}
                  >
                    {placement.slotId}
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate font-mono text-[11px] font-bold text-foreground">
                      Tag {tag.code} positionné à {placement.slotId}
                    </span>
                    <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                      le {formatDate(placement.placedAt)} à {formatTime(placement.placedAt)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeTag(placement.tagId)}
                  aria-label={`Retirer le tag ${tag.code} de l'emplacement ${placement.slotId}`}
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

