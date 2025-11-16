<template>
	<div class="layout">
		<el-container>
			<!-- Sidebar -->
			<el-aside :width="sidebarWidth" class="sidebar" :class="{ collapsed }">
				<div class="sidebar-header">
					<div class="logo">
						<span class="logo-icon"></span>
						<span class="logo-text" v-if="!collapsed">Dashboard</span>
					</div>
					<el-button link :icon="Menu" @click="toggleSidebar" class="collapse-btn" />
				</div>

				<!-- Loading State -->
				<div v-if="loading" class="menu-loading">
					<div class="loading-content">
						<el-icon class="loading-icon" :size="20">
							<Loading />
						</el-icon>
						<span v-if="!collapsed" class="loading-text">Loading your topics...</span>
					</div>
				</div>

				<!-- Error State -->
				<div v-else-if="error" class="menu-error">
					<el-icon class="error-icon" :size="20">
						<Warning />
					</el-icon>
					<span v-if="!collapsed" class="error-text">Couldn't load topics</span>
					<el-button v-if="!collapsed" link :icon="Refresh" @click="retryLoad" class="retry-btn"
						title="Try again" />
				</div>

				<!-- Menu Content -->
				<el-menu v-else :default-active="activeRoute" class="sidebar-menu" background-color="transparent"
					text-color="#e2e8f0" active-text-color="#ffd04b" :collapse="collapsed">
					<template v-for="topic in topics" :key="topic.id">
						<el-sub-menu v-if="topic.projects?.length" :index="topic.id">
							<template #title>
								<el-icon>
									<Folder />
								</el-icon>
								<span>{{ topic.name }}</span>
							</template>
							<el-menu-item v-for="project in topic.projects" :key="project.id"
								:index="`/projects/${project.id}`" @click="navigate(`/projects/${project.id}`)">
								<el-icon>
									<Document />
								</el-icon>
								<span class="project-name">{{ project.title }} test</span>
							</el-menu-item>
						</el-sub-menu>

						<el-menu-item v-else :index="`/topics/${topic.id}`" @click="navigate(`/topics/${topic.id}`)">
							<el-icon>
								<Collection />
							</el-icon>
							<span>{{ topic.name }}</span>
						</el-menu-item>
					</template>

					<!-- Empty State -->
					<div v-if="topics.length === 0" class="menu-empty">
						<el-icon class="empty-icon" :size="20">
							<FolderOpened />
						</el-icon>
						<span v-if="!collapsed" class="empty-text">No topics yet</span>
					</div>
				</el-menu>
			</el-aside>

			<!-- Main content -->
			<el-container>
				<el-header class="header">
					<div class="header-content">
						<el-button link :icon="Menu" @click="toggleSidebar" class="mobile-menu-btn" />
						<!-- <div class="header-title">Learning Dashboard</div> -->
						<img src="../assets/images/stitch.png" alt="Logo" height="50" />
					</div>
				</el-header>

				<el-main>
					<div class="main-content">
						<slot />
					</div>
				</el-main>

				<el-footer class="footer">
					<div class="footer-content">
						<p class="dev-name">Built by <span>Meezaan Davids</span></p>

						<div class="social-links">
							<a href="mailto:meezaandavids365@gmail.com" target="_blank" title="Email">
								<Icon icon="mdi:email-outline" />
							</a>
							<a href="https://meezaand.github.io/" target="_blank" title="Portfolio">
								<Icon icon="mdi:web" />
							</a>
							<a href="https://github.com/MeezaanD" target="_blank" title="GitHub">
								<Icon icon="mdi:github" />
							</a>
							<a href="https://www.linkedin.com/in/meezaan-davids-4a7aa8265/" target="_blank"
								title="LinkedIn">
								<Icon icon="mdi:linkedin" />
							</a>
						</div>
					</div>
				</el-footer>

			</el-container>
		</el-container>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDashboardStore } from '~/stores/dashboard';
import {
	Menu,
	Folder,
	Document,
	Collection,
	Loading,
	Warning,
	Refresh,
	FolderOpened,
} from '@element-plus/icons-vue';
import { Icon } from '@iconify/vue'

const store = useDashboardStore();
const router = useRouter();
const route = useRoute();
const collapsed = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);

const topics = computed(() => store.topics);
const activeRoute = computed(() => route.path);
const sidebarWidth = computed(() => (collapsed.value ? '64px' : '240px'));

onMounted(async () => {
	await loadData();
});

