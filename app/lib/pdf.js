// Minimal, dependency-free PDF writer: enough to lay out monospaced text
// lines across pages using a core (non-embedded) Courier font. No external
// library needed just to print a plain end-of-day report.

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const LINE_H = 13;
const FONT_SIZE = 9.5;
const LINES_PER_PAGE = Math.floor((PAGE_H - MARGIN * 2) / LINE_H);

function pdfEscape(str) {
  return String(str)
    .replace(/[^\x20-\x7e]/g, (ch) => (ch.charCodeAt(0) <= 255 ? ch : "?"))
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function toBytes(str) {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i) & 0xff;
  return arr;
}

export function buildPdf(lines) {
  const pages = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + LINES_PER_PAGE));
  }
  if (!pages.length) pages.push([]);

  const objects = {};
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";

  const pageIds = pages.map((_, i) => 4 + i * 2);
  objects[2] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => id + " 0 R").join(" ")}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

  pages.forEach((pageLines, i) => {
    const pageId = 4 + i * 2;
    const contentId = pageId + 1;
    let stream = `BT /F1 ${FONT_SIZE} Tf ${MARGIN} ${PAGE_H - MARGIN} Td\n`;
    pageLines.forEach((line, idx) => {
      if (idx > 0) stream += `0 -${LINE_H} Td\n`;
      stream += `(${pdfEscape(line)}) Tj\n`;
    });
    stream += "ET";
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  const total = 3 + pages.length * 2;

  let pdf = "%PDF-1.4\n";
  const offsets = {};
  for (let id = 1; id <= total; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= total; id++) {
    pdf += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  }
  pdf += `trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return toBytes(pdf);
}

// The core PDF font here isn't embedded, so it can't render the naira glyph —
// spell it out instead of risking a missing-glyph box in the output.
export function pdfMoney(n) {
  return "NGN " + Math.round(n).toLocaleString("en-US");
}

export function padCol(str, width, alignRight) {
  const s = String(str).slice(0, width - 1);
  return alignRight ? s.padStart(width - 1) + " " : s.padEnd(width);
}
