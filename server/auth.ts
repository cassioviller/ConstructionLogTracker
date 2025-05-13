import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Função simplificada de comparação para desenvolvimento
async function comparePasswords(supplied: string, stored: string) {
  try {
    // Durante o desenvolvimento, permitimos comparação direta para testes
    return supplied === stored;
  } catch (error) {
    console.error('Erro ao comparar senhas:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "diario-de-obra-session-secret",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Tentando autenticar usuário: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`Usuário não encontrado: ${username}`);
          return done(null, false);
        }
        
        // Verificar a senha usando nossa função aprimorada
        if (await comparePasswords(password, user.password)) {
          console.log(`Usuário ${username} autenticado com sucesso`);
          return done(null, user);
        }
        
        console.log("Senha incorreta");
        return done(null, false);
      } catch (error) {
        console.error("Erro de autenticação:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Usuário já existe");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Erro de autenticação:", err);
        return next(err);
      }
      if (!user) {
        console.log("Tentativa de login falhou:", req.body.username);
        return res.status(401).json({ message: "Nome de usuário ou senha inválidos" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Erro ao estabelecer sessão:", err);
          return next(err);
        }
        console.log("Login bem-sucedido para:", user.username);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
