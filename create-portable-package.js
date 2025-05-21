const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 获取版本号
const packageJson = require('./package.json');
const version = packageJson.version;

// 文件夹命名
const portableName = `秤人健康系统-便携版-${version}`;
const sourceDir = path.join(__dirname, 'dist', 'win-unpacked');
const targetDir = path.join(__dirname, 'dist', portableName);

// 删除目标文件夹（如果存在）
if (fs.existsSync(targetDir)) {
  console.log('正在删除旧的目标文件夹...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// 复制文件
console.log('正在复制文件...');
fs.mkdirSync(targetDir, { recursive: true });

// 使用robocopy复制目录内容
const robocopyCommand = `robocopy "${sourceDir}" "${targetDir}" /E`;
exec(robocopyCommand, (error, stdout, stderr) => {
  if (error && error.code > 1) {
    // robocopy返回1意味着成功但有一些文件被跳过，这是正常的
    console.error(`复制出错: ${error}`);
    return;
  }
  
  console.log('复制完成！文件已复制到:', targetDir);
  console.log('正在创建压缩文件...');
  
  // 更新图标（这一步可能需要使用其他工具如ResourceHacker来完成）
  // 这里只是简单复制图标文件到便携版目录
  fs.copyFileSync(
    path.join(__dirname, '24-cio.ico'), 
    path.join(targetDir, '24-cio.ico')
  );
  
  // 创建一个简单的启动批处理文件
  const batchContent = `@echo off
title 启动秤人健康系统
echo 正在启动秤人健康系统...
start "" "%~dp0秤人.exe"
exit
`;
  
  fs.writeFileSync(path.join(targetDir, '启动秤人.bat'), batchContent);
  
  // 创建一个简单的README文件
  const readmeContent = `# 秤人健康系统 便携版 ${version}

## 使用方法
1. 双击"启动秤人.bat"文件即可运行程序
2. 程序数据将保存在本目录中

## 注意事项
- 请不要删除任何文件夹和文件
- 若要卸载，直接删除整个文件夹即可
`;
  
  fs.writeFileSync(path.join(targetDir, 'README.txt'), readmeContent);
  
  console.log('便携版创建完成！');
  console.log(`文件位置: ${targetDir}`);
  
  // 创建zip压缩文件
  const zipCommand = `powershell Compress-Archive -Path "${targetDir}" -DestinationPath "${targetDir}.zip" -Force`;
  console.log('正在创建ZIP压缩包...');
  
  exec(zipCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`压缩出错: ${error}`);
      return;
    }
    console.log(`ZIP压缩包已创建: ${targetDir}.zip`);
  });
}); 