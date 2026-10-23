"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationFinding = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CollaborationFindingSchema = new mongoose_1.Schema({
    repositoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Repository', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AnalysisJob' },
    findingType: {
        type: String,
        enum: ['shared-file', 'overlapping-lines', 'shared-module', 'potential-conflict'],
        required: true,
    },
    developers: [{ type: String }],
    relatedCommits: [{ type: String }],
    filePaths: [{ type: String }],
    lineRanges: [
        {
            file: String,
            start: Number,
            end: Number,
        },
    ],
    evidence: { type: String, required: true },
    confidence: { type: String, enum: ['verified', 'probable', 'possible'], required: true },
    confidenceExplanation: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    reviewStatus: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
}, { timestamps: true });
CollaborationFindingSchema.index({ repositoryId: 1, findingType: 1 });
exports.CollaborationFinding = mongoose_1.default.model('CollaborationFinding', CollaborationFindingSchema);
//# sourceMappingURL=CollaborationFinding.js.map