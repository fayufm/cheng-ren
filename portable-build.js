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
    target: 'portable',
    icon: '24-cio.ico',
    artifactName: '秤人健康系统-便携版-${version}.${ext}'
  },
  asar: true,
  asarUnpack: [],
  extraResources: [],
  electronDownload: {
    cache: path.resolve(process.env.APPDATA, 'electron-builder/electron-cache')
  },
  buildDependenciesFromSource: true,
  npmRebuild: false,
  forceCodeSigning: false
};

// 执行构建
builder.build({
  targets: builder.Platform.WINDOWS.createTarget(),
  config: config
})
.then(() => {
  console.log('便携版打包成功!');
})
.catch((error) => {
  console.error('便携版打包失败:', error);
}); 