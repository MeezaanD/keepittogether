/**
 * Dashboard Store
 * 
 * Pinia store for managing learning dashboard data including topics, projects, and notes.
 * Supports both local state management and Firestore integration for data persistence.
 * 
 * @file stores/dashboard.ts
 * @version 1.0.0
 */

import { defineStore } from 'pinia';
import type { Topic, Project, Note, ProjectStatus } from '~/types';
import { useNuxtApp } from '#app';
import {
	collection,
	getDocs,
	doc,
	addDoc,
	setDoc,
	query,
	orderBy,
	deleteDoc,
	updateDoc,
} from 'firebase/firestore';

/**
 * Type guard to validate ProjectStatus values
 * @param s - Value to check
 * @returns True if value is a valid ProjectStatus
 */
function isValidStatus(s: unknown): s is ProjectStatus {
	return s === 'in-progress' || s === 'completed' || s === 'not-started';
}

/**
 * Store state interface
 */
interface State {
	/** Array of learning topics with their projects */
	topics: Topic[];
	/** Index for quick project lookup by project ID */
	projectIndex: {
		[projectId: string]: { topicId: string; project: Project };
	};
	/** Flag indicating if Firestore is being used for data persistence */
	usingFirestore: boolean;
}

/**
 * Dashboard Store
 * 
 * Manages the application's learning data including topics, projects, and notes.
 * Provides CRUD operations and synchronization with Firestore when available.
 */
