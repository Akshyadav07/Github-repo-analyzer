"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000').transform(Number),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI is required'),
    GITHUB_CLIENT_ID: zod_1.z.string().min(1, 'GITHUB_CLIENT_ID is required'),
    GITHUB_CLIENT_SECRET: zod_1.z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
    GITHUB_CALLBACK_URL: zod_1.z.string().url(),
    SESSION_SECRET: zod_1.z.string().min(32, 'SESSION_SECRET must be at least 32 chars'),
    APP_BASE_URL: zod_1.z.string().url(),
    FRONTEND_URL: zod_1.z.string().url(),
    AI_PROVIDER: zod_1.z.string().optional(),
    AI_API_KEY: zod_1.z.string().optional(),
    REPORT_STORAGE_PATH: zod_1.z.string().default('./reports'),
    ENCRYPTION_KEY: zod_1.z.string().optional(),
});
const parseResult = envSchema.safeParse(process.env);
if (!parseResult.success) {
    console.error('❌ Invalid environment variables:');
    parseResult.error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
}
exports.env = parseResult.data;
//# sourceMappingURL=env.js.map