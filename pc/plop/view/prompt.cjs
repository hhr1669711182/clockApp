/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:55
 * @LastEditTime: 2025-10-30 15:33:05
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\plop\view\prompt.cjs
 */
// const toUpperCase = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const toUpperCase = (str) => str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())


module.exports = {
  description: 'Create vue view',
  prompts: [
    {
      type: 'input',
      name: 'path',
      message: '请输入路径（Please enter a path）',
      default: 'views'
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入模块名称（Please enter module name）'
    }
  ],
  actions: (data) => {
    const { name, path } = data
    const upperFirstName = toUpperCase(name)
    console.log("🚀 ~ file: prompt.cjs:31 ~ upperFirstName:", upperFirstName)

    const actions = []
    if (name) {
      actions.push({
        type: 'add',
        path: `./src/${path}/${upperFirstName}/index.vue`,
        templateFile: './plop/view/view.hbs',
        data: {
          name,
          upperFirstName
        }
      })
    }

    return actions
  }
}
