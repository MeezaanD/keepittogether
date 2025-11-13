<template>
	<div class="notes-container">
		<div v-if="notes.length">
			<el-timeline class="notes-timeline">
				<el-timeline-item v-for="(note, idx) in notes" :key="idx" :timestamp="formatDate(note.date)"
					placement="top" :type="getTimelineType(note.date)" :hide-timestamp="false">
					<el-card class="note-card" shadow="hover">
						<template #header>
							<div class="note-header">
								<h4 class="note-title">Note</h4>
								<div class="note-actions">
									<el-button type="primary" text size="small" :icon="Edit" @click="editNote(idx)"
										title="Edit note" class="edit-btn" />
									<el-button type="danger" text size="small" :icon="Delete"
										@click="confirmDeleteNote(idx)" title="Delete note" class="delete-btn" />
								</div>
							</div>
						</template>

						<div class="note-content-wrapper">
							<div v-if="!editingNote || editingNote.index !== idx" v-html="renderMarkdown(note.content)"
								class="note-content">
							</div>
							<div v-else class="edit-form">
								<el-form @submit.prevent="saveEditedNote">
									<el-form-item>
										<el-date-picker v-model="editingNote.data.date" type="date"
											placeholder="Select date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
											style="
												width: 100%;
												margin-bottom: 1rem;
											" />
									</el-form-item>
									<el-form-item>
										<el-input v-model="editingNote.data.content" type="textarea" :rows="6"
											placeholder="Enter your note content (Markdown supported)"
											resize="vertical" />
									</el-form-item>
									<el-form-item class="form-actions">
										<el-button @click="cancelEdit">Cancel</el-button>
										<el-button type="primary" native-type="submit">
											Save Changes
										</el-button>
									</el-form-item>
								</el-form>
							</div>
						</div>

						<div v-if="!editingNote || editingNote.index !== idx" class="note-footer">
							<el-text type="info" size="small">
								{{ getNotePreview(note.content) }}
							</el-text>
						</div>
					</el-card>
				</el-timeline-item>
			</el-timeline>
		</div>

		<div v-else class="empty-state">
			<el-empty description="No notes yet" :image-size="100">
				<template #description>
					<div class="empty-description">
						<el-text type="info" size="default">
							No notes have been added to this project yet.
						</el-text>
						<el-text type="info" size="small" style="margin-top: 0.5rem; display: block">
							Add your first note to track progress and ideas.
						</el-text>
					</div>
				</template>
			</el-empty>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Note } from '~/types';
import { useFormattedDate } from '~/composables/useFormattedDate';
import { Delete, Edit } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import MarkdownIt from 'markdown-it';
import { useDashboardStore } from '~/stores/dashboard';
import { ref } from 'vue';

const props = defineProps<{
	notes: Note[];
	projectId: string;
}>();

const emit = defineEmits<{
	deleted: [noteIndex: number];
	updated: [noteIndex: number, updatedNote: Note];
}>();

const store = useDashboardStore();
const formatDate = useFormattedDate();
const md = new MarkdownIt();

const editingNote = ref<{ index: number; data: Note } | null>(null);

function renderMarkdown(content: string) {
	return md.render(content || '');
}

