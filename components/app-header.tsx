import Image from "next/image"

export function AppHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-aodt-red pb-3">
      <div className="flex items-center gap-4">
        <h1 className="font-sans text-3xl font-extrabold uppercase leading-none tracking-[0.18em] text-aodt-navy md:text-4xl">
          Ampere
        </h1>

        <span aria-hidden="true" className="h-9 w-px bg-border md:h-11" />

        <Image
          src="/images/aodt.png"
          alt="AODT — smart tracking, smarter decisions"
          width={2530}
          height={790}
          className="h-9 w-auto object-contain md:h-11"
          priority
        />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
       Batiment 1 — Ampere / niv-0
      </p>
    </header>
  )
}
