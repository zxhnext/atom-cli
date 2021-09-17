#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const program = require('commander');
const initial = require('../command/initial');
const generate = require('../command/generator');
const release = require('../command/release');
const releaseCo = require('../command/releaseCo');

const pkg = require('../package.json')

let config = {};
// 配置文件如果存在则读取
if (fs.existsSync(path.resolve('atom.config.js'))) {
    config = require(path.resolve('atom.config.js'));
}

// 初始化配置
program
    .version(pkg.version, '-v, --version')
    .command('init')
    .description('初始化 atom config 配置文件')
    .action(initial);

// 生成模版
program
    .command('create [template]')
    .description('生成 atom 模板')
    .action(function (template) {
        generate(template);
    });

// 发布模版
program
    .command('release')
    .description('发布模板')
    .action(function () {
        release();
    });

// 发布组件
program
    .command('releaseCo')
    .description('发布组件')
    .action(function () {
        releaseCo();
    });

program.parse(process.argv);