function getNotePreview(content: string): string {
	const plainText = content.replace(/[#*`\[\]]/g, '').trim();
	return plainText.length > 100
		? plainText.substring(0, 100) + '...'
		: plainText;
}

function getTimelineType(date: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
	const noteDate = new Date(date);
	const today = new Date();
	const diffTime = Math.abs(today.getTime() - noteDate.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 1) return 'primary';
	if (diffDays <= 7) return 'success';
	return 'info';
}

function editNote(noteIndex: number) {
	const note = props.notes[noteIndex];
	if (!note) return;
	editingNote.value = {
		index: noteIndex,
		data: {
			date: note.date,
			content: note.content,
		},
	};
}

function cancelEdit() {
	editingNote.value = null;
}

async function saveEditedNote() {
	if (!editingNote.value) return;

	try {
		const { index, data } = editingNote.value;

		if (!data.content.trim()) {
			ElMessage.warning('Note content cannot be empty');
			return;
		}

		await store.updateNote(props.projectId, index, data);
		emit('updated', index, data);
		editingNote.value = null;
		ElMessage.success('Note updated successfully');
	} catch (error) {
		console.error('Failed to update note', error);
		ElMessage.error('Failed to update note');
	}
}

async function confirmDeleteNote(noteIndex: number) {
	try {
		await ElMessageBox.confirm(
			'Are you sure you want to delete this note? This action cannot be undone.',
			'Delete Note',
			{
				confirmButtonText: 'Delete',
				cancelButtonText: 'Cancel',
				type: 'warning',
				confirmButtonClass: 'el-button--danger',
			}
		);

		await store.deleteNote(props.projectId, noteIndex);
		emit('deleted', noteIndex);
		ElMessage.success('Note deleted successfully');
	} catch (error) {
		if (error !== 'cancel') {
			console.error('Failed to delete note', error);
			ElMessage.error('Failed to delete note');
		}
	}
}
</script>

<style scoped>
.notes-container {
	width: 100%;
}

.notes-timeline {
	padding: 1rem 0;
	max-height: 600px;
	overflow-y: auto;
}

.note-card {
	border: 1px solid var(--el-border-color-light);
	border-radius: 8px;
	transition: all 0.3s ease;
	margin: 1rem;
}

.note-card:hover {
	border-color: var(--el-color-primary-light-5);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.note-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.25rem 0;
}

.note-title {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.note-actions {
	display: flex;
	gap: 0.25rem;
}

.edit-btn,
.delete-btn {
	opacity: 0.7;
	transition: all 0.2s ease;
}

.edit-btn:hover,
.delete-btn:hover {
	opacity: 1;
	transform: scale(1.05);
}

.note-content-wrapper {
	min-height: 40px;
	margin: 0.5rem 0;
}

.note-content {
	line-height: 1.6;
	color: var(--el-text-color-primary);
}

.edit-form {
	padding: 0.5rem 0;
}

.form-actions {
	margin-bottom: 0;
	display: flex;
	gap: 0.5rem;
	justify-content: flex-end;
}

.note-footer {
	border-top: 1px solid var(--el-border-color-lighter);
	padding-top: 0.75rem;
	margin-top: 0.75rem;
}

.empty-state {
	padding: 2rem 0;
	text-align: center;
}

.empty-description {
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* Custom scrollbar for timeline */
.notes-timeline::-webkit-scrollbar {
	width: 6px;
}

.notes-timeline::-webkit-scrollbar-track {
	background: var(--el-fill-color-lighter);
	border-radius: 3px;
}

.notes-timeline::-webkit-scrollbar-thumb {
	background: var(--el-border-color);
	border-radius: 3px;
}

.notes-timeline::-webkit-scrollbar-thumb:hover {
	background: var(--el-border-color-dark);
}

/* Timeline customization */
:deep(.el-timeline-item__timestamp) {
	color: var(--el-text-color-regular);
	font-size: 0.875rem;
	font-weight: 500;
	margin-bottom: 0.5rem;
}

:deep(.el-timeline-item__node) {
	background-color: var(--el-color-primary);
	border: 2px solid white;
	box-shadow: 0 0 0 2px var(--el-color-primary);
}

:deep(.el-timeline-item__tail) {
	border-left: 2px solid var(--el-border-color-light);
}

:deep(.el-timeline-item__wrapper) {
	padding-left: 1.5rem;
}

/* Markdown content styling */
.note-content :deep(*) {
	margin: 0.5rem 0;
}

.note-content :deep(*:first-child) {
	margin-top: 0;
}

.note-content :deep(*:last-child) {
	margin-bottom: 0;
}

.note-content :deep(h1) {
	font-size: 1.25rem;
	font-weight: 600;
	margin: 1rem 0 0.5rem 0;
	color: var(--el-text-color-primary);
}

.note-content :deep(h2) {
	font-size: 1.125rem;
	font-weight: 600;
	margin: 0.875rem 0 0.5rem 0;
	color: var(--el-text-color-primary);
}

.note-content :deep(h3) {
	font-size: 1rem;
	font-weight: 600;
	margin: 0.75rem 0 0.5rem 0;
	color: var(--el-text-color-primary);
}

.note-content :deep(p) {
	line-height: 1.6;
}

.note-content :deep(ul),
.note-content :deep(ol) {
	padding-left: 1.5rem;
	margin: 0.5rem 0;
}

.note-content :deep(li) {
	margin: 0.25rem 0;
	line-height: 1.5;
}

.note-content :deep(blockquote) {
	border-left: 3px solid var(--el-color-primary-light-5);
	padding: 0.75rem 1rem;
	margin: 0.75rem 0;
	background: var(--el-fill-color-lighter);
	border-radius: 0 4px 4px 0;
	color: var(--el-text-color-regular);
}

.note-content :deep(code) {
	background: var(--el-fill-color-light);
	padding: 0.15rem 0.3rem;
	border-radius: 3px;
	font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	font-size: 0.85rem;
	color: var(--el-color-primary);
}

.note-content :deep(pre) {
	background: var(--el-fill-color-light);
	padding: 1rem;
	border-radius: 6px;
	overflow-x: auto;
	margin: 0.75rem 0;
	border: 1px solid var(--el-border-color-lighter);
}

.note-content :deep(pre code) {
	background: none;
	padding: 0;
	border: none;
	color: var(--el-text-color-primary);
}

.note-content :deep(a) {
	color: var(--el-color-primary);
	text-decoration: none;
}

.note-content :deep(a:hover) {
	text-decoration: underline;
}

:deep(.el-card__header) {
	padding: 0.75rem 1rem 0.5rem;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card__body) {
	padding: 0.5rem 1rem 0.75rem;
}
</style>