const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
    api.assertVersion(7)
    const { types, template } = api
    const bodyContent = []

    const propertyMap = {
        props: { },
        state: { }
    }

    function assetType(property, type) {
        return types.isIdentifier(property?.key, { name: type })
    }

    /**
     * 转换props
     * options 中的 props 作为 composition api 的参数
     */
    function genDefineProps(property) {
        bodyContent.push(
            types.variableDeclaration(
                'const',
                [
                    types.variableDeclarator(
                        types.identifier('props'),
                        types.callExpression(
                            types.identifier('defineProps'),
                            [
                                property.value
                            ]
                        )
                    )
                ]
            )
        )
    }

    /**
     * 转换data
     * options api 中的 data 转成 composition api 中的 reactive 函数
     */
    function genReactiveData(property) {
        const reactiveDataAST = template.ast(`const state = reactive();`);

        reactiveDataAST.declarations[0].init.arguments.push(property.value.body.body[0].argument)

        // const toRefsAST = template.ast(`toRefs(state)`);

        bodyContent.push(
            reactiveDataAST,
            // toRefsAST
        )
    }

    /**
     * 转换computed
     * options api 中的 computed 转成 composition api 中的 computed 函数
     */
    function genComputed(property) {
        const properties = property.value.properties
        const computedArr = []

        properties.forEach(item => {
            const fnName = item.key.name

            let computedAST = null

            if (types.isObjectMethod(item)) {
                computedAST = template.ast(`const ${fnName} = computed(() => {})`)
                computedAST.declarations[0].init.arguments[0].body = item.value.body
            } else if (types.isObjectProperty(item)) {
                computedAST = template.ast(`const ${fnName} = computed()`)
                computedAST.declarations[0].init.arguments.push(item.value)
            }

            computedArr.push(computedAST)
        })

        bodyContent.push(...computedArr)
    }

    function genWatcher(property) {
        const properties = property.value.properties
        const watcherArr = []

        properties.forEach(item => {
            const fnName = item.key.name

            let watcherAST = null

            watcherAST = template.ast(`watch(() => ${fnName}, () => {})`)

            // {deep: true, handler (new, old) {}, immediate: true}
            if (types.isObjectExpression(item?.value)) {
                const params = item.value.properties
                const methodObject = params.filter(param => types.isObjectMethod(param))
                watcherAST.expression.arguments[1].params = methodObject[0].params
                watcherAST.expression.arguments[1].body = methodObject[0].body

                const isDeep = params.filter(param => types.isObjectProperty(param) && param,key.name === 'deep')
                if (isDeep?.length) {
                    watcherAST.expression.arguments.push(template.ast(`{deep: true}`))
                }
            } else {
                // 判断watcher是个函数
               
                watcherAST.expression.arguments[1].params = item.value.params
                watcherAST.expression.arguments[1].body = item.value.body
            }

            watcherArr.push(watcherAST)
        })

        bodyContent.push(...watcherArr)
    }

    function genMethods(property) {
        const properties = property.value.properties
        const methodArr = []

        properties.forEach(item => {
            const fnName = item.key.name

            let ast = null

            if (types.isObjectProperty(item)) {
                ast = template.ast(`const ${fnName} = () => {}`)
                ast.declarations[0].init.params = item.value.params
                ast.declarations[0].init.body = item.value.body
            }

            methodArr.push(ast)
        })

        bodyContent.push(...methodArr)
    }

    return {
        name: 'transform-vue2-options-to-vue3-composition-plugin',
        pre(file) {
            console.log(file)
        },
        visitor: {
            // ObjectProperty (path) {
            //     console.log(path)
            // },
            // ThisExpression: {
            //     enter (path) {

            //     }
            // },
            Program: {
                exit(path) {
                    const exportDefaultDeclaration = path.node.body.filter(item => types.isExportDefaultDeclaration(item))
                    const properties = exportDefaultDeclaration[0].declaration.properties

                    properties.forEach(property => {
                        if (assetType(property, 'props')) {
                            genDefineProps(property)
                        }

                        if (assetType(property, 'data')) {
                            genReactiveData(property)
                        }

                        if (assetType(property, 'computed')) {
                            genComputed(property)
                        }

                        if (assetType(property, 'watch')) {
                            genWatcher(property)
                        }

                        if (assetType(property, 'methods')) {
                            genMethods(property)
                        }
                    })

                    path.node.body.push(...bodyContent)
                }
            }
        },
        post(file) {

        }
    };
});