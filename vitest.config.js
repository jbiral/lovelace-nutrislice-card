import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        alias: {
            'https://unpkg.com/lit-element@2.5.4/lit-element.js?module': 'lit-element'
        },
        setupFiles: ['./test/setup.js']
    }
});
