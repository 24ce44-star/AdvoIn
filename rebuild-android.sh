#!/bin/bash

# Android Rebuild Script
# Run this after changing AndroidManifest.xml or app.json

echo "🧹 Cleaning Android build..."
cd android
./gradlew clean
cd ..

echo "📦 Rebuilding Android app..."
npx expo run:android

echo "✅ Done! The app should now have proper keyboard handling."
