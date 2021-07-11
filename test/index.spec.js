import plugin from '../plugin/index';
import pluginTester from 'babel-plugin-tester';

pluginTester({
    plugin: plugin,
    tests: {
        'no-params': {
            code: `spliceText('有趣的灵魂')`,
            snapshot: true
        },
        'has-params': {
            code: `spliceText('我有一只小{0}，我从来都不{1}', '毛驴', '骑')`,
            snapshot: true
        }
    }
})