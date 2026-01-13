# PM2 Deployment Instructions

## The sorting code is correct! You just need to properly deploy it.

### Step 1: Check which file PM2 is actually running

```bash
pm2 list
pm2 show <app-name>
```

This will show you the **actual directory** PM2 is running from.

### Step 2: Verify you're editing the correct file

Make sure the file you edited matches the path shown by PM2.

```bash
# On your server, check if the updated code is there:
grep -n "KOSH CONTENT API LOADED - VERSION WITH HINDI SORTING" routes/api/koshContent.js
```

If this doesn't show anything, the file wasn't updated on the server!

### Step 3: Upload/sync your files to the server

If you're developing locally, you need to **upload the updated files to your server**:

```bash
# Example using SCP:
scp -r routes/ user@your-server:/path/to/sanksrit_admin/

# Or using rsync:
rsync -avz routes/ user@your-server:/path/to/sanksrit_admin/routes/

# Or using Git:
git add routes/api/koshContent.js routes/koshContent.js
git commit -m "Implement Hindi alphabetical sorting"
git push
# Then on server:
git pull
```

### Step 4: Restart PM2 properly

```bash
# Stop all PM2 processes
pm2 stop all

# Delete from PM2 process list (clears cache)
pm2 delete all

# Start your app fresh
pm2 start app.js --name "sanksrit_admin"

# OR if you have a specific PM2 config:
pm2 start ecosystem.config.js

# Save the PM2 configuration
pm2 save
```

### Step 5: Verify the new code is loaded

Check PM2 logs to see the startup message:

```bash
pm2 logs

# You should see:
# ========================================
# KOSH CONTENT API LOADED - VERSION WITH HINDI SORTING - 2025-01-02
# ========================================
```

### Step 6: Test the API

Make an API call and check for the debug logs:

```bash
pm2 logs --lines 100

# You should see:
# 3. BEFORE SORTING - First 5 items:
# 4. AFTER SORTING - First 5 items:
```

## Common Issues:

### Issue 1: Code not on server
**Problem:** You edited files locally but didn't upload them to the server.
**Solution:** Use SCP, rsync, or Git to sync files.

### Issue 2: PM2 running from different directory
**Problem:** PM2 is running from `/var/www/app` but you edited `/home/user/app`.
**Solution:** Check `pm2 show <app-name>` to find the correct directory.

### Issue 3: Node module cache
**Problem:** Node.js cached the old module.
**Solution:** Use `pm2 delete all` then restart (not just `pm2 restart`).

### Issue 4: Multiple PM2 instances
**Problem:** Old PM2 process still running.
**Solution:** 
```bash
pm2 kill
pm2 start app.js
```

### Issue 5: Build process
**Problem:** Your deployment uses a build process that creates a `dist/` folder.
**Solution:** Run your build command before restarting PM2.

## Quick Verification Script

Run this on your server:

```bash
cd /path/to/sanksrit_admin
echo "=== Checking if updated code exists ==="
grep -A 3 "KOSH CONTENT API LOADED" routes/api/koshContent.js

echo "=== Checking PM2 status ==="
pm2 list

echo "=== Stopping and restarting PM2 ==="
pm2 stop all
pm2 delete all
pm2 start app.js --name "sanksrit_admin"
pm2 logs --lines 50
```

