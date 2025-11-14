module.exports = function (plop) {
    plop.setGenerator('view', {
        description: '生成一个视图页面',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: '请输入视图名称（英文）:',
                validate: value => {
                    if (!value) return '视图名称不能为空'
                    if (!/^[a-zA-Z]+$/.test(value)) return '视图名称只能包含英文字母'
                    return true
                }
            },
            {
                type: 'input',
                name: 'description',
                message: '请输入页面描述:',
                default: '页面描述'
            },
            {
                type: 'confirm',
                name: 'hasTree',
                message: '是否需要左侧树形结构?',
                default: true
            },
            {
                type: 'confirm',
                name: 'hasSearch',
                message: '是否需要搜索表单?',
                default: true
            },
            {
                type: 'input',
                name: 'author',
                message: '作者:',
                default: 'huanghuanrong'
            }
        ],
        actions: function (data) {
            const actions = [
                {
                    type: 'add',
                    path: 'src/views/{{camelCase name}}/index.vue',
                    templateFile: 'plop-templates/view/index.hbs',
                    data: {
                        date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('zh-CN'),
                        filePath: `src/views/{{camelCase name}}/index.vue`,
                        // 默认的树形数据
                        treeData: JSON.stringify([
                            {
                                id: 1,
                                name: '单位1',
                                children: [
                                    {
                                        id: 2,
                                        name: '单位1-1'
                                    }
                                ],
                                key: 1,
                                isLeaf: false,
                                scopedSlots: {
                                    title: 'customTitle'
                                }
                            },
                            {
                                id: 3,
                                name: '单位2'
                            },
                            {
                                id: 4,
                                name: '单位3'
                            },
                            {
                                id: 5,
                                name: '单位4'
                            },
                            {
                                id: 6,
                                name: '单位5'
                            }
                        ], null, 2),
                        // 默认的搜索表单配置
                        searchSchema: JSON.stringify([
                            {
                                field: 'unitName',
                                label: '单位名称',
                                component: 'Input'
                            },
                            {
                                field: 'type',
                                label: '单位类型',
                                component: 'Select',
                                componentProps: {
                                    options: [
                                        {
                                            label: '文件',
                                            value: 'file'
                                        },
                                        {
                                            label: '图片',
                                            value: 'image'
                                        }
                                    ]
                                }
                            },
                            {
                                field: 'unit',
                                label: '维保单位',
                                component: 'Input'
                            },
                            {
                                field: 'unitUser',
                                label: '维保人员',
                                component: 'Input'
                            },
                            {
                                field: 'textArea',
                                label: '所在区域',
                                component: 'Select',
                                componentProps: {
                                    options: [
                                        {
                                            label: '区域A',
                                            value: 'areaA'
                                        },
                                        {
                                            label: '区域B',
                                            value: 'areaB'
                                        },
                                        {
                                            label: '区域C',
                                            value: 'areaC'
                                        }
                                    ]
                                }
                            }
                        ], null, 2),
                        // 默认的表格列配置
                        tableColumns: JSON.stringify([
                            {
                                headerAlign: 'center',
                                align: 'center',
                                field: 'index',
                                label: '序号',
                                width: 80
                            },
                            {
                                field: 'unitName',
                                label: '单位名称'
                            },
                            {
                                field: 'unitType',
                                label: '单位类型',
                                width: 150,
                                slots: {
                                    default: (data) => {
                                        return (
                                            `<ElTag type={data.row.unitType === 'file' ? 'primary' : 'success'}>
    {data.row.unitType === 'file' ? '文件' : '图片'}
</ElTag>`
                                        )
                                    }
                                }
                            },
                            {
                                field: 'maintenanceUnit',
                                label: '维保单位名称'
                            },
                            {
                                field: 'maintenanceUser',
                                label: '维保人员'
                            },
                            {
                                field: 'attachmentInfo',
                                label: '附件信息',
                                slots: {
                                    default: (data) => {
                                        return <a href="#" target="_blank">{`${data.row.attachmentInfo}`}</a>
                                    }
                                }
                            },
                            {
                                headerAlign: 'center',
                                align: 'center',
                                width: 150,
                                field: 'action',
                                label: '操作',
                                slots: {
                                    default: (data) => {
                                        return (
                                            <ElButton link type="primary">
                                                查看
                                            </ElButton>
                                        )
                                    }
                                }
                            }
                        ], null, 2),
                        // 默认的表格数据
                        tableData: JSON.stringify([
                            {
                                index: 1,
                                unitName: 'XX大厦',
                                unitType: 'file',
                                maintenanceUnit: 'XX维保公司',
                                maintenanceUser: '张三',
                                attachmentInfo: '3个附件'
                            },
                            {
                                index: 2,
                                unitName: 'YY商场',
                                unitType: 'image',
                                maintenanceUnit: 'YY维保公司',
                                maintenanceUser: '李四',
                                attachmentInfo: '5个附件'
                            },
                            {
                                index: 3,
                                unitName: 'ZZ医院',
                                unitType: 'file',
                                maintenanceUnit: 'ZZ维保公司',
                                maintenanceUser: '王五',
                                attachmentInfo: '2个附件'
                            }
                        ], null, 2)
                    }
                }
            ]

            return actions
        }
    })
}