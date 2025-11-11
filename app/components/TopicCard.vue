<template>
	<div class="card" role="article">
		<div class="row-between mb-1">
			<h2 class="title-lg">{{ topic.name }}</h2>
			<span class="muted small">{{ projectCount }} projects</span>
		</div>

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
import type { Topic } from '~/types';
import { computed } from 'vue';

const props = defineProps<{
	topic: Topic;
	completed: number;
	total: number;
	projectCount: number;
}>();

const completed = props.completed || 0;
const total = props.total || 0;
const completedRatio = computed(() => (total ? completed / total : 0));
</script>