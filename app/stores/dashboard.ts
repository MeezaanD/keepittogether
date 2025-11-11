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
  updateDoc
} from 'firebase/firestore';

/** Narrowing helper for ProjectStatus */
function isValidStatus(s: unknown): s is ProjectStatus {
  return s === 'in-progress' || s === 'completed' || s === 'not-started';
}

interface State {
  topics: Topic[];
  projectIndex: { [projectId: string]: { topicId: string; project: Project } };
  usingFirestore: boolean;
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): State => ({
    topics: [],
    projectIndex: {},
    usingFirestore: false
  }),

  actions: {
    async loadInitialData(): Promise<void> {
      if (this.topics.length) return;

      const nuxtApp = useNuxtApp();
      const db = (nuxtApp as any).$db;

      if (!db) {
        this.topics = [];
        this.reindexProjects();
        this.usingFirestore = false;
        return;
      }

      try {
        const topicsCol = collection(db, 'topics');
        const topicsSnap = await getDocs(topicsCol);

        if (topicsSnap.empty) {
          this.topics = [];
          this.reindexProjects();
          this.usingFirestore = true;
          return;
        }

        const loadedTopics: Topic[] = [];

        for (const tDoc of topicsSnap.docs) {
          const topicId = tDoc.id;
          const topicData = tDoc.data() as any;
          const name = topicData?.name ?? topicId;

          const projectsCol = collection(db, 'topics', topicId, 'projects');
          const projectsSnap = await getDocs(query(projectsCol, orderBy('startDate', 'desc')));

          const projects: Project[] = [];

          for (const pDoc of projectsSnap.docs) {
            const p = pDoc.data() as any;
            const projectId = pDoc.id;

            const notesCol = collection(db, 'topics', topicId, 'projects', projectId, 'notes');
            const notesSnap = await getDocs(query(notesCol, orderBy('date', 'desc')));
            const notes: Note[] = notesSnap.docs.map(nDoc => {
              const data = nDoc.data() as any;
              return {
                date: String(data.date ?? ''),
                content: String(data.content ?? '')
              } as Note;
            });

            const status: ProjectStatus = isValidStatus(p.status) ? p.status : 'not-started';

            projects.push({
              id: projectId,
              title: String(p.title ?? ''),
              description: String(p.description ?? ''),
              status,
              startDate: String(p.startDate ?? ''),
              endDate: p.endDate === null ? null : String(p.endDate ?? null),
              notes
            });
          }

          loadedTopics.push({
            id: topicId,
            name,
            projects
          });
        }

        this.topics = loadedTopics;
        this.reindexProjects();
        this.usingFirestore = true;
      } catch (err) {
        console.error('Firestore load failed, falling back to empty topics list', err);
        this.topics = [];
        this.reindexProjects();
        this.usingFirestore = false;
      }
    },

    reindexProjects(): void {
      this.projectIndex = {};
      for (const topic of this.topics) {
        for (const project of topic.projects) {
          this.projectIndex[project.id] = { topicId: topic.id, project };
        }
      }
    },

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
            endDate: p.endDate
          });
          for (const n of p.notes) {
            const notesCol = collection(db, 'topics', t.id, 'projects', p.id, 'notes');
            await addDoc(notesCol, n);
          }
        }
      }
    },

    async addProject(topicId: string, newProject: Project): Promise<void> {
      const nuxtApp = useNuxtApp();
      const db = (nuxtApp as any).$db;
      try {
        if (db) {
          const pDocRef = doc(db, 'topics', topicId, 'projects', newProject.id);
          await setDoc(pDocRef, {
            title: newProject.title,
            description: newProject.description,
            status: newProject.status,
            startDate: newProject.startDate,
            endDate: newProject.endDate
          });
        }
        const topic = this.topics.find(t => t.id === topicId);
        if (topic) {
          topic.projects.push(newProject);
        } else {
          this.topics.push({ id: topicId, name: topicId, projects: [newProject] });
        }
        this.reindexProjects();
      } catch (err) {
        console.error('addProject error', err);
        throw err;
      }
    },

    async addNote(projectId: string, note: Note): Promise<void> {
      const nuxtApp = useNuxtApp();
      const db = (nuxtApp as any).$db;
      try {
        const lookup = this.projectIndex[projectId];
        if (!lookup) throw new Error('Project not found in index');
        const { topicId } = lookup;
        if (db) {
          const notesCol = collection(db, 'topics', topicId, 'projects', projectId, 'notes');
          await addDoc(notesCol, note);
        }
        lookup.project.notes.push(note);
        this.reindexProjects();
      } catch (err) {
        console.error('addNote error', err);
        throw err;
      }
    },

    // IMPORTANT: update project's status both in Firestore (if available) and in local state
    async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
      const nuxtApp = useNuxtApp();
      const db = (nuxtApp as any).$db;
      const lookup = this.projectIndex[projectId];
      if (!lookup) throw new Error('Project not found');
      const { topicId } = lookup;
      try {
        if (db) {
          const pDocRef = doc(db, 'topics', topicId, 'projects', projectId);
          await updateDoc(pDocRef, { status });
        }
        lookup.project.status = status;
        this.reindexProjects();
      } catch (err) {
        console.error('updateProjectStatus error', err);
        throw err;
      }
    },

    async removeProject(topicId: string, projectId: string): Promise<void> {
      const nuxtApp = useNuxtApp();
      const db = (nuxtApp as any).$db;
      try {
        if (db) {
          const pDocRef = doc(db, 'topics', topicId, 'projects', projectId);
          await deleteDoc(pDocRef);
        }
        const topic = this.topics.find(t => t.id === topicId);
        if (topic) {
          topic.projects = topic.projects.filter(p => p.id !== projectId);
        }
        this.reindexProjects();
      } catch (err) {
        console.error('removeProject error', err);
        throw err;
      }
    }
  },

  getters: {
    getTopicById: (state) => (id: string) => state.topics.find(t => t.id === id),
    getProjectById: (state) => (id: string) => state.projectIndex[id]?.project,
    getTopicProjects: (state) => (topicId: string) => state.topics.find(t => t.id === topicId)?.projects || [],
    getProjectNotes: (state) => (projectId: string) => state.projectIndex[projectId]?.project.notes || [],
    getTopicProgress: (state) => (topicId: string): [number, number] => {
      const t = state.topics.find(topic => topic.id === topicId);
      if (!t) return [0, 0];
      const total = t.projects.length;
      const completed = t.projects.filter(p => p.status === 'completed').length;
      return [completed, total];
    }
  }
});