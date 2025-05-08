import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// Şifre sıfırlama token'ları için bir bellek depolaması
// Bu real-world uygulamalarda veritabanında saklanmalıdır
interface PasswordResetToken {
  token: string;
  userId: number;
  expiresAt: Date;
}

const passwordResetTokens: PasswordResetToken[] = [];

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function generatePasswordResetToken(userId: number): string {
  // Eski tokenları temizle
  const now = new Date();
  const indexesToRemove: number[] = [];
  
  passwordResetTokens.forEach((tokenObj, index) => {
    if (tokenObj.expiresAt < now || tokenObj.userId === userId) {
      indexesToRemove.push(index);
    }
  });
  
  // Büyükten küçüğe sırala ki indeks değişmesin
  indexesToRemove.sort((a, b) => b - a).forEach(index => {
    passwordResetTokens.splice(index, 1);
  });
  
  // Yeni token oluştur
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli
  
  passwordResetTokens.push({
    token,
    userId,
    expiresAt
  });
  
  return token;
}

export function verifyPasswordResetToken(token: string): number | null {
  const now = new Date();
  const tokenObj = passwordResetTokens.find(t => t.token === token && t.expiresAt > now);
  
  if (!tokenObj) {
    return null;
  }
  
  // Token kullanıldıktan sonra sil
  const tokenIndex = passwordResetTokens.findIndex(t => t.token === token);
  if (tokenIndex !== -1) {
    passwordResetTokens.splice(tokenIndex, 1);
  }
  
  return tokenObj.userId;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "finratio-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email } = req.body;

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Kullanıcı adı zaten kullanılıyor" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email adresi zaten kullanılıyor" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
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
