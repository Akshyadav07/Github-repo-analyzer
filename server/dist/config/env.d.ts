export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    MONGODB_URI: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GITHUB_CALLBACK_URL: string;
    SESSION_SECRET: string;
    APP_BASE_URL: string;
    FRONTEND_URL: string;
    AI_PROVIDER?: string | undefined;
    AI_API_KEY?: string | undefined;
    REPORT_STORAGE_PATH: string;
    ENCRYPTION_KEY?: string | undefined;
};
export type Env = typeof env;
//# sourceMappingURL=env.d.ts.map