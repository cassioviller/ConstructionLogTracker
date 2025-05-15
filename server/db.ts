import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Configuração do cliente Postgres
const connectionString = process.env.DATABASE_URL || 'postgres://obras:obras@estruturas_diariodeobras:5432/obras?sslmode=disable';

// Cliente sql para consultas
const client = postgres(connectionString, {
  max: 10, // Número máximo de conexões no pool
  onnotice: () => {}, // Ignorar avisos
  connect_timeout: 10, // Tempo limite para conexão em segundos
});

// Cliente Drizzle ORM com schema
export const db = drizzle(client, { schema });

console.log('Conexão com banco de dados PostgreSQL estabelecida');