import { usersByEmail } from './users.js';

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

  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const existingUser = usersByEmail.get(email.toLowerCase());

  if (!existingUser || existingUser.password !== password) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = Buffer.from(`${existingUser.id}:${Date.now()}:${Math.random()}`).toString('base64');

  res.json({
    success: true,
    token,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar || null,
    },
  });
}
