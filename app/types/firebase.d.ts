import type { Firestore } from 'firebase/firestore';

declare module '#app' {
	interface NuxtApp {
		$db: Firestore;
	}
}