export type Slot = { id: string; x: number; y: number; w: number; h: number }

/** Dimensions du repère SVG du plan (viewBox) */
export const PLAN_VIEWBOX = { width: 640, height: 430 }

// Zone principale : colonnes A / B / C / D, 5 niveaux (bas = 1)
const MAIN_COLUMNS = [
  { letter: "A", x: 190 },
  { letter: "B", x: 237 },
  { letter: "C", x: 293 },
  { letter: "D", x: 340 },
]
/** Hauteur d'une case et jeu constant entre deux niveaux (identique A5/A4) */
const MAIN_ROW_HEIGHT = 31
const MAIN_ROW_GAP = 4
const MAIN_ROW_STEP = MAIN_ROW_HEIGHT + MAIN_ROW_GAP
const MAIN_TOP = 140

const MAIN_ROWS = [5, 4, 3, 2, 1].map((level, index) => ({
  level,
  y: MAIN_TOP + index * MAIN_ROW_STEP,
}))

const MAIN_BOTTOM = MAIN_TOP + 4 * MAIN_ROW_STEP + MAIN_ROW_HEIGHT

const MAIN_SLOTS: Slot[] = MAIN_COLUMNS.flatMap((col) =>
  MAIN_ROWS.map((row) => ({
    id: `${col.letter}${row.level}`,
    x: col.x,
    y: row.y,
    w: 45,
    h: MAIN_ROW_HEIGHT,
  })),
)

/**
 * Zone secondaire : colonnes E / F / G / H (+ I).
 * Ce ne sont pas des cases carrées : chaque colonne est faite de deux racks
 * verticaux allongés.
 *  - rack haut  : niveau 3, descend jusqu'au bas de la rangée 4 (D4)
 *  - petit espace
 *  - rack bas   : niveaux 2 et 1 accolés dans un même contour, il descend
 *                 jusqu'au bas de la rangée 1 (D1)
 */
const SIDE_WIDTH = 27
/** niveau 3 : descend jusqu'au bas de la rangée 4 */
const SIDE_TOP = { y: 142, h: MAIN_ROWS[1].y + MAIN_ROW_HEIGHT - 142 }
/** niveaux 2 + 1 accolés : descend jusqu'au bas de la rangée 1 */
const SIDE_BOTTOM = { y: MAIN_ROWS[2].y + 2, h: MAIN_BOTTOM - (MAIN_ROWS[2].y + 2) }

/**
 * `split` = les niveaux 2 et 1 sont deux racks distincts séparés par un jeu
 * (cas de la colonne H sur le plan) au lieu d'un seul contour commun.
 */
const SIDE_COLUMNS = [
  { letter: "E", x: 405, split: false },
  { letter: "F", x: 437, split: false },
  { letter: "G", x: 469, split: false },
  { letter: "H", x: 501, split: true },
]

/** jeu vertical entre H2 et H1 */
const SIDE_SPLIT_GAP = 7

/**
 * Géométrie des racks bas d'une colonne : [rack niveau 2, rack niveau 1].
 * Chaque rack a la même hauteur que la moitié d'un rack non scindé
 * (donc la même longueur que G2 / G1) ; en mode `split`, un jeu vertical
 * est simplement inséré entre les deux (H2 puis H1).
 */
function bottomRacks(col: (typeof SIDE_COLUMNS)[number]) {
  const h = SIDE_BOTTOM.h / 2
  if (col.split) {
    return [
      { level: 2, y: SIDE_BOTTOM.y, h },
      // H1 se termine au même niveau que G1 (le jeu réduit donc sa hauteur)
      { level: 1, y: SIDE_BOTTOM.y + h + SIDE_SPLIT_GAP, h: h - SIDE_SPLIT_GAP },
    ]
  }
  return [
    { level: 2, y: SIDE_BOTTOM.y, h },
    { level: 1, y: SIDE_BOTTOM.y + h, h },
  ]
}

