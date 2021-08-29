const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
    api.assertVersion(7);
    const { types } = api;
    
    return {
        name: 'transform-vue2-options-to-vue3-composition-plugin',
        pre (file) {
            
        },
        visitor: {
            Identifier (path, state) {
                
            }
        },
        post (file) {

        }
    };
});