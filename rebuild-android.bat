@echo off
REM Android Rebuild Script for Windows
REM Run this after changing AndroidManifest.xml or app.json

echo Cleaning Android build...
cd android
call gradlew.bat clean
cd ..

echo Rebuilding Android app...
call npx expo run:android

echo Done! The app should now have proper keyboard handling.
pause
