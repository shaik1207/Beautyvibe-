import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Automatically strip accidental quotes, commas, or spaces from Vercel env vars
const cleanEnv = (value) => {
  if (!value) return undefined;
  return value.toString().replace(/['", \]]+/g, '').trim();
};

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

const requiredConfig = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

const missingConfig = requiredConfig.filter(
  (key) => !firebaseConfig[key]
);

if (missingConfig.length > 0) {
  throw new Error(
    `Firebase configuration is missing: ${missingConfig.join(", ")}. ` +
    "Check your frontend .env file or Vercel dashboard."
  );
}

// Initialize Firebase only once
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Forces the Google account selector to appear every time
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;