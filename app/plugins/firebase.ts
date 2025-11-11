import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export default defineNuxtPlugin((nuxtApp) => {
	const config = useRuntimeConfig();
	const firebaseConfig = {
		apiKey: config.public.firebaseApiKey,
		authDomain: config.public.firebaseAuthDomain,
		projectId: config.public.firebaseProjectId,
		storageBucket: config.public.firebaseStorageBucket,
		messagingSenderId: config.public.firebaseMessagingSenderId,
		appId: config.public.firebaseAppId,
	};

	if (!getApps().length) {
		initializeApp(firebaseConfig);
	}

	const db = getFirestore();
	nuxtApp.provide('db', db);
});