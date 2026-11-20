import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { exportOrders } from '@/lib/admin/queries'
import { STATUS_LABEL } from '@/lib/orders/status'
import type { Order } from '@/lib/orders/types'
import { errorResponse } from '@/lib/http'

const COLUMNS: { header: string; key: string; width: number; value: (o: Order) => string | number }[] = [
  { header: 'No. Pesanan', key: 'no', width: 20, value: (o) => o.orderNumber },
  {
    header: 'Tanggal (WIB)',
    key: 'tanggal',
    width: 18,
    value: (o) =>
      new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta', dateStyle: 'short', timeStyle: 'short' }).format(
        o.createdAt
      ),
  },
  { header: 'Status', key: 'status', width: 12, value: (o) => STATUS_LABEL[o.status] },
  { header: 'Nama', key: 'nama', width: 22, value: (o) => o.customer.name },
  { header: 'Email', key: 'email', width: 26, value: (o) => o.customer.email },
  { header: 'No. HP', key: 'hp', width: 15, value: (o) => o.customer.phone },
  {
    header: 'Produk',
    key: 'produk',
    width: 40,
    value: (o) => o.items.map((i) => `${i.name} x${i.quantity}${i.unit === 'kg' ? ' kg' : ''}`).join('; '),
  },
  { header: 'Berat (kg)', key: 'berat', width: 10, value: (o) => o.weightKg },
  { header: 'Subtotal', key: 'subtotal', width: 12, value: (o) => o.subtotal },
  { header: 'Kurir', key: 'kurir', width: 16, value: (o) => `${o.shipping.courierName} ${o.shipping.service}` },
  { header: 'Ongkir', key: 'ongkir', width: 10, value: (o) => o.shipping.cost },
  { header: 'Total', key: 'total', width: 12, value: (o) => o.total },
  { header: 'Kab/Kota', key: 'kota', width: 22, value: (o) => o.address.regencyName },
  { header: 'Provinsi', key: 'provinsi', width: 18, value: (o) => o.address.provinceName },
  { header: 'No. Resi', key: 'resi', width: 18, value: (o) => o.tracking?.awb ?? '' },
]

function csvCell(value: string | number) {
  const text = String(value)
  // Cegah formula injection saat dibuka di spreadsheet
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const format = params.get('format') === 'xlsx' ? 'xlsx' : 'csv'
  try {
    const orders = await exportOrders({
      status: params.get('status') ?? undefined,
      q: params.get('q') ?? undefined,
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
    })
    const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
    const filename = `pesanan-cibulu-${stamp}.${format}`

    if (format === 'csv') {
      const lines = [
        COLUMNS.map((c) => csvCell(c.header)).join(','),
        ...orders.map((o) => COLUMNS.map((c) => csvCell(c.value(o))).join(',')),
      ]
      // BOM agar Excel membaca UTF-8 dengan benar
      return new NextResponse('﻿' + lines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Pesanan')
    sheet.columns = COLUMNS.map(({ header, key, width }) => ({ header, key, width }))
    for (const o of orders) {
      sheet.addRow(Object.fromEntries(COLUMNS.map((c) => [c.key, c.value(o)])))
    }
    sheet.getRow(1).font = { bold: true }
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    for (const key of ['subtotal', 'ongkir', 'total']) {
      sheet.getColumn(key).numFmt = '"Rp"#,##0'
    }
    const buffer = await workbook.xlsx.writeBuffer()
    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return errorResponse(error, 'admin/orders/export')
  }
}
