<template>
	<div class="dashboard-page">
		<div class="page-header">
			<div class="header-content">
				<el-text
					class="header-title"
					size="xxl"
					tag="h1"
					type="primary"
				>
					Learning Dashboard
				</el-text>
				<el-text type="info" size="small" class="header-subtitle">
					Manage your learning topics and track progress
				</el-text>
			</div>
		</div>

		<div class="dashboard-content">
			<!-- Stats Overview -->
			<el-row :gutter="16" class="stats-row">
				<el-col :xs="24" :sm="8">
					<el-card shadow="never" class="stat-card">
						<div class="stat-content">
							<el-text
								class="stat-number"
								type="primary"
								size="xxl"
							>
								{{ topics.length }}
							</el-text>
							<el-text
								class="stat-label"
								type="info"
								size="small"
							>
								Total Topics
							</el-text>
						</div>
					</el-card>
				</el-col>
				<el-col :xs="24" :sm="8">
					<el-card shadow="never" class="stat-card">
						<div class="stat-content">
							<el-text
								class="stat-number"
								type="success"
								size="xxl"
							>
								{{ totalProjects }}
							</el-text>
							<el-text
								class="stat-label"
								type="info"
								size="small"
							>
								Total Projects
							</el-text>
						</div>
					</el-card>
				</el-col>
				<el-col :xs="24" :sm="8">
					<el-card shadow="never" class="stat-card">
						<div class="stat-content">
							<el-text
								class="stat-number"
								type="warning"
								size="xxl"
							>
								{{ completionRate }}%
							</el-text>
							<el-text
								class="stat-label"
								type="info"
								size="small"
							>
								Completion Rate
							</el-text>
						</div>
					</el-card>
				</el-col>
			</el-row>

			<!-- Action Bar -->
			<el-card class="action-section" shadow="never">
				<template #header>
					<div class="card-header">
						<el-text size="large" tag="h2" type="primary">
							Your Topics
						</el-text>
						<CreateTopic
							v-model:showAddModal="showAddModal"
							@created="handleTopicCreated"
						/>
					</div>
				</template>

				<!-- Loading state -->
				<el-skeleton v-if="loading" :rows="6" animated />

				<!-- Error state -->
				<el-alert
					v-else-if="error"
					:title="error"
					type="error"
					:closable="false"
					show-icon
					class="error-alert"
				>
					<template #action>
						<el-button type="danger" text @click="reload"
							>Retry</el-button
						>
					</template>
				</el-alert>

				<!-- Topics grid -->
				<div v-if="!loading && !error">
					<!-- Empty state -->
					<el-empty
						v-if="topics.length === 0"
						description="No topics found"
						:image-size="200"
						class="empty-state"
					>
						<template #description>
							<div class="empty-description">
								<el-text type="info" size="default">
									No learning topics found yet.
								</el-text>
								<el-text
									type="info"
									size="small"
									style="margin-top: 0.5rem; display: block"
								>
									Create your first topic to organize your
									learning projects.
								</el-text>
							</div>
						</template>
						<template #extra>
							<el-button-group style="margin-top: 1rem">
								<el-button
									type="primary"
									@click="showAddModal = true"
								>
									Create First Topic
								</el-button>
								<el-button @click="reload">
									Reload Data
								</el-button>
							</el-button-group>
						</template>
					</el-empty>

					<!-- Topics grid -->
					<div v-else class="topics-grid">
						<NuxtLink
							v-for="topic in topics"
							:key="topic.id"
							:to="`/topics/${topic.id}`"
							class="topic-link"
						>
							<TopicCard
								:topic="topic"
								:completed="getProgress(topic.id)[0]"
								:total="getProgress(topic.id)[1]"
								:project-count="topic.projects.length"
							/>
						</NuxtLink>
					</div>
				</div>
			</el-card>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useDashboardStore } from '~/stores/dashboard';
import TopicCard from '~/components/TopicCard.vue';
import CreateTopic from '~/components/topic/CreateTopic.vue';

const store = useDashboardStore();
const loading = ref(true);
const error = ref<string | null>(null);
const showAddModal = ref(false);

onMounted(async () => {
	await loadData();
});

const topics = computed(() => store.topics);

const totalProjects = computed(() => {
	return topics.value.reduce(
		(total, topic) => total + topic.projects.length,
		0
	);
});

const completionRate = computed(() => {
	if (totalProjects.value === 0) return 0;

	const completedProjects = topics.value.reduce((total, topic) => {
		const [completed] = getProgress(topic.id);
		return total + completed;
	}, 0);

	return Math.round((completedProjects / totalProjects.value) * 100);
});

function getProgress(topicId: string): [number, number] {
	return store.getTopicProgress(topicId);
}

async function loadData() {
	loading.value = true;
	error.value = null;
	try {
		await store.loadInitialData();
	} catch (err: any) {
		console.error('Failed to load initial data:', err);
		error.value = err?.message ?? String(err);
		ElMessage.error('Failed to load topics');
	} finally {
		loading.value = false;
	}
}

async function reload() {
	loading.value = true;
	error.value = null;
	try {
		store.topics = [];
		store.projectIndex = {};
		await store.loadInitialData();
		ElMessage.success('Data reloaded successfully');
	} catch (err: any) {
		console.error('Reload failed:', err);
		error.value = err?.message ?? String(err);
		ElMessage.error('Failed to reload data');
	} finally {
		loading.value = false;
	}
}

function handleTopicCreated() {
	ElMessage.success('Topic created successfully');
}
</script>

<style scoped>
.dashboard-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 1rem;
}

.page-header {
	margin-bottom: 2rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-content {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.header-title {
	font-size: 2rem;
	font-weight: 700;
	line-height: 1.2;
	margin: 0;
}

.header-subtitle {
	font-weight: 400;
	color: var(--el-text-color-regular);
}

.dashboard-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.stats-row {
	margin-bottom: 0.5rem;
}

.stat-card {
	border: 1px solid var(--el-border-color-light);
	border-radius: 12px;
	text-align: center;
	transition: all 0.3s ease;
}

.stat-card:hover {
	border-color: var(--el-color-primary-light-5);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
	padding: 1.5rem 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.stat-number {
	font-size: 2.5rem;
	font-weight: 700;
	line-height: 1;
}

.stat-label {
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.action-section {
	border: 1px solid var(--el-border-color-light);
	border-radius: 12px;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 0;
}

.error-alert {
	margin-bottom: 1rem;
}

.empty-state {
	padding: 3rem 0;
}

.empty-description {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
}

.topics-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 1.5rem;
	margin-top: 0.5rem;
}

.topic-link {
	text-decoration: none;
	display: block;
	transition: transform 0.2s ease;
}

.topic-link:hover {
	transform: translateY(-2px);
}

:deep(.el-card__header) {
	border-bottom: 1px solid var(--el-border-color-lighter);
	padding: 1.25rem 1.5rem;
}

:deep(.el-card__body) {
	padding: 1.5rem;
}

@media (max-width: 768px) {
	.dashboard-page {
		padding: 0.75rem;
	}

	.stats-row {
		gap: 1rem;
	}

	.stat-content {
		padding: 1rem 0.5rem;
	}

	.stat-number {
		font-size: 2rem;
	}

	.card-header {
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	.topics-grid {
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	:deep(.el-card__header) {
		padding: 1rem;
	}

	:deep(.el-card__body) {
		padding: 1rem;
	}
}

@media (max-width: 480px) {
	.header-title {
		font-size: 1.25rem;
	}

	.stat-number {
		font-size: 1.75rem;
	}
}
</style>