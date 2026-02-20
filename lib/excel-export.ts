import type { Evaluation, AccessLog } from "./types"
import { CRITERIA_LABELS, CRITERIA_KEYS } from "./types"
import { getSupervisors, getCompanies } from "./store"

type CellStyle = {
  font?: { bold?: boolean; color?: string; size?: number }
  fill?: string
  alignment?: "left" | "center" | "right"
  border?: boolean
  numberFormat?: string
}

type CellValue = {
  value: string | number
  style?: CellStyle
}

function buildXLSX(
  sheetName: string,
  title: string,
  headers: CellValue[],
  rows: CellValue[][],
  colWidths: number[]
): Blob {
  // Build an XML-based XLSX (SpreadsheetML) that Excel can open natively
  // This approach gives us full styling support without any external library

  const escXml = (s: string | number) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  // Style definitions
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="14"/><color rgb="FF1A1A2E"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><sz val="11"/><color rgb="FF333333"/><name val="Calibri"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0D9488"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF0FDF9"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border>
      <left/><right/><top/><bottom/><diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FFD1D5DB"/></left>
      <right style="thin"><color rgb="FFD1D5DB"/></right>
      <top style="thin"><color rgb="FFD1D5DB"/></top>
      <bottom style="thin"><color rgb="FFD1D5DB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
  </cellXfs>
</styleSheet>`

  // Column references
  const colRef = (i: number) => String.fromCharCode(65 + (i % 26))
  const totalCols = headers.length

  // Build sheet XML
  let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<cols>`

  colWidths.forEach((w, i) => {
    sheetXml += `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`
  })

  sheetXml += `</cols><sheetData>`

  // Title row (merged)
  sheetXml += `<row r="1" ht="30" customHeight="1">
    <c r="A1" s="1" t="inlineStr"><is><t>${escXml(title)}</t></is></c>
  </row>`

  // Subtitle row
  const now = new Date()
  const subtitle = `Gerado em ${now.toLocaleDateString("pt-BR")} as ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
  sheetXml += `<row r="2" ht="20">
    <c r="A2" s="0" t="inlineStr"><is><t>${escXml(subtitle)}</t></is></c>
  </row>`

  // Empty row
  sheetXml += `<row r="3"/>`

  // Header row (row 4)
  sheetXml += `<row r="4" ht="28" customHeight="1">`
  headers.forEach((h, i) => {
    const ref = `${colRef(i)}4`
    sheetXml += `<c r="${ref}" s="2" t="inlineStr"><is><t>${escXml(h.value)}</t></is></c>`
  })
  sheetXml += `</row>`

  // Data rows (starting from row 5)
  rows.forEach((row, ri) => {
    const rowNum = ri + 5
    const isEven = ri % 2 === 0
    sheetXml += `<row r="${rowNum}" ht="22">`
    row.forEach((cell, ci) => {
      const ref = `${colRef(ci)}${rowNum}`
      const isNumber = typeof cell.value === "number"
      const styleId = cell.style?.alignment === "center" ? "5" : isEven ? "3" : "4"

      if (isNumber) {
        sheetXml += `<c r="${ref}" s="${styleId}"><v>${cell.value}</v></c>`
      } else {
        sheetXml += `<c r="${ref}" s="${styleId}" t="inlineStr"><is><t>${escXml(cell.value)}</t></is></c>`
      }
    })
    sheetXml += `</row>`
  })

  // Summary row
  const summaryRow = rows.length + 5
  sheetXml += `<row r="${summaryRow}" ht="20">
    <c r="A${summaryRow}" s="0" t="inlineStr"><is><t>Total de registros: ${rows.length}</t></is></c>
  </row>`

  sheetXml += `</sheetData>`

  // Merge title cells
  if (totalCols > 1) {
    sheetXml += `<mergeCells count="2">
      <mergeCell ref="A1:${colRef(totalCols - 1)}1"/>
      <mergeCell ref="A2:${colRef(totalCols - 1)}2"/>
    </mergeCells>`
  }

  sheetXml += `</worksheet>`

  // Build the XLSX zip manually using the minimum required structure
  // XLSX is a ZIP containing XML files
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

  // Use JSZip-like manual ZIP creation
  // Since we can't import external libs easily, we'll use the simpler approach
  // of creating an HTML table that Excel can open with full formatting
  // This is the most reliable cross-platform approach

  // Actually, let's use an Excel-compatible HTML format that supports full styling
  const htmlExcel = buildExcelHTML(title, subtitle, headers, rows, colWidths)
  return new Blob(["\ufeff" + htmlExcel], {
    type: "application/vnd.ms-excel;charset=utf-8",
  })
}

function buildExcelHTML(
  title: string,
  subtitle: string,
  headers: CellValue[],
  rows: CellValue[][],
  colWidths: number[]
): string {
  const totalCols = headers.length

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Relatorio</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  body { font-family: Calibri, Arial, sans-serif; }
  table { border-collapse: collapse; width: 100%; }
  .title { font-size: 18pt; font-weight: bold; color: #1a1a2e; padding: 12px 8px; }
  .subtitle { font-size: 10pt; color: #64748b; padding: 4px 8px 12px; }
  .header { background-color: #0d9488; color: #ffffff; font-weight: bold; font-size: 10pt; padding: 10px 8px; border: 1px solid #0d9488; text-align: center; }
  .cell { font-size: 10pt; color: #333333; padding: 8px; border: 1px solid #e2e8f0; vertical-align: middle; }
  .cell-alt { font-size: 10pt; color: #333333; padding: 8px; border: 1px solid #e2e8f0; vertical-align: middle; background-color: #f8fafc; }
  .cell-center { text-align: center; }
  .cell-number { text-align: center; font-weight: 600; }
  .cell-high { text-align: center; font-weight: 600; color: #059669; background-color: #ecfdf5; }
  .cell-medium { text-align: center; font-weight: 600; color: #d97706; background-color: #fffbeb; }
  .cell-low { text-align: center; font-weight: 600; color: #dc2626; background-color: #fef2f2; }
  .summary { font-size: 9pt; color: #94a3b8; padding: 10px 8px; font-style: italic; }
</style>
</head>
<body>
<table>`

  // Title row
  html += `<tr><td colspan="${totalCols}" class="title">${escHtml(title)}</td></tr>`
  html += `<tr><td colspan="${totalCols}" class="subtitle">${escHtml(subtitle)}</td></tr>`
  html += `<tr><td colspan="${totalCols}" style="height:8px"></td></tr>`

  // Header row
  html += `<tr>`
  headers.forEach((h, i) => {
    html += `<td class="header" style="min-width:${colWidths[i] * 8}px">${escHtml(String(h.value))}</td>`
  })
  html += `</tr>`

  // Data rows
  rows.forEach((row, ri) => {
    const isAlt = ri % 2 !== 0
    html += `<tr>`
    row.forEach((cell) => {
      const baseClass = isAlt ? "cell-alt" : "cell"
      let cls = baseClass

      if (cell.style?.alignment === "center") {
        if (typeof cell.value === "number") {
          const v = cell.value
          if (v >= 4) cls += " cell-high"
          else if (v >= 3) cls += " cell-medium"
          else if (v > 0) cls += " cell-low"
          else cls += " cell-center"
        } else {
          cls += " cell-center"
        }
      }

      if (cell.style?.font?.color === "green") cls = baseClass + " cell-high"
      if (cell.style?.font?.color === "amber") cls = baseClass + " cell-medium"
      if (cell.style?.font?.color === "red") cls = baseClass + " cell-low"

      html += `<td class="${cls}">${escHtml(String(cell.value))}</td>`
    })
    html += `</tr>`
  })

  // Summary
  const now = new Date()
  html += `<tr><td colspan="${totalCols}" style="height:8px"></td></tr>`
  html += `<tr><td colspan="${totalCols}" class="summary">Total: ${rows.length} registro(s) | Exportado em ${now.toLocaleDateString("pt-BR")} as ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td></tr>`

  html += `</table></body></html>`
  return html
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// ==========================================
// PUBLIC EXPORT FUNCTIONS
// ==========================================

export function exportEvaluationsToExcel(evaluations: Evaluation[]): void {
  const supervisors = getSupervisors()
  const companies = getCompanies()

  const headers: CellValue[] = [
    { value: "Data" },
    { value: "Horario" },
    { value: "Empresa" },
    { value: "Supervisor" },
    { value: "Lideranca" },
    { value: "Comunicacao" },
    { value: "Respeito" },
    { value: "Organizacao" },
    { value: "Apoio a Equipe" },
    { value: "Media" },
    { value: "Classificacao" },
    { value: "Comentario" },
  ]

  const colWidths = [14, 10, 18, 18, 12, 14, 12, 14, 16, 10, 14, 40]

  const rows: CellValue[][] = evaluations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((e) => {
      const supervisor = supervisors.find((s) => s.id === e.supervisorId)
      const company = companies.find((c) => c.id === e.companyId)
      const avg =
        (e.ratings.lideranca +
          e.ratings.comunicacao +
          e.ratings.respeito +
          e.ratings.organizacao +
          e.ratings.apoioEquipe) /
        5
      const classificacao = avg >= 4 ? "Otimo" : avg >= 3 ? "Bom" : avg >= 2 ? "Regular" : "Ruim"
      const dateObj = new Date(e.createdAt)

      const ratingStyle = (v: number): CellStyle => ({
        alignment: "center",
        font: {
          color: v >= 4 ? "green" : v >= 3 ? "amber" : "red",
        },
      })

      return [
        { value: dateObj.toLocaleDateString("pt-BR") },
        { value: dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), style: { alignment: "center" } },
        { value: company?.name || "N/A" },
        { value: supervisor?.name || "N/A" },
        { value: e.ratings.lideranca, style: ratingStyle(e.ratings.lideranca) },
        { value: e.ratings.comunicacao, style: ratingStyle(e.ratings.comunicacao) },
        { value: e.ratings.respeito, style: ratingStyle(e.ratings.respeito) },
        { value: e.ratings.organizacao, style: ratingStyle(e.ratings.organizacao) },
        { value: e.ratings.apoioEquipe, style: ratingStyle(e.ratings.apoioEquipe) },
        { value: Number(avg.toFixed(1)), style: ratingStyle(avg) },
        {
          value: classificacao,
          style: {
            alignment: "center",
            font: { color: avg >= 4 ? "green" : avg >= 3 ? "amber" : "red" },
          },
        },
        { value: e.comment || "-" },
      ]
    })

  const blob = buildXLSX(
    "Avaliacoes",
    "Relatorio de Avaliacoes - Plataforma Dikma",
    headers,
    rows,
    colWidths
  )

  downloadExcel(blob, `avaliacoes_${new Date().toISOString().slice(0, 10)}.xls`)
}

