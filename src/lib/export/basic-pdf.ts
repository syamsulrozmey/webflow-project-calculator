import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { PDFFont, PDFPage } from "pdf-lib";

import type { CalculationMeta } from "@/lib/calculator/storage";
import type { CalculationResult } from "@/lib/calculator/types";
import { buildBasicPdfSections } from "@/lib/export/basic-template";
import type { BasicPdfSections } from "@/lib/export/basic-template";
import { getFeatureTier } from "@/lib/export/feature-tier";

const PAGE_WIDTH = 612; // Letter (8.5in) portrait @ 72dpi
const PAGE_HEIGHT = 792; // Letter height
const PAGE_MARGIN = 48;

interface GenerateBasicPdfArgs {
  result: CalculationResult;
  meta: CalculationMeta;
  source?: "demo" | "questionnaire" | "analysis";
}

export async function generateBasicPdfReport({
  result,
  meta,
  source,
}: GenerateBasicPdfArgs): Promise<Uint8Array> {
  const tier = getFeatureTier();
  const sections = buildBasicPdfSections({ result, meta, tier, source });
  const pdfDoc = await PDFDocument.create();
  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };

  const pageState = createPage(pdfDoc, sections.header.watermarkText, fonts.bold);
  renderHeader(pageState, sections, fonts);
  renderSummary(pageState, sections.summary, fonts);
  renderDivider(pageState);
  renderSectionTitle(pageState, "Cost Breakdown", fonts);
  renderBreakdown(pageState, sections.breakdown, fonts);
  renderSectionTitle(pageState, "Timeline", fonts);
  renderTimeline(pageState, sections.timeline, fonts);
  renderSectionTitle(pageState, "Multipliers", fonts);
  renderFactors(pageState, sections.factors, fonts);
  renderSectionTitle(pageState, "Scope Notes", fonts);
  renderScope(pageState, sections.scope, fonts);
  if (sections.agency) {
    renderSectionTitle(pageState, "Agency Economics", fonts);
    renderAgency(pageState, sections.agency, fonts);
  }
  renderFooter(pageState, sections.header.source, fonts);

  return pdfDoc.save();
}

type FontMap = {
  regular: PDFFont;
  bold: PDFFont;
};

interface PageState extends FontContext {
  doc: PDFDocument;
  page: PDFPage;
  cursorY: number;
}

interface FontContext {
  watermarkFont?: PDFFont;
  watermarkText?: string;
}

function createPage(doc: PDFDocument, watermarkText?: string, watermarkFont?: PDFFont): PageState {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  if (watermarkText && watermarkFont) {
    drawWatermark(page, watermarkText, watermarkFont);
  }
  return {
    doc,
    page,
    cursorY: PAGE_HEIGHT - PAGE_MARGIN,
    watermarkFont,
    watermarkText,
  };
}

function ensureSpace(state: PageState, heightNeeded: number) {
  if (state.cursorY - heightNeeded >= PAGE_MARGIN) {
    return;
  }
  const next = createPage(state.doc, state.watermarkText, state.watermarkFont);
  state.page = next.page;
  state.cursorY = next.cursorY;
  state.watermarkFont = next.watermarkFont;
  state.watermarkText = next.watermarkText;
}

function renderHeader(state: PageState, sections: BasicPdfSections, fonts: FontMap) {
  const { header } = sections;
  const maxWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const titleSize = 20;
  const subtitleSize = 14;
  ensureSpace(state, 90);
  state.page.drawText(header.title, {
    x: PAGE_MARGIN,
    y: state.cursorY,
    size: titleSize,
    font: fonts.bold,
    color: rgb(0.1, 0.12, 0.2),
  });
  state.cursorY -= titleSize + 6;
  state.page.drawText(header.subtitle, {
    x: PAGE_MARGIN,
    y: state.cursorY,
    size: subtitleSize,
    font: fonts.bold,
    color: rgb(0.08, 0.45, 0.85),
  });
  state.cursorY -= subtitleSize + 10;
  const metaLine = `${header.projectDescriptor} • Currency ${header.currency.toUpperCase()} • Issued ${header.issuedOn}`;
  drawWrappedText(state, metaLine, fonts.regular, 10, maxWidth, rgb(0.33, 0.35, 0.4));
  const tierLine = `Tier: ${header.tier.toUpperCase()} • Source: ${header.source}`;
  drawWrappedText(state, tierLine, fonts.regular, 10, maxWidth, rgb(0.33, 0.35, 0.4));
  state.cursorY -= 8;
}

