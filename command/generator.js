const path = require('path');
const fs = require('fs');
const chalk = require('chalk'); // 在终端显示颜色
const inquirer = require('inquirer'); // 集用户填入表单
const download = require('download-git-repo');
const ora = require('ora'); // 加载动画效果，增加趣味性，用现有版本，版本太高有问题
const genConfig = require('../tpl/getConfig');
const {
    writeFileTree,
    resolveJson
} = require('../lib/utils');
// 目标文件夹根路径
let targetRootPath = process.cwd();

/**
 * 删除模版文件夹
 * @param {*} path /Users/zxh/Downloads/lowcode/${name}
 */
function deleteFolderRecursive(path) {
    // 查看文件是否存在
    if (fs.existsSync(path)) {
        // 同步读取给定目录的内容
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            // 查看文件信息，判断是否是文件夹
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // 删除文件
                fs.unlinkSync(curPath);
            }
        });
        // 删除模版当前文件夹
        fs.rmdirSync(path);
    }
};

/**
 * 下载模版
 * @param {*} repository 模版地址
 * @param {*} projectName 项目名
 * @param {*} clone 
 */
async function downLoadTemplate(repository, projectName, clone) {
    await new Promise((resolve, reject) => {
        download(
            repository,
            projectName, 
            {
                clone
            },
            (err) => {
                if (err) return reject(err);
                resolve();
            }
        );
    });
}

/**
 * 拷贝模版
 * @param {*} name 项目名
 * @param {*} config 交互输入的模版信息
 */
function copyTemplates(name, config) {
    /**
     * 
     * @param {*} parentPath 生成的模版文件路径 /Users/zxh/Downloads/lowcode/${name}
     * @param {*} tempPath 模版文件名 ${name}
     */
    async function readAndCopyFile(parentPath, tempPath) {
        console.log();
        const spinner = ora('🗃 开始下载模版...').start();
        await downLoadTemplate(`direct:git@github.com:zxhnext/atom-template.git`, name, true);
        spinner.succeed('🎉 模版下载完成');
        console.log();
        console.info('🚀 初始化文件配置信息...');

        const pkg = {
            name,
            version: '0.1.0',
            private: true,
        }

        // 重写package.json文件
        await writeFileTree(parentPath, {
            'package.json': JSON.stringify({
                    ...resolveJson(parentPath),
                    ...pkg
                },
                null,
                2
            )
        });

        // 重写atom.config.js文件
        await writeFileTree(parentPath, {
            'atom.config.js': genConfig({
                name: this.name,
                templateName: config.templateName, // 模版中文名
                author: config.author,
            })
        });
        console.log();
        console.log(chalk.green(`🎉 你的项目 ${name} 已创建成功！`));
        console.log();
    }

    readAndCopyFile(path.join(targetRootPath, name), name);
}

/**
 * 交互式输入
 * @returns 
 */
async function getTemplateName() {
    return await inquirer.prompt([{
            name: 'author', // 存储当前问题回答的变量
            type: 'input', // 提问的类型，包括：input, confirm, list, rawlist, expand, checkbox, password, editor
            message: '作者', // 问题的描述
            default: '' // 默认值
        },
        {
            name: 'templateName',
            type: 'input',
            message: '你还需要给你的模版起个中文名',
            default: ''
        }
    ]);
}

/**
 * 
 * @param {*} name 项目名称
 */
async function generate(name) {
    // 交互式问答，生成模板配置信息
    const config = await getTemplateName();
    // 生成项目的目录
    const targetDir = path.join(targetRootPath, name);

    // 检测目录是否存在
    if (fs.existsSync(targetDir)) {

        // 如果已存在改模块，提问开发者是否覆盖该模块
        inquirer.prompt([{
                name: 'template-overwrite',
                type: 'confirm',
                message: `模板 ${name} 已经存在, 是否确认覆盖?`,
                validate: function (input) {
                    if (input.lowerCase !== 'y' && input.lowerCase !== 'n') {
                        return 'Please input y/n !'
                    } else {
                        return true;
                    }
                }
            }])
                .then(async (answers) => {
                    // answers: { 'template-overwrite': true }

                    // 如果确定覆盖
                    if (answers['template-overwrite']) {
                        // 删除文件夹
                        deleteFolderRecursive(targetDir);
                        console.log();
                        console.log(chalk.yellow('该模版已存在 , 删除中...'));
                        //创建新模块文件夹
                        fs.mkdirSync(targetDir);
                        // 拷贝模版
                        copyTemplates(name, config);
                    }
                })
                .catch(err => {
                    console.log(chalk.red(`生成模版失败，请检查是否已存在该文件夹。${err}`));
                })
    } else {
        //创建新模块文件夹
        fs.mkdirSync(targetDir);
        copyTemplates(name, config);
    }

}

module.exports = generate;