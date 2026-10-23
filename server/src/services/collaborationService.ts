import { GitHubCommit, GitHubCommitFile } from './githubService';
import { v4 as uuidv4 } from 'uuid';

export interface CollaborationResult {
  findingId: string;
  findingType: 'shared-file' | 'overlapping-lines' | 'shared-module' | 'potential-conflict';
  developers: string[];
  relatedCommits: string[];
  filePaths: string[];
  lineRanges?: Array<{ file: string; start: number; end: number }>;
  evidence: string;
  confidence: 'verified' | 'probable' | 'possible';
  confidenceExplanation: string;
  recommendedAction: string;
}

interface CommitWithFiles extends GitHubCommit {
  files?: GitHubCommitFile[];
}

export class CollaborationService {
  detectOverlaps(commits: CommitWithFiles[], windowDays = 7): CollaborationResult[] {
    const findings: CollaborationResult[] = [];

    // Group commits by file
    const fileCommitMap = new Map<string, CommitWithFiles[]>();

    for (const commit of commits) {
      if (!commit.files) continue;
      for (const file of commit.files) {
        const existing = fileCommitMap.get(file.filename) ?? [];
        existing.push(commit);
        fileCommitMap.set(file.filename, existing);
      }
    }

    // Detect shared-file changes within window
    for (const [filename, fileCommits] of fileCommitMap.entries()) {
      if (fileCommits.length < 2) continue;

      const uniqueDevs = new Set(fileCommits.map((c) => c.authorLogin ?? c.authorName));
      if (uniqueDevs.size < 2) continue;

      // Check if changes happened within the time window
      const sortedCommits = [...fileCommits].sort(
        (a, b) => new Date(a.authoredAt).getTime() - new Date(b.authoredAt).getTime()
      );

      for (let i = 0; i < sortedCommits.length - 1; i++) {
        const c1 = sortedCommits[i];
        const c2 = sortedCommits[i + 1];
        const dev1 = c1.authorLogin ?? c1.authorName;
        const dev2 = c2.authorLogin ?? c2.authorName;

        if (dev1 === dev2) continue;

        const diffMs = new Date(c2.authoredAt).getTime() - new Date(c1.authoredAt).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays > windowDays) continue;

        // Check for line-level overlap if patches available
        const file1 = c1.files?.find((f) => f.filename === filename);
        const file2 = c2.files?.find((f) => f.filename === filename);

        let confidence: 'verified' | 'probable' | 'possible' = 'possible';
        let findingType: CollaborationResult['findingType'] = 'shared-file';
        let lineRanges: Array<{ file: string; start: number; end: number }> | undefined;

        if (file1?.patch && file2?.patch) {
          const ranges1 = extractChangedLines(file1.patch);
          const ranges2 = extractChangedLines(file2.patch);
          const overlapping = findOverlappingRanges(ranges1, ranges2);

          if (overlapping.length > 0) {
            confidence = 'probable';
            findingType = 'overlapping-lines';
            lineRanges = overlapping.map((r) => ({ file: filename, start: r.start, end: r.end }));
          }
        }

        findings.push({
          findingId: uuidv4(),
          findingType,
          developers: [dev1, dev2],
          relatedCommits: [c1.sha, c2.sha],
          filePaths: [filename],
          lineRanges,
          evidence: `${dev1} modified "${filename}" at ${new Date(c1.authoredAt).toISOString()} and ${dev2} modified it ${Math.round(diffDays * 24)} hours later.`,
          confidence,
          confidenceExplanation:
            findingType === 'overlapping-lines'
              ? 'Both commits include patches showing changes to overlapping line ranges.'
              : 'Two different developers modified the same file within the configured time window. Line-level comparison not available.',
          recommendedAction:
            'Review both commits to ensure the changes are compatible. Consider a code review or pair programming session.',
        });
      }
    }

    return findings;
  }

  detectSharedModules(commits: CommitWithFiles[]): CollaborationResult[] {
    const findings: CollaborationResult[] = [];
    const moduleDevMap = new Map<string, Set<string>>();
    const moduleCommitMap = new Map<string, string[]>();

    for (const commit of commits) {
      if (!commit.files) continue;
      const dev = commit.authorLogin ?? commit.authorName;

      for (const file of commit.files) {
        // Extract module/directory
        const parts = file.filename.split('/');
        const module = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';

        const devs = moduleDevMap.get(module) ?? new Set<string>();
        devs.add(dev);
        moduleDevMap.set(module, devs);

        const commitShas = moduleCommitMap.get(module) ?? [];
        if (!commitShas.includes(commit.sha)) commitShas.push(commit.sha);
        moduleCommitMap.set(module, commitShas);
      }
    }

    for (const [module, devSet] of moduleDevMap.entries()) {
      if (devSet.size < 2) continue;
      const devs = Array.from(devSet);
      const relatedCommits = moduleCommitMap.get(module) ?? [];

      findings.push({
        findingId: uuidv4(),
        findingType: 'shared-module',
        developers: devs,
        relatedCommits: relatedCommits.slice(0, 10),
        filePaths: [`${module}/`],
        evidence: `${devs.length} contributors (${devs.join(', ')}) modified files within the "${module}" module.`,
        confidence: 'possible',
        confidenceExplanation: 'Shared directory access does not necessarily indicate a conflict but may warrant coordination.',
        recommendedAction: 'Ensure the team is coordinating changes to this module to avoid integration issues.',
      });
    }

    return findings;
  }
}

function extractChangedLines(patch: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const hunkHeaderRegex = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
  let match;

  while ((match = hunkHeaderRegex.exec(patch)) !== null) {
    const start = parseInt(match[1], 10);
    const count = match[2] !== undefined ? parseInt(match[2], 10) : 1;
    ranges.push({ start, end: start + count - 1 });
  }
  return ranges;
}

function findOverlappingRanges(
  ranges1: Array<{ start: number; end: number }>,
  ranges2: Array<{ start: number; end: number }>
): Array<{ start: number; end: number }> {
  const overlapping: Array<{ start: number; end: number }> = [];
  for (const r1 of ranges1) {
    for (const r2 of ranges2) {
      if (r1.start <= r2.end + 10 && r2.start <= r1.end + 10) {
        overlapping.push({ start: Math.min(r1.start, r2.start), end: Math.max(r1.end, r2.end) });
      }
    }
  }
  return overlapping;
}
