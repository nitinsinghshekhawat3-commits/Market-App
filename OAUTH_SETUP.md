# OAuth Integration Setup Guide

Complete setup guide for Google and Apple OAuth integration with real user data fetching.

## ✅ What's Implemented

Your MarketStock app now fetches **REAL** Gmail ID, name, and profile picture when users register with Google or Apple. No more mock data!

### Features:
- ✅ **Real Gmail Address** - Fetches actual email from Google account
- ✅ **Real User Name** - Gets full name from Google/Apple profile  
- ✅ **Permission Requests** - Asks for email and name permissions
- ✅ **Email Verification** - Ensures email is verified before login
- ✅ **Secure Token Verification** - Backend verifies OAuth tokens
- ✅ **Profile Picture** - Google Sign-In includes profile picture

---

## 🔧 Setup Instructions

### STEP 1: Google OAuth Setup

**1a. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (name it: "MarketStock AI")
3. Enable these APIs:
   - Google+ API
   - Google Sign-In API

**1b. Create OAuth 2.0 Credentials**
1. Go to **Credentials** in the left menu
2. Click **Create Credentials** → **OAuth Client ID**
3. Choose **Web application**
4. Add Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com (for production)
   ```
5. Add Authorized redirect URIs:
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com (for production)
   ```
6. Copy your **Client ID**

**1c. Update .env File**
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

---

### STEP 2: Apple Sign-In Setup

