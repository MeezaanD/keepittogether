<template>
	<div>
		<NuxtLink to="/" class="link">&larr; Back to Dashboard</NuxtLink>

		<div style="margin-top: 1rem">
			<h2 class="title-lg">{{ topic?.name ?? 'Topic' }}</h2>

			<!-- Edit Topic Form -->
			<button class="btn" @click="isEditing = !isEditing">
				{{ isEditing ? 'Cancel Edit' : 'Edit Topic' }}
			</button>

			<form v-if="isEditing" @submit.prevent="saveTopicEdits" class="form" style="margin-top: 0.75rem">
				<input v-model="editForm.name" class="input" type="text" placeholder="Topic name" required />
				<textarea v-model="editForm.description" class="input" placeholder="Description (optional)"></textarea>
				<button class="btn" type="submit">Save Changes</button>
			</form>

			<div v-if="projects.length"
				style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.6rem;">
				<NuxtLink v-for="project in projects" :key="project.id" :to="`/projects/${project.id}`"
					style="text-decoration: none; display: block" class="link">
					<ProjectCard :project="project" />
				</NuxtLink>
			</div>

			<div v-else class="muted" style="margin-top: 0.75rem">
				No projects yet. Start by adding a new one!
			</div>
		</div>

		<div style="margin-top: 1.25rem">
			<h3 style="margin-bottom: 0.5rem">Add a Project</h3>
			<form @submit.prevent="addNewProject" class="form">
				<input v-model="form.title" class="input" type="text" required placeholder="Project title" />
				<input v-model="form.description" class="input" type="text" required placeholder="Description" />
				<select v-model="form.status" class="input">
					<option value="in-progress">in-progress</option>
					<option value="completed">completed</option>
					<option value="not-started">not-started</option>
				</select>
				<button class="btn" type="submit">Add Project</button>
			</form>
		</div>
	</div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDashboardStore } from '~/stores/dashboard';
import ProjectCard from '~/components/ProjectCard.vue';
import type { ProjectStatus } from '~/types';

const route = useRoute();
const store = useDashboardStore();
await store.loadInitialData();

const topicId = route.params.topic as string;
const topic = computed(() => store.getTopicById(topicId));
const projects = computed(() => store.getTopicProjects(topicId));

const isEditing = ref(false);
const editForm = ref({
	name: topic.value?.name ?? '',
	description: (topic.value as any)?.description ?? '',
});

const form = ref<{
	title: string;
	description: string;
	status: ProjectStatus;
}>({
	title: '',
	description: '',
	status: 'in-progress',
});

function addNewProject() {
	const { title, description, status } = form.value;
	if (title && description) {
		store.addProject(topicId, {
			id: `${topicId}-${Math.random().toString(36).substr(2, 5)}`,
			title,
			description,
			status,
			startDate: new Date().toISOString().split('T')[0] || '',
			endDate: null,
			notes: [],
		});
		form.value = { title: '', description: '', status: 'in-progress' };
	}
}

async function saveTopicEdits() {
	if (!topic.value) return;
	await store.updateTopic(topicId, {
		name: editForm.value.name,
		description: editForm.value.description,
	});
	isEditing.value = false;
}
</script>