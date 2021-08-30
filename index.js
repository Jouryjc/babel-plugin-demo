const parser = require('@babel/parser');
const { transformFromAst, transformSync } = require('@babel/core');
const plugin = require('./plugin/index.js');
const transformVue2to3 = require('./plugin/transform-vue2-options-to-vue3-composition')

// const sourceCode = `
// spliceText('我有一只小{0}，我从来都不{1}', '毛驴', '骑')    // 有一只小毛驴，我从来都不骑
// spliceText('我叫{0}，今年{1}岁，特长是{2}', '小余', 18, '睡觉') // 叫小余，今年18岁，特长是睡觉
// spliceText('有趣的灵魂')    // 有趣的灵魂
// `

// const ast = parser.parse(sourceCode, {
//     sourceType: 'unambiguous'
// })
// const code = transformFromAst(ast, sourceCode, {
//     plugins: [
//         plugin
//     ]
// }).code

// console.log(code)

const code2 = transformSync(`
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',

  components: {
    HelloWorld
  },

  props: {
    firstName: {
      type: String,
      default: 'Jour'
    }
  },

  data () {
    return {
      lastName: 'Tom'
    }
  },

  computed: {
    name () {
      return this.firstName + this.lastName
    },

    secondName: {
      get () {
        return this.lastName + this.firstName
      }
    } 
  },

  watch: {
    name: {
      deep: true,
      handler (cur, prev) {
        console.log(cur, prev)
      }
    }
  },

  methods: {
    sayHello (aa) {
      console.log('say Hi')
      return aa
    }
  },

  beforeUnmount () {
    console.log('before unmount!')
  }
  
}`, {
  targets: "> 0.25%, not dead",
  plugins: [
    transformVue2to3
  ]
}).code
console.log(code2)