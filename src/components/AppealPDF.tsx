/**
 * Form A-1 PDF Generator — builds a clean, printable petition document.
 * Uses jsPDF for client-side PDF generation (no server needed).
 *
 * Install: npm install jspdf
 */

interface FormData {
  ownerName: string; ownerAddress: string; ownerCity: string; ownerState: string; ownerZip: string;
  ownerPhone: string; ownerEmail: string;
  propertyAddress: string; propertyCity: string; propertyCounty: string; propertyZip: string;
  block: string; lot: string; qualifier: string; taxYear: string;
  assessedTotal: string; assessedLand: string; assessedImprovement: string; currentTaxes: string; propertyClass: string;
  claimedValue: string; appealReasons: string[]; appealNarrative: string;
  useGSAIComps: boolean;
  comps: { address: string; salePrice: string; saleDate: string; beds: string; baths: string; sqft: string }[];
  evidenceFiles: File[];
}

function fmt(v: string | number): string {
  const n = typeof v === "string" ? parseInt(v) : v;
  if (!n || isNaN(n)) return "$0";
  return "$" + n.toLocaleString();
}

export async function generateAppealPDF(form: FormData) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 50;
  const contentW = W - margin * 2;
  let y = 50;

  function checkPage(needed: number) {
    if (y + needed > 720) { doc.addPage(); y = 50; }
  }

  // ── Header ─────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("FORM A-1 — PETITION OF APPEAL", margin, y);
  doc.text(`Tax Year ${form.taxYear}`, W - margin, y, { align: "right" });
  y += 20;

  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.line(margin, y, W - margin, y);
  y += 25;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("PETITION OF APPEAL", W / 2, y, { align: "center" });
  y += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`${form.propertyCounty} County Board of Taxation`, W / 2, y, { align: "center" });
  y += 30;

  // ── Section: Petitioner ────────────────────────────────
  function sectionTitle(title: string) {
    checkPage(40);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 3, contentW, 18, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    doc.text(title, margin + 6, y + 10);
    y += 25;
  }

  function field(label: string, value: string, x?: number, w?: number) {
    const fx = x ?? margin;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(label, fx, y);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", fx, y + 12);
    if (w) {
      doc.setDrawColor(200);
      doc.line(fx, y + 15, fx + w, y + 15);
    }
  }

  function fieldRow(fields: { label: string; value: string; width: number }[]) {
    checkPage(30);
    let x = margin;
    for (const f of fields) {
      field(f.label, f.value, x, f.width);
      x += f.width + 15;
    }
    y += 28;
  }

  sectionTitle("1. PETITIONER INFORMATION");
  fieldRow([
    { label: "Full Name", value: form.ownerName, width: 250 },
    { label: "Phone", value: form.ownerPhone, width: 150 },
  ]);
  fieldRow([
    { label: "Mailing Address", value: `${form.ownerAddress}, ${form.ownerCity}, ${form.ownerState} ${form.ownerZip}`, width: contentW },
  ]);

  // ── Section: Property ──────────────────────────────────
  sectionTitle("2. PROPERTY UNDER APPEAL");
  fieldRow([
    { label: "Property Address", value: `${form.propertyAddress}, ${form.propertyCity}, NJ ${form.propertyZip}`, width: contentW },
  ]);
  fieldRow([
    { label: "Block", value: form.block, width: 80 },
    { label: "Lot", value: form.lot, width: 80 },
    { label: "Qualifier", value: form.qualifier || "N/A", width: 80 },
    { label: "County", value: form.propertyCounty, width: 120 },
  ]);
  fieldRow([
    { label: "Property Classification", value: form.propertyClass === "2" ? "Class 2 — Residential" : `Class ${form.propertyClass}`, width: 200 },
    { label: "Tax Year", value: form.taxYear, width: 100 },
  ]);

  // ── Section: Assessment ────────────────────────────────
  sectionTitle("3. CURRENT ASSESSMENT & CLAIMED VALUE");
  fieldRow([
    { label: "Total Assessed Value", value: fmt(form.assessedTotal), width: 150 },
    { label: "Land", value: fmt(form.assessedLand), width: 120 },
    { label: "Improvement", value: fmt(form.assessedImprovement), width: 120 },
  ]);
  fieldRow([
    { label: "Annual Taxes", value: form.currentTaxes ? `$${parseFloat(form.currentTaxes).toLocaleString()}` : "—", width: 150 },
    { label: "Petitioner's Claimed Value", value: fmt(form.claimedValue), width: 200 },
  ]);

  // ── Section: Reasons ───────────────────────────────────
  sectionTitle("4. BASIS FOR APPEAL");
  checkPage(60);
  doc.setFontSize(9);
  doc.setTextColor(40);
  for (const r of form.appealReasons) {
    checkPage(15);
    doc.text(`\u2022  ${r}`, margin + 6, y);
    y += 14;
  }
  if (form.appealNarrative) {
    y += 5;
    checkPage(40);
    doc.setFontSize(8);
    doc.setTextColor(60);
    const lines = doc.splitTextToSize(form.appealNarrative, contentW - 12);
    for (const line of lines) {
      checkPage(12);
      doc.text(line, margin + 6, y);
      y += 11;
    }
  }
  y += 10;

  // ── Section: Comparables ───────────────────────────────
  const validComps = form.comps.filter(c => c.address);
  if (validComps.length > 0) {
    sectionTitle("5. COMPARABLE SALES (ANNEX A)");

    // Table header
    checkPage(30);
    doc.setFillColor(30, 35, 50);
    doc.rect(margin, y, contentW, 18, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255);
    const cols = [
      { label: "Address", x: margin + 4, w: 160 },
      { label: "Sale Price", x: margin + 170, w: 70 },
      { label: "Sale Date", x: margin + 245, w: 65 },
      { label: "Beds", x: margin + 315, w: 30 },
      { label: "Baths", x: margin + 350, w: 30 },
      { label: "Sqft", x: margin + 385, w: 50 },
    ];
    for (const col of cols) doc.text(col.label, col.x, y + 12);
    y += 22;

    // Table rows
    doc.setFont("helvetica", "normal");
    for (let i = 0; i < validComps.length; i++) {
      checkPage(20);
      const c = validComps[i];
      if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 2, contentW, 16, "F"); }
      doc.setFontSize(8);
      doc.setTextColor(40);
      doc.text((c.address || "").slice(0, 40), cols[0].x, y + 10);
      doc.text(fmt(c.salePrice), cols[1].x, y + 10);
      doc.text(c.saleDate || "—", cols[2].x, y + 10);
      doc.text(c.beds || "—", cols[3].x, y + 10);
      doc.text(c.baths || "—", cols[4].x, y + 10);
      doc.text(c.sqft || "—", cols[5].x, y + 10);
      y += 16;
    }
    y += 10;
  }

  // ── Signature ──────────────────────────────────────────
  checkPage(80);
  sectionTitle("6. CERTIFICATION");
  doc.setFontSize(8);
  doc.setTextColor(60);
  doc.text("I certify that the foregoing statements made by me are true. I am aware that if any of the foregoing", margin + 6, y);
  y += 11;
  doc.text("statements made by me are willfully false, I am subject to punishment.", margin + 6, y);
  y += 30;

  doc.setDrawColor(0);
  doc.line(margin, y, margin + 200, y);
  doc.line(W - margin - 150, y, W - margin, y);
  y += 12;
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text("Signature of Petitioner", margin, y);
  doc.text("Date", W - margin - 150, y);
  y += 30;

  // ── Disclaimer ─────────────────────────────────────────
  checkPage(60);
  doc.setDrawColor(200);
  doc.line(margin, y, W - margin, y);
  y += 15;
  doc.setFontSize(6.5);
  doc.setTextColor(140);
  const discText = "DISCLAIMER: This document was prepared using Garden State AI, an informational tool. Garden State AI is not a law firm, attorney, tax advisor, or licensed appraiser. This document is provided for informational purposes only and does not constitute legal or tax advice. You are solely responsible for verifying all information before filing. We strongly recommend reviewing this document with a licensed NJ property tax attorney before submission. Filing deadlines and procedures are subject to change — verify with your County Board of Taxation.";
  const discLines = doc.splitTextToSize(discText, contentW);
  for (const line of discLines) {
    doc.text(line, margin, y);
    y += 9;
  }

  y += 10;
  doc.setFontSize(6);
  doc.text("Prepared with Garden State AI — gardenstate.ai", W / 2, y, { align: "center" });

  // ── Save ───────────────────────────────────────────────
  const filename = `Tax-Appeal-${form.propertyAddress.replace(/[^a-zA-Z0-9]/g, "-")}-${form.taxYear}.pdf`;
  doc.save(filename);
}
