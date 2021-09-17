const {
    execSync
} = require('child_process');
const process = require('process');
const inquirer = require('inquirer');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const {
    writeFileTree,
    resolveJson,
    pusBranch
} = require('../lib/utils');

const rootPath = process.cwd();

const platformQues = [{
    type: 'list',
    name: 'env', // 变量名
    message: '请选择打包环境',
    default: '',
    choices: ['测试 test', '预发 pre', '生产 prod'] // 选项
}];

const releaseAPIMap = {
    test: 'http://localhost:7001',
    pre: 'http://localhost:7001',
    prod: 'http://localhost:7001',
}

/**
 * 更新版本号
 */
async function upVersion() {
    const pkg = resolveJson(rootPath);
    // master 版本号自增
    const v = pkg.version.split('.');
    v[2] = Number(v[2]) < 10 ? Number(v[2]) + 1 : 0;
    v[1] = v[2] === 0 ? Number(v[1]) + 1 : Number(v[1]);
    v[1] = v[1] < 10 ? Number(v[1]) : 0;
    v[0] = v[1] === 0 ? Number(v[0]) + 1 : v[0];
    pkg.version = v.join('.');
    await writeFileTree(rootPath, {
        'package.json': JSON.stringify(pkg, null, 2)
    });
}


async function release() {
    // 交互命令
    const res = await inquirer.prompt(platformQues);
    const {
        env
    } = res;
    const mode = env.split(' ')[1]; // test, pre, prod
    // 执行命令，构建
    execSync(`npx vue-cli-service build ${mode ? `--mode ${mode}` : ''}`, {
        stdio: 'inherit' // 子进程将使用父进程的标准输入输出
    });

    const baseApi = releaseAPIMap[mode];
    const templateConfig = require(`${process.cwd()}/atom.config.js`);
    console.log();
    const spinner = ora('🗃 开始提交模板...').start();
    // 升级版本
    await upVersion();
    // 运行git提交命令
    pusBranch();
    console.log();
    spinner.succeed('🎉 模版提交完成');
    // 发布
    await releaseTemplate({
        ...templateConfig,
        baseApi
    });
}

/**
 * 
 * @param {*} param 
 */
async function releaseTemplate({
    snapshot,
    name, // 项目名
    templateName, // 中文描述
    author, // 作者
    baseApi,
    gitUrl
}) {
    try {
        // 发布数据
        await axios
            .post(`${baseApi}/template/update`, {
                name,
                templateName,
                author,
                snapshot,
                gitUrl,
                version: resolveJson(rootPath).version
            });
            console.log();
        chalk.green(`🎉 🎉 发布成功！`);
    } catch (error) {
        chalk.red('发布失败', error);
    }
}



module.exports = release;