export const useDashboardStore = defineStore('dashboard', {
	/**
	 * Store state initialization
	 */
	state: (): State => ({
		topics: [],
		projectIndex: {},
		usingFirestore: false,
	}),

	/**
	 * Store actions for data operations
	 */
	actions: {
		/**
		 * Loads initial data from Firestore or initializes empty state
		 * 
		 * This method attempts to connect to Firestore and load topics, projects, and notes.
		 * If Firestore is unavailable, it falls back to an empty local state.
		 * 
		 * @throws {Error} When Firestore connection fails
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.loadInitialData();
		 */
		async loadInitialData(): Promise<void> {
			// Return early if data is already loaded
			if (this.topics.length) return;

			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;

			// Fallback to local state if Firestore is not available
			if (!db) {
				this.topics = [];
				this.reindexProjects();
				this.usingFirestore = false;
				return;
			}

			try {
				const topicsCol = collection(db, 'topics');
				const topicsSnap = await getDocs(topicsCol);

				// Initialize empty state if no data exists in Firestore
				if (topicsSnap.empty) {
					this.topics = [];
					this.reindexProjects();
					this.usingFirestore = true;
					return;
				}

				const loadedTopics: Topic[] = [];

				// Load each topic and its nested projects and notes
				for (const tDoc of topicsSnap.docs) {
					const topicId = tDoc.id;
					const topicData = tDoc.data() as any;
					const name = topicData?.name ?? topicId;

					// Load projects for this topic, ordered by start date
					const projectsCol = collection(
						db,
						'topics',
						topicId,
						'projects'
					);
					const projectsSnap = await getDocs(
						query(projectsCol, orderBy('startDate', 'desc'))
					);

					const projects: Project[] = [];

					// Process each project and its notes
					for (const pDoc of projectsSnap.docs) {
						const p = pDoc.data() as any;
						const projectId = pDoc.id;

						// Load notes for this project, ordered by date
						const notesCol = collection(
							db,
							'topics',
							topicId,
							'projects',
							projectId,
							'notes'
						);
						const notesSnap = await getDocs(
							query(notesCol, orderBy('date', 'desc'))
						);
						const notes: Note[] = notesSnap.docs.map((nDoc) => {
							const data = nDoc.data() as any;
							return {
								date: String(data.date ?? ''),
								content: String(data.content ?? ''),
							} as Note;
						});

						// Validate and set project status
						const status: ProjectStatus = isValidStatus(p.status)
							? p.status
							: 'not-started';

						projects.push({
							id: projectId,
							title: String(p.title ?? ''),
							description: String(p.description ?? ''),
							status,
							startDate: String(p.startDate ?? ''),
							endDate:
								p.endDate === null
									? null
									: String(p.endDate ?? null),
							notes,
						});
					}

					loadedTopics.push({
						id: topicId,
						name,
						projects,
					});
				}

				this.topics = loadedTopics;
				this.reindexProjects();
				this.usingFirestore = true;
			} catch (err) {
				console.error(
					'Firestore load failed, falling back to empty topics list',
					err
				);
				this.topics = [];
				this.reindexProjects();
				this.usingFirestore = false;
			}
		},

		/**
		 * Rebuilds the project index for efficient project lookup
		 * 
		 * This method creates a flat index of all projects keyed by project ID
		 * for quick access without traversing the nested topic structure.
		 * 
		 * @returns {void}
		 */
		reindexProjects(): void {
			this.projectIndex = {};
			for (const topic of this.topics) {
				for (const project of topic.projects) {
					this.projectIndex[project.id] = {
						topicId: topic.id,
						project,
					};
				}
			}
		},

		/**
		 * Seeds Firestore with initial data
		 * 
		 * Used for initial database population with sample or default data.
		 * 
		 * @param db - Firestore database instance
		 * @param topics - Array of topics to seed
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.seedFirestore(db, sampleTopics);
		 */
		async seedFirestore(db: any, topics: Topic[]): Promise<void> {
			for (const t of topics) {
				const tDocRef = doc(db, 'topics', t.id);
				await setDoc(tDocRef, { name: t.name });
				for (const p of t.projects) {
					const pDocRef = doc(db, 'topics', t.id, 'projects', p.id);
					await setDoc(pDocRef, {
						title: p.title,
						description: p.description,
						status: p.status,
						startDate: p.startDate,
						endDate: p.endDate,
					});
					for (const n of p.notes) {
						const notesCol = collection(
							db,
							'topics',
							t.id,
							'projects',
							p.id,
							'notes'
						);
						await addDoc(notesCol, n);
					}
				}
			}
		},

		/**
		 * Creates a new topic
		 * 
		 * @param topicName - Name of the topic to create
		 * @throws {Error} When creation fails
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.createTopic('Machine Learning');
		 */
		async createTopic(topicName: string): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;

			try {
				// Generate a simple id (you could use uuid instead if you want)
				const topicId = topicName.toLowerCase().replace(/\s+/g, '-');

				// Check if it already exists
				if (this.topics.find((t) => t.id === topicId)) {
					throw new Error(`Topic "${topicName}" already exists.`);
				}

				// Create Firestore doc if available
				if (db) {
					const topicsCol = collection(db, 'topics');
					await setDoc(doc(topicsCol, topicId), { name: topicName });
				}

				// Update local state
				this.topics.push({
					id: topicId,
					name: topicName,
					projects: [],
				});

				this.reindexProjects();
			} catch (err) {
				console.error('createTopic error', err);
				throw err;
			}
		},

		/**
		 * Updates a topic with new data
		 * 
		 * @param topicId - ID of the topic to update
		 * @param updatedData - Partial topic data to update
		 * @throws {Error} When topic is not found
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.updateTopic('math', { name: 'Mathematics' });
		 */
		async updateTopic(topicId: string, updatedData: Partial<Topic>): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;

			try {
				const topic = this.topics.find((t) => t.id === topicId);
				if (!topic) throw new Error('Topic not found');

				// Update Firestore if connected
				if (db) {
					const tDocRef = doc(db, 'topics', topicId);
					await updateDoc(tDocRef, updatedData);
				}

				// Update local state
				Object.assign(topic, updatedData);
				this.reindexProjects();
			} catch (err) {
				console.error('updateTopic error', err);
				throw err;
			}
		},

		/**
		 * Deletes a topic by ID
		 * 
		 * @param topicId - The ID of the topic to delete
		 * @throws {Error} If deletion fails
		 * @returns {Promise<void>}
		 */
		async deleteTopic(topicId: string): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;

			try {
				// Remove from Firestore if available
				if (db) {
					const topicDocRef = doc(db, 'topics', topicId);
					await deleteDoc(topicDocRef);
				}

				// Remove from local state
				this.topics = this.topics.filter((t) => t.id !== topicId);
				this.reindexProjects();
			} catch (err) {
				console.error('deleteTopic error', err);
				throw err;
			}
		},

		/**
		 * Adds a new project to a topic
		 * 
		 * Creates a new project within the specified topic. If the topic doesn't exist,
		 * it creates both the topic and the project.
		 * 
		 * @param topicId - ID of the topic to add the project to
		 * @param newProject - The project data to add
		 * @throws {Error} When operation fails
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.addProject('programming', newProject);
		 */
		async addProject(topicId: string, newProject: Project): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;
			try {
				// Persist to Firestore if available
				if (db) {
					const pDocRef = doc(
						db,
						'topics',
						topicId,
						'projects',
						newProject.id
					);
					await setDoc(pDocRef, {
						title: newProject.title,
						description: newProject.description,
						status: newProject.status,
						startDate: newProject.startDate,
						endDate: newProject.endDate,
					});
				}

				// Update local state
				const topic = this.topics.find((t) => t.id === topicId);
				if (topic) {
					topic.projects.push(newProject);
				} else {
					// Create new topic if it doesn't exist
					this.topics.push({
						id: topicId,
						name: topicId,
						projects: [newProject],
					});
				}
				this.reindexProjects();
			} catch (err) {
				console.error('addProject error', err);
				throw err;
			}
		},

		/**
		 * Updates a project's details (title, description, etc.)
		 * 
		 * @param projectId - ID of the project to update
		 * @param updatedData - Partial project data to update
		 * @throws {Error} When project is not found or update fails
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.updateProject('project-123', { title: 'New Title', description: 'New description' });
		 */
		async updateProject(projectId: string, updatedData: Partial<Project>): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;

			try {
				const lookup = this.projectIndex[projectId];
				if (!lookup) throw new Error('Project not found in index');

				const { topicId } = lookup;

				// Update in Firestore if available
				if (db) {
					const pDocRef = doc(
						db,
						'topics',
						topicId,
						'projects',
						projectId
					);
					await updateDoc(pDocRef, updatedData);
				}

				// Update local state
				Object.assign(lookup.project, updatedData);
				this.reindexProjects();

			} catch (err) {
				console.error('updateProject error', err);
				throw err;
			}
		},

		/**
		 * Removes a project from a topic
		 * 
		 * @param topicId - ID of the topic containing the project
		 * @param projectId - ID of the project to remove
		 * @throws {Error} When operation fails
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.removeProject('programming', 'old-project-123');
		 */
		async removeProject(topicId: string, projectId: string): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;
			try {
				// Remove from Firestore if connected
				if (db) {
					const pDocRef = doc(
						db,
						'topics',
						topicId,
						'projects',
						projectId
					);
					await deleteDoc(pDocRef);
				}

				// Remove from local state
				const topic = this.topics.find((t) => t.id === topicId);
				if (topic) {
					topic.projects = topic.projects.filter(
						(p) => p.id !== projectId
					);
				}
				this.reindexProjects();
			} catch (err) {
				console.error('removeProject error', err);
				throw err;
			}
		},

		/**
		 * Updates a project's status
		 * 
		 * @param projectId - ID of the project to update
		 * @param status - New status for the project
		 * @throws {Error} When project is not found
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.updateProjectStatus('project-123', 'completed');
		 */
		async updateProjectStatus(
			projectId: string,
			status: ProjectStatus
		): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;
			const lookup = this.projectIndex[projectId];
			if (!lookup) throw new Error('Project not found');
			const { topicId } = lookup;
			try {
				// Update Firestore if connected
				if (db) {
					const pDocRef = doc(
						db,
						'topics',
						topicId,
						'projects',
						projectId
					);
					await updateDoc(pDocRef, { status });
				}

				// Update local state
				lookup.project.status = status;
				this.reindexProjects();
			} catch (err) {
				console.error('updateProjectStatus error', err);
				throw err;
			}
		},

		/**
		 * Adds a note to a project
		 * 
		 * @param projectId - ID of the project to add the note to
		 * @param note - The note data to add
		 * @throws {Error} When project is not found
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.addNote('project-123', { date: '2024-01-01', content: 'Note content' });
		 */
		async addNote(projectId: string, note: Note): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;
			try {
				const lookup = this.projectIndex[projectId];
				if (!lookup) throw new Error('Project not found in index');
				const { topicId } = lookup;

				// Persist to Firestore if available
				if (db) {
					const notesCol = collection(
						db,
						'topics',
						topicId,
						'projects',
						projectId,
						'notes'
					);
					await addDoc(notesCol, note);
				}

				// Update local state
				lookup.project.notes.push(note);
				this.reindexProjects();
			} catch (err) {
				console.error('addNote error', err);
				throw err;
			}
		},

		/**
		 * Updates an existing note in a project
		 * 
		 * @param projectId - ID of the project containing the note
		 * @param noteIndex - Index of the note to update in the project's notes array
		 * @param updatedNote - The updated note data
		 * @throws {Error} When project is not found or update fails
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.updateNote('project-123', 0, { date: '2024-01-01', content: 'Updated content' });
		 */
		async updateNote(projectId: string, noteIndex: number, updatedNote: Note): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;

			try {
				const lookup = this.projectIndex[projectId];
				if (!lookup) throw new Error('Project not found in index');

				const { topicId } = lookup;
				const existingNote = lookup.project.notes[noteIndex];

				if (!existingNote) throw new Error('Note not found at specified index');

				// Update in Firestore if available
				if (db) {
					// Since notes are stored as subcollection documents, we need to get the document ID
					const notesCol = collection(
						db,
						'topics',
						topicId,
						'projects',
						projectId,
						'notes'
					);
					const notesSnap = await getDocs(notesCol);
					const noteDocs = notesSnap.docs;

					// Find the note document that matches our existing note content and date
					const noteDoc = noteDocs.find(doc => {
						const data = doc.data();
						return data.date === existingNote.date && data.content === existingNote.content;
					});

					if (noteDoc) {
						await updateDoc(noteDoc.ref, updatedNote);
					} else {
						console.warn('Note not found in Firestore, updating local state only');
					}
				}

				// Update local state
				lookup.project.notes[noteIndex] = { ...updatedNote };
				this.reindexProjects();

			} catch (err) {
				console.error('updateNote error', err);
				throw err;
			}
		},

		/**
		 * Deletes a note from a project
		 * 
		 * @param projectId - ID of the project containing the note
		 * @param noteIndex - Index of the note to delete in the project's notes array
		 * @throws {Error} When project is not found or deletion fails
		 * @returns {Promise<void>}
		 * 
		 * @example
		 * await store.deleteNote('project-123', 0);
		 */
		async deleteNote(projectId: string, noteIndex: number): Promise<void> {
			const nuxtApp = useNuxtApp();
			const db = (nuxtApp as any).$db;

			try {
				const lookup = this.projectIndex[projectId];
				if (!lookup) throw new Error('Project not found in index');

				const { topicId } = lookup;
				const note = lookup.project.notes[noteIndex];

				if (!note) throw new Error('Note not found at specified index');

				// Delete from Firestore if available
				if (db) {
					// Since notes are stored as subcollection documents, we need to get the document ID
					const notesCol = collection(
						db,
						'topics',
						topicId,
						'projects',
						projectId,
						'notes'
					);
					const notesSnap = await getDocs(notesCol);
					const noteDocs = notesSnap.docs;

					// Find the note document that matches our note content and date
					const noteDoc = noteDocs.find(doc => {
						const data = doc.data();
						return data.date === note.date && data.content === note.content;
					});

					if (noteDoc) {
						await deleteDoc(noteDoc.ref);
					} else {
						console.warn('Note not found in Firestore, deleting from local state only');
					}
				}

				// Remove from local state
				lookup.project.notes.splice(noteIndex, 1);
				this.reindexProjects();

			} catch (err) {
				console.error('deleteNote error', err);
				throw err;
			}
		},
	},

	/**
	 * Store getters for computed data access
	 */
	getters: {
		/**
		 * Gets a topic by its ID
		 * @param state - Store state
		 * @returns Topic or undefined if not found
		 */
		getTopicById: (state) => (id: string) =>
			state.topics.find((t) => t.id === id),

		/**
		 * Gets a project by its ID
		 * @param state - Store state
		 * @returns Project or undefined if not found
		 */
		getProjectById: (state) => (id: string) =>
			state.projectIndex[id]?.project,

		/**
		 * Gets all projects for a topic
		 * @param state - Store state
		 * @returns Array of projects or empty array if topic not found
		 */
		getTopicProjects: (state) => (topicId: string) =>
			state.topics.find((t) => t.id === topicId)?.projects || [],

		/**
		 * Gets all notes for a project
		 * @param state - Store state
		 * @returns Array of notes or empty array if project not found
		 */
		getProjectNotes: (state) => (projectId: string) =>
			state.projectIndex[projectId]?.project.notes || [],

		/**
		 * Calculates progress for a topic
		 * @param state - Store state
		 * @returns Tuple of [completedProjects, totalProjects]
		 * 
		 * @example
		 * const [completed, total] = store.getTopicProgress('math');
		 * const progress = (completed / total) * 100;
		 */
		getTopicProgress:
			(state) =>
				(topicId: string): [number, number] => {
					const t = state.topics.find((topic) => topic.id === topicId);
					if (!t) return [0, 0];
					const total = t.projects.length;
					const completed = t.projects.filter(
						(p) => p.status === 'completed'
					).length;
					return [completed, total];
				},
	},
});