function renderSummary(state: PageState, summary: BasicPdfSections["summary"], fonts: FontMap) {
  const columnWidth = (PAGE_WIDTH - PAGE_MARGIN * 2) / 2 - 8;
  const rowHeight = 48;
  summary.forEach((stat, index) => {
    if (index % 2 === 0) {
      ensureSpace(state, rowHeight);
    }
    const columnIndex = index % 2;
    const x = PAGE_MARGIN + columnIndex * (columnWidth + 16);
    const y = state.cursorY;
    state.page.drawText(stat.label.toUpperCase(), {
      x,
      y,
      size: 8,
      font: fonts.bold,
      color: rgb(0.45, 0.47, 0.5),
    });
    state.page.drawText(stat.value, {
      x,
      y: y - 12,
      size: 13,
      font: fonts.bold,
      color: rgb(0.1, 0.12, 0.2),
    });
    if (stat.helper) {
      drawWrappedText(
        state,
        stat.helper,
        fonts.regular,
        9,
        columnWidth,
        rgb(0.45, 0.47, 0.5),
        x,
        y - 24,
        true,
      );
    }
    if (columnIndex === 1 || index === summary.length - 1) {
      state.cursorY -= rowHeight;
    }
  });
  state.cursorY -= 8;
}

function renderBreakdown(state: PageState, breakdown: BasicPdfSections["breakdown"], fonts: FontMap) {
  const maxWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  breakdown.forEach((row) => {
    const descriptionLines = wrapText(row.description, fonts.regular, 10, maxWidth);
    const blockHeight = 34 + descriptionLines.length * 12;
    ensureSpace(state, blockHeight);
    const y = state.cursorY;
    state.page.drawText(row.label, {
      x: PAGE_MARGIN,
      y,
      size: 11,
      font: fonts.bold,
      color: rgb(0.1, 0.12, 0.2),
    });
    state.page.drawText(`${row.hoursLabel} • ${row.costLabel} • ${row.percent}%`, {
      x: PAGE_MARGIN,
      y: y - 12,
      size: 9,
      font: fonts.regular,
      color: rgb(0.33, 0.35, 0.4),
    });
    drawParagraph(
      descriptionLines,
      state,
      fonts.regular,
      10,
      rgb(0.28, 0.3, 0.32),
      PAGE_MARGIN,
      y - 24,
      true,
    );
    state.cursorY -= blockHeight;
  });
}

function renderTimeline(state: PageState, timeline: BasicPdfSections["timeline"], fonts: FontMap) {
  timeline.forEach((entry) => {
    ensureSpace(state, 40);
    const y = state.cursorY;
    state.page.drawText(entry.label, {
      x: PAGE_MARGIN,
      y,
      size: 10,
      font: fonts.bold,
      color: rgb(0.1, 0.12, 0.2),
    });
    state.page.drawText(entry.hoursLabel, {
      x: PAGE_MARGIN,
      y: y - 12,
      size: 9,
      font: fonts.regular,
      color: rgb(0.33, 0.35, 0.4),
    });
    drawProgressBar(state, entry.startPercent, entry.widthPercent, y - 20);
    const narrativeLines = wrapText(entry.narrative, fonts.regular, 9, PAGE_WIDTH - PAGE_MARGIN * 2);
    drawParagraph(
      narrativeLines,
      state,
      fonts.regular,
      9,
      rgb(0.45, 0.47, 0.5),
      PAGE_MARGIN,
      y - 34,
      true,
    );
    state.cursorY -= 48;
  });
}

