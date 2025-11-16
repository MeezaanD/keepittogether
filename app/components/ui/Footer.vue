<template>
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
                <a href="https://www.linkedin.com/in/meezaan-davids-4a7aa8265/" target="_blank" title="LinkedIn">
                    <Icon icon="mdi:linkedin" />
                </a>
            </div>
        </div>
    </el-footer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<style scoped>
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
</style>