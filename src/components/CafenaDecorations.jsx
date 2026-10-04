import React from 'react';

/**
 * Cafena Brand Stamp Logo (Iconic vintage notched seal emblem with coffee cup & stars)
 */
export function CafenaLogoStamp({ size = 48, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cafena-stamp-logo ${className}`}
      aria-label="Cafena Vintage Artisanal Seal Logo"
    >
      {/* Outer serrated notched stamp ring */}
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="4 2.5"
      />
      {/* Outer solid border */}
      <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.5" />
      {/* Inner thin ring */}
      <circle cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />

      {/* Decorative Stars */}
      <path d="M50 14 L51.5 17.5 L55 18 L52.5 20.5 L53 24 L50 22 L47 24 L47.5 20.5 L45 18 L48.5 17.5 Z" fill="var(--primary)" />
      <path d="M23 48 L24 49.5 L26 50 L24.5 51.5 L25 53.5 L23 52.5 L21 53.5 L21.5 51.5 L20 50 L22 49.5 Z" fill="var(--primary)" />
      <path d="M77 48 L78 49.5 L80 50 L78.5 51.5 L79 53.5 L77 52.5 L75 53.5 L75.5 51.5 L74 50 L76 49.5 Z" fill="var(--primary)" />

      {/* Coffee Steam */}
      <path
        d="M44 34 Q42 30 44 26"
        stroke="var(--primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M50 33 Q48 29 50 25"
        stroke="var(--primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 34 Q54 30 56 26"
        stroke="var(--primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Coffee Cup Silhouette */}
      <path
        d="M36 38 H64 C64 50 58 56 50 56 C42 56 36 50 36 38 Z"
        fill="currentColor"
      />
      {/* Cup Handle */}
      <path
        d="M63 41 C67 41 69 44 69 47 C69 50 66 52 62 52"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Saucer */}
      <path
        d="M32 58 Q50 63 68 58"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Lower Ribbon / Text Banner */}
      <text
        x="50"
        y="75"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        letterSpacing="1.8"
        fill="currentColor"
        fontFamily="var(--font-heading)"
      >
        CAFENA
      </text>
      <text
        x="50"
        y="83"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="700"
        letterSpacing="1.2"
        fill="var(--primary)"
        fontFamily="var(--font-heading)"
      >
        EST. 2023
      </text>
    </svg>
  );
}

/**
 * Characteristic Curved Golden Brush Stroke (from Cafena hero banner)
 */
export function CafenaBrushStroke({ className = '' }) {
  return (
    <svg
      viewBox="0 0 340 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cafena-brush-stroke ${className}`}
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', maxWidth: '320px', height: '18px' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cafenaBrushGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c7a17a" stopOpacity="0.2" />
          <stop offset="15%" stopColor="#c7a17a" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#d8b28a" stopOpacity="0.95" />
          <stop offset="85%" stopColor="#c7a17a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#b6895b" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d="M4 14 C45 7, 110 5, 170 8 C230 11, 290 19, 336 21 C310 24, 250 20, 185 16 C120 12, 65 19, 4 14 Z"
        fill="url(#cafenaBrushGrad)"
      />
      {/* Textured secondary dry-brush bristle path */}
      <path
        d="M20 18 C70 12, 140 10, 210 13 C260 15, 305 20, 325 22"
        stroke="#c7a17a"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="40 12 60 8 30 15"
        opacity="0.8"
      />
      <path
        d="M35 11 C85 6, 150 7, 215 11 C265 14, 295 17, 310 19"
        stroke="#b6895b"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="25 15 50 10"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Botanical Coffee Branch with Cherries & Leaves (Engraving Sketch Style from Cafena bottom-left)
 */
export function BotanicalBranchSketch({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sketch-bg-coffee-branch ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.32">
        {/* Main Branch Stem */}
        <path d="M10 370 Q120 300 230 180 T380 40" strokeWidth="2.8" />
        <path d="M110 305 Q170 340 220 360" strokeWidth="2" />
        <path d="M210 205 Q280 230 330 250" strokeWidth="2" />
        <path d="M170 245 Q120 220 70 210" strokeWidth="1.8" />

        {/* Coffee Leaf 1 (Large bottom-left) */}
        <path d="M70 210 C50 160 80 120 120 100 C130 140 110 180 70 210 Z" />
        {/* Leaf 1 internal veins */}
        <path d="M70 210 Q95 155 120 100" />
        <path d="M85 185 Q95 175 105 180" />
        <path d="M92 165 Q105 155 115 160" />
        <path d="M78 195 Q70 185 65 170" />
        <path d="M85 175 Q78 165 72 150" />

        {/* Coffee Leaf 2 (Mid-branch right) */}
        <path d="M210 205 C260 180 300 190 340 160 C320 210 270 230 210 205 Z" />
        <path d="M210 205 Q275 195 340 160" />
        <path d="M245 200 Q260 185 275 188" />
        <path d="M275 190 Q290 175 305 178" />
        <path d="M250 208 Q260 220 275 222" />
        <path d="M280 198 Q290 210 305 212" />

        {/* Coffee Leaf 3 (Top tip) */}
        <path d="M310 105 C340 60 370 50 395 35 C380 70 350 95 310 105 Z" />
        <path d="M310 105 Q352 70 395 35" />

        {/* Coffee Cherries / Berries Cluster (Etched circles with shading hatching) */}
        {/* Berry 1 */}
        <ellipse cx="160" cy="250" rx="22" ry="26" transform="rotate(-15 160 250)" />
        <path d="M152 240 Q158 244 165 242" strokeWidth="1" />
        <path d="M148 248 Q156 254 168 250" strokeWidth="0.8" />
        <path d="M150 256 Q158 262 166 258" strokeWidth="0.8" />

        {/* Berry 2 */}
        <ellipse cx="195" cy="225" rx="20" ry="24" transform="rotate(20 195 225)" />
        <path d="M188 218 Q194 222 201 220" strokeWidth="1" />
        <path d="M185 225 Q193 230 203 226" strokeWidth="0.8" />

        {/* Berry 3 */}
        <ellipse cx="145" cy="285" rx="18" ry="22" transform="rotate(-30 145 285)" />
        <path d="M138 280 Q144 283 150 282" strokeWidth="0.8" />

        {/* Berry 4 */}
        <ellipse cx="180" cy="275" rx="19" ry="23" transform="rotate(10 180 275)" />
        <path d="M174 270 Q180 274 186 272" strokeWidth="0.8" />

        {/* Berry 5 */}
        <ellipse cx="225" cy="180" rx="17" ry="20" transform="rotate(45 225 180)" />

        {/* Shading Hatching Lines (Authentic copperplate engraving feel) */}
        <path d="M15 365 L25 360 M20 370 L30 365 M28 355 L38 350 M35 360 L45 355" strokeWidth="0.8" />
        <path d="M95 195 L102 188 M102 200 L110 193 M110 185 L118 178" strokeWidth="0.7" />
        <path d="M225 215 L232 208 M235 220 L242 213 M245 215 L252 208" strokeWidth="0.7" />
      </g>
    </svg>
  );
}

/**
 * Parisian Street Cafe Patio Terrace Line Sketch (from Cafena bottom-right)
 */
export function CafePatioSketch({ className = '' }) {
  return (
    <svg
      viewBox="0 0 460 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sketch-bg-cafe-patio ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.28">
        {/* Cafe Awning Canopy */}
        <path d="M20 100 L440 20 L440 60 L20 140 Z" />
        {/* Scalloped edge of awning */}
        <path d="M20 140 Q40 145 60 135 Q80 145 100 130 Q120 140 140 125 Q160 135 180 120 Q200 130 220 115 Q240 125 260 110 Q280 120 300 105 Q320 115 340 100 Q360 110 380 95 Q400 105 420 90 Q430 95 440 85" strokeWidth="1.5" />
        {/* Awning stripes */}
        <path d="M80 85 L80 135 M140 70 L140 125 M200 55 L200 115 M260 40 L260 105 M320 30 L320 98 M380 25 L380 92" strokeWidth="1" strokeDasharray="3 3" />

        {/* Large Patio Umbrella / Parasol */}
        <path d="M260 60 Q340 40 420 90 L340 140 Z" />
        <path d="M340 140 L340 280" strokeWidth="2" />
        {/* Parasol Ribs */}
        <path d="M340 60 L340 140" strokeWidth="1" />
        <path d="M300 52 L340 140" strokeWidth="1" />
        <path d="M380 72 L340 140" strokeWidth="1" />

        {/* Round Bistro Table 1 */}
        <ellipse cx="340" cy="280" rx="42" ry="14" />
        {/* Table Leg & Base */}
        <path d="M340 294 L340 350 M320 350 L360 350 M325 350 L340 335 L355 350" strokeWidth="1.6" />
        {/* Coffee Cup on Table */}
        <ellipse cx="335" cy="277" rx="6" ry="2.5" />
        <path d="M331 277 L331 273 Q335 271 339 273 L339 277" />

        {/* Bistro Chair Left */}
        <path d="M275 250 Q285 240 295 250 L295 285 L275 285 Z" />
        <path d="M275 285 L270 350 M295 285 L300 350" strokeWidth="1.5" />
        <path d="M285 240 L285 285" strokeWidth="1" strokeDasharray="2 2" />

        {/* Bistro Chair Right */}
        <path d="M385 250 Q395 240 405 250 L405 285 L385 285 Z" />
        <path d="M385 285 L380 350 M405 285 L410 350" strokeWidth="1.5" />
        <path d="M395 240 L395 285" strokeWidth="1" strokeDasharray="2 2" />

        {/* Background Bistro Window & Door Arch */}
        <path d="M50 135 L50 290 Q50 310 70 310 L160 310 Q180 310 180 290 L180 115" strokeWidth="1.4" />
        <path d="M50 190 L180 165" strokeWidth="1" />
        <path d="M115 130 L115 310" strokeWidth="1" />

        {/* Pavement Stones / Cobblestones Perspective */}
        <path d="M100 355 L440 355" strokeWidth="1" />
        <path d="M150 365 L440 365" strokeWidth="0.8" />
        <path d="M200 375 L440 375" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

/**
 * Top-left Delicate Steaming Coffee Cup Sketch (from Cafena top-left)
 */
export function CoffeeCupSketch({ className = '' }) {
  return (
    <svg
      viewBox="0 0 180 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sketch-bg-coffee-cup ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.25">
        {/* Steam */}
        <path d="M70 35 Q65 20 70 10 Q75 0 70 -5" />
        <path d="M85 30 Q80 15 85 5" />
        <path d="M100 35 Q95 20 100 10" />

        {/* Cup Rim Ellipse */}
        <ellipse cx="85" cy="50" rx="42" ry="12" strokeWidth="1.5" />
        <ellipse cx="85" cy="52" rx="36" ry="9" strokeWidth="0.9" />

        {/* Cup Body */}
        <path d="M43 50 C43 85 58 100 85 100 C112 100 127 85 127 50" strokeWidth="1.5" />

        {/* Handle */}
        <path d="M125 58 C145 60 148 78 123 85" strokeWidth="1.6" />

        {/* Saucer */}
        <ellipse cx="85" cy="104" rx="65" ry="16" strokeWidth="1.6" />
        <ellipse cx="85" cy="108" rx="55" ry="12" strokeWidth="1" />

        {/* Shading Hatching */}
        <path d="M52 75 L58 70 M55 82 L62 76 M60 88 L68 82 M67 93 L75 87" strokeWidth="0.7" />
      </g>
    </svg>
  );
}
