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

  const { token, userData } = req.body || {};

  if (!token || !userData) {
    res.status(400).json({ success: false, error: 'Google token and user data are required' });
    return;
  }

  const googleUserId = userData.id;
  const googleEmail = userData.email;
  const googleName = userData.name;
  const googlePicture = userData.picture || null;
  const emailVerified = userData.email_verified ?? true;

  if (!googleEmail || !googleName) {
    res.status(400).json({ success: false, error: 'Google user email and name are required' });
    return;
  }

  const userId = `google_${googleUserId || googleEmail}`;
  const existingUser = usersById.get(userId);

  if (existingUser) {
    const authToken = Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');
    res.json({
      success: true,
      token: authToken,
      user: existingUser,
      message: 'Welcome back! Signed in successfully.',
    });
    return;
  }

  const newUser = {
    id: userId,
    name: googleName,
    email: googleEmail.toLowerCase(),
    avatar: googlePicture,
    provider: 'google',
    email_verified: emailVerified,
    created_at: new Date().toISOString(),
  };

  usersById.set(userId, newUser);
  usersByEmail.set(googleEmail.toLowerCase(), newUser);

  const authToken = Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');

  res.json({
    success: true,
    token: authToken,
    user: newUser,
    message: 'Account created successfully! Welcome to MarketStock.',
  });
}
