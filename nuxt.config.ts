import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  // Use app-level CSS (we keep app/ structure)
  css: ['../app/assets/main.css'],
  modules: [],
  typescript: {
    strict: true
  },
  runtimeConfig: {
    // Private keys (server-side) — leave blank locally and use .env for values
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
    // Public keys safe for client (apiKey, authDomain, etc.)
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || ''
    }
  }
});