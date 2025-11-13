<template>
	<div>
		<el-button plain @click="showModal = true"> Add Topic </el-button>

		<el-dialog v-model="showModal" title="Create New Topic" width="500" :before-close="handleClose">
			<el-input v-model="newTopicName" placeholder="Enter topic name" @keyup.enter="handleCreate" />

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
import { ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useDashboardStore } from '~/stores/dashboard';

const emit = defineEmits(['created']);
const store = useDashboardStore();

const showModal = ref(false);
const newTopicName = ref('');

const handleClose = (done: () => void) => {
	if (newTopicName.value.trim()) {
		ElMessageBox.confirm(
			'Are you sure to close this dialog? Any unsaved changes will be lost.'
		)
			.then(() => {
				newTopicName.value = '';
				done();
			})
			.catch(() => {
				// catch cancel
			});
	} else {
		newTopicName.value = '';
		done();
	}
};

async function handleCreate() {
	if (!newTopicName.value.trim()) {
		ElMessage.warning('Please enter a topic name');
		return;
	}

	try {
		const newTopic = await store.createTopic(newTopicName.value.trim());
		newTopicName.value = '';
		showModal.value = false;
		emit('created', newTopic);
		ElMessage.success('Topic created successfully');
	} catch (error) {
		ElMessage.error('Failed to create topic');
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