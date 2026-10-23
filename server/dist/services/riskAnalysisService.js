"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAnalysisService = void 0;
const uuid_1 = require("uuid");
// Patterns for deterministic checks
const SECRET_PATTERNS = [
    { pattern: /(?:password|passwd|pwd)\s*=\s*['"][^'"]{4,}['"]/gi, label: 'Hardcoded password' },
    { pattern: /(?:api_key|apikey|api-key)\s*=\s*['"][^'"]{8,}['"]/gi, label: 'Hardcoded API key' },
    { pattern: /(?:secret|token)\s*=\s*['"][^'"]{8,}['"]/gi, label: 'Hardcoded secret/token' },
    { pattern: /-----BEGIN\s+(?:RSA|EC|DSA)?\s*PRIVATE KEY-----/g, label: 'Private key in source' },
    { pattern: /(?:AKIA|ASIA)[A-Z0-9]{16}/g, label: 'Possible AWS access key' },
];
const DEBUG_PATTERNS = [
    { pattern: /console\.log\(.*password/gi, label: 'Possible credential logging' },
    { pattern: /debugger;/g, label: 'Debugger statement' },
    { pattern: /TODO.*(?:hack|fixme|xxx)/gi, label: 'Risky TODO comment' },
];
const DANGEROUS_PATTERNS = [
    { pattern: /eval\s*\(/g, label: 'eval() usage' },
    { pattern: /exec\s*\(`[^`]*\$\{/g, label: 'Template literal in exec (injection risk)' },
    { pattern: /child_process\.exec\s*\(/g, label: 'Child process exec' },
    { pattern: /\.innerHTML\s*=\s*[^'"]/g, label: 'Potential XSS via innerHTML' },
];
const AUTH_FILE_PATTERNS = [
    /auth/i, /login/i, /session/i, /token/i, /permission/i, /role/i, /middleware/i,
];
class RiskAnalysisService {
    analyzeCommitFiles(sha, files) {
        const findings = [];
        for (const file of files) {
            if (!file.patch)
                continue;
            const patch = file.patch;
            const lines = patch.split('\n');
            // Run secret checks
            SECRET_PATTERNS.forEach(({ pattern, label }) => {
                const addedLines = lines.filter((l) => l.startsWith('+'));
                addedLines.forEach((line) => {
                    pattern.lastIndex = 0;
                    if (pattern.test(line)) {
                        findings.push(this.createFinding(sha, file.filename, {
                            category: 'Security',
                            severity: 'critical',
                            title: label,
                            description: `A possible ${label.toLowerCase()} was detected in the changed code. Hardcoded secrets should never be committed to version control.`,
                            evidenceSnippet: line.substring(0, 200),
                            confidenceExplanation: 'Pattern match on added lines. May be a false positive for test fixtures or example code.',
                            recommendedFix: 'Remove the hardcoded secret, use environment variables or a secret manager, and rotate the credential immediately.',
                            suggestedTests: 'Add a pre-commit hook (e.g., detect-secrets, gitleaks) to prevent future secret commits.',
                            detectionMethod: 'deterministic',
                        }));
                    }
                });
            });
            // Debug patterns
            DEBUG_PATTERNS.forEach(({ pattern, label }) => {
                const addedLines = lines.filter((l) => l.startsWith('+'));
                addedLines.forEach((line) => {
                    pattern.lastIndex = 0;
                    if (pattern.test(line)) {
                        findings.push(this.createFinding(sha, file.filename, {
                            category: 'Code Quality',
                            severity: 'low',
                            title: label,
                            description: `${label} detected in committed code. Debug artifacts may expose sensitive information or degrade performance.`,
                            evidenceSnippet: line.substring(0, 200),
                            confidenceExplanation: 'Pattern match on added lines. Verify this is not intentional.',
                            recommendedFix: 'Remove debug statements before merging to main branches.',
                            detectionMethod: 'heuristic',
                        }));
                    }
                });
            });
            // Dangerous patterns
            DANGEROUS_PATTERNS.forEach(({ pattern, label }) => {
                const addedLines = lines.filter((l) => l.startsWith('+'));
                addedLines.forEach((line) => {
                    pattern.lastIndex = 0;
                    if (pattern.test(line)) {
                        findings.push(this.createFinding(sha, file.filename, {
                            category: 'Security',
                            severity: 'high',
                            title: label,
                            description: `Potentially dangerous pattern "${label}" detected in changed code.`,
                            evidenceSnippet: line.substring(0, 200),
                            confidenceExplanation: 'Heuristic pattern match. Review context carefully before dismissing.',
                            recommendedFix: 'Replace with a safer alternative. Review the security implications of this pattern.',
                            detectionMethod: 'heuristic',
                        }));
                    }
                });
            });
            // Large change check
            if (file.changes > 500) {
                findings.push(this.createFinding(sha, file.filename, {
                    category: 'Code Churn',
                    severity: 'medium',
                    title: 'Very large change set',
                    description: `This commit changes ${file.changes} lines in a single file. Large changes are harder to review and may introduce integration issues.`,
                    confidenceExplanation: 'Based on GitHub diff statistics.',
                    recommendedFix: 'Consider breaking large changes into smaller, focused commits. Ensure thorough code review.',
                    detectionMethod: 'deterministic',
                }));
            }
            // Auth file changes
            const isAuthFile = AUTH_FILE_PATTERNS.some((p) => p.test(file.filename));
            if (isAuthFile && file.changes > 20) {
                findings.push(this.createFinding(sha, file.filename, {
                    category: 'Security',
                    severity: 'medium',
                    title: 'Significant changes to authentication/authorization file',
                    description: `The file "${file.filename}" appears to be related to authentication or authorization and received ${file.changes} changes. These files require careful review.`,
                    confidenceExplanation: 'File path pattern match. Changes to auth-related files carry higher security risk.',
                    recommendedFix: 'Ensure this change was intentional, reviewed by a security-aware team member, and covered by tests.',
                    suggestedTests: 'Add or update authentication and authorization tests to cover the changed behavior.',
                    detectionMethod: 'heuristic',
                }));
            }
        }
        // Deduplicate similar findings
        const seen = new Set();
        return findings.filter((f) => {
            const key = `${f.affectedFile}:${f.title}:${f.commitSha}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    createFinding(sha, filename, data) {
        return {
            findingId: (0, uuid_1.v4)(),
            commitSha: sha,
            affectedFile: filename,
            ...data,
        };
    }
}
exports.RiskAnalysisService = RiskAnalysisService;
//# sourceMappingURL=riskAnalysisService.js.map