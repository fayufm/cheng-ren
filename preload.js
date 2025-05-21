const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制方法
  windowControl: (command) => {
    console.log(`[preload] 窗口控制命令: ${command}`);
    ipcRenderer.send('window-control', command);
  },
  
  // 窗口拖拽功能
  startDrag: () => {
    console.log('[preload] 开始拖拽');
    ipcRenderer.send('window-start-drag');
  },
  endDrag: () => {
    console.log('[preload] 结束拖拽');
    ipcRenderer.send('window-end-drag');
  },
  dragWindow: () => {
    console.log('[preload] 拖拽窗口');
    ipcRenderer.send('window-drag');
  },
  
  // 注册窗口状态变化监听器
  onWindowStateChange: (callback) => {
    ipcRenderer.on('window-state-change', (_, state) => callback(state));
  },
  
  // 获取当前窗口状态
  getWindowState: () => ipcRenderer.send('get-window-state'),
  
  // 让整个文档知道这是一个Electron应用
  isElectron: true
});

// 禁用右键菜单
window.addEventListener('contextmenu', (e) => {
  // 允许在输入字段和文本区域使用右键菜单
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  e.preventDefault();
}); 