function renderFactors(state: PageState, factors: BasicPdfSections["factors"], fonts: FontMap) {
  const maxWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const tagSpacing = 6;
  let x = PAGE_MARGIN;
  ensureSpace(state, 30);
  factors.forEach((factor) => {
    const label = `${factor.label}: ${factor.value}`;
    const width = fonts.regular.widthOfTextAtSize(label, 9) + 12;
    if (x + width > PAGE_MARGIN + maxWidth) {
      x = PAGE_MARGIN;
      state.cursorY -= 18;
      ensureSpace(state, 18);
    }
    state.page.drawRectangle({
      x,
      y: state.cursorY,
      width,
      height: 16,
      borderWidth: 0.5,
      borderColor: rgb(0.8, 0.82, 0.86),
      color: rgb(0.95, 0.96, 0.97),
      opacity: 0.9,
    });
    state.page.drawText(label, {
      x: x + 6,
      y: state.cursorY + 4,
      size: 9,
      font: fonts.regular,
      color: rgb(0.33, 0.35, 0.4),
    });
    x += width + tagSpacing;
  });
  state.cursorY -= 26;
}

function renderScope(state: PageState, scope: BasicPdfSections["scope"], fonts: FontMap) {
  const maxWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const renderList = (title: string, entries: string[]) => {
    if (!entries.length) return;
    ensureSpace(state, 24);
    state.page.drawText(title, {
      x: PAGE_MARGIN,
      y: state.cursorY,
      size: 10,
      font: fonts.bold,
      color: rgb(0.1, 0.12, 0.2),
    });
    state.cursorY -= 14;
    entries.forEach((entry) => {
      const lines = wrapText(entry, fonts.regular, 9, maxWidth - 16);
      const height = lines.length * 12;
      ensureSpace(state, height);
      drawBulletListEntry(state, lines, fonts.regular, 9);
      state.cursorY -= 6;
    });
    state.cursorY -= 6;
  };
  renderList("Highlights", scope.highlights);
  renderList("Assumptions", scope.assumptions);
  renderList("Risks", scope.risks);
}

function renderAgency(state: PageState, agency: BasicPdfSections["agency"], fonts: FontMap) {
  if (!agency) return;
  const maxWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const stats = [
    `Blended cost rate ${agency.blendedCostRate}`,
    `Recommended billable ${agency.recommendedBillableRate}`,
    `Margin ${agency.margin}`,
    `Weekly capacity ${agency.totalWeeklyCapacity}`,
    `Team size ${agency.memberCount}`,
  ];
  stats.forEach((stat) => {
    ensureSpace(state, 16);
    state.page.drawText(stat, {
      x: PAGE_MARGIN,
      y: state.cursorY,
      size: 9,
      font: fonts.regular,
      color: rgb(0.33, 0.35, 0.4),
    });
    state.cursorY -= 14;
  });
  if (agency.teamSnapshot.length) {
    ensureSpace(state, 16);
    state.page.drawText("Team snapshot:", {
      x: PAGE_MARGIN,
      y: state.cursorY,
      size: 10,
      font: fonts.bold,
      color: rgb(0.1, 0.12, 0.2),
    });
    state.cursorY -= 14;
    agency.teamSnapshot.forEach((member) => {
      const lines = wrapText(`${member.name} (${member.role}) — ${member.rateLabel}`, fonts.regular, 9, maxWidth);
      const height = lines.length * 12;
      ensureSpace(state, height);
      drawParagraph(lines, state, fonts.regular, 9, rgb(0.33, 0.35, 0.4));
      state.cursorY -= 4;
    });
  }
}

