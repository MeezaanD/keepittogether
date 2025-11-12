<template>
	<div>
		<button class="btn" @click="showModal = true">
			Add Topic
		</button>
		<div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
			<div class="modal">
				<h3 class="title-md">Create New Topic</h3>
				<input v-model="newTopicName" type="text" placeholder="Enter topic name" class="input"
					@keyup.enter="handleCreate" />
				<div class="actions">
					<button class="btn" @click="handleCreate">Create</button>
					<button class="btn-secondary" @click="showModal = false">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDashboardStore } from '~/stores/dashboard';

const emit = defineEmits(['created']);
const store = useDashboardStore();

const showModal = ref(false);
const newTopicName = ref('');

async function handleCreate() {
	if (!newTopicName.value.trim()) return;

	const newTopic = await store.createTopic(newTopicName.value.trim());
	newTopicName.value = '';
	showModal.value = false;

	emit('created', newTopic);
}
</script>

<style scoped>
.btn {
	background: #2563eb;
	color: white;
	border: none;
	padding: 0.5rem 0.75rem;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 600;
}

.btn-secondary {
	background: #e5e7eb;
	color: #111827;
	border: none;
	padding: 0.5rem 0.75rem;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
}

.modal-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 50;
}

.modal {
	background: white;
	padding: 1.5rem;
	border-radius: 12px;
	width: 90%;
	max-width: 400px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.input {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	margin: 0.75rem 0;
	font-size: 1rem;
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
}
</style>
