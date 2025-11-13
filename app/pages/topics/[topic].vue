<template>
	<div class="topic-page">
		<el-page-header @back="$router.push('/')" class="page-header">
			<template #content>
				<div class="header-content">
					<span class="header-title">Topic Details</span>
				</div>
			</template>
		</el-page-header>

		<div v-if="topic" class="topic-content">
			<!-- Topic Header Section -->
			<el-card class="topic-header-card" shadow="never">
				<template #header>
					<div class="card-header">
						<span class="card-title">Topic Information</span>
						<el-button-group>
							<el-button
								:type="isEditing ? 'danger' : 'primary'"
								:text="true"
								:icon="isEditing ? Close : Edit"
								@click="isEditing = !isEditing"
							>
								{{ isEditing ? 'Cancel Edit' : 'Edit Topic' }}
							</el-button>
						</el-button-group>
					</div>
				</template>

				<div class="topic-main-info">
					<div class="topic-text-content">
						<div v-if="!isEditing" class="topic-display">
							<el-text class="topic-title" size="large" tag="h1">
								{{ topic.name }}
							</el-text>
							<el-text
								v-if="topic.description"
								class="topic-description"
								type="info"
								size="default"
							>
								{{ topic.description }}
							</el-text>
							<el-text
								v-else
								class="topic-description"
								type="info"
								size="default"
							>
								No description provided
							</el-text>
						</div>

						<el-form
							v-else
							@submit.prevent="saveTopicEdits"
							class="topic-edit-form"
						>
							<el-form-item>
								<template #label>
									<el-text type="primary" size="small"
										>Topic Name</el-text
									>
								</template>
								<el-input
									v-model="editForm.name"
									placeholder="Enter topic name"
									size="large"
									class="title-input"
									required
								/>
							</el-form-item>
							<el-form-item>
								<template #label>
									<el-text type="primary" size="small"
										>Description</el-text
									>
								</template>
								<el-input
									v-model="editForm.description"
									type="textarea"
									:rows="3"
									placeholder="Describe this topic..."
									show-word-limit
									maxlength="500"
									resize="none"
								/>
							</el-form-item>
							<el-form-item class="form-actions">
								<el-button @click="isEditing = false"
									>Cancel</el-button
								>
								<el-button type="primary" native-type="submit">
									Save Changes
								</el-button>
							</el-form-item>
						</el-form>
					</div>

					<div class="topic-stats-section">
						<el-card shadow="never" class="stats-card">
							<template #header>
								<el-text
									type="primary"
									size="small"
									tag="strong"
									>Overview</el-text
								>
							</template>
							<div class="stats-content">
								<div class="stat-item">
									<el-text
										class="stat-number"
										size="large"
										type="primary"
									>
										{{ projects.length }}
									</el-text>
									<el-text
										class="stat-label"
										type="info"
										size="small"
									>
										Project{{
											projects.length !== 1 ? 's' : ''
										}}
									</el-text>
								</div>
								<div class="stat-item">
									<el-text
										class="stat-number"
										size="large"
										type="success"
									>
										{{ completedProjects }}
									</el-text>
									<el-text
										class="stat-label"
										type="info"
										size="small"
									>
										Completed
									</el-text>
								</div>
								<div class="stat-item">
									<el-text
										class="stat-number"
										size="large"
										type="warning"
									>
										{{ inProgressProjects }}
									</el-text>
									<el-text
										class="stat-label"
										type="info"
										size="small"
									>
										In Progress
									</el-text>
								</div>
							</div>
						</el-card>
					</div>
				</div>
			</el-card>

			<!-- Projects Section -->
			<el-card class="projects-section" shadow="never">
				<template #header>
					<div class="projects-header">
						<div class="projects-title-section">
							<el-text size="large" tag="h2" type="primary"
								>Projects</el-text
							>
							<el-text type="info" size="small">
								{{ projects.length }} project{{
									projects.length !== 1 ? 's' : ''
								}}
								in this topic
							</el-text>
						</div>
						<CreateProject
							:topic-id="topicId"
							@created="handleProjectCreated"
						/>
					</div>
				</template>

				<div v-if="projects.length" class="projects-grid">
					<NuxtLink
						v-for="project in projects"
						:key="project.id"
						:to="`/projects/${project.id}`"
						class="project-link"
					>
						<ProjectCard :project="project" />
					</NuxtLink>
				</div>

				<el-empty
					v-else
					description="No projects yet"
					:image-size="150"
				>
					<template #description>
						<div class="empty-description">
							<el-text type="info" size="default">
								No projects have been added to this topic yet.
							</el-text>
							<el-text
								type="info"
								size="small"
								style="margin-top: 0.5rem; display: block"
							>
								Create your first project to get started.
							</el-text>
						</div>
					</template>
				</el-empty>
			</el-card>
		</div>

		<el-empty
			v-else
			description="Topic not found"
			:image-size="150"
			class="not-found-state"
		>
			<template #description>
				<div class="empty-description">
					<el-text type="info" size="default">
						The topic you're looking for doesn't exist.
					</el-text>
					<el-button
						type="primary"
						style="margin-top: 1rem"
						@click="$router.push('/')"
					>
						Back to Dashboard
					</el-button>
				</div>
			</template>
		</el-empty>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Edit, Close } from '@element-plus/icons-vue';
