"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
async function start() {
    await (0, database_1.connectDatabase)();
    app_1.default.listen(env_1.env.PORT, () => {
        console.log(`🚀 GitScope AI server running on http://localhost:${env_1.env.PORT}`);
        console.log(`   Environment: ${env_1.env.NODE_ENV}`);
        console.log(`   Frontend:    ${env_1.env.FRONTEND_URL}`);
    });
}
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map