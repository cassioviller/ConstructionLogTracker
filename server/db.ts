import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Configuração do cliente Postgres
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_sdivzNC3KMy2@ep-shrill-dust-a5nw6bdb.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Configuração básica para o cliente Postgres
const clientConfig = {
  max: 10,                       // Número máximo de conexões no pool
  connect_timeout: 30,           // Aumentando tempo limite para conexão (30s)
  ssl: connectionString.includes('sslmode=require'),
  idle_timeout: 20               // Tempo máximo em segundos que uma conexão pode ficar ociosa (20s)
};

// Cliente SQL para consultas
const client = postgres(connectionString, clientConfig);

// Cliente Drizzle ORM com schema
export const db = drizzle(client, { schema });

console.log('Conexão com banco de dados PostgreSQL estabelecida');