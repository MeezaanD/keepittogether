<template>
	<div>
		<NuxtLink :to="topic ? `/topics/${topic.id}` : '/'" class="link">&larr; Back</NuxtLink>

		<div v-if="project" style="margin-top: 1rem">
			<div style="
					display: flex;
					gap: 0.5rem;
					align-items: center;
					justify-content: space-between;
				">
				<div>
					<h2 class="title-lg">{{ project.title }}</h2>
					<div class="small" style="margin-top: 0.4rem">
						{{ project.description }}
					</div>
				</div>

				<div style="display: flex; gap: 0.75rem; align-items: center">
					<!-- Status badge -->
					<span :class="statusClass">{{ project.status }}</span>

					<!-- Dropdown to change status -->
					<div>
						<label for="status-select" class="text-xs muted"
							style="display: block; margin-bottom: 0.25rem">Completion</label>
						<select id="status-select" class="input" :value="statusSelect" @change="onStatusChange($event)"
							:disabled="busy" aria-label="Change project completion status" style="min-width: 170px">
							<option value="not-started">Not started</option>
							<option value="in-progress">In progress</option>
							<option value="completed">Completed</option>
						</select>
					</div>

					<!-- Delete button -->
					<button @click="confirmDelete" class="btn" :disabled="busy" style="background: #ef4444">
						Delete Project
					</button>
				</div>
			</div>

			<div style="margin-top: 1rem">
				<div style="
						margin-top: 0.6rem;
						display: flex;
						gap: 0.5rem;
						align-items: center;
					">
					<span class="meta">Started: {{ formatDate(project.startDate) }}</span>
					<span v-if="project.endDate" class="meta">Ended: {{ formatDate(project.endDate) }}</span>
				</div>

				<div style="margin-top: 1rem">
					<h3 style="margin-bottom: 0.5rem">Notes</h3>
					<NotesList :notes="project.notes" />
					<form @submit.prevent="addNote" class="form" style="margin-top: 0.75rem">
						<textarea v-model="note" rows="3" placeholder="Add a new note (Markdown supported)"
							class="input" required></textarea>
						<button class="btn" type="submit">Add Note</button>
					</form>
				</div>
			</div>
		</div>

		<div v-else class="muted" style="margin-top: 1rem">
			Project not found.
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDashboardStore } from '~/stores/dashboard';
import NotesList from '~/components/NotesList.vue';
import { useFormattedDate } from '~/composables/useFormattedDate';
import type { ProjectStatus } from '~/types';

const store = useDashboardStore();
await store.loadInitialData();

const route = useRoute();
const router = useRouter();
const projectId = route.params.id as string;
const project = computed(() => store.getProjectById(projectId));
const topic = computed(() => {
	const lookup = store.projectIndex[projectId];
	return lookup ? store.getTopicById(lookup.topicId) : undefined;
});

const formatDate = useFormattedDate();

const note = ref('');
const busy = ref(false);

// Status select local state (keeps UI responsive)
const statusSelect = ref<ProjectStatus | ''>(project.value?.status ?? '');

watch(project, (p) => {
	statusSelect.value = (p?.status ?? '') as ProjectStatus;
});

// Handler for status changes from the dropdown
async function onStatusChange(e: Event) {
	if (!project.value) return;
	const val = (e.target as HTMLSelectElement).value as ProjectStatus;
	if (val === project.value.status) return; // no-op

	busy.value = true;
	try {
		await store.updateProjectStatus(projectId, val);
		// reflect change in local select (store already updates local state)
		statusSelect.value = val;
	} catch (err) {
		console.error('Failed to change status', err);
		// revert UI selection to actual project status
		statusSelect.value = project.value?.status ?? '';
		// optionally show an error UI message here
	} finally {
		busy.value = false;
	}
}

async function addNote() {
	if (!project.value) return;
	if (note.value.trim()) {
		busy.value = true;
		try {
			await store.addNote(projectId, {
				date: new Date().toISOString().substring(0, 10),
				content: note.value,
			});
			note.value = '';
		} catch (err) {
			console.error('addNote failed', err);
		} finally {
			busy.value = false;
		}
	}
}

async function confirmDelete() {
	if (!project.value || !topic.value) return;
	const ok = confirm(
		`Delete project "${project.value.title}"? This cannot be undone.`
	);
	if (!ok) return;

	busy.value = true;
	try {
		await store.removeProject(topic.value.id, projectId);
		await router.push(topic.value ? `/topics/${topic.value.id}` : '/');
	} catch (err) {
		console.error('Failed to delete project', err);
	} finally {
		busy.value = false;
	}
}

const statusClass = computed(() => {
	switch (project.value?.status) {
		case 'completed':
			return 'badge badge--success';
		case 'in-progress':
			return 'badge badge--warn';
		case 'not-started':
			return 'badge badge--muted';
		default:
			return 'badge badge--muted';
	}
});
</script>

<style scoped>
/* small adjustments for select to match input styles */
.input {
	appearance: none;
	-webkit-appearance: none;
	-moz-appearance: none;
	padding: 0.5rem 0.75rem;
}

.text-xs {
	font-size: 0.78rem;
	color: #6b7280;
}
</style>