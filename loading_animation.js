document.addEventListener("DOMContentLoaded", function() {
  const style = document.createElement("style");
  style.textContent = `
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
      text-align: center;
    }
    .loading-spinner .spinner {
      width: 50px;
      height: 50px;
      margin-bottom: 15px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-left-color: #1890ff;
      animation: spinner-rotate 1s linear infinite;
    }
    .loading-spinner .text {
      font-size: 16px;
      color: #666;
      margin-top: 5px;
    }
    .loading-spinner .dots {
      display: inline-block;
    }
    .loading-spinner .dots::after {
      content: "";
      animation: dots-animation 1.5s infinite;
      display: inline-block;
      width: 20px;
      text-align: left;
    }
    @keyframes spinner-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes dots-animation {
      0%, 20% { content: "."; }
      40% { content: ".."; }
      60%, 100% { content: "..."; }
    }
  `;
  document.head.appendChild(style);
  
  // 替换原有的加载提示
  window.showLoadingAnimation = function(container, message) {
    if (!container) return;
    const lang = window.currentLanguage || "zh-CN";
    const waitText = lang === "zh-CN" ? "这可能需要一点时间，请稍候" : "This may take a moment, please wait";
    container.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="text">${message || "加载中"}<span class="dots"></span></div>
        <p style="margin-top: 15px; font-size: 14px; color: #999;">${waitText}</p>
      </div>
    `;
  };
  
  // 直接替换reportContent.innerHTML在handleFormSubmit函数中的调用
  // 等待renderer.js加载完成
  setTimeout(function() {
    // 查找reportContent对象
    const reportContent = document.querySelector('.report-content');
    if (!reportContent) return;
    
    // 修改原生的处理函数
    const originalShowReport = window.showReport;
    if (originalShowReport) {
      window.showReport = function() {
        // 调用原始的showReport函数
        originalShowReport();
        
        // 检查是否显示的是静态的加载文本，如果是则替换为动画
        const loadingDiv = reportContent.querySelector('.loading');
        if (loadingDiv) {
          const loadingText = loadingDiv.textContent;
          window.showLoadingAnimation(reportContent, loadingText);
        }
      };
    }
  }, 500);
});
