<template>
	<div class="project-page">
		<el-page-header
			@back="$router.push(topic ? `/topics/${topic.id}` : '/')"
			class="page-header"
		>
			<template #content>
				<div class="header-content">
					<span class="header-title">Project Details</span>
				</div>
			</template>
		</el-page-header>

		<div v-if="project" class="project-content">
			<!-- Project Header Section -->
			<el-card class="project-header-card" shadow="never">
				<template #header>
					<div class="card-header">
						<span class="card-title">Project Information</span>
						<el-button-group>
							<el-button
								v-if="!isEditing"
								type="primary"
								:text="true"
								:icon="Edit"
								@click="startEditing"
								title="Edit project"
							>
								Edit
							</el-button>
							<el-button
								type="danger"
								:text="true"
								:icon="Delete"
								@click="confirmDelete"
								title="Delete project"
							>
								Delete
							</el-button>
						</el-button-group>
					</div>
				</template>

				<div class="project-main-info">
					<div class="project-text-content">
						<div v-if="!isEditing" class="project-display">
							<el-text
								class="project-title"
								size="large"
								tag="h1"
							>
								{{ project.title }}
							</el-text>
							<el-text
								class="project-description"
								type="info"
								size="default"
							>
								{{
									project.description ||
									'No description provided'
								}}
							</el-text>
						</div>

						<el-form
							v-else
							@submit.prevent="saveProjectEdits"
							class="project-edit-form"
						>
							<el-form-item>
								<template #label>
									<el-text type="primary" size="small"
										>Project Title</el-text
									>
								</template>
								<el-input
									v-model="editForm.title"
									placeholder="Enter project title"
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
									placeholder="Describe your project..."
									show-word-limit
									maxlength="500"
									resize="none"
								/>
							</el-form-item>
							<el-form-item class="form-actions">
								<el-button @click="cancelEditing"
									>Cancel</el-button
								>
								<el-button
									type="primary"
									native-type="submit"
									:loading="busy"
								>
									Save Changes
								</el-button>
							</el-form-item>
						</el-form>
					</div>

					<div class="project-status-section">
						<el-card shadow="never" class="status-card">
							<template #header>
								<el-text
									type="primary"
									size="small"
									tag="strong"
									>Status</el-text
								>
							</template>
							<div class="status-content">
								<el-tag
									:type="statusTagType"
									effect="light"
									size="large"
									class="status-badge"
								>
									<i
										:class="statusIcon"
										class="status-icon"
									></i>
									{{ statusDisplayText }}
								</el-tag>
								<el-select
									v-model="statusSelect"
									placeholder="Change status"
									:disabled="busy"
									class="status-select"
									@change="onStatusChange"
								>
									<el-option
										label="Not started"
										value="not-started"
									/>
									<el-option
										label="In progress"
										value="in-progress"
									/>
									<el-option
										label="Completed"
										value="completed"
									/>
								</el-select>
							</div>
						</el-card>

						<el-card shadow="never" class="timeline-card">
							<template #header>
								<el-text
									type="primary"
									size="small"
									tag="strong"
									>Timeline</el-text
								>
							</template>
							<div class="timeline-content">
								<div class="timeline-item">
									<i class="el-icon-time timeline-icon"></i>
									<div>
										<el-text type="info" size="small"
											>Started</el-text
										>
										<div class="timeline-date">
											{{ formatDate(project.startDate) }}
										</div>
									</div>
								</div>
								<div
									v-if="project.endDate"
									class="timeline-item"
								>
									<i
										class="el-icon-finished timeline-icon"
									></i>
									<div>
										<el-text type="info" size="small"
											>Completed</el-text
										>
										<div class="timeline-date">
											{{ formatDate(project.endDate) }}
										</div>
									</div>
								</div>
							</div>
						</el-card>
					</div>
				</div>
			</el-card>

			<!-- Notes Section -->
			<el-card class="notes-section" shadow="never">
				<template #header>
					<div class="notes-header">
						<div class="notes-title-section">
							<el-text size="large" tag="h2" type="primary"
								>Project Notes</el-text
							>
							<el-text type="info" size="small">
								{{ project.notes.length }} note{{
									project.notes.length !== 1 ? 's' : ''
								}}
							</el-text>
						</div>
						<CreateNote
							:project-id="projectId"
							@created="handleNoteCreated"
						/>
					</div>
				</template>

				<NotesList
					:notes="project.notes"
					:project-id="projectId"
					@deleted="handleNoteDeleted"
					@updated="handleNoteUpdated"
				/>
			</el-card>
		</div>

		<el-empty
			v-else
			description="Project not found"
			:image-size="150"
			class="not-found-state"
		>
			<template #description>
				<div class="empty-description">
					<el-text type="info" size="default">
						The project you're looking for doesn't exist.
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
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';
import { useDashboardStore } from '~/stores/dashboard';
import NotesList from '~/components/NotesList.vue';
import CreateNote from '~/components/note/CreateNote.vue';
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

const busy = ref(false);
const isEditing = ref(false);
const editForm = ref({
	title: '',
	description: '',
});

// Status select local state (keeps UI responsive)
const statusSelect = ref<ProjectStatus | ''>(project.value?.status ?? '');

watch(project, (p) => {
	statusSelect.value = (p?.status ?? '') as ProjectStatus;
	// Reset edit form when project data changes
	if (p) {
		editForm.value = {
			title: p.title,
			description: p.description,
		};
	}
});

