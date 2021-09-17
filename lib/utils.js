const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra'); // fs模块的扩展
const readPkg = require('read-pkg'); // 读取 package.json 文件,用现有版本，版本太高会有问题
const {
    execSync
} = require('child_process');
const sh = require('shelljs');

/**
 * 写文件操作
 * @param {*} dir 父文件夹路径
 * @param {*} files 文件名
 */
function writeFileTree(dir, files) {
    Object.keys(files).forEach((name) => {
        const filePath = path.join(dir, name)
        // 确保目录的存在。如果目录结构不存在,就创建一个
        fsExtra.ensureDirSync(path.dirname(filePath));
        // 写文件
        fsExtra.writeFileSync(filePath, files[name]);
    })
}

/**
 * 读取文件信息
 * @param {*} context 父文件夹路径
 * @param {*} name 文件名
 * @returns 文件信息
 */
function resolveJson(context, name = 'package.json') {
    // 查看目录是否存在
    if (fs.existsSync(path.join(context, name))) {
        return readPkg.sync({
            cwd: context
        })
    }
    return {}
}

/**
 * 运行git命令
 */
function pusBranch() {
    try {
        // 运行命令
        execSync(`git add . && git commit -m 'release project' && git push`);
    } catch (e) {
        console.log(e);
    }
}

/**
 * shell常用命令 https://www.cnblogs.com/dashnowords/p/9632493.html
 */
class Shell {
    constructor() {
        this.shell = sh;
    }
    exec(command) {
        return new Promise((resolve, reject) => {
            sh.exec( // 执行所传入的命令
                command, {
                    async: true // 是否异步执行,默认false，传入callback时自动开启
                },
                (code, stdout, stderr) => {
                    stdout = stdout.toString().trim();
                    if (code === 0) {
                        if (stderr) {
                            console.error(stderr.toString().trim());
                        }
                        resolve(stdout);
                    } else {
                        if (stdout && stderr) {
                            console.error(`\n${stdout}`);
                        }
                        reject(new Error(stderr || stdout));
                    }
                }
            );
        });
    }
}

module.exports = {
    writeFileTree,
    resolveJson,
    pusBranch,
    Shell,
}