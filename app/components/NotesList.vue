<template>
  <div>
    <div v-if="notes.length">
      <div v-for="(note, idx) in notes" :key="idx" class="note">
        <div class="note-date">{{ formatDate(note.date) }}</div>
        <div v-html="renderMarkdown(note.content)"></div>
      </div>
    </div>
    <div v-else class="muted">No notes yet.</div>
  </div>
</template>

<script lang="ts" setup>
import type { Note } from '~/types';
import { useFormattedDate } from '~/composables/useFormattedDate';
import MarkdownIt from 'markdown-it';

const props = defineProps<{ notes: Note[] }>();
const formatDate = useFormattedDate();
const md = new MarkdownIt();

function renderMarkdown(content: string) {
  return md.render(content || '');
}
</script>