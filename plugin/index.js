const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
    api.assertVersion(7);
    const { types } = api;
    
    return {
        name: 'my-test-plugin',
        pre (file) {
            
        },
        visitor: {
            Identifier (path, state) {
                if (path.node.name === 'spliceText') {
                    path.node.name = 'spliceTextCopy';
                    
                    // 拿到当前 Identifier 的父节点也就是整个表达式
                    const parent = path.parent;
                    const args = parent.arguments;

                    // 只有一个参数，不需要处理
                    if (args.length === 1) {
                        return;
                    }

                    // 构建空对象的 ast
                    const params = types.objectExpression([]);

                    // 从 1 开始，遍历参数，然后塞进对象表达式的 properties 中
                    for (let i = 1, len = args.length; i < len; i++) {
                        params.properties.push(
                            types.objectProperty(
                                types.numericLiteral(i-1),
                                args[i]
                            )
                        )
                    }

                    parent.arguments.splice(1);
                    parent.arguments.push(params);
                    path.skip();
                }
            }
        },
        post (file) {

        }
    };
});