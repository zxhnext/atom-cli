const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra'); // fs模块的扩展
const readPkg = require('read-pkg'); // 读取 package.json 文件
const {
    execSync
} = require('child_process');
const sh = require('shelljs');

function writeFileTree(dir, files) {
    Object.keys(files).forEach((name) => {
        const filePath = path.join(dir, name)
        // 确保目录的存在。如果目录结构不存在,就创建一个
        fsExtra.ensureDirSync(path.dirname(filePath));
        // 
        fsExtra.writeFileSync(filePath, files[name]);
    })
}


function resolveJson(context, name = 'package.json') {
    // 查看目录是否存在
    if (fs.existsSync(path.join(context, name))) {
        return readPkg.sync({
            cwd: context
        })
    }
    return {}
}

function pusBranch() {
    try {
        execSync(`git add . && git commit -m 'release project' && git push`);
    } catch (e) {
        console.log(e);
    }
}

class Shell {
    constructor() {
        this.shell = sh;
    }
    exec(command) {
        return new Promise((resolve, reject) => {
            sh.exec(
                command, {
                    async: true
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