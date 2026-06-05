// Shimmering placeholder block. Compose several to mimic a page's layout.
export default function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}
