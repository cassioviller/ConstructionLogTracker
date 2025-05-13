import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Configuração do cliente Postgres
const connectionString = process.env.DATABASE_URL;

// Cliente sql para consultas
const client = postgres(connectionString!, {
  max: 10, // Número máximo de conexões no pool
  onnotice: () => {}, // Ignorar avisos
});

// Cliente Drizzle ORM com schema
export const db = drizzle(client, { schema });

console.log('Conexão com banco de dados PostgreSQL estabelecida');