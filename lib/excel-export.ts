import type { Evaluation, AccessLog } from "./types"
import { getSupervisors, getCompanies } from "./store"

function escHtml(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function ratingColor(v: number): { bg: string; text: string; label: string } {
  if (v >= 4) return { bg: "#ecfdf5", text: "#059669", label: "Otimo" }
  if (v >= 3) return { bg: "#fffbeb", text: "#d97706", label: "Bom" }
  if (v >= 2) return { bg: "#fff7ed", text: "#ea580c", label: "Regular" }
  return { bg: "#fef2f2", text: "#dc2626", label: "Ruim" }
}

function buildEvalData(evaluations: Evaluation[]) {
  const supervisors = getSupervisors()
  const companies = getCompanies()
  return evaluations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((e) => {
      const supervisor = supervisors.find((s) => s.id === e.supervisorId)
      const company = companies.find((c) => c.id === e.companyId)
      const avg = (e.ratings.lideranca + e.ratings.comunicacao + e.ratings.respeito + e.ratings.organizacao + e.ratings.apoioEquipe) / 5
      const dateObj = new Date(e.createdAt)
      return {
        data: dateObj.toLocaleDateString("pt-BR"),
        horario: dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        empresa: company?.name || "N/A",
        supervisor: supervisor?.name || "N/A",
        lideranca: e.ratings.lideranca,
        comunicacao: e.ratings.comunicacao,
        respeito: e.ratings.respeito,
        organizacao: e.ratings.organizacao,
        apoio: e.ratings.apoioEquipe,
        media: Number(avg.toFixed(1)),
        classificacao: ratingColor(avg).label,
        comentario: e.comment || "-",
      }
    })
}

// ==========================================
// EXCEL EXPORT
// ==========================================

export function exportEvaluationsToExcel(evaluations: Evaluation[]): void {
  const rows = buildEvalData(evaluations)
  const now = new Date()

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet><x:Name>Relatorio de Avaliacoes</x:Name><x:WorksheetOptions><x:FreezePanes/><x:FrozenNoSplit/><x:SplitHorizontal>4</x:SplitHorizontal><x:TopRowBottomPane>4</x:TopRowBottomPane><x:ActivePane>2</x:ActivePane></x:WorksheetOptions></x:ExcelWorksheet>
<x:ExcelWorksheet><x:Name>Resumo</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
</x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml><![endif]-->
<style>
  @page { margin: 0.5in; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 6px 10px; }
  .title-row td { font-size: 16pt; font-weight: bold; color: #0f172a; padding: 14px 10px 4px; border: none; }
  .subtitle-row td { font-size: 9pt; color: #64748b; padding: 2px 10px 14px; border: none; }
  .hdr { background: #0d9488; color: #ffffff; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #0d9488; padding: 10px 8px; }
  .c { border: 1px solid #e2e8f0; vertical-align: middle; font-size: 10pt; color: #1e293b; }
  .ca { text-align: center; }
  .w0 { background: #ffffff; }
  .w1 { background: #f8fafc; }
  .hi { font-weight: 600; color: #059669; background: #ecfdf5; text-align: center; }
  .md { font-weight: 600; color: #d97706; background: #fffbeb; text-align: center; }
  .lo { font-weight: 600; color: #dc2626; background: #fef2f2; text-align: center; }
  .rg { font-weight: 600; color: #ea580c; background: #fff7ed; text-align: center; }
  .wrap { word-wrap: break-word; max-width: 300px; }
  .sep td { height: 6px; border: none; }
  .foot td { font-size: 8pt; color: #94a3b8; font-style: italic; padding: 12px 10px 4px; border: none; }
  .conf td { font-size: 8pt; color: #cbd5e1; padding: 2px 10px; border: none; }
  .sum-title td { font-size: 14pt; font-weight: bold; color: #0f172a; padding: 14px 10px 4px; border: none; }
  .sum-sub td { font-size: 9pt; color: #64748b; padding: 2px 10px 14px; border: none; }
  .sum-hdr { background: #1e293b; color: #ffffff; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #1e293b; padding: 8px; }
  .sum-c { border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 10pt; }
  .sum-w0 { background: #ffffff; }
  .sum-w1 { background: #f1f5f9; }
  .sum-bold { font-weight: 700; }
</style>
</head>
<body>

<table>
  <tr class="title-row"><td colspan="12">Relatorio de Avaliacoes de Supervisores</td></tr>
  <tr class="subtitle-row"><td colspan="12">Plataforma Dikma | Gerado em ${now.toLocaleDateString("pt-BR")} as ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td></tr>
  <tr class="sep"><td colspan="12"></td></tr>
  <tr>
    <td class="hdr" style="min-width:80px">Data</td>
    <td class="hdr" style="min-width:60px">Horario</td>
    <td class="hdr" style="min-width:120px">Empresa</td>
    <td class="hdr" style="min-width:120px">Supervisor</td>
    <td class="hdr" style="min-width:80px">Lideranca</td>
    <td class="hdr" style="min-width:90px">Comunicacao</td>
    <td class="hdr" style="min-width:80px">Respeito</td>
    <td class="hdr" style="min-width:90px">Organizacao</td>
    <td class="hdr" style="min-width:100px">Apoio a Equipe</td>
    <td class="hdr" style="min-width:60px">Media</td>
    <td class="hdr" style="min-width:90px">Classificacao</td>
    <td class="hdr" style="min-width:250px">Comentario</td>
  </tr>
${rows.map((r, i) => {
  const z = i % 2 === 0 ? "w0" : "w1"
  const rc = (v: number) => v >= 4 ? "hi" : v >= 3 ? "md" : v >= 2 ? "rg" : "lo"
  const mc = ratingColor(r.media)
  return `  <tr>
    <td class="c ${z} ca">${escHtml(r.data)}</td>
    <td class="c ${z} ca">${escHtml(r.horario)}</td>
    <td class="c ${z}">${escHtml(r.empresa)}</td>
    <td class="c ${z}">${escHtml(r.supervisor)}</td>
    <td class="c ${rc(r.lideranca)}">${r.lideranca}</td>
    <td class="c ${rc(r.comunicacao)}">${r.comunicacao}</td>
    <td class="c ${rc(r.respeito)}">${r.respeito}</td>
    <td class="c ${rc(r.organizacao)}">${r.organizacao}</td>
    <td class="c ${rc(r.apoio)}">${r.apoio}</td>
    <td class="c ${rc(r.media)}" style="font-weight:700">${r.media}</td>
    <td class="c ${z} ca" style="color:${mc.text};font-weight:600">${escHtml(r.classificacao)}</td>
    <td class="c ${z} wrap">${escHtml(r.comentario)}</td>
  </tr>`
}).join("\n")}
  <tr class="sep"><td colspan="12"></td></tr>
  <tr class="foot"><td colspan="12">Total de avaliacoes: ${rows.length} | Exportado em ${now.toLocaleDateString("pt-BR")} as ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td></tr>
  <tr class="conf"><td colspan="12">Documento confidencial - uso interno</td></tr>
</table>

${buildSummarySheet(rows)}

</body></html>`

  downloadFile(
    new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" }),
    `avaliacoes_${now.toISOString().slice(0, 10)}.xls`
  )
}

function buildSummarySheet(rows: ReturnType<typeof buildEvalData>): string {
  // Summary by supervisor
  const bySupervisor: Record<string, { name: string; empresa: string; total: number; sum: number }> = {}
  rows.forEach((r) => {
    const key = `${r.supervisor}_${r.empresa}`
    if (!bySupervisor[key]) bySupervisor[key] = { name: r.supervisor, empresa: r.empresa, total: 0, sum: 0 }
    bySupervisor[key].total++
    bySupervisor[key].sum += r.media
  })
  const supervisorRows = Object.values(bySupervisor).sort((a, b) => (b.sum / b.total) - (a.sum / a.total))

  // Summary by company
  const byCompany: Record<string, { name: string; total: number; sum: number }> = {}
  rows.forEach((r) => {
    if (!byCompany[r.empresa]) byCompany[r.empresa] = { name: r.empresa, total: 0, sum: 0 }
    byCompany[r.empresa].total++
    byCompany[r.empresa].sum += r.media
  })
  const companyRows = Object.values(byCompany)

  // Overall
  const totalEvals = rows.length
  const overallAvg = totalEvals > 0 ? (rows.reduce((s, r) => s + r.media, 0) / totalEvals).toFixed(1) : "0"

  return `
<br><br>
<table>
  <tr class="sum-title"><td colspan="4">Resumo Geral</td></tr>
  <tr class="sum-sub"><td colspan="4">Visao consolidada das avaliacoes</td></tr>
  <tr class="sep"><td colspan="4"></td></tr>
  <tr>
    <td class="sum-c sum-w1 sum-bold" style="border:1px solid #e2e8f0">Total de Avaliacoes</td>
    <td class="sum-c sum-w0" style="border:1px solid #e2e8f0;font-size:14pt;font-weight:700;text-align:center" colspan="3">${totalEvals}</td>
  </tr>
  <tr>
    <td class="sum-c sum-w1 sum-bold" style="border:1px solid #e2e8f0">Media Geral</td>
    <td class="sum-c sum-w0" style="border:1px solid #e2e8f0;font-size:14pt;font-weight:700;text-align:center;color:#0d9488" colspan="3">${overallAvg}</td>
  </tr>
  <tr class="sep"><td colspan="4"></td></tr>
  <tr class="sep"><td colspan="4"></td></tr>

  <tr><td colspan="4" style="font-size:12pt;font-weight:bold;color:#0f172a;padding:10px 10px 6px;border:none">Media por Empresa</td></tr>
  <tr>
    <td class="sum-hdr">Empresa</td>
    <td class="sum-hdr">Avaliacoes</td>
    <td class="sum-hdr" colspan="2">Media</td>
  </tr>
${companyRows.map((c, i) => {
  const z = i % 2 === 0 ? "sum-w0" : "sum-w1"
  const avg = (c.sum / c.total).toFixed(1)
  return `  <tr>
    <td class="sum-c ${z}" style="font-weight:600">${escHtml(c.name)}</td>
    <td class="sum-c ${z}" style="text-align:center">${c.total}</td>
    <td class="sum-c ${z}" style="text-align:center;font-weight:700;color:#0d9488" colspan="2">${avg}</td>
  </tr>`
}).join("\n")}

  <tr class="sep"><td colspan="4"></td></tr>
  <tr class="sep"><td colspan="4"></td></tr>
  <tr><td colspan="4" style="font-size:12pt;font-weight:bold;color:#0f172a;padding:10px 10px 6px;border:none">Media por Supervisor</td></tr>
  <tr>
    <td class="sum-hdr">Supervisor</td>
    <td class="sum-hdr">Empresa</td>
    <td class="sum-hdr">Avaliacoes</td>
    <td class="sum-hdr">Media</td>
  </tr>
${supervisorRows.map((s, i) => {
  const z = i % 2 === 0 ? "sum-w0" : "sum-w1"
  const avg = (s.sum / s.total).toFixed(1)
  const rc = ratingColor(Number(avg))
  return `  <tr>
    <td class="sum-c ${z}" style="font-weight:600">${escHtml(s.name)}</td>
    <td class="sum-c ${z}">${escHtml(s.empresa)}</td>
    <td class="sum-c ${z}" style="text-align:center">${s.total}</td>
    <td class="sum-c ${z}" style="text-align:center;font-weight:700;color:${rc.text}">${avg}</td>
  </tr>`
}).join("\n")}
  <tr class="sep"><td colspan="4"></td></tr>
  <tr class="conf"><td colspan="4">Documento confidencial - uso interno</td></tr>
</table>`
}

// ==========================================
// LOGS EXCEL EXPORT
// ==========================================

export function exportLogsToExcel(logs: AccessLog[]): void {
  const now = new Date()
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Logs de Acesso</x:Name>
<x:WorksheetOptions><x:FreezePanes/><x:FrozenNoSplit/><x:SplitHorizontal>4</x:SplitHorizontal><x:TopRowBottomPane>4</x:TopRowBottomPane><x:ActivePane>2</x:ActivePane></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 6px 10px; }
  .title-row td { font-size: 16pt; font-weight: bold; color: #0f172a; padding: 14px 10px 4px; border: none; }
  .subtitle-row td { font-size: 9pt; color: #64748b; padding: 2px 10px 14px; border: none; }
  .hdr { background: #1e293b; color: #ffffff; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #1e293b; padding: 10px 8px; }
  .c { border: 1px solid #e2e8f0; vertical-align: middle; font-size: 10pt; color: #1e293b; }
  .ca { text-align: center; }
  .w0 { background: #ffffff; }
  .w1 { background: #f8fafc; }
  .sep td { height: 6px; border: none; }
  .foot td { font-size: 8pt; color: #94a3b8; font-style: italic; padding: 12px 10px; border: none; }
  .login-badge { color: #0369a1; font-weight: 600; }
  .eval-badge { color: #059669; font-weight: 600; }
  .admin-badge { color: #d97706; font-weight: 600; }
</style>
</head>
<body>
<table>
  <tr class="title-row"><td colspan="5">Logs de Acesso - Plataforma Dikma</td></tr>
  <tr class="subtitle-row"><td colspan="5">Gerado em ${now.toLocaleDateString("pt-BR")} as ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td></tr>
  <tr class="sep"><td colspan="5"></td></tr>
  <tr>
    <td class="hdr" style="min-width:80px">Data</td>
    <td class="hdr" style="min-width:60px">Horario</td>
    <td class="hdr" style="min-width:120px">CPF</td>
    <td class="hdr" style="min-width:100px">Tipo de Acao</td>
    <td class="hdr" style="min-width:120px">Empresa</td>
  </tr>
${sortedLogs.map((l, i) => {
  const z = i % 2 === 0 ? "w0" : "w1"
  const dateObj = new Date(l.timestamp)
  const cpf = l.fullCPF ? l.fullCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : l.maskedCPF
  const actionLabel = l.action === "login" ? "Login" : l.action === "evaluation" ? "Avaliacao" : "Admin"
  const badge = l.action === "login" ? "login-badge" : l.action === "evaluation" ? "eval-badge" : "admin-badge"
  return `  <tr>
    <td class="c ${z} ca">${dateObj.toLocaleDateString("pt-BR")}</td>
    <td class="c ${z} ca">${dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
    <td class="c ${z}" style="font-family:Consolas,monospace">${escHtml(cpf)}</td>
    <td class="c ${z} ca ${badge}">${escHtml(actionLabel)}</td>
    <td class="c ${z}">${escHtml(l.companyName || "-")}</td>
  </tr>`
}).join("\n")}
  <tr class="sep"><td colspan="5"></td></tr>
  <tr class="foot"><td colspan="5">Total: ${sortedLogs.length} registro(s) | Documento confidencial - uso interno</td></tr>
</table>
</body></html>`

  downloadFile(
    new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" }),
    `logs_acesso_${now.toISOString().slice(0, 10)}.xls`
  )
}

// ==========================================
// PDF EXPORT
// ==========================================

export function exportEvaluationsToPDF(evaluations: Evaluation[]): void {
  const rows = buildEvalData(evaluations)
  const now = new Date()

  // Overall stats
  const totalEvals = rows.length
  const overallAvg = totalEvals > 0 ? (rows.reduce((s, r) => s + r.media, 0) / totalEvals).toFixed(1) : "0"

  // By company
  const byCompany: Record<string, { name: string; total: number; sum: number }> = {}
  rows.forEach((r) => {
    if (!byCompany[r.empresa]) byCompany[r.empresa] = { name: r.empresa, total: 0, sum: 0 }
    byCompany[r.empresa].total++
    byCompany[r.empresa].sum += r.media
  })

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Relatorio de Avaliacoes</title>
<style>
  @page { size: A4 landscape; margin: 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #1e293b; font-size: 10pt; background: #fff; }

  .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 12px; border-bottom: 3px solid #0d9488; margin-bottom: 20px; }
  .header-left h1 { font-size: 18pt; color: #0f172a; font-weight: 700; margin-bottom: 2px; }
  .header-left p { font-size: 9pt; color: #64748b; }
  .header-right { text-align: right; font-size: 9pt; color: #64748b; }
  .header-right .date { font-size: 10pt; color: #0f172a; font-weight: 600; }

  .section-title { font-size: 12pt; font-weight: 700; color: #0f172a; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }

  .stats { display: flex; gap: 16px; margin-bottom: 20px; }
  .stat-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; }
  .stat-card .label { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-card .value { font-size: 20pt; font-weight: 700; color: #0d9488; margin-top: 2px; }
  .stat-card .value.dark { color: #0f172a; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9pt; }
  th { background: #0d9488; color: #fff; font-weight: 600; padding: 8px 6px; text-align: center; border: 1px solid #0d9488; }
  td { padding: 6px; border: 1px solid #e2e8f0; vertical-align: middle; }
  tr:nth-child(even) td { background: #f8fafc; }
  .num { text-align: center; font-weight: 600; }
  .num-hi { text-align: center; font-weight: 600; color: #059669; }
  .num-md { text-align: center; font-weight: 600; color: #d97706; }
  .num-lo { text-align: center; font-weight: 600; color: #dc2626; }
  .num-rg { text-align: center; font-weight: 600; color: #ea580c; }
  .comment { max-width: 220px; word-wrap: break-word; font-size: 8pt; color: #475569; }
  .avg-cell { font-weight: 700; font-size: 10pt; }

  .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 8pt; color: #94a3b8; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>Relatorio de Avaliacao de Supervisores</h1>
    <p>Plataforma Dikma</p>
  </div>
  <div class="header-right">
    <div class="date">${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
    <div>${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
  </div>
</div>

<div class="section-title">1. Resumo Geral</div>
<div class="stats">
  <div class="stat-card">
    <div class="label">Total de Avaliacoes</div>
    <div class="value dark">${totalEvals}</div>
  </div>
  <div class="stat-card">
    <div class="label">Media Geral</div>
    <div class="value">${overallAvg}</div>
  </div>
${Object.values(byCompany).map((c) => `  <div class="stat-card">
    <div class="label">${escHtml(c.name)}</div>
    <div class="value">${(c.sum / c.total).toFixed(1)}</div>
  </div>`).join("\n")}
</div>

<div class="section-title">2. Avaliacoes Detalhadas</div>
<table>
  <thead>
    <tr>
      <th>Data</th>
      <th>Empresa</th>
      <th>Supervisor</th>
      <th>Lideranca</th>
      <th>Comunicacao</th>
      <th>Respeito</th>
      <th>Organizacao</th>
      <th>Apoio</th>
      <th>Media</th>
      <th>Class.</th>
      <th>Comentario</th>
    </tr>
  </thead>
  <tbody>
${rows.map((r) => {
  const nc = (v: number) => v >= 4 ? "num-hi" : v >= 3 ? "num-md" : v >= 2 ? "num-rg" : "num-lo"
  const mc = ratingColor(r.media)
  return `    <tr>
      <td class="num">${escHtml(r.data)}</td>
      <td>${escHtml(r.empresa)}</td>
      <td style="font-weight:600">${escHtml(r.supervisor)}</td>
      <td class="${nc(r.lideranca)}">${r.lideranca}</td>
      <td class="${nc(r.comunicacao)}">${r.comunicacao}</td>
      <td class="${nc(r.respeito)}">${r.respeito}</td>
      <td class="${nc(r.organizacao)}">${r.organizacao}</td>
      <td class="${nc(r.apoio)}">${r.apoio}</td>
      <td class="${nc(r.media)} avg-cell">${r.media}</td>
      <td class="num" style="color:${mc.text}">${escHtml(r.classificacao)}</td>
      <td class="comment">${escHtml(r.comentario)}</td>
    </tr>`
}).join("\n")}
  </tbody>
</table>

<div class="footer">
  <span>Documento confidencial - uso interno</span>
  <span>Gerado automaticamente pela Plataforma Dikma | ${now.toLocaleDateString("pt-BR")}</span>
</div>

</body>
</html>`

  // Open in new window for printing as PDF
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

// ==========================================
// UTILITY
// ==========================================

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
