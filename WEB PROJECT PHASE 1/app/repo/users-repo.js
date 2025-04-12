import fs from 'fs/promises';
import path from 'path';

const usersFile = path.join(process.cwd(), 'data', 'users.json');

export async function getAllUsers() {
  const raw = await fs.readFile(usersFile, 'utf8');
  const data = JSON.parse(raw);
  return data.users;
}

export async function getUserByUsername(username) {
  const all = await getAllUsers();
  return all.find(u => u.username === username);
}

export async function createUser(userData) {
  const raw = await fs.readFile(usersFile, 'utf8');
  const data = JSON.parse(raw);
  data.users.push(userData);
  await fs.writeFile(usersFile, JSON.stringify(data, null, 2));
  return userData;
}

export async function updateUser(username, updates) {
  const raw = await fs.readFile(usersFile, 'utf8');
  const data = JSON.parse(raw);

  const index = data.users.findIndex(u => u.username === username);
  if (index === -1) {
    return null;
  }

  data.users[index] = { ...data.users[index], ...updates };
  await fs.writeFile(usersFile, JSON.stringify(data, null, 2));
  return data.users[index];
}

export async function deleteUser(username) {
  const raw = await fs.readFile(usersFile, 'utf8');
  const data = JSON.parse(raw);

  const before = data.users.length;
  data.users = data.users.filter(u => u.username !== username);

  if (data.users.length === before) {
    return false;
  }
  await fs.writeFile(usersFile, JSON.stringify(data, null, 2));
  return true;
}
