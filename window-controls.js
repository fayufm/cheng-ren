// 窗口控制功能
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否在Electron环境中运行
  const isElectron = window.electronAPI !== undefined;
  
  if (!isElectron) {
    // 如果不是在Electron中运行，隐藏窗口控制按钮
    const titlebar = document.getElementById('window-titlebar');
    if (titlebar) {
      titlebar.style.display = 'none';
    }
    document.body.classList.add('non-electron');
    return;
  }
  
  // 获取窗口控制按钮元素
  const closeBtn = document.getElementById('window-close');
  const minBtn = document.getElementById('window-minimize');
  const maxBtn = document.getElementById('window-maximize');
  
  // 为按钮添加事件监听器
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.electronAPI.windowControl('close');
    });
  }
  
  if (minBtn) {
    minBtn.addEventListener('click', () => {
      window.electronAPI.windowControl('minimize');
    });
  }
  
  if (maxBtn) {
    maxBtn.addEventListener('click', () => {
      window.electronAPI.windowControl('maximize');
    });
  }
  
  // 监听窗口状态变化
  if (window.electronAPI.onWindowStateChange) {
    window.electronAPI.onWindowStateChange((state) => {
      if (maxBtn) {
        if (state === 'maximized') {
          maxBtn.classList.add('is-maximized');
          maxBtn.title = '还原';
        } else {
          maxBtn.classList.remove('is-maximized');
          maxBtn.title = '最大化';
        }
      }
    });
  }
  
  // 让整个标题栏区域可拖拽
  const titlebar = document.getElementById('window-titlebar');
  if (titlebar) {
    titlebar.addEventListener('mousedown', (e) => {
      // 防止点击按钮时开始拖拽
      if (e.target.classList.contains('window-control-btn')) {
        return;
      }
      window.electronAPI.windowControl('drag');
    });
  }
}); 