export function exportLogsToExcel(logs: AccessLog[]): void {
  const headers: CellValue[] = [
    { value: "Data" },
    { value: "Horario" },
    { value: "CPF" },
    { value: "Tipo de Acao" },
    { value: "Empresa" },
  ]

  const colWidths = [14, 10, 20, 16, 20]

  const rows: CellValue[][] = logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((l) => {
      const dateObj = new Date(l.timestamp)
      const cpfFormatted = l.fullCPF
        ? l.fullCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        : l.maskedCPF
      const actionLabel =
        l.action === "login" ? "Login" : l.action === "evaluation" ? "Avaliacao" : "Admin"

      return [
        { value: dateObj.toLocaleDateString("pt-BR") },
        { value: dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), style: { alignment: "center" } },
        { value: cpfFormatted },
        {
          value: actionLabel,
          style: {
            alignment: "center",
            font: {
              color: l.action === "evaluation" ? "green" : l.action === "admin_login" ? "amber" : undefined,
            },
          },
        },
        { value: l.companyName || "-" },
      ]
    })

  const blob = buildXLSX(
    "Logs",
    "Logs de Acesso - Plataforma Dikma",
    headers,
    rows,
    colWidths
  )

  downloadExcel(blob, `logs_${new Date().toISOString().slice(0, 10)}.xls`)
}

function downloadExcel(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
