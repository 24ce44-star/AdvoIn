# LegalBuddy - Developer Guide 📱⚖️

Welcome to LegalBuddy! This guide will help you get started with development, whether you're a beginner or experienced developer.

## 📋 Table of Contents

- [What is LegalBuddy?](#what-is-legalbuddy)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Project Structure](#project-structure)
- [Working with the Code](#working-with-the-code)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [Useful Resources](#useful-resources)

---

## 🤔 What is LegalBuddy?

LegalBuddy is a mobile application built with React Native and Expo that helps users with legal assistance. The app includes features like chat, advocate connections, and call functionality.

---

## 🛠 Tech Stack

This project uses modern technologies:

- **React Native** - Framework for building native mobile apps using React
- **Expo** - Platform for making React Native development easier
- **TypeScript** - JavaScript with type safety
- **Expo Router** - File-based routing for navigation
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - State management
- **React Native Gifted Chat** - Chat UI components

---

## ✅ Prerequisites

Before you start, make sure you have these installed on your computer:

### Required Software

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Check if installed: `node --version`

2. **npm** (comes with Node.js)
   - Check if installed: `npm --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Check if installed: `git --version`

### For Mobile Development

4. **Expo Go App** (easiest way to test)
   - Download on your phone:
     - iOS: App Store
     - Android: Google Play Store

5. **Android Studio** (optional, for Android emulator)
   - Download from: https://developer.android.com/studio
   - Required for `expo run:android`

6. **Xcode** (optional, for iOS simulator - Mac only)
   - Download from Mac App Store
   - Required for `expo run:ios`

---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine:

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd LegalBuddy
```

### Step 2: Install Dependencies

```bash
npm install
```

This will download all the required packages listed in `package.json`. It might take a few minutes.

### Step 3: Start the Development Server

```bash
npm start
```

This will start the Expo development server. You'll see a QR code in your terminal.

### Step 4: Run the App

You have several options:

**Option A: Use Expo Go (Easiest for beginners)**

1. Open Expo Go app on your phone
2. Scan the QR code from your terminal
3. The app will load on your phone

**Option B: Use Android Emulator**

```bash
npm run android
```

**Option C: Use iOS Simulator (Mac only)**

```bash
npm run ios
```

**Option D: Run in Web Browser**

```bash
npm run web
```

---

## 💻 Development Commands

Here are all the commands you'll use during development:

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm start`       | Starts the development server                   |
| `npm run android` | Runs the app on Android emulator/device         |
| `npm run ios`     | Runs the app on iOS simulator/device (Mac only) |
| `npm run web`     | Runs the app in a web browser                   |

### Additional Useful Commands

```bash
# Clear cache and restart (if you face issues)
npm start -- --clear

# Install a new package
npm install <package-name>

# Check for outdated packages
npm outdated
```

---

## 📁 Project Structure

Understanding the project structure will help you navigate the codebase:

```
LegalBuddy/
├── app/                      # Main application code (Expo Router)
│   ├── (tabs)/              # Tab-based navigation screens
│   ├── advocate/            # Advocate-related screens
│   ├── call/                # Call functionality screens
│   ├── chat/                # Chat screens
│   ├── _layout.tsx          # Root layout component
│   ├── index.tsx            # Home/landing screen
│   └── modal.tsx            # Modal screens
│
├── components/              # Reusable UI components
│   └── ...                  # Button, Card, Input, etc.
│
├── constants/               # App constants (colors, config, etc.)
│   └── ...
│
├── src/                     # Additional source code
│   └── ...                  # Utilities, helpers, types
│
├── assets/                  # Images, fonts, and other static files
│   ├── images/             # App icons, splash screens
│   └── fonts/              # Custom fonts
│
├── android/                 # Native Android code
├── ios/                     # Native iOS code (if exists)
│
├── app.json                 # Expo configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md               # This file!
```

### Key Files Explained

- **app/\_layout.tsx**: Root layout that wraps your entire app
- **app/index.tsx**: The first screen users see
- **app.json**: Configure app name, icon, splash screen, etc.
- **package.json**: Lists all dependencies and scripts
- **tsconfig.json**: TypeScript compiler settings

---

## 🔧 Working with the Code

### Creating a New Screen

1. Create a new file in the `app/` directory:

   ```typescript
   // app/my-new-screen.tsx
   import { View, Text } from 'react-native';

   export default function MyNewScreen() {
     return (
       <View>
         <Text>Hello from my new screen!</Text>
       </View>
     );
   }
   ```

2. Navigate to it using Expo Router:

   ```typescript
   import { router } from "expo-router";

   // Navigate to the screen
   router.push("/my-new-screen");
   ```

### Creating a Reusable Component

1. Create a new file in `components/`:

   ```typescript
   // components/MyButton.tsx
   import { TouchableOpacity, Text } from 'react-native';

   interface MyButtonProps {
     title: string;
     onPress: () => void;
   }

   export function MyButton({ title, onPress }: MyButtonProps) {
     return (
       <TouchableOpacity onPress={onPress}>
         <Text>{title}</Text>
       </TouchableOpacity>
     );
   }
   ```

2. Use it in your screens:

   ```typescript
   import { MyButton } from '@/components/MyButton';

   <MyButton title="Click me" onPress={() => console.log('Clicked!')} />
   ```

### Using NativeWind (Tailwind CSS)

Style your components with Tailwind classes:

```typescript
import { View, Text } from 'react-native';

export default function StyledScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-white text-2xl font-bold">
        Styled with Tailwind!
      </Text>
    </View>
  );
}
```

### State Management with Zustand

Create a store for global state:

```typescript
// src/store/userStore.ts
import { create } from "zustand";

