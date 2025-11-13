<template>
	<el-progress
		:percentage="Math.round(completedRatio * 100)"
		:stroke-width="6"
		:color="completedRatio >= 1 ? '#67C23A' : '#409EFF'"
		:show-text="false"
	/>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ completed: number; total: number }>();

const completedRatio = computed(() =>
	props.total ? props.completed / props.total : 0
);
</script>