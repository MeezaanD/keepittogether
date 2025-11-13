<template>
	<el-card class="topic-card" shadow="hover" role="article">
		<template #header>
			<div class="card-header">
				<h3 class="topic-title">{{ topic.name }}</h3>
				<el-button type="danger" text @click.stop.prevent="confirmDelete" title="Delete topic">
					Delete
				</el-button>
			</div>
		</template>

		<div class="topic-stats">
			<span class="muted-text">{{ projectCount }} projects</span>

			<div class="progress-section">
				<el-progress :percentage="Math.round(completedRatio * 100)" :stroke-width="8"
					:color="completedRatio >= 1 ? successColor : primaryColor" :show-text="false" />
				<div class="progress-text muted-text">
					{{ completed }} of {{ total }} completed
				</div>
			</div>
		</div>
	</el-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useDashboardStore } from '~/stores/dashboard';
import type { Topic } from '~/types';

const props = defineProps<{
	topic: Topic;
	completed: number;
	total: number;
	projectCount: number;
}>();

const store = useDashboardStore();

const completedRatio = computed(() =>
	props.total ? props.completed / props.total : 0
);

const primaryColor = '#409eff';
const successColor = '#67c23a';

async function confirmDelete() {
	try {
		await ElMessageBox.confirm(
			`Are you sure you want to delete "${props.topic.name}"? This action cannot be undone.`,
			'Delete Topic',
			{
				confirmButtonText: 'Delete',
				cancelButtonText: 'Cancel',
				type: 'warning',
				confirmButtonClass: 'el-button--danger',
			}
		);

		await store.deleteTopic(props.topic.id);
		ElMessage.success('Topic deleted successfully');
	} catch (error) {
		// User cancelled the deletion
		if (error !== 'cancel') {
			ElMessage.error('Failed to delete topic');
		}
	}
}
</script>

<style scoped>
.topic-card {
	transition: transform 0.15s ease;
}

.topic-card:hover {
	transform: translateY(-3px);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: -0.5rem;
}

.topic-title {
	margin: 0;
	font-size: 1.125rem;
	font-weight: 600;
}

.topic-stats {
	margin-top: 0.5rem;
}

.progress-section {
	margin-top: 0.5rem;
}

.progress-text {
	margin-top: 0.75rem;
	font-size: 0.9rem;
}

.muted-text {
	color: var(--el-text-color-secondary);
}
</style>