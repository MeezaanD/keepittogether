<template>
	<div class="card" role="article">
		<div class="row-between mb-1">
			<h3 class="title-lg">{{ project.title }}</h3>
			<span :class="badgeClass">{{ project.status }}</span>
		</div>

		<div class="mt-2 small">{{ project.description }}</div>

		<div class="mt-3 meta">
			Started: {{ formatDate(project.startDate) }}
			<span v-if="project.endDate">
				| Ended: {{ formatDate(project.endDate) }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Project } from '~/types';
import { computed } from 'vue';
import { useFormattedDate } from '~/composables/useFormattedDate';

const props = defineProps<{ project: Project }>();
const formatDate = useFormattedDate();

const badgeClass = computed(() => {
	const base = 'badge';
	switch (props.project.status) {
		case 'completed':
			return `${base} badge--success`;
		case 'in-progress':
			return `${base} badge--warn`;
		default:
			return `${base} badge--muted`;
	}
});
</script>