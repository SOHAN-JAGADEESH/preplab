export default function Ring({ pct, size = 46, sw = 4 }) {
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.min(pct, 100) / 100)
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} />
        <circle className="ring-fg" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw}
          stroke="var(--lime)" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="ring-label"><b>{pct}%</b><small>PROT</small></div>
    </div>
  )
}