import { useDashboardStore } from '~/stores/dashboard';
import ProjectCard from '~/components/ProjectCard.vue';
import CreateProject from '~/components/project/CreateProject.vue';

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

const completedProjects = computed(() => {
	return projects.value.filter((project) => project.status === 'completed')
		.length;
});

const inProgressProjects = computed(() => {
	return projects.value.filter((project) => project.status === 'in-progress')
		.length;
});

function handleProjectCreated() {
	ElMessage.success('Project created successfully');
}

async function saveTopicEdits() {
	if (!topic.value) return;

	if (!editForm.value.name.trim()) {
		ElMessage.warning('Topic name is required');
		return;
	}

	try {
		await store.updateTopic(topicId, {
			name: editForm.value.name,
			description: editForm.value.description,
		});
		isEditing.value = false;
		ElMessage.success('Topic updated successfully');
	} catch (error) {
		ElMessage.error('Failed to update topic');
	}
}
</script>

<style scoped>
.topic-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 1rem;
}

.page-header {
	margin-bottom: 1.5rem;
}

.header-content {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.header-title {
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.topic-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.topic-header-card {
	border: 1px solid var(--el-border-color-light);
	border-radius: 12px;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 0;
}

.card-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.topic-main-info {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 2rem;
	align-items: start;
}

.topic-text-content {
	min-height: 120px;
}

.topic-display {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.topic-title {
	font-size: 1.75rem;
	font-weight: 700;
	line-height: 1.2;
	color: var(--el-text-color-primary);
	margin: 0;
}

.topic-description {
	line-height: 1.6;
	font-size: 1rem;
}

.topic-edit-form {
	background: var(--el-fill-color-lighter);
	padding: 1.5rem;
	border-radius: 8px;
	border: 1px solid var(--el-border-color-light);
}

.topic-stats-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.stats-card {
	border: 1px solid var(--el-border-color-light);
	border-radius: 8px;
}

.stats-content {
	display: flex;
	justify-content: space-around;
	text-align: center;
}

.stat-item {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.stat-number {
	font-size: 1.5rem;
	font-weight: 700;
	line-height: 1;
}

.stat-label {
	font-weight: 500;
}

.projects-section {
	border: 1px solid var(--el-border-color-light);
	border-radius: 12px;
}

.projects-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 0;
}

.projects-title-section {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.projects-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
	margin-top: 0.5rem;
}

.project-link {
	text-decoration: none;
	display: block;
	transition: transform 0.2s ease;
}

.project-link:hover {
	transform: translateY(-2px);
}

.form-actions {
	margin-bottom: 0;
	display: flex;
	gap: 0.75rem;
	justify-content: flex-start;
}

.not-found-state {
	padding: 3rem 0;
}

.empty-description {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
}

:deep(.topic-edit-form .el-form-item) {
	margin-bottom: 1.25rem;
}

:deep(.topic-edit-form .el-form-item:last-child) {
	margin-bottom: 0;
}

:deep(.title-input .el-input__inner) {
	font-size: 1.25rem;
	font-weight: 600;
}

:deep(.el-card__header) {
	border-bottom: 1px solid var(--el-border-color-lighter);
	padding: 1.25rem 1.5rem;
}

:deep(.el-card__body) {
	padding: 1.5rem;
}

@media (max-width: 768px) {
	.topic-page {
		padding: 0.75rem;
	}

	.topic-main-info {
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.projects-header {
		flex-direction: column;
		gap: 1rem;
		align-items: stretch;
	}

	.projects-grid {
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.topic-edit-form {
		padding: 1rem;
	}

	.card-header {
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	.stats-content {
		justify-content: space-between;
	}

	:deep(.el-card__header) {
		padding: 1rem;
	}

	:deep(.el-card__body) {
		padding: 1rem;
	}
}

@media (max-width: 480px) {
	.topic-title {
		font-size: 1.5rem;
	}

	.stat-number {
		font-size: 1.25rem;
	}
}
</style>