function renderDivider(state: PageState) {
  ensureSpace(state, 10);
  state.page.drawLine({
    start: { x: PAGE_MARGIN, y: state.cursorY },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: state.cursorY },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.9),
  });
  state.cursorY -= 16;
}

function renderSectionTitle(state: PageState, title: string, fonts: FontMap) {
  ensureSpace(state, 20);
  state.page.drawText(title, {
    x: PAGE_MARGIN,
    y: state.cursorY,
    size: 12,
    font: fonts.bold,
    color: rgb(0.08, 0.45, 0.85),
  });
  state.cursorY -= 18;
}

function renderFooter(state: PageState, source: string, fonts: FontMap) {
  const footer = `Generated via Webflow Project Calculator • Source: ${source}`;
  ensureSpace(state, 24);
  state.page.drawLine({
    start: { x: PAGE_MARGIN, y: PAGE_MARGIN + 12 },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: PAGE_MARGIN + 12 },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.9),
  });
  state.page.drawText(footer, {
    x: PAGE_MARGIN,
    y: PAGE_MARGIN,
    size: 8,
    font: fonts.regular,
    color: rgb(0.45, 0.47, 0.5),
  });
}

function drawWrappedText(
  state: PageState,
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
  color = rgb(0, 0, 0),
  x = PAGE_MARGIN,
  y?: number,
  skipCursorUpdate = false,
) {
  const lines = wrapText(text, font, size, maxWidth);
  const startY = y ?? state.cursorY;
  drawParagraph(lines, state, font, size, color, x, startY, skipCursorUpdate);
}

function drawParagraph(
  lines: string[],
  state: PageState,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  x = PAGE_MARGIN,
  startingY?: number,
  skipCursorUpdate = false,
) {
  let y = startingY ?? state.cursorY;
  const lineHeight = size + 2;
  lines.forEach((line, index) => {
    state.page.drawText(line, {
      x,
      y: y - index * lineHeight,
      size,
      font,
      color,
    });
  });
  if (!skipCursorUpdate) {
    state.cursorY = (startingY ?? state.cursorY) - lines.length * lineHeight;
  }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];
  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/);
    let currentLine = "";
    words.forEach((word) => {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(nextLine, size);
      if (width <= maxWidth || !currentLine) {
        currentLine = nextLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
  });
  return lines.length ? lines : [""];
}

function drawProgressBar(state: PageState, startPercent: number, widthPercent: number, y: number) {
  const totalWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
  const startX = PAGE_MARGIN + (startPercent / 100) * totalWidth;
  const width = (widthPercent / 100) * totalWidth;
  state.page.drawRectangle({
    x: PAGE_MARGIN,
    y,
    width: totalWidth,
    height: 6,
    color: rgb(0.94, 0.95, 0.97),
  });
  state.page.drawRectangle({
    x: startX,
    y,
    width,
    height: 6,
    color: rgb(0.08, 0.45, 0.85),
  });
}

function drawBulletListEntry(state: PageState, lines: string[], font: PDFFont, size: number) {
  const lineHeight = size + 2;
  const bulletY = state.cursorY;
  state.page.drawCircle({
    x: PAGE_MARGIN + 2,
    y: bulletY - 4,
    size: 1.5,
    color: rgb(0.08, 0.45, 0.85),
  });
  lines.forEach((line, index) => {
    state.page.drawText(line, {
      x: PAGE_MARGIN + 10,
      y: state.cursorY - index * lineHeight,
      size,
      font,
      color: rgb(0.33, 0.35, 0.4),
    });
  });
  state.cursorY -= lines.length * lineHeight;
}

function drawWatermark(page: PDFPage, text: string, font: PDFFont) {
  const fontSize = 60;
  const opacity = 0.08;
  page.drawText(text, {
    x: PAGE_WIDTH / 6,
    y: PAGE_HEIGHT / 2,
    size: fontSize,
    rotate: degrees(40),
    color: rgb(0.6, 0.65, 0.75),
    opacity,
    font,
  });
}


