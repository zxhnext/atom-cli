module.exports = function ({
    name, // 项目名
    templateName, // 模版中文名
    author, // 作者
    projectType,
    nameSpace,
    repoUrl
}) {
    return `module.exports = {
        name: '${name}',
        templateName: '${templateName}',
        author: '${author}',
        snapshot: '',
        gitUrl: '${repoUrl}',
        projectType: '${projectType}',
        nameSpace: '${nameSpace}'
    }`
}