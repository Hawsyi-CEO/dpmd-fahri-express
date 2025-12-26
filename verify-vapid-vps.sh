#!/bin/bash
# Script to verify and update VAPID keys on VPS

echo "🔍 Checking VAPID keys on VPS..."

# Expected values
EXPECTED_PUBLIC="BCEEJBfb05GAzlnpuzfPJszt054iCSOhqPVkmAMyTcUGZ8VrNluqShCQ2PVmwcMU0WuXJC35P5_XCXJNaQczX-U"
EXPECTED_PRIVATE="R9vEurYnCrkAYVmJS2q8YOZRZSymCZS2MF1nh7oMEyg"

# Check current values in .env
CURRENT_PUBLIC=$(grep "^VAPID_PUBLIC_KEY=" .env 2>/dev/null | cut -d'=' -f2)
CURRENT_PRIVATE=$(grep "^VAPID_PRIVATE_KEY=" .env 2>/dev/null | cut -d'=' -f2)

echo ""
echo "📋 Current VAPID_PUBLIC_KEY: $CURRENT_PUBLIC"
echo "📋 Expected VAPID_PUBLIC_KEY: $EXPECTED_PUBLIC"
echo ""
echo "📋 Current VAPID_PRIVATE_KEY: $CURRENT_PRIVATE"
echo "📋 Expected VAPID_PRIVATE_KEY: $EXPECTED_PRIVATE"
echo ""

# Check if keys match
if [ "$CURRENT_PUBLIC" = "$EXPECTED_PUBLIC" ] && [ "$CURRENT_PRIVATE" = "$EXPECTED_PRIVATE" ]; then
    echo "✅ VAPID keys are CORRECT! No update needed."
    exit 0
fi

# Keys don't match - update needed
echo "⚠️  VAPID keys MISMATCH detected!"
echo ""
read -p "Do you want to update .env with correct VAPID keys? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Updating VAPID keys..."
    
    # Backup current .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update or add VAPID_PUBLIC_KEY
    if grep -q "^VAPID_PUBLIC_KEY=" .env; then
        sed -i "s|^VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=$EXPECTED_PUBLIC|" .env
        echo "✅ Updated VAPID_PUBLIC_KEY"
    else
        echo "" >> .env
        echo "# VAPID Keys for Push Notifications" >> .env
        echo "VAPID_PUBLIC_KEY=$EXPECTED_PUBLIC" >> .env
        echo "✅ Added VAPID_PUBLIC_KEY"
    fi
    
    # Update or add VAPID_PRIVATE_KEY
    if grep -q "^VAPID_PRIVATE_KEY=" .env; then
        sed -i "s|^VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=$EXPECTED_PRIVATE|" .env
        echo "✅ Updated VAPID_PRIVATE_KEY"
    else
        echo "VAPID_PRIVATE_KEY=$EXPECTED_PRIVATE" >> .env
        echo "✅ Added VAPID_PRIVATE_KEY"
    fi
    
    echo ""
    echo "✅ VAPID keys updated successfully!"
    echo "⚠️  You need to restart the backend server:"
    echo "   pm2 restart dpmd-api"
    echo ""
    echo "⚠️  Users may need to re-subscribe to push notifications"
    
else
    echo "❌ Update cancelled"
    exit 1
fi
