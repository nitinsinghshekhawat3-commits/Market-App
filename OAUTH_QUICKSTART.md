# Quick Start: OAuth with Real User Data

## ✅ What's Done

Your MarketStock app now captures **REAL Gmail IDs, names, and user data** when users register with Google or Apple. No more mocks!

### What Gets Stored:
```javascript
// Google User
{
  email: "user@gmail.com",           // ✅ Real Gmail address
  name: "John Doe",                  // ✅ Real name from Google
  picture: "https://...",            // ✅ Real profile picture
  provider: "google"
}

// Apple User  
{
  email: "user@icloud.com",          // ✅ Real Apple ID email
  name: "Jane Doe",                  // ✅ Real name (if shared)
  provider: "apple"
}
```

---

## 🚀 What To Do Next

### 1️⃣ Get Google Credentials (5 min)
Go to [Google Cloud Console](https://console.cloud.google.com/):
- Create project: "MarketStock AI"
- Create OAuth 2.0 Web credentials
- Copy **Client ID**
- Add these authorized origins:
  ```
  http://localhost:5173
  http://localhost:3000
  https://yourdomain.com
  ```

### 2️⃣ Get Apple Credentials (10 min)  
Go to [Apple Developer](https://developer.apple.com/):
- Create App ID: `com.marketstock.ai`
- Create Services ID: `com.marketstock.web`
- Create Sign-In private key (.p8 file)
- Collect: **Team ID**, **Key ID**, **Private Key**
- Add redirect URL: `https://yourdomain.com/auth/apple/callback`

### 3️⃣ Update `.env` File
```env
# Google
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple
VITE_APPLE_CLIENT_ID=com.marketstock.web
VITE_APPLE_TEAM_ID=your_apple_team_id
VITE_APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```

### 4️⃣ Test Locally
```bash
npm run dev          # Frontend on 5173
npm run server       # Backend on 3000
```

Visit `http://localhost:5173` and click "Continue with Google" or Apple button.

---

## 🔒 Data Flow

```
User Clicks "Continue with Google"
         ↓
Google Login Dialog Appears
         ↓
User Enters Password & Approves Permissions
         ↓
Frontend Receives Real JWT Token
         ↓
Frontend Decodes: email, name, picture
         ↓
Backend Verifies Token
         ↓
✅ Real Data Stored in localStorage
   - marketstock_user_token
   - marketstock_user_data (with real email/name)
```

---

## 📁 Files Modified

| File | Purpose |
|------|---------|
| `src/services/oauthService.ts` | OAuth service with real flows |
| `src/pages_legacy/AdvancedLogin.tsx` | Real sign-in logic |
| `server.js` | Token verification |
| `index.html` | Google/Apple scripts |
| `.env` | OAuth credentials |
| `vite-env.d.ts` | Type definitions |

---

## 🎯 Testing User Data

After login:

**Browser Console:**
```javascript
JSON.parse(localStorage.getItem('marketstock_user_data'))

// Output:
{
  id: "google_118765923482734982",
  email: "your.actual.gmail@gmail.com",     // ✅ REAL
  name: "Your Actual Name",                 // ✅ REAL  
  picture: "https://lh3.googleusercontent.com/...",
  provider: "google",
  email_verified: true
}
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Google not initialized" | Restart `npm run dev` after updating .env |
| "Unverified email" | User needs to verify email in Google settings |
| "Invalid app URL" | Add URL to authorized origins in OAuth apps |
| "Apple private key error" | Ensure .p8 file is properly converted to env variable |

See **OAUTH_SETUP.md** for detailed troubleshooting.

---

## ✨ Features Included

- ✅ Real Gmail capture (not simulated)
- ✅ Real Apple ID capture
- ✅ Permission dialogs
- ✅ Email verification
- ✅ Profile picture from Google
- ✅ Secure token verification
- ✅ Error handling
- ✅ TypeScript strict mode compatible

---

## 📚 Full Documentation

See **OAUTH_SETUP.md** for:
- Step-by-step setup with screenshots
- Production deployment
- Security considerations
- Advanced options

---

**You're ready to collect real user data! 🎉**
