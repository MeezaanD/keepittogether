<template>
	<div class="card" role="article">
		<div class="row-between mb-1">
			<h2 class="title-lg">{{ topic.name }}</h2>
			<!-- Delete button -->
			<button class="delete-btn" @click.stop.prevent="confirmDelete" title="Delete topic">
				Delete
			</button>
		</div>
		<span class="muted small">{{ projectCount }} projects</span>
		<div class="mt-2">
			<div class="progress-outer" aria-hidden>
				<div
					class="progress-inner"
					:class="{ complete: completedRatio >= 1 }"
					:style="{ width: Math.round(completedRatio * 100) + '%' }"
				></div>
			</div>
			<div class="mt-3 small muted">
				{{ completed }} of {{ total }} completed
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
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

async function confirmDelete() {
	const confirmMsg = `Are you sure you want to delete "${props.topic.name}"? This action cannot be undone.`;
	if (confirm(confirmMsg)) {
		await store.deleteTopic(props.topic.id);
	}
}
</script>

<style scoped>
.card {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	padding: 1rem;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
	transition: transform 0.15s ease, box-shadow 0.15s ease;
	position: relative;
}

.card:hover {
	transform: translateY(-3px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.row-between {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.mb-1 {
	margin-bottom: 0.25rem;
}

.mt-2 {
	margin-top: 0.5rem;
}

.mt-3 {
	margin-top: 0.75rem;
}

.muted {
	color: #6b7280;
}

.small {
	font-size: 0.9rem;
}

.progress-outer {
	background: #e5e7eb;
	border-radius: 9999px;
	height: 8px;
	overflow: hidden;
}

.progress-inner {
	background: #2563eb;
	height: 100%;
	border-radius: 9999px;
	transition: width 0.3s ease;
}

.progress-inner.complete {
	background: #16a34a;
}

/* Delete button styling */
.delete-btn {
	background: transparent;
	border: none;
	cursor: pointer;
	font-size: 1.1rem;
	line-height: 1;
	color: #9ca3af;
	transition: color 0.2s ease, transform 0.2s ease;
}

.delete-btn:hover {
	color: #ef4444;
	transform: scale(1.1);
}
</style>
