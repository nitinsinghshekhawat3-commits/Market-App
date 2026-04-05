import { usersById, usersByEmail } from './users.js';

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
};

export default function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const normalizedEmail = email.toLowerCase();

  if (usersByEmail.has(normalizedEmail)) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const userId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const newUser = {
    id: userId,
    name,
    email: normalizedEmail,
    password,
    avatar: null,
    provider: 'local',
    created_at: new Date().toISOString(),
  };

  usersById.set(userId, newUser);
  usersByEmail.set(normalizedEmail, newUser);

  const token = Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');

  res.json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    },
  });
}
