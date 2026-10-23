"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const date_fns_1 = require("date-fns");
class AnalyticsService {
    buildCommitActivity(commits, granularity = 'daily', startDate, endDate) {
        if (commits.length === 0)
            return [];
        const commitsByDate = new Map();
        for (const commit of commits) {
            const date = new Date(commit.authoredAt);
            let key;
            if (granularity === 'daily')
                key = (0, date_fns_1.format)((0, date_fns_1.startOfDay)(date), 'yyyy-MM-dd');
            else if (granularity === 'weekly')
                key = (0, date_fns_1.format)((0, date_fns_1.startOfDay)(date), 'yyyy-\'W\'II');
            else
                key = (0, date_fns_1.format)((0, date_fns_1.startOfDay)(date), 'yyyy-MM');
            const existing = commitsByDate.get(key) ?? { commits: 0, additions: 0, deletions: 0 };
            existing.commits++;
            existing.additions += commit.additions;
            existing.deletions += commit.deletions;
            commitsByDate.set(key, existing);
        }
        const result = [];
        for (const [date, data] of commitsByDate.entries()) {
            result.push({ date, ...data });
        }
        return result.sort((a, b) => a.date.localeCompare(b.date));
    }
    buildContributorStats(commits) {
        const statsMap = new Map();
        for (const commit of commits) {
            const key = commit.authorLogin ?? commit.authorEmail ?? commit.authorName;
            const existing = statsMap.get(key) ?? {
                login: commit.authorLogin ?? commit.authorName,
                avatarUrl: commit.authorAvatarUrl ?? '',
                commits: 0,
                additions: 0,
                deletions: 0,
                filesChanged: 0,
                firstCommit: commit.authoredAt,
                lastCommit: commit.authoredAt,
            };
            existing.commits++;
            existing.additions += commit.additions;
            existing.deletions += commit.deletions;
            existing.filesChanged += commit.changedFiles;
            if (!existing.firstCommit || commit.authoredAt < existing.firstCommit) {
                existing.firstCommit = commit.authoredAt;
            }
            if (!existing.lastCommit || commit.authoredAt > existing.lastCommit) {
                existing.lastCommit = commit.authoredAt;
            }
            statsMap.set(key, existing);
        }
        return Array.from(statsMap.values()).sort((a, b) => b.commits - a.commits);
    }
    buildFileActivity(commits) {
        const fileMap = new Map();
        for (const commit of commits) {
            const dev = commit.authorLogin ?? commit.authorName;
            if (!commit.files)
                continue;
            for (const file of commit.files) {
                const existing = fileMap.get(file.filename) ?? {
                    filename: file.filename,
                    changes: 0,
                    additions: 0,
                    deletions: 0,
                    contributors: [],
                    lastModified: commit.authoredAt,
                };
                existing.changes++;
                existing.additions += file.additions;
                existing.deletions += file.deletions;
                if (!existing.contributors.includes(dev))
                    existing.contributors.push(dev);
                if (!existing.lastModified || commit.authoredAt > existing.lastModified) {
                    existing.lastModified = commit.authoredAt;
                }
                fileMap.set(file.filename, existing);
            }
        }
        return Array.from(fileMap.values()).sort((a, b) => b.changes - a.changes).slice(0, 50);
    }
    classifyCommitTypes(commits) {
        const counts = {
            feature: 0,
            'bug fix': 0,
            refactor: 0,
            documentation: 0,
            test: 0,
            maintenance: 0,
            unknown: 0,
        };
        const patterns = [
            { type: 'feature', regex: /^feat(?:\(.+\))?:|add(?:ed)?:|implement(?:ed)?:|new\s+/i },
            { type: 'bug fix', regex: /^fix(?:\(.+\))?:|bug|hotfix|patch|resolv/i },
            { type: 'refactor', regex: /^refactor(?:\(.+\))?:|refactor|rewrite|restructur/i },
            { type: 'documentation', regex: /^docs?(?:\(.+\))?:|update readme|document|comment/i },
            { type: 'test', regex: /^test(?:\(.+\))?:|add test|spec|coverage/i },
            { type: 'maintenance', regex: /^chore(?:\(.+\))?:|bump|upgrade|update dep|ci:|build:|release:/i },
        ];
        for (const commit of commits) {
            const msg = commit.message.split('\n')[0].toLowerCase();
            let matched = false;
            for (const { type, regex } of patterns) {
                if (regex.test(msg)) {
                    counts[type]++;
                    matched = true;
                    break;
                }
            }
            if (!matched)
                counts['unknown']++;
        }
        const total = commits.length;
        return Object.entries(counts)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => ({
            type,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
            .sort((a, b) => b.count - a.count);
    }
    buildHeatmap(commits) {
        const map = new Map();
        for (const commit of commits) {
            const date = (0, date_fns_1.format)(new Date(commit.authoredAt), 'yyyy-MM-dd');
            map.set(date, (map.get(date) ?? 0) + 1);
        }
        return Array.from(map.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analyticsService.js.map