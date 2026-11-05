import { closeDatabase, resetDatabase } from './db.js';

try {
  await resetDatabase();
  console.log('Base de datos reiniciada con los datos semilla.');
} catch (error) {
  console.error('No se pudo reiniciar la base de datos:', error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
