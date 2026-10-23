import { GitHubCommitFile } from './githubService';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export interface RiskFindingResult {
    findingId: string;
    category: string;
    severity: RiskSeverity;
    title: string;
    description: string;
    affectedFile: string;
    lineStart?: number;
    lineEnd?: number;
    commitSha: string;
    evidenceSnippet?: string;
    detectionMethod: 'deterministic' | 'heuristic';
    confidenceExplanation: string;
    recommendedFix: string;
    suggestedTests?: string;
}
export declare class RiskAnalysisService {
    analyzeCommitFiles(sha: string, files: GitHubCommitFile[]): RiskFindingResult[];
    private createFinding;
}
//# sourceMappingURL=riskAnalysisService.d.ts.map