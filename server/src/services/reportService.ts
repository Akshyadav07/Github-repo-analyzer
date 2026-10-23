import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export interface ReportData {
  title: string;
  owner: string;
  repo: string;
  branch: string;
  startDate?: string;
  endDate?: string;
  generatedAt: string;
  overview: {
    totalCommits: number;
    activeContributors: number;
    totalAdditions: number;
    totalDeletions: number;
  };
  contributors: Array<{ login: string; commits: number; additions: number; deletions: number }>;
  topFiles: Array<{ filename: string; changes: number; contributors: string[] }>;
  commitTypes: Array<{ type: string; count: number; percentage: number }>;
  riskFindings: Array<{
    severity: string;
    title: string;
    affectedFile: string;
    description: string;
    commitSha: string;
    detectionMethod: string;
  }>;
  collaborationFindings: Array<{
    findingType: string;
    developers: string[];
    evidence: string;
    confidence: string;
  }>;
  limitations: string[];
}

export class ReportService {
  async generatePDF(data: ReportData, reportId: string): Promise<string> {
    const storagePath = path.resolve(env.REPORT_STORAGE_PATH);
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    const filePath = path.join(storagePath, `${reportId}.pdf`);
    const doc = new PDFDocument({
      margins: { top: 35, bottom: 25, left: 40, right: 40 },
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true,
    });
    const stream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      doc.on('error', reject);
      stream.on('finish', () => resolve(filePath));

      doc.pipe(stream);


      // Color Palette
      const NAVY = '#0f172a';
      const INDIGO = '#4f46e5';
      const INDIGO_LIGHT = '#818cf8';
      const GRAY = '#64748b';
      const BORDER = '#e2e8f0';
      const GREEN = '#10b981';
      const RED = '#ef4444';
      const AMBER = '#f59e0b';

      const totalWidth = doc.page.width - 80;

      // ─── PAGE 1: Brand Header Banner ──────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 3).fill(INDIGO);

      const headerY = 14;
      const headerHeight = 54;
      doc.rect(40, headerY, totalWidth, headerHeight).fill(NAVY);

      // Left Brand / Title
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff').text('GitScope AI', 52, headerY + 10, { continued: true });
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(INDIGO_LIGHT).text('   REPOSITORY INTELLIGENCE REPORT');
      doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8').text(
        'Automated Commit History, Developer Velocity & Security Risk Audit',
        52,
        headerY + 28
      );

