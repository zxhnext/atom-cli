const {
    Shell,
    resolveJson
} = require('../lib/utils');
const process = require('process');
const ora = require('ora');
const axios = require('axios');

const rootPath = process.cwd();

async function releaseComponents({
    webDomian, // 仓库http地址
    nameSpace,
    gitUrl, // 仓库ssh地址
    name, // 项目名
    baseApi // 上传地址
}) {
    console.log();
    const spinner = ora('🗃 开始上传组件...').start();
    const sh = new Shell();
    const componentConfig = require(`${process.cwd()}/atom.config.js`);
    const config = {
        ...componentConfig,
        config: []
    };
    // 查找 packages 下所有文件, shell.ls显示目标列表
    sh.shell.ls('packages').forEach((file) => {
        // 如果是文件夹
        if (file.indexOf('.') === -1) {
            // 获取package.json文件
            const json = resolveJson(`${rootPath}/packages/${file}`);
            if (!json.name || !json.version || !json.description) {
                console.error(`${rootPath}/packages/${file} 存在不合规范的package.json, 必须包含name、version、description属性`);
                process.exit(0);
            }
            // 组件发布按照 组件名+组件版本 的形式进行发布，比如 atom-global-banner.0.0.1.umd.js
            const name = `${json.name}.${json.version}`;
            config.config.push({
                dir: file,
                snapshot: json.snapshot,
                name,
                description: json.description,
                js: `${componentConfig.webDomian}/${json.name}/${name}.umd.js`,
                css: `${componentConfig.webDomian}/${json.name}/${name}.css`
            });
        }
    });
    try {
        // 查询是否有该组件
        const res = await axios.get(`${baseApi}/component/query`, {
            params: {
                gitUrl
            }
        });
        config.config = JSON.stringify(config.config);
        const hasRecord = !!res.data.result[0];
        // 添加组件
        if (!hasRecord) {
            const res = await axios.post(`${baseApi}/component/add`, config);
            if (res.data.showType !== undefined) {
                console.log('上传失败' + res.data.result.message);
                return;
            }
            console.log('上传成功');
        } else { // 以存在，更新组件
            await axios.post(`${baseApi}/component/update`, config);
            console.log('组件已存在，上传成功');
        }
        spinner.succeed('🎉 组件上传完成');
    } catch (e) {
        console.log('上传失败' + e);
        process.exit(0);
    }
}

async function releaseCo() {
    const baseApi = 'http://localhost:7001';
    await releaseComponents({
        baseApi
    });
}

module.exports = releaseCo;