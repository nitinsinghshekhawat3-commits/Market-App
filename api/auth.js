import { usersById, usersByEmail } from '../src/lib/authUsers.js';

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
};

const sendError = (res, status, error) => {
  res.status(status).json({ success: false, error });
};

export default function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    sendError(res, 405, 'Method Not Allowed');
    return;
  }

  const { action, name, email, password, token, userData } = req.body || {};

  if (action === 'login') {
    if (!email || !password) {
      sendError(res, 400, 'Email and password are required');
      return;
    }

    const existingUser = usersByEmail.get(email.toLowerCase());
    if (!existingUser || existingUser.password !== password) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    const authToken = Buffer.from(`${existingUser.id}:${Date.now()}:${Math.random()}`).toString('base64');
    res.json({
      success: true,
      token: authToken,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        avatar: existingUser.avatar || null,
      },
    });
    return;
  }

  if (action === 'signup') {
    if (!name || !email || !password) {
      sendError(res, 400, 'Name, email, and password are required');
      return;
    }

    const normalizedEmail = email.toLowerCase();
    if (usersByEmail.has(normalizedEmail)) {
      sendError(res, 409, 'Email already registered');
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

    const authToken = Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');
    res.json({
      success: true,
      token: authToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
    return;
  }

  if (action === 'google') {
    if (!token || !userData) {
      sendError(res, 400, 'Google token and user data are required');
      return;
    }

    const googleUserId = userData.id;
    const googleEmail = userData.email;
    const googleName = userData.name;
    const googlePicture = userData.picture || null;
    const emailVerified = userData.email_verified ?? true;

    if (!googleEmail || !googleName) {
      sendError(res, 400, 'Google user email and name are required');
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
    return;
  }

  sendError(res, 400, 'Invalid auth action');
}
