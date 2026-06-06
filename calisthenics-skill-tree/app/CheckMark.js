// Animated SVG checkmark: a ring that scales in and a check stroke that "draws"
// itself. Presentational + reusable (overlay celebration + tree node badge).
// `draw` toggles the animation; when false it renders the final, static state.
export default function CheckMark({ size = 84, ring = '#09c0b7', check = '#22c55e', draw = true, strokeWidth = 4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke={ring}
        strokeWidth={strokeWidth}
        className={draw ? 'cc-ring' : undefined}
      />
      <path
        d="M14 27 l8 8 l16 -18"
        pathLength="1"
        fill="none"
        stroke={check}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={draw ? 'cc-check' : undefined}
      />
    </svg>
  );
}
