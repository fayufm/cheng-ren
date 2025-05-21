const builder = require('electron-builder');
const path = require('path');

// 配置构建选项
const config = {
  appId: 'com.cheng-ren.app',
  productName: '秤人',
  directories: {
    output: 'dist'
  },
  files: [
    '**/*',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ],
  win: {
    target: 'nsis',
    icon: 'cheng-ren.ico',
    artifactName: '秤人健康系统-${version}.${ext}'
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'cheng-ren.ico',
    uninstallerIcon: 'cheng-ren.ico',
    installerHeaderIcon: 'cheng-ren.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: '秤人健康系统'
  }
};

// 执行构建
builder.build({
  targets: builder.Platform.WINDOWS.createTarget(),
  config: config
})
.then(() => {
  console.log('构建成功!');
})
.catch((error) => {
  console.error('构建失败:', error);
}); 