async function loadData() {
	loading.value = true;
	error.value = null;
	try {
		await store.loadInitialData();
	} catch (err: any) {
		console.error('Failed to load sidebar data:', err);
		error.value = err?.message ?? 'Failed to load navigation data';
	} finally {
		loading.value = false;
	}
}

async function retryLoad() {
	await loadData();
}

function toggleSidebar() {
	collapsed.value = !collapsed.value;
}

function navigate(path: string) {
	router.push(path);
}
</script>

<style scoped>
.layout {
	min-height: 100vh;
	background: #f5f7fa;
}

.el-container>.el-container {
	margin-left: 240px;
	/* default width of sidebar */
	transition: margin-left 0.3s ease;
}

.sidebar.collapsed+.el-container {
	margin-left: 64px;
	/* match collapsed sidebar width */
}

.sidebar {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	overflow-y: auto;
	z-index: 100;
	transition: width 0.3s ease;
	background: #1f2937;
	box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem;
	border-bottom: 1px solid #374151;
	height: 60px;
}

.logo {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: white;
	font-weight: 600;
}

.logo-icon {
	font-size: 1.25rem;
}

.collapse-btn {
	color: #9ca3af;
}

.collapse-btn:hover {
	color: white;
}

.sidebar-menu {
	border: none;
	padding: 0.5rem;
}

/* Loading States */
.menu-loading {
	padding: 1.5rem 1rem;
	color: #9ca3af;
	text-align: center;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.75rem;
}

.loading-icon {
	animation: spin 1s linear infinite;
	color: #6b7280;
}

.loading-text {
	font-size: 0.875rem;
	text-align: center;
}

/* Error State */
.menu-error {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 1.5rem 1rem;
	color: #9ca3af;
	flex-direction: column;
	text-align: center;
}

.error-icon {
	color: #f87171;
}

.error-text {
	font-size: 0.875rem;
}

.retry-btn {
	color: #9ca3af;
	margin-top: 0.5rem;
}

.retry-btn:hover {
	color: #f87171;
}

/* Empty State */
.menu-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.75rem;
	padding: 1.5rem 1rem;
	color: #9ca3af;
	text-align: center;
}

.empty-icon {
	color: #9ca3af;
}

.empty-text {
	font-size: 0.875rem;
}

/* Header Loading */
.header-loading {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #6b7280;
	font-size: 0.875rem;
}

.loading-spinner {
	animation: spin 1s linear infinite;
}

.header {
	background: white;
	border-bottom: 1px solid #e5e7eb;
	padding: 0 1.5rem;
	height: 60px;
}

.header-content {
	display: flex;
	align-items: center;
	gap: 1rem;
	height: 100%;
}

.mobile-menu-btn {
	display: none;
	color: #6b7280;
}

.header-title {
	font-size: 1.25rem;
	font-weight: 600;
	color: #1f2937;
	flex: 1;
}

.el-main {
	padding: 0;
	background: white;
}

.main-content {
	padding: 1.5rem;
	min-height: calc(100vh - 120px);
}

.footer {
	background: #f9fafb;
	border-top: 1px solid #e5e7eb;
	padding: 1rem;
	text-align: center;
	color: #6b7280;
}

.footer-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.4rem;
}

.dev-name {
	font-size: 0.9rem;
	color: #4b5563;
}

.dev-name span {
	font-weight: 600;
	color: #111827;
}

.social-links {
	display: flex;
	gap: 1.3rem;
	font-size: 1.4rem;
}

.social-links a {
	color: #4b5563;
	transition: all 0.2s ease;
}

.social-links a:hover {
	color: #111827;
	transform: translateY(-2px) scale(1.1);
}

/* Make icons consistent size */
.social-links :deep(svg) {
	width: 1.4rem;
	height: 1.4rem;
}

/* Menu item styles */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
	border-radius: 6px;
	margin: 2px 0;
}

.project-name {
	display: inline-block;
	max-width: 20ch;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
	background: #374151 !important;
}

:deep(.el-menu-item.is-active) {
	background: #374151 !important;
}

/* Animations */
@keyframes spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

/* Responsive */
@media (max-width: 768px) {
	.mobile-menu-btn {
		display: flex;
	}

	.sidebar:not(.collapsed) {
		position: fixed;
		z-index: 1000;
		height: 100vh;
	}

	.main-content {
		padding: 1rem;
	}

	.header-loading {
		font-size: 0.75rem;
	}
}
</style>