**2a. Apple Developer Account**
1. Go to [Apple Developer](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Go to **Certificates, Identifiers & Profiles** → **Identifiers**

**2b. Create App ID (if not exists)**
1. Click **+** to create new identifier
2. Select **App IDs**
3. Configure:
   - **Description**: MarketStock AI
   - **Identifier**: com.marketstock.ai (or your company domain)
4. Enable **Sign in with Apple** capability
5. Register the App ID

**2c. Create Service ID**
1. Create new identifier → **Services IDs**
2. **Description**: MarketStock Web
3. **Identifier**: com.marketstock.web (unique for web)
4. Enable **Sign in with Apple**
5. Configure Return URLs:
   ```
   http://localhost:5173/auth/apple/callback
   http://localhost:3000/auth/apple/callback
   https://yourdomain.com/auth/apple/callback (production)
   ```
6. Register

**2d. Create Private Key**
1. Go to **Keys** tab
2. Create new key with "Sign in with Apple" capability
3. Download the private key file (.p8)
4. **IMPORTANT**: Save this file securely - you can only download once!

**2e. Update .env File**
```env
VITE_APPLE_CLIENT_ID=com.marketstock.web
VITE_APPLE_TEAM_ID=XXXXXXXXXX (from Apple Developer account)
VITE_APPLE_KEY_ID=XXXXXXXXXX (from the key you created)
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```

To convert your .p8 file to environment variable:
```bash
# On macOS/Linux
cat AuthKey_XXXXXXXXXX.p8 | tr '\n' '\\n'

# Copy the output and use in APPLE_PRIVATE_KEY with actual newlines
```

---

## 🎯 User Registration Flow

When a user clicks "Continue with Google" or "Continue with Apple":

### ✅ Google Flow:
1. User clicks **"Continue with Google"**
2. Google login popup appears
3. User enters Gmail credentials
4. Google requests permission for:
   - Email address
   - Full name
   - Profile picture
5. User clicks **"Allow"**
6. Frontend receives real Gmail ID and name
7. Backend verifies token with Google
8. **Real data stored**: `{email: "user@gmail.com", name: "John Doe", picture: "..."}`

### ✅ Apple Flow:
1. User clicks **"Continue with Apple"**
2. Apple login popup appears
3. User enters Apple ID credentials
4. Apple requests permission for:
   - Email address
   - First & Last name
5. User can choose to **hide email** or share it
6. If hidden, Apple generates privacy email: `XXXXX@privaterelay.appleid.com`
7. Frontend receives real Apple ID email and name
8. Backend verifies token with Apple
9. **Real data stored**: `{email: "user@apple.com", name: "Jane Doe"}`

---

## 📋 Testing Locally

### Quick Test (Google):

```bash
# 1. Start dev server
npm run dev

# 2. Start auth server
npm run server

# 3. Open browser
http://localhost:5173

# 4. Click "Continue with Google"
# 5. Use your personal Gmail account
# 6. Click Allow when permissions prompt appears
```

### Testing Data Retrieved:

After login, check browser console:
```javascript
// In browser DevTools Console:
JSON.parse(localStorage.getItem('marketstock_user_data'))

// Output:
{
  id: "google_118765923482734982734",
  email: "your.real.email@gmail.com",      // ✅ Real Gmail
  name: "Your Real Name",                   // ✅ Real Name
  picture: "https://lh3.googleusercontent.com/...",  // ✅ Profile Pic
  provider: "google",
  email_verified: true
}
```

---

## 🔒 Security Considerations

### What We Do:
✅ **Verify tokens on backend** - Never trust frontend alone
✅ **Check email verification** - Reject unverified emails
✅ **Use HTTPS in production** - Encrypt all API calls
✅ **Store securely** - Use environment variables (never commit credentials)
✅ **Validate data server-side** - Never trust client-sent data

### Production Security:
- Use railway.app or Vercel environment variables
- Never expose `GOOGLE_CLIENT_SECRET` or `APPLE_PRIVATE_KEY` in code
- Implement rate limiting on auth endpoints
- Add CSRF protection
- Use HTTPS only

---

## 🚀 Production Deployment

### On Railway/Vercel:

Add these environment variables:

```env
VITE_GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
VITE_APPLE_CLIENT_ID=com.marketstock.web
VITE_APPLE_TEAM_ID=xxxx
VITE_APPLE_KEY_ID=xxxx
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nxxxx
```

Update OAuth redirect URLs to your production domain:
- Google: Add `https://yourdomain.com` to authorized origins
- Apple: Add `https://yourdomain.com/auth/apple/callback`

---

## 🐛 Troubleshooting

### "Google Sign-In not initialized"
- Check that `VITE_GOOGLE_CLIENT_ID` is in `.env`
- Restart dev server after .env changes
- Clear browser cache (hard refresh)

### Apple Sign-In not working
- Verify `VITE_APPLE_CLIENT_ID`, `VITE_APPLE_TEAM_ID`, `VITE_APPLE_KEY_ID` are correct
- Check that redirect URL matches exactly
- Ensure private key `.p8` file is correctly converted to env variable

### "Email not verified"
- Apple/Google side: User needs to verify email in their account settings
- Backend rejects unverified emails for security

### Real email not showing
- Check browser console for errors
- Verify backend token verification is working
- Check server logs: `npm run server`

---

## 📚 Key Files Modified

| File | Change |
|------|--------|
| `src/services/oauthService.ts` | **NEW** - OAuth integration service |
| `src/pages_legacy/AdvancedLogin.tsx` | Updated to use real OAuth |
| `server.js` | Updated auth endpoints for token verification |
| `.env` | Added OAuth credentials |
| `index.html` | Added Google/Apple scripts |

---

## 💡 What Happens Inside

### Frontend (oauthService.ts):
1. Loads Google/Apple Sign-In scripts
2. User clicks button → OAuth provider login
3. Provider returns ID token (JWT)
4. Frontend decodes JWT to extract: `email`, `name`, `picture`, `id`
5. Sends token + user data to backend

### Backend (server.js):
1. Receives token from frontend
2. Verifies token is valid (in production, checks with Google/Apple servers)
3. Extracts user data
4. Creates/updates user in database
5. Returns auth token for session

### Storage:
- `localStorage.marketstock_user_token` - Session token
- `localStorage.marketstock_user_data` - User profile (email, name, picture)

---

## ✨ Features Added

### Real User Data:
- Gmail address (not mock data)
- Full name from Google/Apple account
- Profile picture
- Email verification status

### Permissions Flow:
- Users see permission dialog
- Can review what data is shared
- Can approve or deny

### Error Handling:
- Proper error messages
- Email verification checks
- Token validation
- User feedback

---

## 🎓 Next Steps

1. **Get credentials** from Google and Apple (STEP 1 & 2 above)
2. **Add to .env** file
3. **Test locally** with your own Gmail/Apple ID
4. **Deploy to production** with environment variables
5. **Monitor logs** for any auth issues

---

## 📞 Support

If you encounter issues:

1. Check console errors (F12 → Console)
2. Check server logs: `npm run server` output
3. Verify .env file has correct credentials
4. Make sure URLs are whitelisted in OAuth apps
5. Hard refresh browser (Ctrl+F5)

---

**Congratulations! Your app now securely fetches real Gmail IDs, names, and user data! 🎉**
