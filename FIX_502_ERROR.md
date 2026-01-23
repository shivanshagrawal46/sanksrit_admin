# Fix 502 Bad Gateway Error - Troubleshooting Guide

## 🔴 Problem: 502 Bad Gateway after updating the app

This error means **nginx can't reach your Node.js application**. The app likely crashed or isn't running.

---

## ✅ Quick Fix Steps (Run these on your server)

### Step 1: Check if Node.js app is running

```bash
# Check PM2 status
pm2 list

# Check if your app is running
pm2 status
```

**If app is stopped or errored:**
```bash
# Check PM2 logs for errors
pm2 logs --lines 50
```

### Step 2: Check for syntax errors in the code

The most common cause after an update is a **syntax error** or **missing dependency**.

```bash
# Navigate to your app directory
cd /path/to/sanksrit_admin

# Test if the app can start (this will show errors)
node app.js
```

**Common errors you might see:**
- `Cannot find module 'xyz'` - Missing dependency
- `SyntaxError: Unexpected token` - Syntax error
- `ReferenceError: xyz is not defined` - Missing variable

### Step 3: Check for missing environment variables

After adding auth routes, you need these in your `.env`:

```bash
# Check if .env file exists and has required variables
cat .env | grep -E "JWT_SECRET|MONGODB_URI|PORT"
```

**Required variables:**
```env
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string
PORT=5000
SESSION_SECRET=your_session_secret
```

### Step 4: Install missing dependencies

If you added new packages, install them:

```bash
cd /path/to/sanksrit_admin
npm install
```

**New packages that might be missing:**
- `jsonwebtoken`
- `bcryptjs`
- `google-auth-library`

### Step 5: Restart the application

```bash
# Stop all PM2 processes
pm2 stop all

# Delete from PM2 (clears cache)
pm2 delete all

# Start fresh
pm2 start app.js --name "sanksrit_admin"

# OR if you have ecosystem.config.js:
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check logs
pm2 logs --lines 50
```

### Step 6: Verify the app is listening on the correct port

```bash
# Check what port your app is using
pm2 logs | grep "Server running"

# Should show: "Server running on http://localhost:PORT"

# Check if port is in use
netstat -tulpn | grep :5000
# OR
ss -tulpn | grep :5000
```

### Step 7: Check nginx configuration

Make sure nginx is pointing to the correct port:

```bash
# Check nginx config
sudo nano /etc/nginx/sites-available/default
# OR
sudo nano /etc/nginx/sites-available/your-site

# Look for this section:
# upstream app {
#     server 127.0.0.1:5000;  # Should match your PORT in .env
# }
```

**Verify the port matches your `.env` file PORT variable.**

---

## 🔍 Common Causes & Solutions

### Cause 1: Missing JWT_SECRET in .env

**Error in logs:**
```
JWT_SECRET not set in environment - JWT generation will fail
```

**Solution:**
```bash
# Add to .env file
echo "JWT_SECRET=a6d025b8494531ed12ec3f83d172d0a91534255e594cf8f4b603a1dce1a47ea8bfc7a424dddf8217a65f3a1a469f5955ce8b6de7aeede23273cfe1cbcb8e083b" >> .env
```

### Cause 2: Missing npm packages

**Error:**
```
Cannot find module 'jsonwebtoken'
```

**Solution:**
```bash
npm install jsonwebtoken bcryptjs google-auth-library
```

### Cause 3: MongoDB connection failed

**Error:**
```
MongoServerError: connection failed
```

**Solution:**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check MongoDB connection string in .env
cat .env | grep MONGODB_URI
```

### Cause 4: Port already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :5000
# OR
sudo netstat -tulpn | grep :5000

# Kill the process or change PORT in .env
```

### Cause 5: Syntax error in routes/auth.js

**Error:**
```
SyntaxError: Unexpected token
```

**Solution:**
```bash
# Test syntax
node -c routes/auth.js

# If error, check the file for syntax issues
```

---

## 🚀 Complete Recovery Script

Run this script on your server to fix everything:

```bash
#!/bin/bash

echo "=================================="
echo "Fixing 502 Bad Gateway Error"
echo "=================================="

# Step 1: Navigate to app directory
cd /path/to/sanksrit_admin

# Step 2: Check for syntax errors
echo "Checking for syntax errors..."
node -c app.js
if [ $? -ne 0 ]; then
    echo "❌ Syntax error found in app.js"
    exit 1
fi

# Step 3: Install dependencies
echo "Installing dependencies..."
npm install

# Step 4: Check .env file
echo "Checking .env file..."
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Step 5: Verify required variables
if ! grep -q "JWT_SECRET" .env; then
    echo "⚠️  JWT_SECRET not found in .env"
    echo "Add: JWT_SECRET=your_secret_here"
fi

if ! grep -q "MONGODB_URI" .env; then
    echo "❌ MONGODB_URI not found in .env"
    exit 1
fi

if ! grep -q "PORT" .env; then
    echo "⚠️  PORT not found in .env"
    echo "Add: PORT=5000"
fi

# Step 6: Stop and restart PM2
echo "Restarting PM2..."
pm2 stop all
pm2 delete all
pm2 start app.js --name "sanksrit_admin"
pm2 save

# Step 7: Check status
echo "Checking PM2 status..."
pm2 status

# Step 8: Show logs
echo "Recent logs:"
pm2 logs --lines 20

echo ""
echo "=================================="
echo "✅ Recovery complete!"
echo "=================================="
echo ""
echo "If still getting 502 error, check:"
echo "1. pm2 logs - for error messages"
echo "2. nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "3. Verify PORT in .env matches nginx upstream config"
```

---

## 📋 Verification Checklist

After fixing, verify:

- [ ] PM2 shows app as "online"
- [ ] `pm2 logs` shows "Server running on http://localhost:PORT"
- [ ] No error messages in PM2 logs
- [ ] `.env` file has all required variables
- [ ] All npm packages are installed
- [ ] MongoDB is running and accessible
- [ ] Port in `.env` matches nginx upstream config
- [ ] nginx config is correct

---

## 🔧 Manual Debugging

If still not working, check these:

### 1. Test app directly (bypass nginx)

```bash
# On your server
curl http://localhost:5000/api/auth/me
```

If this works, the issue is with nginx configuration.
If this fails, the issue is with the Node.js app.

### 2. Check nginx error logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### 3. Check nginx access logs

```bash
sudo tail -f /var/log/nginx/access.log
```

### 4. Test nginx configuration

```bash
sudo nginx -t
```

### 5. Reload nginx

```bash
sudo systemctl reload nginx
```

---

## 💡 Quick Commands Reference

```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs

# Restart app
pm2 restart sanksrit_admin

# Stop app
pm2 stop sanksrit_admin

# Start app
pm2 start app.js --name "sanksrit_admin"

# Check if app is listening
netstat -tulpn | grep :5000

# Check nginx status
sudo systemctl status nginx

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 🎯 Most Likely Fix

**90% of the time, the issue is:**

1. **Missing JWT_SECRET in .env** - Add it
2. **App crashed due to missing dependency** - Run `npm install`
3. **PM2 not restarted after update** - Run `pm2 restart all`

**Run these commands:**
```bash
cd /path/to/sanksrit_admin
npm install
pm2 restart all
pm2 logs
```

If you see errors in the logs, fix those specific errors first!
