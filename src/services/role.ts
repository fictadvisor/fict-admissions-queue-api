import { Role } from "../db/entities/Role";

const cache = {};

export const getCachedRole = (token: string) => cache[token];

export const cacheRoles = async () => {
  const roles = await Role.find();
  roles.forEach(r => cache[r.username.startsWith('api_') ? r.password : Buffer.from(`${r.username}:${r.password}`, 'utf8').toString('base64')] = r);
};
