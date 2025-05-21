// 应用顶部拖拽功能 - 使用electron原生方法
document.addEventListener('DOMContentLoaded', () => {
  console.log('拖拽区域脚本已加载!'); // 添加调试输出
  
  // 检查是否在Electron环境中运行
  const isElectron = window && typeof window.electronAPI !== 'undefined';
  
  if (!isElectron) {
    console.log('非Electron环境，拖拽功能不可用');
    return;
  }

  console.log('初始化拖拽功能');
  
  // 首先添加椭圆形拖拽区域，确保优先创建
  addEllipseDragHandle();
  
  // 方法1: 使用CSS属性实现拖拽
  addDraggableByCSS();
  
  // 方法2: 使用事件监听实现拖拽
  addDraggableByEvents();
  
  /**
   * 添加顶部中间椭圆形拖拽区域
   */
  function addEllipseDragHandle() {
    console.log('添加椭圆形拖拽区域 - 开始');
    
    // 先移除可能存在的旧元素
    const existingHandle = document.getElementById('ellipse-drag-handle');
    if (existingHandle) {
      existingHandle.remove();
      console.log('移除已存在的拖拽区域');
    }
    
    // 创建椭圆形拖拽区域
    const dragHandle = document.createElement('div');
    dragHandle.id = 'ellipse-drag-handle';
    
    // 使用更明显的样式
    const styles = {
      position: 'fixed',
      top: '6px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '120px',
      height: '10px',
      backgroundColor: 'rgba(80, 80, 80, 0.8)',
      borderRadius: '10px',
      zIndex: '10000',
      cursor: 'grab',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    };
    
    // 应用样式
    Object.keys(styles).forEach(key => {
      dragHandle.style[key] = styles[key];
    });
    
    // 添加文本说明
    dragHandle.title = "点击并拖动移动窗口";
    
    // 鼠标悬停效果
    dragHandle.addEventListener('mouseover', () => {
      dragHandle.style.backgroundColor = 'rgba(60, 60, 60, 0.9)';
      dragHandle.style.width = '160px';
      dragHandle.style.height = '12px';
      dragHandle.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.4)';
    });
    
    // 鼠标离开效果
    dragHandle.addEventListener('mouseout', () => {
      dragHandle.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
      dragHandle.style.width = '120px';
      dragHandle.style.height = '10px';
      dragHandle.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    });
    
    // 鼠标按下效果
    dragHandle.addEventListener('mousedown', (e) => {
      console.log('椭圆拖拽区域被点击，开始拖拽');
      dragHandle.style.cursor = 'grabbing';
      dragHandle.style.backgroundColor = 'rgba(40, 40, 40, 1)';
      
      // 使用合适的API触发拖拽
      if (window.electronAPI.dragWindow) {
        window.electronAPI.dragWindow();
      } else if (window.electronAPI.windowControl) {
        window.electronAPI.windowControl('drag');
      }
      
      // 防止事件冒泡
      e.stopPropagation();
    });
    
    // 鼠标抬起效果
    dragHandle.addEventListener('mouseup', () => {
      dragHandle.style.cursor = 'grab';
      dragHandle.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
    });
    
    // 根据主题应用不同样式
    const applyThemeStyles = () => {
      const isDarkTheme = document.body.classList.contains('theme-dark');
      const isGoldTheme = document.body.classList.contains('theme-gold');
      
      if (isDarkTheme) {
        dragHandle.style.backgroundColor = 'rgba(200, 200, 200, 0.8)';
      } else if (isGoldTheme) {
        dragHandle.style.backgroundColor = 'rgba(201, 164, 92, 0.8)';
      } else {
        dragHandle.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
      }
    };
    
    // 初始应用主题样式
    applyThemeStyles();
    
    // 监听主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyThemeStyles();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // 添加到DOM - 作为第一个子元素
    document.body.insertBefore(dragHandle, document.body.firstChild);
    
    // 确保元素可见性
    setTimeout(() => {
      // 检查元素是否可见
      const computedStyle = window.getComputedStyle(dragHandle);
      console.log('椭圆拖拽区域样式:', {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        width: computedStyle.width,
        height: computedStyle.height,
        backgroundColor: computedStyle.backgroundColor
      });
      
      // 如果需要，强制更新样式
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
        console.log('强制更新拖拽区域可见性');
        dragHandle.style.display = 'block';
        dragHandle.style.visibility = 'visible';
        dragHandle.style.opacity = '1';
      }
    }, 1000);
    
    console.log('椭圆形拖拽区域已添加到DOM');
  }
  
  /**
   * 使用CSS属性添加拖拽功能
   */
  function addDraggableByCSS() {
    // 查找应用头部区域
    const appHeader = document.querySelector('.app-header');
    if (appHeader) {
      // 在控制台显示我们正在设置拖拽区域
      console.log('为应用头部添加CSS拖拽属性');
      
      // 强制添加拖拽CSS属性
      appHeader.style.cssText += `-webkit-app-region: drag !important; app-region: drag !important;`;
      
      // 防止头部内的交互元素被拖拽影响
      const interactiveElements = appHeader.querySelectorAll('button, input, a, select, textarea');
      interactiveElements.forEach(element => {
        element.style.cssText += `-webkit-app-region: no-drag !important; app-region: no-drag !important;`;
      });
    }
    
    // 创建顶部拖拽区域
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 30px;
      -webkit-app-region: drag !important;
      app-region: drag !important;
      z-index: 9999;
      background-color: transparent;
      pointer-events: auto;
    `;
    document.body.appendChild(topBar);
  }
  
  /**
   * 使用事件监听实现拖拽
   */
  function addDraggableByEvents() {
    // 查找应用头部区域
    const appHeader = document.querySelector('.app-header');
    if (appHeader) {
      console.log('为应用头部添加拖拽事件监听');
      
      // 鼠标按下时开始拖拽
      appHeader.addEventListener('mousedown', (e) => {
        // 忽略交互元素上的拖拽
        if (e.target.tagName === 'BUTTON' || 
            e.target.tagName === 'INPUT' || 
            e.target.tagName === 'A' || 
            e.target.tagName === 'SELECT' || 
            e.target.tagName === 'TEXTAREA') {
          return;
        }
        
        console.log('触发拖拽事件');
        
        // 使用两种可能的API
        if (window.electronAPI.dragWindow) {
          window.electronAPI.dragWindow();
        } else if (window.electronAPI.windowControl) {
          window.electronAPI.windowControl('drag');
        }
      });
    }
    
    // 创建一个全屏宽度但很小高度的顶部拖拽区域
    const topDragArea = document.createElement('div');
    topDragArea.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 10px;
      z-index: 9999;
      background-color: transparent;
    `;
    
    topDragArea.addEventListener('mousedown', (e) => {
      console.log('顶部区域触发拖拽');
      
      // 使用两种可能的API
      if (window.electronAPI.dragWindow) {
        window.electronAPI.dragWindow();
      } else if (window.electronAPI.windowControl) {
        window.electronAPI.windowControl('drag');
      }
    });
    
    document.body.appendChild(topDragArea);
  }
}); 