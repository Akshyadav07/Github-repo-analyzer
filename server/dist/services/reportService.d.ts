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
    contributors: Array<{
        login: string;
        commits: number;
        additions: number;
        deletions: number;
    }>;
    topFiles: Array<{
        filename: string;
        changes: number;
        contributors: string[];
    }>;
    commitTypes: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
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
export declare class ReportService {
    generatePDF(data: ReportData, reportId: string): Promise<string>;
    private addSection;
    private addMetricRow;
    private addTable;
}
//# sourceMappingURL=reportService.d.ts.map