const statusIcon = computed(() => {
	switch (project.value?.status) {
		case 'completed':
			return 'el-icon-success';
		case 'in-progress':
			return 'el-icon-loading';
		case 'not-started':
			return 'el-icon-watch';
		default:
			return 'el-icon-info';
	}
});

function startEditing() {
	if (!project.value) return;
	editForm.value = {
		title: project.value.title,
		description: project.value.description,
	};
	isEditing.value = true;
}

function cancelEditing() {
	isEditing.value = false;
}

async function saveProjectEdits() {
	if (!project.value) return;

	if (!editForm.value.title.trim()) {
		ElMessage.warning('Project title is required');
		return;
	}

	busy.value = true;
	try {
		await store.updateProject(projectId, {
			title: editForm.value.title.trim(),
			description: editForm.value.description.trim(),
		});
		isEditing.value = false;
		ElMessage.success('Project updated successfully');
	} catch (error) {
		console.error('Failed to update project', error);
		ElMessage.error('Failed to update project');
	} finally {
		busy.value = false;
	}
}

// Handler for status changes from the dropdown
async function onStatusChange(val: ProjectStatus) {
	if (!project.value) return;
	if (val === project.value.status) return; // no-op

	busy.value = true;
	try {
		await store.updateProjectStatus(projectId, val);
		ElMessage.success('Status updated successfully');
	} catch (err) {
		console.error('Failed to change status', err);
		// revert UI selection to actual project status
		statusSelect.value = project.value?.status ?? '';
		ElMessage.error('Failed to update status');
	} finally {
		busy.value = false;
	}
}

async function handleNoteCreated(noteData: any) {
	if (!project.value) return;

	busy.value = true;
	try {
		await store.addNote(projectId, noteData);
		ElMessage.success('Note added successfully');
	} catch (err) {
		console.error('addNote failed', err);
		ElMessage.error('Failed to add note');
	} finally {
		busy.value = false;
	}
}

function handleNoteDeleted(noteIndex: number) {
	ElMessage.success('Note deleted successfully');
}

function handleNoteUpdated(noteIndex: number, updatedNote: any) {
	ElMessage.success('Note updated successfully');
}

async function confirmDelete() {
	if (!project.value || !topic.value) return;

	try {
		await ElMessageBox.confirm(
			`Are you sure you want to delete "${project.value.title}"? This action cannot be undone and all notes will be lost.`,
			'Delete Project',
			{
				confirmButtonText: 'Delete Project',
				cancelButtonText: 'Cancel',
				type: 'warning',
				confirmButtonClass: 'el-button--danger',
				center: true,
			}
		);

		busy.value = true;
		await store.removeProject(topic.value.id, projectId);
		ElMessage.success('Project deleted successfully');
		await router.push(topic.value ? `/topics/${topic.value.id}` : '/');
	} catch (err) {
		if (err !== 'cancel') {
			console.error('Failed to delete project', err);
			ElMessage.error('Failed to delete project');
		}
	} finally {
		busy.value = false;
	}
}

const statusTagType = computed(() => {
	switch (project.value?.status) {
		case 'completed':
			return 'success';
		case 'in-progress':
			return 'warning';
		case 'not-started':
			return 'info';
		default:
			return 'info';
	}
});

const statusDisplayText = computed(() => {
	switch (project.value?.status) {
		case 'completed':
			return 'Completed';
		case 'in-progress':
			return 'In Progress';
		case 'not-started':
			return 'Not Started';
		default:
			return project.value?.status || '';
	}
});
</script>

<style scoped>
.project-page {
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

.project-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.project-header-card {
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

.project-main-info {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 2rem;
	align-items: start;
}

.project-text-content {
	min-height: 120px;
}

.project-display {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.project-title {
	font-size: 1.75rem;
	font-weight: 700;
	line-height: 1.2;
	color: var(--el-text-color-primary);
	margin: 0;
}

.project-description {
	line-height: 1.6;
	font-size: 1rem;
}

.project-edit-form {
	background: var(--el-fill-color-lighter);
	padding: 1.5rem;
	border-radius: 8px;
	border: 1px solid var(--el-border-color-light);
}

.project-status-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.status-card,
.timeline-card {
	border: 1px solid var(--el-border-color-light);
	border-radius: 8px;
}

.status-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.status-badge {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	font-weight: 600;
}

.status-icon {
	font-size: 1rem;
}

.status-select {
	width: 100%;
}

.timeline-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.timeline-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.timeline-icon {
	font-size: 1.25rem;
	color: var(--el-color-primary);
}

.timeline-date {
	font-weight: 500;
	color: var(--el-text-color-primary);
	margin-top: 0.125rem;
}

.notes-section {
	border: 1px solid var(--el-border-color-light);
	border-radius: 12px;
}

.notes-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 0;
}

.notes-title-section {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
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

:deep(.project-edit-form .el-form-item) {
	margin-bottom: 1.25rem;
}

:deep(.project-edit-form .el-form-item:last-child) {
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
	.project-page {
		padding: 0.75rem;
	}

	.project-main-info {
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.notes-header {
		flex-direction: column;
		gap: 1rem;
		align-items: stretch;
	}

	.project-edit-form {
		padding: 1rem;
	}

	.card-header {
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	:deep(.el-card__header) {
		padding: 1rem;
	}

	:deep(.el-card__body) {
		padding: 1rem;
	}
}

@media (max-width: 480px) {
	.project-title {
		font-size: 1.5rem;
	}

	.status-content {
		gap: 0.75rem;
	}
}
</style>