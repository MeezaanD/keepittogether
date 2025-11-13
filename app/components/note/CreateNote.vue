<template>
	<div>
		<el-button type="primary" @click="showModal = true">
			<i class="el-icon-plus"></i>
			Add Note
		</el-button>

		<el-dialog v-model="showModal" title="Add New Note" width="600" :before-close="handleClose">
			<el-form @submit.prevent="handleCreate" :model="form">
				<el-form-item label="Note Content" required>
					<el-input v-model="form.content" type="textarea" :rows="4"
						placeholder="Enter your note content (Markdown supported)" required show-word-limit
						maxlength="1000" />
				</el-form-item>
				<el-form-item label="Note Date">
					<el-date-picker v-model="form.date" type="date" placeholder="Select date" format="YYYY-MM-DD"
						value-format="YYYY-MM-DD" />
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

interface Props {
	projectId: string;
	showAddModal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	showAddModal: false,
});

const emit = defineEmits<{
	created: [note: any];
	'update:showAddModal': [value: boolean];
}>();

const showModal = ref(props.showAddModal);
const form = ref<{
	content: string;
	date: string;
}>({
	content: '',
	date: new Date().toISOString().split('T')[0] || '',
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
	if (form.value.content.trim()) {
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
	form.value = {
		content: '',
		date: new Date().toISOString().split('T')[0] || '',
	};
}

async function handleCreate() {
	const { content, date } = form.value;

	if (!content.trim()) {
		ElMessage.warning('Please enter note content');
		return;
	}

	try {
		const newNote = {
			date: date || new Date().toISOString().substring(0, 10),
			content: content.trim(),
		};

		resetForm();
		showModal.value = false;
		emit('created', newNote);
		ElMessage.success('Note added successfully');
	} catch (error) {
		ElMessage.error('Failed to add note');
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