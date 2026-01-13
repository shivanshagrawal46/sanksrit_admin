# Environment Variables Setup Guide

This guide explains how to set up the required environment variables in your `.env` file for the Authentication API, including Google OAuth credentials.

## Required Environment Variables

Create or update your `.env` file in the root directory of your project with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sanskrit_admin

# JWT Secret Key (IMPORTANT: Use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Google OAuth Client IDs
# Get these from Google Cloud Console: https://console.cloud.google.com/
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# Session Secret (if using sessions)
SESSION_SECRET=your_session_secret_here
```

---

## Step-by-Step Setup

### 1. MongoDB Connection

**Variable:** `MONGODB_URI`

**Format:**
- Local: `mongodb://localhost:27017/database_name`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority`

**Example:**
```env
MONGODB_URI=mongodb://localhost:27017/sanskrit_admin
```

---

### 2. JWT Secret Key

**Variable:** `JWT_SECRET`

**Requirements:**
- Must be a strong, random string
- Minimum 32 characters recommended
- Never commit this to version control
- Use different secrets for development and production

**How to Generate:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### 3. Google OAuth Client IDs

### Getting Google Client IDs

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Sanskrit App")
5. Click "Create"

#### Step 2: Enable Google Sign-In API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sign-In API" or "Identity Platform API"
3. Click on it and click "Enable"

#### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" (unless you have a Google Workspace account)
   - Fill in the required information:
     - App name: Your app name
     - User support email: Your email
     - Developer contact information: Your email
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Click "Save and Continue"
   - Add test users (if needed) or skip
   - Review and go back to credentials

#### Step 4: Create Web Client ID

1. In **Credentials** page, click **+ CREATE CREDENTIALS** > **OAuth client ID**
2. Select **Application type**: **Web application**
3. Enter a name (e.g., "Sanskrit App Web Client")
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5000` (for development)
   - `https://your-domain.com` (for production)
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:5000/api/auth/google/callback` (if using callbacks)
   - `https://your-domain.com/api/auth/google/callback` (for production)
6. Click **Create**
7. Copy the **Client ID** (it ends with `.apps.googleusercontent.com`)
8. This is your `GOOGLE_WEB_CLIENT_ID`

**Example:**
```env
GOOGLE_WEB_CLIENT_ID=123456789-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

#### Step 5: Create Android Client ID

1. Still in **Credentials** page, click **+ CREATE CREDENTIALS** > **OAuth client ID**
2. Select **Application type**: **Android**
3. Enter a name (e.g., "Sanskrit App Android")
4. Enter your **Package name** (from `android/app/build.gradle`, e.g., `com.yourcompany.sanskritapp`)
5. Get your **SHA-1 certificate fingerprint**:
   
   **For Debug Keystore (Development):**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   
   **For Release Keystore (Production):**
   ```bash
   keytool -list -v -keystore path/to/your/release.keystore -alias your-key-alias
   ```
   
   Copy the SHA-1 fingerprint (looks like: `AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD`)
6. Paste the SHA-1 fingerprint in the **SHA-1 certificate fingerprint** field
7. Click **Create**
8. Copy the **Client ID** (it ends with `.apps.googleusercontent.com`)
9. This is your `GOOGLE_ANDROID_CLIENT_ID`

**Example:**
```env
GOOGLE_ANDROID_CLIENT_ID=987654321-xyz789abc123def456ghi789jkl012mno.apps.googleusercontent.com
```

---

### Complete .env File Example

```env
# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017/sanskrit_admin

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# ============================================
# Google OAuth Configuration
# ============================================
# Web Client ID (from Google Cloud Console)
GOOGLE_WEB_CLIENT_ID=123456789-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com

# Android Client ID (from Google Cloud Console)
GOOGLE_ANDROID_CLIENT_ID=987654321-xyz789abc123def456ghi789jkl012mno.apps.googleusercontent.com

# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# Session Configuration (if using sessions)
# ============================================
SESSION_SECRET=your_session_secret_key_here
```

---

## Important Notes

### Security

1. **Never commit `.env` file to Git:**
   - Add `.env` to your `.gitignore` file
   - Use `.env.example` as a template (without sensitive values)

2. **Different Environments:**
   - Use different values for development, staging, and production
   - Production should use stronger secrets and HTTPS

3. **JWT Secret:**
   - Must be kept secret at all times
   - Changing it will invalidate all existing tokens
   - Generate a new one for production

### Google OAuth Setup Tips

1. **For Development:**
   - Use debug keystore SHA-1 for Android
   - Add `http://localhost` as authorized origin
   - Test users need to be added to OAuth consent screen

2. **For Production:**
   - Use release keystore SHA-1 for Android
   - Add your production domain as authorized origin
   - Verify your OAuth consent screen is approved

3. **Testing Google Sign-In:**
   - Make sure the package name matches exactly
   - SHA-1 fingerprint must match
   - Client IDs must be from the same Google Cloud project

### Common Issues

1. **"Token audience mismatch" error:**
   - Ensure `GOOGLE_WEB_CLIENT_ID` and `GOOGLE_ANDROID_CLIENT_ID` match the ones in your Flutter app
   - Check that Client IDs are from the same Google Cloud project

2. **"Token expired" error:**
   - Google ID tokens expire quickly (usually 1 hour)
   - Make sure the token is sent immediately after receiving from Google

3. **"Invalid token" error:**
   - Verify the token format is correct
   - Check that you're sending `idToken`, not `accessToken`

---

## Verification

After setting up your `.env` file, verify the configuration:

1. **Check if variables are loaded:**
   ```bash
   node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set'); console.log('GOOGLE_WEB_CLIENT_ID:', process.env.GOOGLE_WEB_CLIENT_ID ? 'Set' : 'Not set');"
   ```

2. **Test the server:**
   ```bash
   npm start
   # Check console for configuration validation messages
   ```

3. **Test registration:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"1234567890","password":"password123","confirmPassword":"password123"}'
   ```

---

## Production Checklist

Before deploying to production:

- [ ] Generate a strong, unique `JWT_SECRET`
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Set up production Google OAuth credentials
- [ ] Add production domain to authorized origins
- [ ] Use release keystore SHA-1 for Android
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Review OAuth consent screen settings
- [ ] Test all authentication flows
- [ ] Verify `.env` is not in version control