interface UserState {
  name: string;
  setName: (name: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: "",
  setName: (name) => set({ name }),
}));
```

Use it in components:

```typescript
import { useUserStore } from '@/src/store/userStore';

export default function ProfileScreen() {
  const { name, setName } = useUserStore();

  return (
    <View>
      <Text>Hello, {name}!</Text>
    </View>
  );
}
```

### Working with TypeScript

TypeScript helps catch errors before runtime:

```typescript
// Define types for your data
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types in functions
function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

// TypeScript will warn you if you pass wrong data
const user: User = {
  id: "1",
  name: "John",
  email: "john@example.com",
};

greetUser(user); // ✅ Works
greetUser({ name: "John" }); // ❌ TypeScript error
```

---

## 📦 Building for Production

### Android APK

1. Configure your app in `app.json`
2. Build the APK:
   ```bash
   npx expo build:android
   ```

### iOS App

1. Configure your app in `app.json`
2. Build for iOS:
   ```bash
   npx expo build:ios
   ```

### Using EAS Build (Recommended)

Expo Application Services (EAS) makes building easier:

1. Install EAS CLI:

   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:

   ```bash
   eas login
   ```

3. Configure EAS:

   ```bash
   eas build:configure
   ```

4. Build for Android:

   ```bash
   eas build --platform android
   ```

5. Build for iOS:
   ```bash
   eas build --platform ios
   ```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: "Metro bundler not starting"

```bash
# Solution: Clear cache and restart
npm start -- --clear
```

#### Issue: "Module not found" errors

```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

#### Issue: "Expo Go app not connecting"

- Make sure your phone and computer are on the same WiFi network
- Try restarting the Expo development server
- Check if your firewall is blocking the connection

#### Issue: Android build fails

```bash
# Solution: Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

#### Issue: TypeScript errors

```bash
# Check TypeScript errors
npx tsc --noEmit
```

### Getting Help

- Check Expo documentation: https://docs.expo.dev/
- React Native docs: https://reactnative.dev/
- Search for errors on Stack Overflow
- Check the project's GitHub issues

---

## 📚 Useful Resources

### Official Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Learning Resources

- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [Expo Tutorial](https://docs.expo.dev/tutorial/introduction/)
- [TypeScript for Beginners](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

### Community

- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)
- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js and npm
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Install Expo Go on your phone
- [ ] Run `npm start`
- [ ] Scan QR code with Expo Go
- [ ] Start coding!

---

## 🤝 Contributing

When contributing to this project:

1. Create a new branch for your feature

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and commit

   ```bash
   git add .
   git commit -m "Add my new feature"
   ```

3. Push to your branch

   ```bash
   git push origin feature/my-new-feature
   ```

4. Create a Pull Request

---

## 📝 Notes for Beginners

- **Don't be afraid to experiment!** The development server reloads automatically when you save files.
- **Read error messages carefully** - they usually tell you exactly what's wrong.
- **Use console.log()** to debug - check the terminal or Expo Go app for logs.
- **Start small** - make small changes and test frequently.
- **Ask for help** - the React Native community is very helpful!

---

## 📄 License

[Add your license information here]

---

## 👥 Team

[Add your team information here]

---

**Happy Coding! 🚀**

If you have any questions or run into issues, don't hesitate to ask for help!
