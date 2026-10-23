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
    /**
     * Checks if content of neededHeight fits on the current page;
     * if not, advances to the next page and renders the running page header.
     */
    private ensureSpace;
    /**
     * Adds a new page and renders the page 2+ running header.
     */
    private addNewPage;
    /**
     * Adds a section title with a left accent bar, only breaking page if needed.
     */
    private addSectionTitle;
    /**
     * Renders the 4 executive KPI metric tiles.
     */
    private addMetricRow;
    /**
     * Renders a table with automatic row-by-row pagination and repeated headers if page breaks.
     */
    private addTable;
}
//# sourceMappingURL=reportService.d.ts.map