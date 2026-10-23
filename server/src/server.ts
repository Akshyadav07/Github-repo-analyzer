import { connectDatabase } from './config/database';
import { env } from './config/env';
import app from './app';

async function start(): Promise<void> {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`🚀 GitScope AI server running on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Frontend:    ${env.FRONTEND_URL}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
