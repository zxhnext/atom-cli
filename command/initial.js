const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet'); // 输出一些特殊的文字
const inquirer = require('inquirer');

function copyatomConfigJS() {
    // 将定义好的模板文件，copy 到当前目录
    figlet('atom cli', function (err, data) {
        if (err) {
            console.log(chalk.red('Some thing about figlet is wrong!'));
        }
        console.log(chalk.yellow(data));
        // 初始化文件地址 /Users/zxh/Downloads/lowcode/atom.config.js
        let targetFilePath = path.resolve('atom.config.js');
        // 模版地址
        let templatePath = path.join(__dirname, '../tpl/atom.config.js');
        // 读取模版文件
        let contents = fs.readFileSync(templatePath, 'utf8');
        // 写模版文件
        fs.writeFileSync(targetFilePath, contents, 'utf8');
        console.log(chalk.green('初始化配置成功 \n'));
        process.exit(0);
    });
}

/**
 * 初始化 atom.config.js 文件
 */
module.exports = function () {
    // 配置文件如果存在则提示是否覆盖
    if (fs.existsSync(path.resolve('atom.config.js'))) {
        // 连续提问
        inquirer.prompt([{
                name: 'init-confirm',
                type: 'confirm',
                message: `atom.config.js 已经存在，是否覆盖?`,
                validate: function (input) {
                    if (input.lowerCase !== 'y' && input.lowerCase !== 'n') {
                        return 'Please input y/n !'
                    } else {
                        return true;
                    }
                }
            }])
            .then(answers => {
                if (answers['init-confirm']) {
                    copyatomConfigJS();
                } else {
                    process.exit(0);
                }
            })
            .catch(err => {
                console.log(chalk.red(err));
            })
    } else {
        copyatomConfigJS();
    }
};