const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// 初始化存储
const store = new Store();

// 检查是否在Electron环境中运行
const isElectron = process.versions.hasOwnProperty('electron');

// 启动时创建窗口
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,  // 原来是1200，减小为2/3大小
    height: 534, // 原来是800，减小为2/3大小
    minWidth: 600, // 设置最小宽度
    minHeight: 400, // 设置最小高度
    title: '秤人 v1.7.0',
    icon: path.join(__dirname, 'cheng-ren.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
      zoomFactor: 0.9 // 设置初始缩放因子为0.9，使内容稍微缩小
    },
    // 设置窗口外观
    frame: false, // 完全移除标题栏和边框
    transparent: false,  // 不透明窗口
    titleBarStyle: 'hidden',  // 隐藏标题栏但允许拖拽
    titleBarOverlay: {  // Windows上启用覆盖标题栏
      color: '#ffffff', 
      symbolColor: '#000000',
      height: 30
    },
    backgroundColor: '#ffffff'
  });

  // 允许frame: false情况下的拖拽 (Windows 10+)
  try {
    if (process.platform === 'win32') {
      // 检查 Electron 版本是否支持 titleBarOverlay
      const electronVersion = process.versions.electron;
      const versionParts = electronVersion.split('.').map(Number);
      
      if (versionParts[0] >= 13) {
        // Electron 13+ 支持 titleBarOverlay
        mainWindow.setTitleBarOverlay({
          color: '#ffffff',
          symbolColor: '#000000',
          height: 30
        });
        console.log('启用标题栏覆盖层拖拽功能');
      } else {
        console.log(`当前Electron版本 ${electronVersion} 不支持标题栏覆盖层`);
      }
    }
  } catch (e) {
    console.error('设置标题栏覆盖层失败:', e);
  }

  // 移除菜单栏
  mainWindow.setMenu(null);

  // 加载主页面
  mainWindow.loadFile('index.html');

  // 窗口加载完成后调整尺寸和位置
  mainWindow.webContents.on('did-finish-load', () => {
    // 原始设计尺寸
    const originalWidth = 1200;
    const originalHeight = 800;
    
    // 计算调整后的尺寸 (为原来的2/3)
    const newWidth = Math.floor(originalWidth * 2/3);
    const newHeight = Math.floor(originalHeight * 2/3);
    
    // 设置窗口大小
    mainWindow.setSize(newWidth, newHeight);
    
    // 居中显示
    mainWindow.center();
    
    console.log(`调整窗口大小为原设计的2/3: ${newWidth} × ${newHeight}`);
  });
  
  // 开发环境打开开发者工具
  // mainWindow.webContents.openDevTools();
}

// 应用准备好后创建窗口
if (isElectron && app) {
  app.whenReady().then(createWindow);

  // 所有窗口关闭时退出应用（macOS除外）
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
} else if (!isElectron) {
  // 如果不是在Electron环境中运行，输出提示信息
  console.log("这个应用程序需要在Electron环境中运行。请使用以下命令启动：");
  console.log("npx electron .");
  console.log("或者");
  console.log("npm start");
}

// 处理保存报告
ipcMain.handle('save-report', async (event, { content, format }) => {
  const { filePath } = await dialog.showSaveDialog({
    title: '保存健康报告',
    defaultPath: `健康报告_${new Date().toISOString().slice(0, 10)}`,
    filters: [
      { name: 'PDF', extensions: ['pdf'] },
      { name: '文本文件', extensions: ['txt'] },
      { name: 'Markdown', extensions: ['md'] },
      { name: 'HTML', extensions: ['html'] }
    ]
  });

  if (!filePath) return { success: false, message: '未选择保存位置' };

  try {
    fs.writeFileSync(filePath, content);
    return { success: true, message: '保存成功' };
  } catch (error) {
    return { success: false, message: `保存失败: ${error.message}` };
  }
});

// 获取历史记录
ipcMain.handle('get-history', async () => {
  return store.get('history', []);
});

// 保存记录到历史
ipcMain.handle('save-to-history', async (event, data) => {
  const history = store.get('history', []);
  const newRecord = {
    id: Date.now(),
    date: new Date().toISOString(),
    data: data,
  };
  
  history.unshift(newRecord);
  store.set('history', history);
  return { success: true, record: newRecord };
});

// 删除历史记录
ipcMain.handle('delete-history', async (event, id) => {
  const history = store.get('history', []);
  const newHistory = history.filter(item => item.id !== id);
  store.set('history', newHistory);
  return { success: true };
});

// 处理直接保存文件（不显示系统对话框）
ipcMain.handle('save-file-direct', async (event, { filePath, content }) => {
  if (!filePath) return { success: false, message: '未提供保存路径' };

  try {
    // 确保目录存在
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 直接写入文件
    fs.writeFileSync(filePath, content);
    return { success: true, message: '文件保存成功' };
  } catch (error) {
    console.error('直接保存文件失败:', error);
    return { success: false, message: `保存失败: ${error.message}` };
  }
});

// 在处理窗口控制命令后添加处理拖拽的代码
ipcMain.on('window-control', (event, command) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  switch (command) {
    case 'minimize':
      win.minimize();
      break;
    case 'maximize':
      if (win.isMaximized()) {
        win.unmaximize();
        event.sender.send('window-state-change', 'unmaximized');
      } else {
        win.maximize();
        event.sender.send('window-state-change', 'maximized');
      }
      break;
    case 'close':
      win.close();
      break;
    case 'drag':
      // 此处直接调用原生拖拽
      win.webContents.executeJavaScript(
        'if (process.platform !== "darwin") { window.electronDragStart ? window.electronDragStart() : require("electron").remote.getCurrentWindow().startDrag(); }'
      );
      break;
  }
});

// 处理窗口拖拽开始
ipcMain.on('window-start-drag', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  win.webContents.executeJavaScript(`
    window.addEventListener('mousemove', function windowDrag(e) {
      window.electronAPI.windowControl('drag');
    }, { once: true });
  `);
});

// 处理拖拽结束时清除偏移量
ipcMain.on('window-end-drag', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    // 清除偏移量
    win.dragOffset = null;
    win.lastDragPos = null; // 清除拖拽位置
    console.log('拖拽结束，清除偏移量和位置记录');
  }
});

// 处理window-drag事件 - 特殊处理用于窗口拖拽
ipcMain.on('window-drag', (event) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error('找不到窗口实例');
      return;
    }
    
    // 直接使用setMovable和startMoving来实现拖拽
    if (process.platform === 'darwin') {
      // macOS上使用特殊方式
      win.webContents.executeJavaScript(`
        if (window.electronDragStart) window.electronDragStart();
      `);
    } else {
      // 获取鼠标当前位置
      const { screen } = require('electron');
      const { x, y } = screen.getCursorScreenPoint();
      
      // 如果第一次调用，初始化位置信息
      if (!win.lastDragPos) {
        win.lastDragPos = { x, y };
        return;
      }
      
      // 计算位移
      const deltaX = x - win.lastDragPos.x;
      const deltaY = y - win.lastDragPos.y;
      
      // 获取窗口当前位置
      const [winX, winY] = win.getPosition();
      
      // 设置新位置
      win.setPosition(winX + deltaX, winY + deltaY);
      
      // 更新上次位置
      win.lastDragPos = { x, y };
      
      console.log(`窗口拖拽: deltaX=${deltaX}, deltaY=${deltaY}`);
    }
  } catch (err) {
    console.error('拖拽窗口时出错:', err);
  }
}); 