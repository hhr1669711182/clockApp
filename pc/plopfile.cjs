/*
 * @Author: huanghuanrong
 * @Date: 2025-10-30 14:05:58
 * @LastEditTime: 2025-10-30 20:54:59
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \pc\plopfile.cjs
 */
const viewGenerator = require('./plop/view/prompt.cjs')
const componentGenerator = require('./plop/component/prompt.cjs')
const tableViewGenerator = require('./plop/views/index.cjs')

module.exports = function (plop) {
  plop.setGenerator('view', viewGenerator)
  plop.setGenerator('component', componentGenerator)
  plop.setGenerator('table-view', tableViewGenerator)
}
