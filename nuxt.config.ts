import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
	// Use app-level CSS (we keep app/ structure)
	css: ['../app/assets/main.css'],
	modules: ['@element-plus/nuxt'],
	// elementPlus: {},
	typescript: {
		strict: true,
	},
	runtimeConfig: {
		firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
		public: {
			firebaseApiKey: process.env.FIREBASE_API_KEY || '',
			firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
			firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
			firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
			firebaseMessagingSenderId:
				process.env.FIREBASE_MESSAGING_SENDER_ID || '',
			firebaseAppId: process.env.FIREBASE_APP_ID || '',
		},
	},
});