const SIDE_SLOTS: Slot[] = SIDE_COLUMNS.flatMap((col) => [
  { id: `${col.letter}3`, x: col.x, y: SIDE_TOP.y, w: SIDE_WIDTH, h: SIDE_TOP.h },
  ...bottomRacks(col).map((rack) => ({
    id: `${col.letter}${rack.level}`,
    x: col.x,
    y: rack.y,
    w: SIDE_WIDTH,
    h: rack.h,
  })),
])

// Colonne I : 2 racks verticaux en limite de zone (I1 a la même longueur que G2)
const I_SLOTS: Slot[] = [
  { id: "I2", x: 533, y: SIDE_TOP.y, w: 24, h: SIDE_TOP.h },
  { id: "I1", x: 533, y: SIDE_BOTTOM.y, w: 24, h: SIDE_BOTTOM.h / 2 },
]

export const SLOTS: Slot[] = [...MAIN_SLOTS, ...SIDE_SLOTS, ...I_SLOTS]

/**
 * Contours jaunes réellement dessinés : les cases A→D sont individuelles,
 * les niveaux 2 et 1 des colonnes E→G partagent un seul contour, et la
 * colonne H a trois racks bien distincts (H3, H2, H1).
 */
type Outline = { key: string; x: number; y: number; w: number; h: number }

const OUTLINES: Outline[] = [
  ...MAIN_SLOTS.map((s) => ({ key: s.id, x: s.x, y: s.y, w: s.w, h: s.h })),
  ...SIDE_COLUMNS.flatMap((col) => [
    { key: `${col.letter}-top`, x: col.x, y: SIDE_TOP.y, w: SIDE_WIDTH, h: SIDE_TOP.h },
    ...(col.split
      ? bottomRacks(col).map((rack) => ({
          key: `${col.letter}${rack.level}-outline`,
          x: col.x,
          y: rack.y,
          w: SIDE_WIDTH,
          h: rack.h,
        }))
      : [{ key: `${col.letter}-bottom`, x: col.x, y: SIDE_BOTTOM.y, w: SIDE_WIDTH, h: SIDE_BOTTOM.h }]),
  ]),
  ...I_SLOTS.map((s) => ({ key: s.id, x: s.x, y: s.y, w: s.w, h: s.h })),
]

/** Petite séparation au milieu des racks bas fusionnés (E2/E1, F2/F1, G2/G1) */
const SIDE_DIVIDERS = SIDE_COLUMNS.filter((col) => !col.split).map((col) => ({
  key: `${col.letter}-divider`,
  x1: col.x,
  x2: col.x + SIDE_WIDTH,
  y: SIDE_BOTTOM.y + SIDE_BOTTOM.h / 2,
}))

// Repères géographiques des 4 angles de la zone
const MARKERS = [
  { label: "50.36608, 3.02451", cx: 163, cy: 120, bx: 40, by: 44, anchor: "start" as const },
  { label: "50.36574, 3.02486", cx: 573, cy: 120, bx: 455, by: 37, anchor: "start" as const },
  { label: "50.36596, 3.02428", cx: 163, cy: 324, bx: 18, by: 340, anchor: "start" as const },
  { label: "50.36563, 3.02460", cx: 573, cy: 330, bx: 462, by: 342, anchor: "start" as const },
]

// Poteaux / trames magenta le long des murs
const POSTS_TOP = [24, 48, 72, 96, 120, 268, 292, 356, 420, 462, 526]
const POSTS_BOTTOM = [190, 236, 268, 300, 356, 420, 462, 500, 540]

