<template>
	<div>
		<el-button type="primary" @click="showModal = true">
			<i class="el-icon-plus"></i>
			Add Project
		</el-button>

		<el-dialog v-model="showModal" title="Create New Project" width="500" :before-close="handleClose">
			<el-form @submit.prevent="handleCreate" :model="form">
				<el-form-item label="Project Title" required>
					<el-input v-model="form.title" required placeholder="Project title" />
				</el-form-item>
				<el-form-item label="Description" required>
					<el-input v-model="form.description" required placeholder="Description" />
				</el-form-item>
				<el-form-item label="Status">
					<el-select v-model="form.status" placeholder="Select status">
						<el-option label="In Progress" value="in-progress" />
						<el-option label="Completed" value="completed" />
						<el-option label="Not Started" value="not-started" />
					</el-select>
				</el-form-item>
			</el-form>

			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showModal = false">Cancel</el-button>
					<el-button type="primary" @click="handleCreate">
						Create
					</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useDashboardStore } from '~/stores/dashboard';
import type { ProjectStatus } from '~/types';

interface Props {
	topicId: string;
	showAddModal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showAddModal: false,
});

const emit = defineEmits<{
	created: [project: any];
	'update:showAddModal': [value: boolean];
}>();

const store = useDashboardStore();

const showModal = ref(props.showAddModal);
const form = ref<{
	title: string;
	description: string;
	status: ProjectStatus;
}>({
	title: '',
	description: '',
	status: 'in-progress',
});

// Watch for prop changes
watch(
	() => props.showAddModal,
	(newVal) => {
		showModal.value = newVal;
	}
);

watch(showModal, (newVal) => {
	emit('update:showAddModal', newVal);
});

const handleClose = (done: () => void) => {
	if (form.value.title.trim() || form.value.description.trim()) {
		ElMessageBox.confirm(
			'Are you sure to close this dialog? Any unsaved changes will be lost.'
		)
			.then(() => {
				resetForm();
				done();
			})
			.catch(() => {
				// catch cancel
			});
	} else {
		resetForm();
		done();
	}
};

function resetForm() {
	form.value = { title: '', description: '', status: 'in-progress' };
}

async function handleCreate() {
	const { title, description, status } = form.value;

	if (!title.trim() || !description.trim()) {
		ElMessage.warning('Please fill in all required fields');
		return;
	}

	try {
		const newProject = await store.addProject(props.topicId, {
			id: `${props.topicId}-${Math.random().toString(36).substr(2, 5)}`,
			title: title.trim(),
			description: description.trim(),
			status,
			startDate: new Date().toISOString().split('T')[0] || '',
			endDate: null,
			notes: [],
		});

		resetForm();
		showModal.value = false;
		emit('created', newProject);
		ElMessage.success('Project created successfully');
	} catch (error) {
		ElMessage.error('Failed to create project');
	}
}
</script>

<style scoped>
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}
</style>