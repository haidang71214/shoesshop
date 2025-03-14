import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Lấy đường dẫn tuyệt đối
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessTokenPrivateKey = fs.readFileSync(path.join(__dirname, '../keys/access_token.private.key'));
const accessTokenPublicKey = fs.readFileSync(path.join(__dirname, '../keys/access_token.public.key'));
const refreshTokenPrivateKey = fs.readFileSync(path.join(__dirname, '../keys/refresh_token.private.key'));
const refreshTokenPublicKey = fs.readFileSync(path.join(__dirname, '../keys/refresh_token.public.key'));

export const createTokenAsyncKey = async (data) => {
  return jwt.sign({ payload: data }, accessTokenPrivateKey, {
    algorithm: 'RS256',
    expiresIn: '1h'
  });
};

export const createRefTokenAsyncKey = async (data) => {
  return jwt.sign({ payload: data }, refreshTokenPrivateKey, {
    algorithm: 'RS256',
    expiresIn: '7d'
  });
};

export const verifyTokenAsyncKey = async (token) => {
  try {
    const decoded = jwt.verify(token, accessTokenPublicKey, { algorithms: ['RS256'] });
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

export const verifyRefreshTokenAsyncKey = async (token) => {
  try {
    const decoded = jwt.verify(token, refreshTokenPublicKey, { algorithms: ['RS256'] });
    return decoded;
  } catch (error) {
    console.error('Refresh token verification error:', error.message);
    return null;
  }
};

export const middlewareTokenAsyncKey = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication failed! No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = await verifyTokenAsyncKey(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token!' });
  }

  req.user = decoded.payload;
  next();
};