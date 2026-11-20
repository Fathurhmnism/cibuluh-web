'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/format'

type Point = { date: string; revenue: number; orders: number }

const W = 1100
const H = 260
const PAD = { top: 12, right: 8, bottom: 26, left: 72 }

function niceMax(value: number) {
  if (value <= 0) return 100000
  const pow = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= value / 4)! * pow
  return step * 4
}

function shortDate(date: string) {
  const [, m, d] = date.split('-')
  return `${Number(d)}/${Number(m)}`
}

function compactRupiah(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  if (v >= 1000) return `Rp${Math.round(v / 1000)} rb`
  return `Rp${v}`
}

/** Omzet harian (satu seri) — batang tipis, hover menampilkan detail per hari */
export default function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = niceMax(Math.max(...data.map((d) => d.revenue)))
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const slot = plotW / data.length
  const barW = Math.max(4, Math.min(24, slot - 6))
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)
  const active = hover !== null ? data[hover] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Grafik omzet harian 30 hari terakhir">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-gray-500 text-[13px]">
              {compactRupiah(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = PAD.left + i * slot + (slot - barW) / 2
          const h = Math.max(0, y(0) - y(d.revenue))
          const r = Math.min(4, barW / 2, h)
          return (
            <g key={d.date}>
              {h > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(d.revenue) + r} Q${x},${y(d.revenue)} ${x + r},${y(d.revenue)} H${x + barW - r} Q${x + barW},${y(d.revenue)} ${x + barW},${y(d.revenue) + r} V${y(0)} Z`}
                  fill={hover === i ? '#14532d' : '#15803d'}
                />
              )}
              {i % 5 === 0 || i === data.length - 1 ? (
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="fill-gray-500 text-[13px]">
                  {shortDate(d.date)}
                </text>
              ) : null}
              {/* Area hover lebih lebar dari batangnya */}
              <rect
                x={PAD.left + i * slot}
                y={PAD.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          )
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} stroke="#9ca3af" strokeWidth={1} />
      </svg>
      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${((PAD.left + hover * slot + slot / 2) / W) * 100}%`,
            transform: hover > data.length / 2 ? 'translateX(-105%)' : 'translateX(5%)',
          }}
        >
          <p className="font-medium text-gray-900">{shortDate(active.date)}</p>
          <p className="text-gray-700">{formatRupiah(active.revenue)}</p>
          <p className="text-gray-500">{active.orders} pesanan</p>
        </div>
      )}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-gray-500">Lihat sebagai tabel</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="py-1">Tanggal</th>
              <th className="py-1 text-right">Omzet</th>
              <th className="py-1 text-right">Pesanan</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((d) => d.orders > 0)
              .map((d) => (
                <tr key={d.date} className="border-t">
                  <td className="py-1">{d.date}</td>
                  <td className="py-1 text-right tabular-nums">{formatRupiah(d.revenue)}</td>
                  <td className="py-1 text-right tabular-nums">{d.orders}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
