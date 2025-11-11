<template>
	<div class="progress-outer">
		<div
			class="progress-inner"
			:class="{ complete: completedRatio >= 1 }"
			:style="{ width: Math.round(completedRatio * 100) + '%' }"
		></div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps<{ completed: number; total: number }>();
const completedRatio = computed(() =>
	props.total ? props.completed / props.total : 0
);
</script>