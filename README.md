# GPA Calculator

A minimal GPA calculator app built with Expo, React Native, and TypeScript. The project uses Expo Router for file‑based navigation and runs on Android, iOS, and the web.

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Start the app

```bash
npm start
```

From the Expo CLI, you can open on:
- Android emulator or a connected device
- iOS simulator (on macOS)
- Expo Go on your phone
- Web (press `w`)

## Useful Scripts

- `npm start`: Launch Expo developer tools
- `npm run android`: Run the native Android app
- `npm run ios`: Run the native iOS app (macOS required)
- `npm run web`: Start the web build
- `npm run lint`: Lint the project with ESLint
- `npm run reset-project`: Reset to a fresh starter (moves current app to `app-example/`)

## Building with EAS (optional)

This repo includes an `eas.json`. If you use Expo Application Services:

```bash
npx eas login
npx eas build -p android    # Android build
npx eas build -p ios        # iOS build (macOS + Apple account required)
```

Learn more: https://docs.expo.dev/build/introduction/

## Project Structure

- `app/`: Routes and screens (Expo Router)
- `components/`: Reusable UI components
- `hooks/`: Reusable hooks
- `constants/`: Theme and app constants
- `android/`: Native Android project

You can start iterating by editing files in the `app/` directory.

## Requirements

- Node.js 18+ and npm
- For Android development: Android Studio or device with USB debugging
- For iOS development: Xcode on macOS

## License

This project is for educational/demo purposes. Add your preferred license if publishing.
