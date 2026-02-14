# Maktab Shop - Android Build Instructions

This project uses **Capacitor** to build the Android version from the same codebase as the Desktop version.

## Prerequisites
- Android Studio installed.
- Firebase project created and keys added to `firebase-config.json`.

## Steps to Build
1. **Prepare the Web Assets**:
   Ensure all changes are saved.
   
2. **Initialize/Sync Capacitor**:
   ```bash
   npx cap sync
   ```

3. **Add Android Platform** (first time only):
   ```bash
   npx cap add android
   ```

4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

5. **Build APK**:
   In Android Studio, go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

## Firebase Connection
The app automatically uses the configuration in `firebase-config.json`. Make sure you have enabled **Firestore** in your Firebase console.

## Desktop Version
Run the desktop version with:
```bash
npm start
```
