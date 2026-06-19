import createTables from '../config/schema';
import { query } from '../config/database';

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    await createTables();
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
