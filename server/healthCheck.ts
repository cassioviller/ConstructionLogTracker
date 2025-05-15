import { Request, Response } from 'express';
import { pool } from './db';

export async function healthCheck(req: Request, res: Response) {
  try {
    // Verificar conexão com o banco de dados
    const dbCheckResult = await checkDatabaseConnection();
    
    // Verificar acesso ao sistema de arquivos
    const fsCheckResult = checkFileSystem();

    // Verificar ambiente
    const envCheckResult = checkEnvironment();

    // Verificar memória disponível
    const memCheckResult = checkMemory();

    // Reunir todos os resultados
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      nodeVersion: process.version,
      checks: {
        database: dbCheckResult,
        filesystem: fsCheckResult,
        environment: envCheckResult,
        memory: memCheckResult
      }
    };

    // Verificar se algum check falhou
    const allChecksOk = Object.values(healthStatus.checks).every(check => check.status === 'ok');
    
    if (!allChecksOk) {
      healthStatus.status = 'degraded';
      return res.status(503).json(healthStatus);
    }

    return res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    client.release();

    return {
      status: 'ok',
      responseTime: 'OK',
      details: {
        connected: true,
        serverTime: result.rows[0].now
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Database connection failed',
      details: {
        connected: false
      }
    };
  }
}

function checkFileSystem() {
  try {
    // Verificar se o diretório de uploads existe e é gravável
    const fs = require('fs');
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const testFile = `${uploadDir}/healthcheck-test-${Date.now()}.txt`;
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    return {
      status: 'ok',
      details: {
        uploadDirectory: uploadDir,
        writable: true
      }
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'File system check failed',
      details: {
        uploadDirectory: process.env.UPLOAD_DIR || './uploads',
        writable: false
      }
    };
  }
}

function checkEnvironment() {
  // Verificar variáveis de ambiente críticas
  const requiredVars = ['NODE_ENV', 'DATABASE_URL', 'SESSION_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    status: missingVars.length === 0 ? 'ok' : 'warning',
    details: {
      nodeEnv: process.env.NODE_ENV || 'not set',
      missingVariables: missingVars.length > 0 ? missingVars : undefined
    }
  };
}

function checkMemory() {
  const memoryUsage = process.memoryUsage();
  const memoryUsedPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
  
  return {
    status: memoryUsedPercent < 85 ? 'ok' : 'warning',
    details: {
      memoryUsedPercent,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
    }
  };
}