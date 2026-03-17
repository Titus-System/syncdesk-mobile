# Expo React Native — Build Guide

## Developer Setup

These steps are for local development (not for producing a release APK).

### Prerequisites

- Node.js 20+ and npm
- Android Studio with Android SDK installed (for Android development)
- Xcode + CocoaPods (for iOS development on macOS)

### Install dependencies

```bash
npm install
```

### Run the app

```bash
# Start Metro
npm run start

# Android device/emulator
npm run android

# iOS simulator (macOS only)
npm run ios

# Web
npm run web
```

### Common scripts

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Tests
npm run test

# Full check (type-check + lint + test)
npm run check
```

## Build Types

There are three build types. They are **not interchangeable**.

| Type                         | Contains JS bundle | Requires Metro running | Use case            |
| ---------------------------- | ------------------ | ---------------------- | ------------------- |
| `assembleDebug`              | No                 | Yes                    | Nothing useful      |
| `assembleRelease`            | Yes                | No                     | Final APK for users |
| Development client (Expo Go) | No                 | Yes                    | Development only    |

**If you want an APK that works standalone on a user's device, you need `assembleRelease`.**

The debug build produces an APK that shows a blank screen unless a Metro bundler is running on the same network. It is useless for distribution.

---

## Prerequisites

- Android Studio with Android SDK installed
- `ANDROID_HOME` environment variable set
- **Node.js 20+** — this is a hard requirement. Metro uses `Array.toReversed()` which does not exist below Node 20.

Verify before every build session:

```bash
node --version   # must be v20.x or higher
echo $ANDROID_HOME
```

If using nvm, set the version and **stop any running Gradle daemon** before building — the daemon caches the Node path from when it was first started:

```bash
nvm use 20
./gradlew --stop   # kills the old daemon that may be pointing to the wrong Node
```

---

## Building the Release APK

### Step 1 — Generate native project files

Run from the project root:

```bash
npx expo prebuild --clean
```

`--clean` regenerates `android/` from scratch. Use it whenever dependencies or `app.json` have changed since the last prebuild. The first time is fine without it.

### Step 2 — Build

```bash
cd android && ./gradlew assembleRelease
```

The first build takes 10–15 minutes. Subsequent builds reuse the Gradle cache and finish in 1–3 minutes.

If the build fails with `configs.toReversed is not a function`, the Gradle daemon is using the wrong Node version. Fix:

```bash
./gradlew --stop
./gradlew assembleRelease
```

If it still fails, force the correct Node path explicitly:

```bash
NODE=$(which node) ./gradlew assembleRelease
```

### Step 3 — Locate the APK

```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 4 — Install on device

```bash
# USB (physical device with USB debugging enabled)
adb install android/app/build/outputs/apk/release/app-release.apk

# Running emulator
adb install android/app/build/outputs/apk/release/app-release.apk
```

Or transfer the `.apk` file directly to the device and open it.

---

## Signing

An unsigned release APK can be installed manually but cannot be submitted to the Play Store. For Play Store distribution, you need a keystore.

Generate one:

```bash
keytool -genkeypair -v \
  -keystore android/app/release.keystore \
  -alias release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Then configure `android/app/build.gradle` to use it for release builds. Keep the keystore file and its passwords safe — losing it means you can never update the app on the Play Store.

---

## If Your Machine Crashes Mid-Build

The Gradle cache survives crashes. Re-running `./gradlew assembleRelease` will resume from the cached state and finish much faster than the first build.

---

## Pre-Build Checklist

```bash
# Check for SDK version mismatches
npx expo-doctor

# Type check and lint
npm run check

# Confirm Node version
node --version
```

Fix anything reported by `expo-doctor` before building. Dependency mismatches that are silent during development will cause build failures.