      // Right Meta
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff').text(
        `${data.owner}/${data.repo}`,
        40,
        headerY + 10,
        { align: 'right', width: totalWidth - 14 }
      );
      doc.font('Helvetica').fontSize(7).fillColor('#cbd5e1').text(
        `Branch: ${data.branch}  •  ${new Date(data.generatedAt).toLocaleDateString()}`,
        40,
        headerY + 24,
        { align: 'right', width: totalWidth - 14 }
      );
      if (data.startDate) {
        doc.font('Helvetica').fontSize(6.5).fillColor('#94a3b8').text(
          `Period: ${data.startDate} → ${data.endDate ?? 'present'}`,
          40,
          headerY + 37,
          { align: 'right', width: totalWidth - 14 }
        );
      }

      doc.y = headerY + headerHeight + 8;

      // ─── 1. Executive Summary ────────────────────────────────────────────────
      this.addSectionTitle(doc, '1. Executive Summary', data, 65);

      this.addMetricRow(doc, [
        { label: 'Total Commits', value: String(data.overview.totalCommits), color: INDIGO },
        { label: 'Active Contributors', value: String(data.overview.activeContributors), color: '#0284c7' },
        { label: 'Lines Added', value: `+${data.overview.totalAdditions.toLocaleString()}`, color: GREEN },
        { label: 'Lines Deleted', value: `-${data.overview.totalDeletions.toLocaleString()}`, color: RED },
      ], data);

      doc.font('Helvetica').fontSize(7.5).fillColor(GRAY).text(
        `Analyzed ${data.overview.totalCommits} commit(s) by ${data.overview.activeContributors} contributor(s) on branch "${data.branch}" (${data.owner}/${data.repo}).`,
        40,
        doc.y,
        { width: totalWidth }
      );
      doc.y += 4;

      // ─── 2. Developer Contributions ──────────────────────────────────────────
      this.addSectionTitle(doc, '2. Developer Contributions', data, 50);

      const contribHeaders = ['Developer / Author', 'Commits', 'Lines Added (+)', 'Lines Deleted (-)'];
      const contribColWidths = [185, 90, 120, totalWidth - (185 + 90 + 120)];
      const contribRows = (data.contributors.length > 0 ? data.contributors.slice(0, 15) : [
        { login: 'Unknown', commits: data.overview.totalCommits, additions: data.overview.totalAdditions, deletions: data.overview.totalDeletions }
      ]).map((c) => [
        c.login,
        String(c.commits),
        `+${c.additions.toLocaleString()}`,
        `-${c.deletions.toLocaleString()}`,
      ]);

      this.addTable(doc, contribHeaders, contribRows, contribColWidths, data);

      // ─── 3. Commit Type Classification ───────────────────────────────────────
      if (data.commitTypes && data.commitTypes.length > 0) {
        this.addSectionTitle(doc, '3. Commit Type Classification', data, 45);

        const typeHeaders = ['Conventional Type', 'Commit Count', 'Distribution Percentage'];
        const typeColWidths = [185, 140, totalWidth - (185 + 140)];
        const typeRows = data.commitTypes.map((ct) => [
          ct.type.toUpperCase(),
          String(ct.count),
          `${ct.percentage}%`,
        ]);

        this.addTable(doc, typeHeaders, typeRows, typeColWidths, data);
      }

      // ─── 4. Frequently Modified Files ────────────────────────────────────────
      if (data.topFiles && data.topFiles.length > 0) {
        this.addSectionTitle(doc, '4. Frequently Modified Files', data, 45);

        const fileHeaders = ['File Path', 'Change Count', 'Active Contributors'];
        const fileColWidths = [275, 100, totalWidth - (275 + 100)];
        const fileRows = data.topFiles.slice(0, 12).map((f) => [
          f.filename.length > 46 ? '...' + f.filename.slice(-43) : f.filename,
          String(f.changes),
          f.contributors.join(', ').substring(0, 32),
        ]);

        this.addTable(doc, fileHeaders, fileRows, fileColWidths, data);
      }

      // ─── 5. Security & Risk Findings ─────────────────────────────────────────
      this.addSectionTitle(doc, '5. Security & Risk Analysis', data, 35);

      if (!data.riskFindings || data.riskFindings.length === 0) {
        this.ensureSpace(doc, 22, data);
        const y = doc.y;
        doc.rect(40, y, totalWidth, 18).fillAndStroke('#ecfdf5', '#a7f3d0');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#059669').text(
          'CLEAN AUDIT: Zero hardcoded secrets, security vulnerabilities, or anti-patterns detected.',
          50,
          y + 5,
          { width: totalWidth - 20 }
        );
        doc.y = y + 22;
      } else {
        const severityColor = (s: string) => {
          if (s === 'critical') return RED;
          if (s === 'high') return '#ea580c';
          if (s === 'medium') return AMBER;
          return GREEN;
        };

        for (const finding of data.riskFindings.slice(0, 12)) {
          this.ensureSpace(doc, 26, data);
          const y = doc.y;
          const col = severityColor(finding.severity);

          doc.rect(40, y, totalWidth, 24).fillAndStroke('#f8fafc', BORDER);
          doc.rect(40, y, 3, 24).fill(col);

          doc.font('Helvetica-Bold').fontSize(7.5).fillColor(col).text(
            `[${finding.severity.toUpperCase()}] ${finding.title}`,
            48,
            y + 3,
            { width: totalWidth - 16, ellipsis: true }
          );
          doc.font('Helvetica').fontSize(6.5).fillColor(GRAY).text(
            `File: ${finding.affectedFile}  |  Commit: ${finding.commitSha.substring(0, 7)}  |  Rule: ${finding.detectionMethod}`,
            48,
            y + 13,
            { width: totalWidth - 16, ellipsis: true }
          );

          doc.y = y + 27;
        }

        if (data.riskFindings.length > 12) {
          doc.font('Helvetica').fontSize(7).fillColor(GRAY).text(
            `... and ${data.riskFindings.length - 12} more findings logged in GitScope AI.`,
            40,
            doc.y
          );
          doc.y += 6;
        }
      }

      // ─── 6. Collaboration & Overlap Insights ─────────────────────────────────
      this.addSectionTitle(doc, '6. Collaboration & Overlap Insights', data, 35);

      if (!data.collaborationFindings || data.collaborationFindings.length === 0) {
        this.ensureSpace(doc, 22, data);
        const y = doc.y;
        doc.rect(40, y, totalWidth, 18).fillAndStroke('#f8fafc', BORDER);
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GRAY).text(
          data.overview.activeContributors <= 1
            ? 'SINGLE CONTRIBUTOR: Zero overlapping edit conflicts or merge contentions identified.'
            : 'NO CONFLICTS: All contributor modifications occurred across isolated file sets.',
          50,
          y + 5,
          { width: totalWidth - 20 }
        );
        doc.y = y + 22;
      } else {
        for (const finding of data.collaborationFindings.slice(0, 8)) {
          this.ensureSpace(doc, 24, data);
          const y = doc.y;

          doc.rect(40, y, totalWidth, 22).fillAndStroke('#f8fafc', BORDER);
          doc.rect(40, y, 2.5, 22).fill(INDIGO);

          doc.font('Helvetica-Bold').fontSize(7.5).fillColor(NAVY).text(
            `[${finding.findingType.toUpperCase()}] ${finding.developers.join(' & ')}  (Confidence: ${finding.confidence})`,
            48,
            y + 3,
            { width: totalWidth - 16, ellipsis: true }
          );
          doc.font('Helvetica').fontSize(6.5).fillColor(GRAY).text(
            finding.evidence,
            48,
            y + 12,
            { width: totalWidth - 16, ellipsis: true }
          );

          doc.y = y + 25;
        }
      }

      // ─── 7. Methodology & Audit Notes ────────────────────────────────────────
      this.addSectionTitle(doc, '7. Audit Methodology & Limitations', data, 35);
      this.ensureSpace(doc, 30, data);

      doc.font('Helvetica').fontSize(6.5).fillColor(GRAY);
      const notes = [
        'Generated via GitHub REST API with read-only scopes. Real-time deterministic analysis without persistent code storage.',
        'Commit metrics reflect history at generation time; squash merges or rebases may consolidate commit records.',
        'Risk findings are heuristic indicators designed for developer review and should be verified prior to remediation.',
        ...(data.limitations || []),
      ];

      notes.forEach((note) => {
        doc.text(`• ${note}`, 40, doc.y, { width: totalWidth });
      });

      // ─── Running Headers on Page 2+ and Running Footers on ALL Pages ───────────
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Footer on every page
        const footerY = doc.page.height - 20;
        doc.moveTo(40, footerY - 4).lineTo(doc.page.width - 40, footerY - 4).lineWidth(0.5).stroke(BORDER);

        doc.font('Helvetica').fontSize(7).fillColor(GRAY).text(
          `GitScope AI — GitHub Repository Intelligence  •  ${data.owner}/${data.repo}`,
          40,
          footerY,
          { lineBreak: false }
        );

        doc.font('Helvetica-Bold').fontSize(7).fillColor(NAVY).text(
          `Page ${i + 1} of ${range.count}`,
          40,
          footerY,
          { align: 'right', width: totalWidth, lineBreak: false }
        );
      }

      doc.end();
    });
  }

  /**
   * Checks if content of neededHeight fits on the current page;
   * if not, advances to the next page and renders the running page header.
   */
  private ensureSpace(doc: PDFKit.PDFDocument, neededHeight: number, data: ReportData): void {
    if (doc.y + neededHeight > doc.page.height - 40) {
      this.addNewPage(doc, data);
    }
  }

  /**
   * Adds a new page and renders the page 2+ running header.
   */
  private addNewPage(doc: PDFKit.PDFDocument, data: ReportData): void {
    doc.addPage();
    const NAVY = '#0f172a';
    const INDIGO = '#4f46e5';
    const GRAY = '#64748b';
    const BORDER = '#e2e8f0';

    // Top accent bar
    doc.rect(0, 0, doc.page.width, 2.5).fill(INDIGO);

    // Compact running header
    doc.font('Helvetica-Bold').fontSize(8).fillColor(NAVY).text('GitScope AI', 40, 14, { continued: true });
    doc.font('Helvetica').fontSize(7.5).fillColor(GRAY).text(`  •  ${data.owner}/${data.repo} (${data.branch})`);

    doc.font('Helvetica').fontSize(7.5).fillColor(GRAY).text('Repository Intelligence Audit', 40, 14, {
      align: 'right',
      width: doc.page.width - 80,
    });

    doc.moveTo(40, 26).lineTo(doc.page.width - 40, 26).lineWidth(0.5).stroke(BORDER);
    doc.y = 34;
  }

  /**
   * Adds a section title with a left accent bar, only breaking page if needed.
   */
  private addSectionTitle(doc: PDFKit.PDFDocument, title: string, data: ReportData, neededHeight: number = 50): void {
    this.ensureSpace(doc, neededHeight, data);

    const NAVY = '#0f172a';
    const INDIGO = '#4f46e5';
    const BORDER = '#e2e8f0';

    if (doc.y > 40) {
      doc.y += 4;
    }

    const startY = doc.y;
    // Colored accent pip
    doc.rect(40, startY + 1, 2.5, 9.5).fill(INDIGO);

    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(NAVY).text(title, 46, startY);
    doc.moveTo(40, startY + 14).lineTo(doc.page.width - 40, startY + 14).lineWidth(0.5).stroke(BORDER);
    doc.y = startY + 18;
  }

  /**
   * Renders the 4 executive KPI metric tiles.
   */
  private addMetricRow(
    doc: PDFKit.PDFDocument,
    metrics: Array<{ label: string; value: string; color?: string }>,
    data: ReportData
  ): void {
    this.ensureSpace(doc, 44, data);

    const totalWidth = doc.page.width - 80;
    const colWidth = (totalWidth - (metrics.length - 1) * 6) / metrics.length;
    const startX = 40;
    const startY = doc.y;
    const cardHeight = 38;

    metrics.forEach((m, i) => {
      const x = startX + i * (colWidth + 6);
      doc.rect(x, startY, colWidth, cardHeight).fillAndStroke('#f8fafc', '#e2e8f0');

      // Value
      doc.font('Helvetica-Bold').fontSize(14).fillColor(m.color || '#4f46e5').text(
        m.value,
        x + 6,
        startY + 6,
        { width: colWidth - 12 }
      );

      // Label
      doc.font('Helvetica').fontSize(6.5).fillColor('#64748b').text(
        m.label.toUpperCase(),
        x + 6,
        startY + 24,
        { width: colWidth - 12 }
      );
    });

    doc.y = startY + cardHeight + 6;
  }

  /**
   * Renders a table with automatic row-by-row pagination and repeated headers if page breaks.
   */
  private addTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    colWidths: number[],
    data: ReportData
  ): void {
    const startX = 40;
    const totalWidth = doc.page.width - 80;
    const headerHeight = 16;
    const rowHeight = 14;

    this.ensureSpace(doc, headerHeight + rowHeight + 8, data);

    const drawHeader = () => {
      const y = doc.y;
      doc.rect(startX, y, totalWidth, headerHeight).fill('#1e293b');
      let curX = startX;
      headers.forEach((h, i) => {
        const w = colWidths[i];
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#ffffff').text(
          h.toUpperCase(),
          curX + 6,
          y + 4.5,
          { width: w - 12 }
        );
        curX += w;
      });
      doc.y = y + headerHeight;
    };

    drawHeader();

    rows.forEach((row, rowIndex) => {
      if (doc.y + rowHeight > doc.page.height - 35) {
        this.addNewPage(doc, data);
        drawHeader();
      }

      const y = doc.y;
      const isEven = rowIndex % 2 === 0;
      doc.rect(startX, y, totalWidth, rowHeight).fill(isEven ? '#f8fafc' : '#ffffff');

      let curX = startX;
      row.forEach((cell, i) => {
        const w = colWidths[i];
        doc.font('Helvetica').fontSize(7).fillColor('#1e293b').text(
          cell,
          curX + 6,
          y + 3.5,
          { width: w - 12, ellipsis: true }
        );
        curX += w;
      });
      doc.y = y + rowHeight;
    });

    doc.y += 4;
  }
}
