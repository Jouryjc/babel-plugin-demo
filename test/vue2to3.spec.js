import plugin from '../plugin/transform-vue2-options-to-vue3-composition';
import pluginTester from 'babel-plugin-tester';

pluginTester({
    plugin: plugin,
    tests: {
        
    }
})