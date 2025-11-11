<template>
  <div style="padding:1rem 0;">
    <h2 class="title-lg" style="margin-bottom:.75rem">Topics Overview</h2>

    <!-- Loading state -->
    <div v-if="loading" class="muted" aria-live="polite">Loading topics…</div>

    <!-- Error state -->
    <div v-if="error" class="note" style="background:#fff3f3;border-color:#f8d7da;color:#7f1d1d;">
      <strong>Error:</strong> {{ error }}
      <div style="margin-top:.5rem;">
        <button class="btn" @click="reload">Retry</button>
      </div>
    </div>

    <!-- Topics grid -->
    <div v-if="!loading && !error" class="grid-topics" style="margin-top:.75rem">
      <NuxtLink
        v-for="topic in topics"
        :key="topic.id"
        :to="`/topics/${topic.id}`"
        class="link"
        style="text-decoration:none; display:block;"
      >
        <TopicCard
          :topic="topic"
          :completed="getProgress(topic.id)[0]"
          :total="getProgress(topic.id)[1]"
          :project-count="topic.projects.length"
        />
      </NuxtLink>

      <!-- When there are no topics (shouldn't happen with initialData) -->
      <div v-if="topics.length === 0" class="muted" style="padding:1rem;">
        No topics found. You can reload the initial data.
        <div style="margin-top:.5rem;">
          <button class="btn" @click="reload">Reload initial data</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDashboardStore } from '~/stores/dashboard';
import TopicCard from '~/components/TopicCard.vue';

const store = useDashboardStore();
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    await store.loadInitialData();
  } catch (err: any) {
    console.error('Failed to load initial data:', err);
    error.value = err?.message ?? String(err);
  } finally {
    loading.value = false;
  }
});

const topics = computed(() => store.topics);

function getProgress(topicId: string): [number, number] {
  return store.getTopicProgress(topicId);
}

async function reload() {
  loading.value = true;
  error.value = null;
  try {
    store.topics = [];
    store.projectIndex = {};
    await store.loadInitialData();
  } catch (err: any) {
    console.error('Reload failed:', err);
    error.value = err?.message ?? String(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.grid-topics {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .grid-topics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .grid-topics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.muted { color: #6b7280; font-size: .95rem; }
.note { padding: .75rem; background: #fff; border: 1px solid #fde2e2; border-radius: 8px; }
.btn {
  background: #2563eb; color: white; border: none; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; font-weight: 600;
}
.link { color: inherit; }
</style>