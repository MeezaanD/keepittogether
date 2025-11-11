import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export default defineNuxtPlugin((nuxtApp) => {
	const config = useRuntimeConfig();

	// Build the firebase config object from runtime (public) config
	const firebaseConfig = {
		apiKey: config.public.firebaseApiKey,
		authDomain: config.public.firebaseAuthDomain,
		projectId: config.public.firebaseProjectId,
		storageBucket: config.public.firebaseStorageBucket,
		messagingSenderId: config.public.firebaseMessagingSenderId,
		appId: config.public.firebaseAppId,
	};

	// Initialize Firebase app if none exists
	if (!getApps().length) {
		initializeApp(firebaseConfig);
	}

	// Initialize and expose Firestore
	const db = getFirestore();
	// Provide as $db so it can be accessed via useNuxtApp().$db
	nuxtApp.provide('db', db);
});