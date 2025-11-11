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

				<el-menu :default-active="activeRoute" class="sidebar-menu" background-color="transparent"
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
								<span>{{ project.title }}</span>
							</el-menu-item>
						</el-sub-menu>

						<el-menu-item v-else :index="`/topics/${topic.id}`" @click="navigate(`/topics/${topic.id}`)">
							<el-icon>
								<Collection />
							</el-icon>
							<span>{{ topic.name }}</span>
						</el-menu-item>
					</template>
				</el-menu>
			</el-aside>

			<!-- Main content -->
			<el-container>
				<el-header class="header">
					<div class="header-content">
						<el-button link :icon="Menu" @click="toggleSidebar" class="mobile-menu-btn" />
						<div class="header-title">Learning Dashboard</div>
					</div>
				</el-header>

				<el-main>
					<div class="main-content">
						<slot />
					</div>
				</el-main>

				<el-footer class="footer">
					Footer
				</el-footer>
			</el-container>
		</el-container>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDashboardStore } from '~/stores/dashboard'
import {
	Menu,
	Folder,
	Document,
	Collection,
} from '@element-plus/icons-vue'

const store = useDashboardStore()
const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const topics = computed(() => store.topics)
const activeRoute = computed(() => route.path)
const sidebarWidth = computed(() => collapsed.value ? '64px' : '240px')

onMounted(async () => {
	await store.loadInitialData()
})

function toggleSidebar() {
	collapsed.value = !collapsed.value
}

function navigate(path: string) {
	router.push(path)
}
</script>

<style scoped>
.layout {
	min-height: 100vh;
	background: #f5f7fa;
}

.sidebar {
	background: #1f2937;
	transition: width 0.3s ease;
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
	color: #6b7280;
	padding: 1rem;
	text-align: center;
	height: 60px;
}

/* Menu item styles */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
	border-radius: 6px;
	margin: 2px 0;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
	background: #374151 !important;
}

:deep(.el-menu-item.is-active) {
	background: #374151 !important;
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
}
</style>