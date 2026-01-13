#!/bin/bash

# ============================================
# Hindi Alphabetical Sorting Deployment Script
# Uses MongoDB Native Collation (NO Memory Issues!)
# ============================================

echo "=================================="
echo "MongoDB Native Hindi Sorting Deployment"
echo "=================================="
echo ""

echo "=================================="
echo "Step 1: Killing old PM2 process"
echo "=================================="
pm2 kill
echo "✓ Old process killed"
echo ""

echo "=================================="
echo "Step 2: Starting application"
echo "=================================="
# With MongoDB native sorting, we don't need extra memory!
# But we'll set it anyway for safety
pm2 start app.js --name "app" --node-args="--max-old-space-size=2048"
echo "✓ Application started"
echo ""

echo "=================================="
echo "Step 3: Saving PM2 configuration"
echo "=================================="
pm2 save
echo "✓ Configuration saved"
echo ""

echo "=================================="
echo "Step 4: Setting PM2 to start on boot"
echo "=================================="
pm2 startup
echo "✓ Startup configured"
echo ""

echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "📊 Check status:"
echo "  pm2 status"
echo ""
echo "📝 Check logs:"
echo "  pm2 logs"
echo ""
echo "✅ You should see:"
echo "  [Kosh Content API] MongoDB native Hindi sorting with collation enabled"
echo ""
echo "🎉 No more memory crashes!"
echo "🚀 Lightning fast Hindi sorting at database level!"
echo ""

