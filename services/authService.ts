
import { UserProfile } from '../types';
import * as OTPAuth from 'otpauth';

const STORAGE_KEY = 'minemind_users';

// --- Crypto Utilities ---

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt(): string {
  return crypto.randomUUID();
}

// --- User Management ---

export const getUsers = (): UserProfile[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUser = (user: UserProfile) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.email === user.email);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// --- Auth Actions ---

export const registerUser = async (email: string, password: string): Promise<UserProfile> => {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("User already exists");
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser: UserProfile = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    salt,
    mfaEnabled: false,
    customLanguages: {}
  };

  saveUser(newUser);
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  
  // 1. Check for Runtime Docker Admin (Bootstrap)
  // This value is injected into index.html by Dockerfile CMD logic via env-config.js
  const runtimeAdminPass = window.__RUNTIME_CONFIG__?.ADMIN_PASS || window.__ADMIN_PASS__;
  const ADMIN_EMAIL = 'admin@minemind.net';

  if (email === ADMIN_EMAIL && runtimeAdminPass) {
    if (password === runtimeAdminPass) {
      // Create a transient admin profile
      return {
        id: 'docker-admin-001',
        email: ADMIN_EMAIL,
        passwordHash: '',
        salt: '',
        mfaEnabled: false,
        customLanguages: {},
        isAdmin: true
      };
    }
  }

  // 2. Check Standard Storage
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) throw new Error("Invalid credentials");

  // Prevent admin login via standard storage if it accidentally got saved
  if (user.email === ADMIN_EMAIL) {
     throw new Error("Please use the generated Docker password for admin access.");
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) throw new Error("Invalid credentials");

  return user;
};

export const resetPassword = async (email: string): Promise<string> => {
  // Simulate sending an email
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("User not found");
  
  // In a real app, this returns void and sends an email.
  // Here we return a mock token for demonstration.
  return "mock-reset-token-" + Date.now();
};

export const updateUserLanguages = (user: UserProfile, langCode: string, data: any) => {
    // If admin, we don't persist to local storage to avoid persistence issues across restarts
    if (user.isAdmin) {
      user.customLanguages[langCode] = data;
      return user;
    }

    user.customLanguages[langCode] = data;
    saveUser(user);
    return user;
};

// --- MFA Logic ---

export const generateMfaSecret = () => {
  return new OTPAuth.Secret({ size: 20 });
};

export const generateMfaQrCode = (email: string, secret: string) => {
  const totp = new OTPAuth.TOTP({
    issuer: 'MineMind Forge',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });
  return totp.toString();
};

export const verifyMfaToken = (token: string, secret: string): boolean => {
  const totp = new OTPAuth.TOTP({
    issuer: 'MineMind Forge',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });
  
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
};

export const enableMfaForUser = (user: UserProfile, secret: string) => {
    user.mfaSecret = secret;
    user.mfaEnabled = true;
    if (!user.isAdmin) {
      saveUser(user);
    }
    return user;
};