export function PlanAmp2() {
  return (
    <svg
      viewBox="0 0 640 430"
      className="h-auto w-full"
      role="img"
      aria-label="Plan de la zone AMP2 : lignes 18 et 21, emplacements A1 à I2 et coordonnées GPS des quatre angles"
      fontFamily="var(--font-sans, Arial, Helvetica, sans-serif)"
    >
      <defs>
        <pattern id="plan-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--plan-line-strong)" strokeWidth="0.7" />
        </pattern>
        <pattern id="plan-conveyor" width="7" height="14" patternUnits="userSpaceOnUse">
          <rect width="7" height="14" fill="var(--plan-paper)" />
          <rect x="0.5" y="0.5" width="6" height="13" fill="none" stroke="var(--plan-magenta)" strokeWidth="0.6" />
          <line x1="0.5" y1="7" x2="6.5" y2="7" stroke="var(--plan-magenta)" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="640" height="430" fill="var(--plan-paper)" />

      {/* ---------- fond CAO (traits gris) ---------- */}
      <g stroke="var(--plan-line)" strokeWidth="0.7" fill="none">
        <rect x="8" y="96" width="624" height="240" />
        <line x1="170" y1="96" x2="170" y2="336" />
        <line x1="576" y1="96" x2="576" y2="336" />
        <line x1="8" y1="112" x2="632" y2="112" />
        <line x1="8" y1="322" x2="632" y2="322" />
        <line x1="60" y1="112" x2="60" y2="322" />
        <line x1="600" y1="96" x2="600" y2="336" />
        <line x1="374" y1="88" x2="470" y2="88" strokeDasharray="6 4" />
        <line x1="374" y1="88" x2="374" y2="112" strokeDasharray="4 3" />
        {/* poste retourneur (gauche) */}
        <rect x="10" y="196" width="52" height="120" />
        <rect x="18" y="208" width="36" height="96" rx="18" />
        <rect x="14" y="200" width="44" height="8" />
        <rect x="14" y="304" width="44" height="8" />
        {/* massifs machine (droite) */}
        <rect x="596" y="120" width="28" height="60" />
        <rect x="596" y="184" width="28" height="40" />
        <rect x="580" y="196" width="14" height="26" />
        <rect x="536" y="286" width="30" height="34" />
        <rect x="602" y="230" width="22" height="90" />
      </g>

      {/* zones hachurées machine */}
      <g>
        <rect x="576" y="228" width="24" height="96" fill="url(#plan-hatch)" opacity="0.75" />
        <rect x="596" y="120" width="28" height="14" fill="url(#plan-hatch)" opacity="0.6" />
      </g>

      {/* poteaux magenta */}
      <g fill="none" stroke="var(--plan-magenta)" strokeWidth="0.9">
        {POSTS_TOP.map((x) => (
          <rect key={`pt-${x}`} x={x} y={106} width={10} height={12} />
        ))}
        {POSTS_BOTTOM.map((x) => (
          <rect key={`pb-${x}`} x={x} y={316} width={10} height={12} />
        ))}
        <rect x="34" y="128" width="10" height="12" />
        <rect x="34" y="178" width="10" height="12" />
        <rect x="86" y="188" width="10" height="12" />
        <rect x="86" y="290" width="10" height="12" />
      </g>

      {/* convoyeur d'alimentation (haut gauche) */}
      <rect x="8" y="98" width="142" height="16" fill="url(#plan-conveyor)" />
      <rect x="8" y="98" width="142" height="16" fill="none" stroke="var(--plan-magenta)" strokeWidth="0.8" />

      {/* cartouches d'annotation bas de plan */}
      <g>
        {[196, 240, 284, 328, 372, 416].map((x) => (
          <g key={`note-${x}`}>
            <rect x={x} y={340} width={42} height={16} fill="none" stroke="var(--plan-magenta)" strokeWidth="0.7" />
            <text x={x + 3} y={346} fontSize="3.4" fill="var(--plan-magenta)">
              ZONE DE STOCKAGE
            </text>
            <text x={x + 3} y={350.5} fontSize="3.4" fill="var(--plan-magenta)">
              PALETTES AMP2
            </text>
            <text x={x + 3} y={355} fontSize="3.4" fill="var(--plan-magenta)">
              NIVEAU 0 - REP.
            </text>
          </g>
        ))}
      </g>

      {/* ---------- lignes de production (vert) ---------- */}
      <g fill="var(--plan-green)">
        <rect x="265" y="100" width="303" height="16" />
        <rect x="148" y="176" width="32" height="146" />
        <rect x="8" y="140" width="44" height="40" />
        <rect x="8" y="322" width="44" height="26" />
      </g>
      <text x="14" y="164" fontSize="8" fill="var(--plan-ink)">
        Prehenseur
      </text>
      <text
        x="0"
        y="0"
        fontSize="8"
        fill="var(--plan-ink)"
        transform="translate(30 268) rotate(-90)"
        textAnchor="middle"
      >
        RETOURNEUR
      </text>

      {/* étiquettes de ligne */}
      <g>
        <ellipse cx="146" cy="101" rx="26" ry="9" fill="var(--plan-paper)" stroke="var(--plan-ink)" strokeWidth="0.8" />
        <text x="146" y="104" fontSize="8" textAnchor="middle" fill="var(--plan-ink)">
          Ligne 21
        </text>
        <ellipse cx="586" cy="89" rx="26" ry="9" fill="var(--plan-paper)" stroke="var(--plan-ink)" strokeWidth="0.8" />
        <text x="586" y="92" fontSize="8" textAnchor="middle" fill="var(--plan-ink)">
          Ligne 18
        </text>
      </g>

      {/* ---------- périmètre rouge de la zone ---------- */}
      <g stroke="var(--plan-red)" fill="none" strokeWidth="2.4">
        <polyline points="182,132 182,320 573,320" />
        <line x1="182" y1="132" x2="573" y2="132" />
        <line x1="573" y1="118" x2="573" y2="332" />
        <line x1="376" y1="68" x2="430" y2="68" strokeWidth="1.6" />
        <line x1="376" y1="68" x2="376" y2="78" strokeWidth="1.6" />
        <line x1="430" y1="68" x2="430" y2="78" strokeWidth="1.6" />
        {/* refends internes */}
        <line x1="234" y1="140" x2="234" y2="310" strokeWidth="2" />
        <line x1="337" y1="140" x2="337" y2="310" strokeWidth="2" />
        <line x1="150" y1="112" x2="182" y2="132" strokeWidth="2" />
      </g>

      {/* ---------- emplacements (jaune) ---------- */}
      <g>
        {OUTLINES.map((o) => (
          <rect
            key={o.key}
            x={o.x}
            y={o.y}
            width={o.w}
            height={o.h}
            fill="none"
            stroke="var(--plan-yellow)"
            strokeWidth="2"
          />
        ))}
        {SIDE_DIVIDERS.map((d) => (
          <line
            key={d.key}
            x1={d.x1}
            y1={d.y}
            x2={d.x2}
            y2={d.y}
            stroke="var(--plan-yellow)"
            strokeWidth="1.6"
          />
        ))}
        {SLOTS.map((slot) => (
          <text key={slot.id} x={slot.x + 2} y={slot.y + 8} fontSize="7" fill="var(--plan-ink)">
            {slot.id}
          </text>
        ))}
      </g>

      {/* ---------- repères GPS ---------- */}
      <g>
        {MARKERS.map((m) => (
          <g key={m.label}>
            <rect x={m.bx} y={m.by} width={178} height={34} fill="var(--plan-marker)" />
            <text
              x={m.bx + 89}
              y={m.by + 23}
              fontSize="16"
              fontWeight="700"
              textAnchor="middle"
              fill="var(--plan-marker-foreground)"
            >
              {m.label}
            </text>
            <circle cx={m.cx} cy={m.cy} r="7" fill="var(--plan-marker)" stroke="var(--plan-ink)" strokeWidth="0.8" />
          </g>
        ))}
      </g>
    </svg>
  )
}