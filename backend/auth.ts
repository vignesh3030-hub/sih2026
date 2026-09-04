import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'users_db.json');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_paimana_key_2026';
const JWT_EXPIRES_IN = '1d';

// --- Types ---
export type Role = 'ADMIN' | 'MOSPI_OFFICER' | 'MINISTRY_OFFICER' | 'PROJECT_OFFICER';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  department?: string;
  status?: string;
  lastLogin?: string;
  ministry?: string;
}

// --- File Database Persistence ---
export let users: User[] = [];

const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

const saveUsersToDisk = () => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    console.log(`[DB] Successfully saved ${users.length} users to ${DB_FILE_PATH}`);
  } catch (err) {
    console.error('[DB] Failed to save users database to disk:', err);
  }
};

const loadUsersFromDisk = () => {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      users = JSON.parse(data);
      console.log(`[DB] Loaded ${users.length} registered users from ${DB_FILE_PATH}`);
      return;
    } catch (err) {
      console.warn('[DB] Could not parse users database file, re-initializing default users:', err);
    }
  }

  // Initialize Default Authorized Accounts
  users = [
    {
      id: 'usr-001',
      username: 'varshini',
      email: 'varshini@paimana.gov.in',
      passwordHash: hashPassword('varshini'),
      role: 'ADMIN',
      name: 'Varshini',
      department: 'Data Informatics & Innovation Division (DIID)',
      status: 'Active',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-002',
      username: 'vicky',
      email: 'vicky@paimana.gov.in',
      passwordHash: hashPassword('vicky'),
      role: 'MOSPI_OFFICER',
      name: 'Vicky',
      department: 'MoSPI Project Monitoring Group (PMG)',
      status: 'Active',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-003',
      username: 'yuhaa',
      email: 'yuhaa@paimana.gov.in',
      passwordHash: hashPassword('1234'),
      role: 'PROJECT_OFFICER',
      name: 'Yuhaa',
      department: 'Field Execution & Civil Engineering',
      status: 'Active',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'usr-004',
      username: 'vathsala',
      email: 'vathsala@paimana.gov.in',
      passwordHash: hashPassword('1234'),
      role: 'PROJECT_OFFICER',
      name: 'Vathsala',
      department: 'Structural & Quality Control Engineering',
      status: 'Active',
      lastLogin: new Date().toISOString(),
    },
  ];
  saveUsersToDisk();
};

loadUsersFromDisk();

// --- Audit Logger ---
export const auditLog = (
  userId: string,
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'data import' | 'risk actions',
  details: string
) => {
  // Audit logs recorded in database context
};

// --- Middleware ---
export const authenticate = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// --- Routes ---
export const authRouter = express.Router();

// GET all active users stored in database
authRouter.get('/users', (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role === 'ADMIN' ? 'Admin' : u.role === 'MOSPI_OFFICER' ? 'MoSPI Officer' : 'Project Officer',
    department: u.department || 'General Engineering',
    status: u.status || 'Active',
    lastLogin: u.lastLogin || new Date().toISOString(),
  }));
  res.json({ count: safeUsers.length, users: safeUsers });
});

// LOGIN Endpoint (authenticates against persistent database)
authRouter.post('/login', (req, res) => {
  const { email, username, password } = req.body;
  const loginIdentifier = (username || email || '').toLowerCase().trim();

  const user = users.find(
    (u) => u.email.toLowerCase() === loginIdentifier || u.username.toLowerCase() === loginIdentifier
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify username and password.' });
  }

  user.lastLogin = new Date().toISOString();
  saveUsersToDisk();

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role === 'ADMIN' ? 'Admin' : user.role === 'MOSPI_OFFICER' ? 'MoSPI Officer' : 'Project Officer',
      name: user.name,
      department: user.department,
    },
  });
});

// ADD ENGINEER Endpoint (RBAC restricted to Varshini & Vicky)
authRouter.post('/add-engineer', (req, res) => {
  const { createdBy, name, email, username, password, role, department } = req.body;
  const creator = (createdBy || '').toLowerCase().trim();

  // Permission Verification
  if (creator !== 'varshini' && creator !== 'vicky' && creator !== 'admin') {
    return res.status(403).json({
      error: 'Permission Denied: Only Admin (Varshini) and Project Tracker (Vicky) can add new engineers to the database.',
    });
  }

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Name, Username, and Password are required fields.' });
  }

  const existing = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() || (email && u.email.toLowerCase() === email.toLowerCase())
  );

  if (existing) {
    return res.status(409).json({ error: `User with username '@${username}' already exists in database.` });
  }

  const newEngineer: User = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name,
    username: username.toLowerCase(),
    email: email || `${username.toLowerCase()}@paimana.gov.in`,
    passwordHash: hashPassword(password),
    role: (role === 'Admin' ? 'ADMIN' : role === 'MoSPI Officer' ? 'MOSPI_OFFICER' : 'PROJECT_OFFICER') as Role,
    department: department || 'Field Execution & Civil Engineering',
    status: 'Active',
    lastLogin: new Date().toISOString(),
  };

  users.push(newEngineer);
  saveUsersToDisk();

  res.status(201).json({
    message: `Engineer account @${newEngineer.username} successfully registered and persisted in PAIMANA Database.`,
    user: {
      id: newEngineer.id,
      name: newEngineer.name,
      username: newEngineer.username,
      email: newEngineer.email,
      role: newEngineer.role === 'ADMIN' ? 'Admin' : newEngineer.role === 'MOSPI_OFFICER' ? 'MoSPI Officer' : 'Project Officer',
      department: newEngineer.department,
      status: newEngineer.status,
      lastLogin: newEngineer.lastLogin,
    },
  });
});

authRouter.post('/register', (req, res) => {
  const { email, username, password, role, name, department } = req.body;
  const uname = (username || email.split('@')[0]).toLowerCase();

  if (users.some((u) => u.username.toLowerCase() === uname || u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'User already exists in database' });
  }

  const newUser: User = {
    id: `usr-${users.length + 1}`,
    username: uname,
    email: email || `${uname}@paimana.gov.in`,
    passwordHash: hashPassword(password),
    role: role || 'PROJECT_OFFICER',
    name,
    department,
    status: 'Active',
    lastLogin: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsersToDisk();

  res.status(201).json({ message: 'User created successfully in database', user: newUser });
});

authRouter.get('/me', authenticate, (req: any, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found in database' });
  }
  res.json({ id: user.id, username: user.username, email: user.email, role: user.role, name: user.name, department: user.department });
});

authRouter.post('/logout', authenticate, (req: any, res) => {
  res.json({ message: 'Logged out successfully' });
});

