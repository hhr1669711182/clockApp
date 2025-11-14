/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:55
 * @LastEditTime: 2025-11-03 17:43:47
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\plop\component\prompt.cjs
 */
const toUpperCase = (str) => str.charAt(0).toUpperCase() + str.slice(1)

module.exports = {
  description: 'Create vue component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: '请输入组件名称'
    }
  ],
  actions: (data) => {
    const { name } = data
    const upperFirstName = toUpperCase(name)

    const actions = []
    if (name) {
      actions.push({
        type: 'add',
        path: `./src/components/${upperFirstName}/src/${upperFirstName}.vue`,
        templateFile: './plop/component/component.hbs',
        data: {
          name,
          upperFirstName
        }
      }, {
        type: 'add',
        path: `./src/components/${upperFirstName}/index.ts`,
        templateFile: './plop/component/index.hbs',
        data: {
          upperFirstName
        }
      })
    }

    return actions
  }
}
