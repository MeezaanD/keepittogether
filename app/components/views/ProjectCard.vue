<template>
	<el-card class="project-card" shadow="hover" role="article">
		<template #header>
			<div class="card-header">
				<el-text size="large" tag="h3" class="project-title">
					{{ project.title }}
				</el-text>
				<el-tag :type="statusTagType" effect="light" size="large">
					{{ statusDisplayText }}
				</el-tag>
			</div>
		</template>

		<el-text type="info" size="small" class="project-description">
			{{ project.description }}
		</el-text>
	</el-card>
</template>

<script lang="ts" setup>
import type { Project } from '~/types';
import { computed } from 'vue';
import { useFormattedDate } from '~/composables/useFormattedDate';

const props = defineProps<{ project: Project }>();
const formatDate = useFormattedDate();

const statusTagType = computed(() => {
	switch (props.project.status) {
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
	switch (props.project.status) {
		case 'completed':
			return 'Completed';
		case 'in-progress':
			return 'In Progress';
		case 'not-started':
			return 'Not Started';
		default:
			return props.project.status;
	}
});
</script>

<style scoped>
.project-card {
	transition: all 0.3s ease;
	height: 100%;
	border-radius: 8px;
}

.project-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 0.5rem;
}

.project-title {
	margin: 0;
	font-weight: 600;
	flex: 1;
	word-break: break-word;
}

.project-description {
	display: block;
	line-height: 1.4;
	margin-bottom: 1rem;
}

.custom-divider {
	margin: 1rem 0;
}

.project-meta {
	width: 100%;
}

:deep(.el-card__header) {
	padding: 1.25rem 1.25rem 0.5rem;
}

:deep(.el-card__body) {
	padding: 0.5rem 1.25rem 1.25rem;
}
</style>