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
    const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: true });
    const stream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      doc.on('error', reject);
      stream.on('finish', () => resolve(filePath));

      doc.pipe(stream);

      // Color palette
      const NAVY = '#1a1f36';
      const INDIGO = '#6366f1';
      const GRAY = '#64748b';
      const LIGHT_GRAY = '#f1f5f9';
      const WHITE = '#ffffff';
      const RED = '#ef4444';
      const AMBER = '#f59e0b';
      const GREEN = '#10b981';

      // ─── Cover Page ───────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 200).fill(NAVY);
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor(WHITE)
        .text('GitScope AI', 50, 60);
      doc
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#a5b4fc')
        .text('GitHub Repository Intelligence Report', 50, 100);

      doc.fillColor(WHITE).fontSize(20).font('Helvetica-Bold').text(data.title, 50, 140);
      doc.moveDown(3);

      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(12).text('Repository', { continued: true });
      doc.font('Helvetica').fillColor(GRAY).text(`  ${data.owner}/${data.repo}`);
      doc.font('Helvetica-Bold').fillColor(NAVY).text('Branch', { continued: true });
      doc.font('Helvetica').fillColor(GRAY).text(`  ${data.branch}`);
      doc.font('Helvetica-Bold').fillColor(NAVY).text('Generated', { continued: true });
      doc.font('Helvetica').fillColor(GRAY).text(`  ${new Date(data.generatedAt).toLocaleString()}`);

      if (data.startDate) {
        doc.font('Helvetica-Bold').fillColor(NAVY).text('Period', { continued: true });
        doc.font('Helvetica').fillColor(GRAY).text(`  ${data.startDate} → ${data.endDate ?? 'now'}`);
      }

      // ─── Executive Summary ───────────────────────────────────────────────────
      this.addSection(doc, NAVY, INDIGO, 'Executive Summary');

      this.addMetricRow(doc, [
        { label: 'Total Commits', value: String(data.overview.totalCommits) },
        { label: 'Active Contributors', value: String(data.overview.activeContributors) },
        { label: 'Lines Added', value: `+${data.overview.totalAdditions.toLocaleString()}` },
        { label: 'Lines Deleted', value: `-${data.overview.totalDeletions.toLocaleString()}` },
      ], INDIGO, LIGHT_GRAY);

      doc.moveDown();
      doc.fillColor(GRAY).font('Helvetica').fontSize(10).text(
        `This report covers ${data.overview.totalCommits} commits by ${data.overview.activeContributors} contributor(s) on the "${data.branch}" branch of the ${data.owner}/${data.repo} repository.`
      );

      // ─── Contributors ────────────────────────────────────────────────────────
      this.addSection(doc, NAVY, INDIGO, 'Developer Contributions');
      this.addTable(
        doc,
        ['Developer', 'Commits', 'Lines Added', 'Lines Deleted'],
        data.contributors.slice(0, 15).map((c) => [
          c.login,
          String(c.commits),
          `+${c.additions.toLocaleString()}`,
          `-${c.deletions.toLocaleString()}`,
        ]),
        NAVY,
        LIGHT_GRAY
      );
      doc.moveDown(0.5);
      doc.fillColor(GRAY).fontSize(9).text(
        'Note: Commit counts and line statistics are derived from GitHub API data and may differ from local git history due to squash merges, rebases, and pagination limits.'
      );

      // ─── Commit Type Distribution ─────────────────────────────────────────────
      if (data.commitTypes.length > 0) {
        this.addSection(doc, NAVY, INDIGO, 'Commit Type Distribution');
        this.addTable(
          doc,
          ['Commit Type', 'Count', 'Percentage'],
          data.commitTypes.map((ct) => [ct.type, String(ct.count), `${ct.percentage}%`]),
          NAVY,
          LIGHT_GRAY
        );
        doc.moveDown(0.5);
        doc.fillColor(GRAY).fontSize(9).text(
          'Commit types are inferred from commit message patterns and should be treated as approximate classifications.'
        );
      }

      // ─── Top Modified Files ───────────────────────────────────────────────────
      if (data.topFiles.length > 0) {
        this.addSection(doc, NAVY, INDIGO, 'Most Frequently Modified Files');
        this.addTable(
          doc,
          ['File', 'Changes', 'Contributors'],
          data.topFiles.slice(0, 20).map((f) => [
            f.filename.length > 50 ? '...' + f.filename.slice(-47) : f.filename,
            String(f.changes),
            f.contributors.join(', ').substring(0, 40),
          ]),
          NAVY,
          LIGHT_GRAY
        );
      }

      // ─── Risk Findings ────────────────────────────────────────────────────────
      this.addSection(doc, NAVY, INDIGO, 'Risk & Bug Analysis Findings');

      if (data.riskFindings.length === 0) {
        doc.fillColor(GREEN).font('Helvetica').fontSize(11).text('No risk findings detected in the analyzed commits.');
      } else {
        const severityColor = (s: string) => {
          if (s === 'critical') return RED;
          if (s === 'high') return '#f97316';
          if (s === 'medium') return AMBER;
          return GREEN;
        };

        for (const finding of data.riskFindings.slice(0, 20)) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(11).fillColor(severityColor(finding.severity)).text(
            `[${finding.severity.toUpperCase()}] ${finding.title}`
          );
          doc.font('Helvetica').fontSize(9).fillColor(GRAY).text(`File: ${finding.affectedFile}  |  Commit: ${finding.commitSha.substring(0, 8)}  |  Detection: ${finding.detectionMethod}`);
          doc.fillColor('#374151').fontSize(10).text(finding.description);
        }

        if (data.riskFindings.length > 20) {
          doc.moveDown(0.5).fillColor(GRAY).text(`... and ${data.riskFindings.length - 20} more findings. View the full list in the GitScope AI dashboard.`);
        }
      }

      // ─── Collaboration Findings ───────────────────────────────────────────────
      this.addSection(doc, NAVY, INDIGO, 'Collaboration & Overlap Insights');

      if (data.collaborationFindings.length === 0) {
        doc.fillColor(GRAY).fontSize(11).text('No collaboration overlap findings detected in the analyzed commits.');
      } else {
        for (const finding of data.collaborationFindings.slice(0, 15)) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text(
            `[${finding.findingType.toUpperCase()}] ${finding.developers.join(' & ')}`
          );
          doc.font('Helvetica').fontSize(9).fillColor(GRAY).text(`Confidence: ${finding.confidence}`);
          doc.fillColor('#374151').fontSize(10).text(finding.evidence);
        }
      }

      // ─── Methodology & Limitations ────────────────────────────────────────────
      this.addSection(doc, NAVY, INDIGO, 'Methodology & Limitations');
      doc.fillColor('#374151').font('Helvetica').fontSize(10);
      doc.text('This report was generated by GitScope AI using the GitHub REST API. Analysis is limited to the commits and file patches available within the selected date range and API rate limits.');
      doc.moveDown(0.5);
      doc.text('Limitations:');

      const defaultLimitations = [
        'Commit statistics reflect what was retrievable via the GitHub API at the time of generation.',
        'Risk findings use deterministic heuristics and may produce false positives. All findings require human review.',
        'Collaboration findings identify potential overlaps based on file paths and line ranges; they do not indicate conflicts or errors.',
        'Large repositories may have incomplete coverage due to API pagination limits.',
        ...data.limitations,
      ];

      defaultLimitations.forEach((l) => {
        doc.text(`• ${l}`);
      });

      // ─── Footer ───────────────────────────────────────────────────────────────
      const pageCount = (doc as any)._pageBuffer?.length ?? 1;
      doc.on('pageAdded', () => {
        doc.fontSize(8).fillColor(GRAY).text(
          `GitScope AI — ${data.owner}/${data.repo} — Generated ${new Date(data.generatedAt).toLocaleDateString()}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 }
        );
      });

      doc.end();
    });
  }

  private addSection(doc: PDFKit.PDFDocument, navyColor: string, accentColor: string, title: string): void {
    doc.addPage();
    doc.rect(0, 0, doc.page.width, 6).fill(accentColor);
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(16).fillColor(navyColor).text(title);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(accentColor);
    doc.moveDown(0.5);
  }

  private addMetricRow(
    doc: PDFKit.PDFDocument,
    metrics: Array<{ label: string; value: string }>,
    accentColor: string,
    bgColor: string
  ): void {
    const colWidth = (doc.page.width - 100) / metrics.length;
    const startX = 50;
    const startY = doc.y;

    metrics.forEach((m, i) => {
      doc.rect(startX + i * colWidth + 2, startY, colWidth - 4, 60).fill(bgColor);
      doc.font('Helvetica-Bold').fontSize(20).fillColor(accentColor).text(m.value, startX + i * colWidth + 8, startY + 10, { width: colWidth - 16 });
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(m.label, startX + i * colWidth + 8, startY + 38, { width: colWidth - 16 });
    });

    doc.y = startY + 70;
  }

  private addTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    headerBg: string,
    rowBg: string
  ): void {
    const colWidth = (doc.page.width - 100) / headers.length;
    const startX = 50;

    // Header
    const headerY = doc.y;
    headers.forEach((h, i) => {
      doc.rect(startX + i * colWidth, headerY, colWidth, 20).fill(headerBg);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text(h, startX + i * colWidth + 4, headerY + 6, { width: colWidth - 8 });
    });
    doc.y = headerY + 22;

    // Rows
    rows.forEach((row, rowIndex) => {
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
        doc.y = 50;
      }
      const currentRowY = doc.y;

      row.forEach((cell, i) => {
        if (rowIndex % 2 === 0) {
          doc.rect(startX + i * colWidth, currentRowY, colWidth, 18).fill(rowBg);
        }
        doc.font('Helvetica').fontSize(8).fillColor('#1e293b').text(
          cell.length > 35 ? cell.substring(0, 32) + '...' : cell,
          startX + i * colWidth + 4,
          currentRowY + 5,
          { width: colWidth - 8 }
        );
      });
      doc.y = currentRowY + 20;
    });
  }
}
