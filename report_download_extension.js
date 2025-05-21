//
报告下载扩展功能

// 浏览器环境中无法使用 require，改为直接使用函数
// const { escapeXml } = require('./escape_xml');
// const { saveReport } = require('./save_report');

// 确保我们有访问escapeXml函数的方法
let escapeXml;
if (typeof window.escapeXml === 'function') {
  escapeXml = window.escapeXml;
} else {
  // 如果没有全局可用的escapeXml函数，提供一个内部实现
  escapeXml = function(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return unsafe.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
}

/**
 * 扩展报告下载功能，支持多种格式
 */
(function() {
  // 等待页面加载完成
  document.addEventListener('DOMContentLoaded', function() {
    // 更新格式提示信息
    updateFormatNotice();
    
    // 不再创建导出选项面板
    // updateExportOptions();
    
    // 下载按钮点击事件扩展
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
      console.log("覆盖原始下载按钮事件");
      
      // 完全覆盖原始点击事件处理器
      downloadBtn.onclick = async function(event) {
        console.log("下载按钮被点击，准备处理增强下载流程");
        
        // 阻止默认行为和事件传播
        event.preventDefault();
        event.stopPropagation();
        
        // 覆盖全局handleDownload函数
        if (typeof window.handleDownload === 'function') {
          console.log("覆盖全局handleDownload函数");
          const originalHandleDownload = window.handleDownload;
          window.handleDownload = async function() {
            console.log("增强的handleDownload函数被调用");
            await handleEnhancedDownload();
            return false;
          };
          
          // 调用增强的下载功能
          await handleEnhancedDownload();
          
          // 恢复原始函数
          window.handleDownload = originalHandleDownload;
        } else {
          // 直接调用增强的下载功能
          await handleEnhancedDownload();
        }
        
        return false;
      };
    }
  });
  
  /**
   * 处理增强的下载功能
   */
  async function handleEnhancedDownload() {
    // 不再创建导出选项面板
    // updateExportOptions();
    console.log("开始处理增强下载流程");
    
    // 获取当前报告数据
    const currentReportData = window.currentReportData;
    if (!currentReportData) {
      showToast('没有可下载的报告', 'warning');
      console.error("没有可下载的报告数据");
      return;
    }
    
    try {
      // 显示格式选择对话框
      console.log("显示格式选择对话框");
      const formatChoice = await showFormatSelectionDialog();
      console.log("用户选择的格式:", formatChoice);
      if (!formatChoice || formatChoice === 'cancel') {
        console.log("用户取消了格式选择");
        return; // 用户取消了选择
      }
      
      // 显示图表选择对话框
      console.log("准备显示图表选择对话框");
      const chartDays = await createTemporaryChartDialog();
      console.log("用户选择的图表天数:", chartDays);
      if (chartDays === 'cancel') {
        console.log("用户取消了图表选择");
        return;
      }
      
      // 获取选中的导出格式
      const format = formatChoice || 'pdf';
      console.log("最终选择的格式:", format, "图表天数:", chartDays);
      
      // 如果用户选择了包含折线图但格式不支持，显示警告
      if (chartDays !== 'none' && (format === 'txt' || format === 'csv' || format === 'json' || format === 'xml')) {
        const warningMessage = `${format.toUpperCase()}格式不支持包含折线图，将只导出文本内容`;
        showToast(warningMessage, 'warning', 4000);
        console.warn(warningMessage);
      }
      
      // 显示路径选择对话框，只选择保存位置，不再选择格式
      console.log("准备显示保存路径对话框");
      const savePathOptions = await showSavePathDialog(format, true); // 传递true表示仅选择位置
      console.log("保存路径选择结果:", savePathOptions);
      if (savePathOptions === 'cancel') {
        console.log("用户取消了保存路径选择");
        return; // 用户取消了保存
      }
      
      // 根据格式准备内容
      console.log("开始准备报告内容");
      let content;
      switch (format) {
        case 'txt':
          content = currentReportData.report.replace(/#{1,6} /g, '').replace(/\*\*/g, '');
          break;
        case 'md':
          content = currentReportData.report;
          break;
        case 'json':
          // 将报告数据转换为JSON格式
          content = JSON.stringify({
            report: currentReportData.report,
            formData: currentReportData.formData,
            generatedAt: currentReportData.generatedAt,
            metadata: {
              generated_by: "Health Manager System",
              version: "1.0"
            }
          }, null, 2);
          break;
        case 'csv':
          // 创建CSV格式
          content = convertToCSV(currentReportData);
          break;
        case 'xml':
          // 创建XML格式
          content = convertToXML(currentReportData);
          break;
        case 'html':
          content = createHtmlReport(currentReportData, chartDays);
          break;
        case 'docx':
        case 'xlsx':
        case 'rtf':
        case 'png':
        case 'jpg':
          // 这些格式需要特殊处理
          content = {
            report: currentReportData.report,
            formData: currentReportData.formData,
            generatedAt: currentReportData.generatedAt,
            htmlContent: currentReportData.htmlContent,
            includeChart: chartDays !== 'none',
            chartDays: chartDays !== 'none' ? parseInt(chartDays) : 0
          };
          break;
        default: // pdf
          content = {
            report: currentReportData.report,
            htmlContent: currentReportData.htmlContent,
            includeChart: chartDays !== 'none',
            chartDays: chartDays !== 'none' ? parseInt(chartDays) : 0
          };
          break;
      }
      
      // 合并保存路径和格式选项
      const saveOptions = {
        content,
        format: format, // 使用之前选择的格式
        includeChart: chartDays !== 'none',
        chartDays: chartDays !== 'none' ? parseInt(chartDays) : 0,
        savePath: savePathOptions.path || '',
        filename: savePathOptions.filename || ''
      };
      
      console.log("准备保存报告，选项:", {
        format: saveOptions.format,
        includeChart: saveOptions.includeChart,
        chartDays: saveOptions.chartDays,
        savePath: saveOptions.savePath,
        filename: saveOptions.filename
      });
      
      // 保存报告
      const result = await saveReport(saveOptions);
      console.log("保存报告结果:", result);
      
      if (result.success) {
        showToast(result.message || '报告保存成功', 'success');
      } else {
        showToast(`保存失败: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error("下载过程中发生错误:", error);
      showToast(`保存报告出错: ${error.message}`, 'error');
    }
  }
  
  /**
   * 创建临时图表选择对话框
   * @returns {Promise<string>} 选择的图表天数或'cancel'
   */
  async function createTemporaryChartDialog() {
    console.log("创建临时图表选择对话框");
    
    // 创建对话框遮罩
    const overlay = document.createElement('div');
    overlay.id = 'chartDialogOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999'; // 确保高于其他所有元素
    
    // 创建对话框容器
    const dialog = document.createElement('div');
    dialog.id = 'chartSelectionDialog';
    dialog.className = 'chart-selection-dialog';
    dialog.style.backgroundColor = '#fff';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dialog.style.width = '450px';
    dialog.style.maxWidth = '90%';
    dialog.style.padding = '20px';
    dialog.style.position = 'relative';
    
    // 创建对话框标题
    const title = document.createElement('h3');
    title.textContent = '选择图表选项';
    title.style.margin = '0 0 20px 0';
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeChartDialogBtn';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '15px';
    closeBtn.style.top = '10px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    
    // 创建选项容器
    const optionsContainer = document.createElement('div');
    optionsContainer.style.marginBottom = '20px';
    
    // 添加选项
    const options = [
      { value: 'none', label: '不包含折线图' },
      { value: '7', label: '包含最近7天的折线图' },
      { value: '30', label: '包含最近30天的折线图' },
      { value: '90', label: '包含最近90天的折线图' }
    ];
    
    options.forEach((option, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.style.marginBottom = '10px';
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'chartOption';
      radio.id = `chart_option_${option.value}`;
      radio.value = option.value;
      radio.checked = index === 0; // 默认选中第一个
      
      const label = document.createElement('label');
      label.htmlFor = `chart_option_${option.value}`;
      label.textContent = option.label;
      label.style.marginLeft = '8px';
      
      optionDiv.appendChild(radio);
      optionDiv.appendChild(label);
      optionsContainer.appendChild(optionDiv);
    });
    
    // 创建格式提示
    const formatNotice = document.createElement('p');
    formatNotice.className = 'format-notice';
    formatNotice.textContent = '注意：纯文本(TXT)、CSV、XML和JSON格式不支持包含折线图，其他格式如PDF、DOCX和HTML等都支持。';
    formatNotice.style.fontSize = '12px';
    formatNotice.style.color = '#888';
    formatNotice.style.marginBottom = '20px';
    
    // 创建按钮容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'flex-end';
    buttonsContainer.style.gap = '10px';
    
    // 创建取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'chartCancelBtn';
    cancelBtn.textContent = '取消';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.style.padding = '8px 15px';
    
    // 创建继续按钮
    const continueBtn = document.createElement('button');
    continueBtn.id = 'chartContinueBtn';
    continueBtn.textContent = '继续';
    continueBtn.className = 'btn btn-primary';
    continueBtn.style.padding = '8px 15px';
    continueBtn.style.backgroundColor = '#1890ff';
    continueBtn.style.color = '#fff';
    continueBtn.style.border = 'none';
    
    // 添加按钮到容器
    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(continueBtn);
    
    // 组装对话框
    dialog.appendChild(closeBtn);
    dialog.appendChild(title);
    dialog.appendChild(optionsContainer);
    dialog.appendChild(formatNotice);
    dialog.appendChild(buttonsContainer);
    
    // 添加到页面
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    console.log("临时图表选择对话框创建完成");
    
    // 返回一个Promise，等待用户选择
    return new Promise(resolve => {
      // 关闭按钮事件
      closeBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve('cancel');
      };
      
      // 取消按钮事件
      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve('cancel');
      };
      
      // 继续按钮事件
      continueBtn.onclick = () => {
        const selectedOption = dialog.querySelector('input[name="chartOption"]:checked');
        document.body.removeChild(overlay);
        resolve(selectedOption ? selectedOption.value : 'none');
      };
    });
  }
  
  /**
   * 显示消息提示
   * @param {string} message - 提示消息
   * @param {string} type - 提示类型
   * @param {number} duration - 显示时长
   */
  function showToast(message, type = 'info', duration = 3000) {
    // 使用window.showToast如果存在
    if (typeof window.showToast === 'function') {
      window.showToast(message, type, duration);
    } else {
      alert(message);
    }
  }
  
  /**
   * 将报告数据转换为CSV格式
   * @param {Object} reportData - 报告数据
   * @returns {string} CSV内容
   */
  function convertToCSV(reportData) {
    let csvContent = "字段,值\n";
    const formData = reportData.formData || {};
    
    for (const key in formData) {
      // 处理数组类型的数据（如过敏源）
      if (Array.isArray(formData[key])) {
        csvContent += `"${key}","${formData[key].join(', ')}"\n`;
      } else {
        csvContent += `"${key}","${formData[key]}"\n`;
      }
    }
    
    // 添加报告摘要
    csvContent += `\n"报告摘要","${reportData.report.substring(0, 100).replace(/\n/g, ' ')}..."\n`;
    csvContent += `"生成时间","${new Date(reportData.generatedAt).toLocaleString()}"\n`;
    
    return csvContent;
  }
  
  /**
   * 将报告数据转换为XML格式
   * @param {Object} reportData - 报告数据
   * @returns {string} XML内容
   */
  function convertToXML(reportData) {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<HealthReport>\n';
    
    // 添加表单数据
    xmlContent += '  <FormData>\n';
    const formData = reportData.formData || {};
    
    for (const key in formData) {
      if (Array.isArray(formData[key])) {
        xmlContent += `    <${key}>\n`;
        formData[key].forEach(item => {
          xmlContent += `      <item>${escapeXml(item)}</item>\n`;
        });
        xmlContent += `    </${key}>\n`;
      } else {
        xmlContent += `    <${key}>${escapeXml(formData[key])}</${key}>\n`;
      }
    }
    xmlContent += '  </FormData>\n';
    
    // 添加报告内容
    xmlContent += '  <ReportContent><![CDATA[\n';
    xmlContent += reportData.report;
    xmlContent += '\n  ]]></ReportContent>\n';
    
    // 添加元数据
    xmlContent += '  <Metadata>\n';
    xmlContent += `    <GeneratedAt>${new Date(reportData.generatedAt).toISOString()}</GeneratedAt>\n`;
    xmlContent += '    <Generator>Health Manager System</Generator>\n';
    xmlContent += '    <Version>1.0</Version>\n';
    xmlContent += '  </Metadata>\n';
    
    xmlContent += '</HealthReport>';
    return xmlContent;
  }
  
  /**
   * 创建HTML格式报告
   * @param {Object} reportData - 报告数据
   * @param {string} chartDays - 图表天数
   * @returns {string} HTML内容
   */
  function createHtmlReport(reportData, chartDays) {
    const currentLanguage = window.currentLanguage || 'zh-CN';
    
    let content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${currentLanguage === 'zh-CN' ? '健康报告' : 'Health Report'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1890ff; }
    h2 { color: #333; margin-top: 20px; }
    p { line-height: 1.6; }
    .chart-section { margin-top: 30px; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
  </style>
</head>
<body>
  ${reportData.htmlContent || ''}`;
    
    // 如果选择包含折线图且是HTML格式
    if (chartDays !== 'none') {
      content += `
<div class="chart-section">
  <h2>${currentLanguage === 'zh-CN' ? '健康趋势图' : 'Health Trend Chart'}</h2>
  <p>${currentLanguage === 'zh-CN' ? `显示最近${chartDays}天的健康数据趋势` : 
       `Showing health data trends for the last ${chartDays} days`}</p>
  <div class="chart-container">
    <p style="text-align:center; color:#888;">
      ${currentLanguage === 'zh-CN' ? '图表将在下一版本中实现' : 'Chart will be implemented in the next version'}
    </p>
  </div>
</div>`;
    }
    
    content += `
  <footer>
    <p>${currentLanguage === 'zh-CN' ? '生成时间' : 'Generated at'}: ${new Date(reportData.generatedAt).toLocaleString()}</p>
    <p>${currentLanguage === 'zh-CN' ? '由秤人健康系统生成' : 'Generated by Health Manager System'}</p>
  </footer>
</body>
</html>`;
    
    return content;
  }
  
  /**
   * 更新格式提示信息
   */
  function updateFormatNotice() {
    const formatNotice = document.querySelector('.chart-selection-dialog .format-notice');
    if (formatNotice) {
      formatNotice.textContent = '注意：纯文本(TXT)、CSV、XML和JSON格式不支持包含折线图，其他格式如PDF、DOCX和HTML等都支持。';
    }
  }
  
  /**
   * 显示格式选择对话框
   * @returns {Promise<string>} 选择的格式或'cancel'
   */
  async function showFormatSelectionDialog() {
    // 定义所有支持的格式
    const supportedFormats = [
      { id: 'formatPDF', value: 'pdf', label: 'PDF' },
      { id: 'formatDOCX', value: 'docx', label: 'Word文档(DOCX)' },
      { id: 'formatHTML', value: 'html', label: 'HTML' },
      { id: 'formatMarkdown', value: 'md', label: 'Markdown' },
      { id: 'formatText', value: 'txt', label: '纯文本(TXT)' },
      { id: 'formatJSON', value: 'json', label: 'JSON' },
      { id: 'formatCSV', value: 'csv', label: 'CSV表格' },
      { id: 'formatXLSX', value: 'xlsx', label: 'Excel表格(XLSX)' },
      { id: 'formatPNG', value: 'png', label: 'PNG图片' },
      { id: 'formatJPG', value: 'jpg', label: 'JPG图片' },
      { id: 'formatRTF', value: 'rtf', label: '富文本格式(RTF)' },
      { id: 'formatXML', value: 'xml', label: 'XML' }
    ];
    
    // 创建对话框
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    
    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box';
    dialogBox.style.width = '400px';
    dialogBox.style.maxWidth = '90%';
    
    const dialogHeader = document.createElement('div');
    dialogHeader.style.display = 'flex';
    dialogHeader.style.justifyContent = 'space-between';
    dialogHeader.style.alignItems = 'center';
    dialogHeader.style.padding = '15px 20px';
    dialogHeader.style.borderBottom = '1px solid #eee';
    
    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = '选择保存格式';
    dialogTitle.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'close-btn';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    
    dialogHeader.appendChild(dialogTitle);
    dialogHeader.appendChild(closeBtn);
    
    const dialogContent = document.createElement('div');
    dialogContent.style.padding = '20px';
    dialogContent.style.maxHeight = '60vh';
    dialogContent.style.overflowY = 'auto';
    
    // 添加格式选项
    supportedFormats.forEach((format, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.style.marginBottom = '12px';
      optionDiv.style.display = 'flex';
      optionDiv.style.alignItems = 'center';
      
      const input = document.createElement('input');
      input.type = 'radio';
      input.id = 'select_' + format.id;
      input.name = 'selectFormatOption';
      input.value = format.value;
      input.style.marginRight = '10px';
      if (index === 0) input.checked = true; // 默认选中第一个
      
      const label = document.createElement('label');
      label.htmlFor = 'select_' + format.id;
      label.textContent = format.label;
      
      // 添加格式图标或预览
      const formatIcon = document.createElement('span');
      formatIcon.style.display = 'inline-block';
      formatIcon.style.width = '20px';
      formatIcon.style.height = '20px';
      formatIcon.style.marginRight = '8px';
      formatIcon.style.borderRadius = '2px';
      formatIcon.style.border = '1px solid #ddd';
      formatIcon.style.backgroundColor = '#f8f8f8';
      formatIcon.style.textAlign = 'center';
      formatIcon.style.lineHeight = '18px';
      formatIcon.style.fontSize = '10px';
      formatIcon.style.fontWeight = 'bold';
      formatIcon.style.color = '#666';
      
      switch (format.value) {
        case 'pdf':
          formatIcon.textContent = 'PDF';
          formatIcon.style.backgroundColor = '#f44336';
          formatIcon.style.color = '#fff';
          break;
        case 'docx':
          formatIcon.textContent = 'W';
          formatIcon.style.backgroundColor = '#2b579a';
          formatIcon.style.color = '#fff';
          break;
        case 'html':
          formatIcon.textContent = '</>';
          formatIcon.style.backgroundColor = '#e34c26';
          formatIcon.style.color = '#fff';
          break;
        case 'md':
          formatIcon.textContent = 'MD';
          formatIcon.style.backgroundColor = '#2962ff';
          formatIcon.style.color = '#fff';
          break;
        case 'txt':
          formatIcon.textContent = 'TXT';
          formatIcon.style.backgroundColor = '#9e9e9e';
          formatIcon.style.color = '#fff';
          break;
        case 'json':
          formatIcon.textContent = '{}'
          formatIcon.style.backgroundColor = '#ffc107';
          formatIcon.style.color = '#000';
          break;
        case 'csv':
          formatIcon.textContent = 'CSV';
          formatIcon.style.backgroundColor = '#4caf50';
          formatIcon.style.color = '#fff';
          break;
        case 'xlsx':
          formatIcon.textContent = 'X';
          formatIcon.style.backgroundColor = '#217346';
          formatIcon.style.color = '#fff';
          break;
        case 'png':
        case 'jpg':
          formatIcon.textContent = 'IMG';
          formatIcon.style.backgroundColor = '#512da8';
          formatIcon.style.color = '#fff';
          break;
        case 'rtf':
          formatIcon.textContent = 'RTF';
          formatIcon.style.backgroundColor = '#795548';
          formatIcon.style.color = '#fff';
          break;
        case 'xml':
          formatIcon.textContent = 'XML';
          formatIcon.style.backgroundColor = '#0277bd';
          formatIcon.style.color = '#fff';
          break;
      }
      
      const formatDescription = document.createElement('div');
      formatDescription.style.fontSize = '12px';
      formatDescription.style.color = '#888';
      formatDescription.style.marginTop = '3px';
      formatDescription.style.marginLeft = '30px';
      
      switch (format.value) {
        case 'pdf':
          formatDescription.textContent = '可打印，保留精确布局';
          break;
        case 'docx':
          formatDescription.textContent = '可在Word中编辑的文档';
          break;
        case 'html':
          formatDescription.textContent = '网页格式，支持图表';
          break;
        case 'md':
          formatDescription.textContent = 'Markdown格式，适合再编辑';
          break;
        case 'txt':
          formatDescription.textContent = '纯文本格式，简洁无格式';
          break;
        case 'json':
          formatDescription.textContent = '结构化数据，适合程序处理';
          break;
        case 'csv':
          formatDescription.textContent = '表格数据，可在Excel打开';
          break;
        case 'xlsx':
          formatDescription.textContent = 'Excel电子表格，适合数据分析';
          break;
        case 'png':
          formatDescription.textContent = '高质量图片格式，支持透明';
          break;
        case 'jpg':
          formatDescription.textContent = '压缩的图片格式，体积小';
          break;
        case 'rtf':
          formatDescription.textContent = '富文本格式，兼容大多数编辑器';
          break;
        case 'xml':
          formatDescription.textContent = '可扩展标记语言，结构化数据';
          break;
      }
      
      const formatWrapper = document.createElement('div');
      formatWrapper.style.display = 'flex';
      formatWrapper.style.alignItems = 'center';
      
      formatWrapper.appendChild(formatIcon);
      formatWrapper.appendChild(label);
      
      optionDiv.appendChild(input);
      optionDiv.appendChild(formatWrapper);
      dialogContent.appendChild(optionDiv);
      dialogContent.appendChild(formatDescription);
    });
    
    const dialogFooter = document.createElement('div');
    dialogFooter.style.display = 'flex';
    dialogFooter.style.justifyContent = 'flex-end';
    dialogFooter.style.padding = '15px 20px';
    dialogFooter.style.borderTop = '1px solid #eee';
    dialogFooter.style.gap = '10px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.className = 'btn btn-secondary';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确定';
    confirmBtn.className = 'btn btn-primary';
    
    dialogFooter.appendChild(cancelBtn);
    dialogFooter.appendChild(confirmBtn);
    
    dialogBox.appendChild(dialogHeader);
    dialogBox.appendChild(dialogContent);
    dialogBox.appendChild(dialogFooter);
    
    dialogOverlay.appendChild(dialogBox);
    document.body.appendChild(dialogOverlay);
    
    // 应用主题样式
    const isDarkTheme = document.body.classList.contains('theme-dark');
    const isGoldTheme = document.body.classList.contains('theme-gold');
    
    if (isDarkTheme) {
      dialogBox.style.backgroundColor = '#1f1f1f';
      dialogBox.style.color = '#e0e0e0';
      dialogHeader.style.borderBottomColor = '#444';
      dialogFooter.style.borderTopColor = '#444';
    } else if (isGoldTheme) {
      dialogBox.style.backgroundColor = '#faf5e6';
      dialogBox.style.color = '#5a4a2f';
      dialogHeader.style.borderBottomColor = '#e6d7b0';
      dialogFooter.style.borderTopColor = '#e6d7b0';
    }
    
    // 返回Promise
    return new Promise(resolve => {
      // 关闭按钮事件
      closeBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
        resolve('cancel');
      };
      
      // 取消按钮事件
      cancelBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
        resolve('cancel');
      };
      
      // 确认按钮事件
      confirmBtn.onclick = () => {
        const selectedOption = dialogContent.querySelector('input[name="selectFormatOption"]:checked');
        document.body.removeChild(dialogOverlay);
        
        if (selectedOption) {
          // 同步选中状态到原始导出面板
          const exportFormatRadio = document.querySelector(`input[name="exportFormat"][value="${selectedOption.value}"]`);
          if (exportFormatRadio) {
            exportFormatRadio.checked = true;
          }
          
          resolve(selectedOption.value);
        } else {
          resolve('pdf'); // 默认PDF
        }
      };
    });
  }
  
  /**
   * 显示保存路径选择对话框
   * @param {string} initialFormat - 初始选择的格式
   * @param {boolean} [locationOnly=false] - 是否仅选择位置（不显示格式选择）
   * @returns {Promise<Object|string>} 保存选项或'cancel'
   */
  async function showSavePathDialog(initialFormat, locationOnly = false) {
    // 创建对话框
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    dialogOverlay.style.position = 'fixed';
    dialogOverlay.style.top = '0';
    dialogOverlay.style.left = '0';
    dialogOverlay.style.width = '100%';
    dialogOverlay.style.height = '100%';
    dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialogOverlay.style.display = 'flex';
    dialogOverlay.style.justifyContent = 'center';
    dialogOverlay.style.alignItems = 'center';
    dialogOverlay.style.zIndex = '10000'; // 确保最高层级
    
    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box save-path-dialog';
    dialogBox.style.width = '500px';
    dialogBox.style.maxWidth = '90%';
    dialogBox.style.backgroundColor = '#fff';
    dialogBox.style.borderRadius = '8px';
    dialogBox.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dialogBox.style.overflow = 'hidden';
    
    const dialogHeader = document.createElement('div');
    dialogHeader.style.display = 'flex';
    dialogHeader.style.justifyContent = 'space-between';
    dialogHeader.style.alignItems = 'center';
    dialogHeader.style.padding = '15px 20px';
    dialogHeader.style.borderBottom = '1px solid #eee';
    
    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = '选择保存位置';
    dialogTitle.style.margin = '0';
    dialogTitle.style.fontSize = '18px';
    dialogTitle.style.color = '#333';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'close-btn';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#888';
    
    dialogHeader.appendChild(dialogTitle);
    dialogHeader.appendChild(closeBtn);
    
    const dialogContent = document.createElement('div');
    dialogContent.style.padding = '20px';
    
    // 文件名输入框
    const filenameGroup = document.createElement('div');
    filenameGroup.style.marginBottom = '20px';
    
    const filenameLabel = document.createElement('label');
    filenameLabel.htmlFor = 'filename-input';
    filenameLabel.textContent = '文件名：';
    filenameLabel.style.display = 'block';
    filenameLabel.style.marginBottom = '8px';
    filenameLabel.style.fontWeight = 'bold';
    
    const filenameInput = document.createElement('input');
    filenameInput.type = 'text';
    filenameInput.id = 'filename-input';
    filenameInput.value = `健康报告_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    filenameInput.style.width = '100%';
    filenameInput.style.padding = '10px';
    filenameInput.style.borderRadius = '4px';
    filenameInput.style.border = '1px solid #ddd';
    filenameInput.style.boxSizing = 'border-box';
    
    filenameGroup.appendChild(filenameLabel);
    filenameGroup.appendChild(filenameInput);
    
    // 保存路径选择框
    const pathGroup = document.createElement('div');
    pathGroup.style.marginBottom = '20px';
    
    const pathLabel = document.createElement('label');
    pathLabel.htmlFor = 'path-input';
    pathLabel.textContent = '保存位置：';
    pathLabel.style.display = 'block';
    pathLabel.style.marginBottom = '8px';
    pathLabel.style.fontWeight = 'bold';
    
    const pathInputGroup = document.createElement('div');
    pathInputGroup.style.display = 'flex';
    pathInputGroup.style.gap = '10px';
    
    const pathInput = document.createElement('input');
    pathInput.type = 'text';
    pathInput.id = 'path-input';
    pathInput.placeholder = '选择保存位置...';
    pathInput.readOnly = true;
    pathInput.style.flex = '1';
    pathInput.style.padding = '10px';
    pathInput.style.borderRadius = '4px';
    pathInput.style.border = '1px solid #ddd';
    pathInput.style.backgroundColor = '#f9f9f9';
    
    const browseBtnIcon = document.createElement('span');
    browseBtnIcon.innerHTML = '&#128193;'; // 文件夹图标
    browseBtnIcon.style.marginRight = '5px';
    
    const browseBtn = document.createElement('button');
    browseBtn.className = 'btn btn-secondary';
    browseBtn.style.padding = '8px 15px';
    browseBtn.style.backgroundColor = '#f0f0f0';
    browseBtn.style.border = '1px solid #ddd';
    browseBtn.style.borderRadius = '4px';
    browseBtn.style.cursor = 'pointer';
    browseBtn.appendChild(browseBtnIcon);
    browseBtn.appendChild(document.createTextNode('浏览...'));
    
    pathInputGroup.appendChild(pathInput);
    pathInputGroup.appendChild(browseBtn);
    
    pathGroup.appendChild(pathLabel);
    pathGroup.appendChild(pathInputGroup);
    
    // 格式选择 - 仅在非仅位置模式时显示
    let formatSelect = null;
    if (!locationOnly) {
      const formatGroup = document.createElement('div');
      formatGroup.style.marginBottom = '20px';
      
      const formatLabel = document.createElement('label');
      formatLabel.htmlFor = 'format-select';
      formatLabel.textContent = '保存类型：';
      formatLabel.style.display = 'block';
      formatLabel.style.marginBottom = '8px';
      formatLabel.style.fontWeight = 'bold';
      
      formatSelect = document.createElement('select');
      formatSelect.id = 'format-select';
      formatSelect.style.width = '100%';
      formatSelect.style.padding = '10px';
      formatSelect.style.borderRadius = '4px';
      formatSelect.style.border = '1px solid #ddd';
      
      // 添加所有支持的格式
      const supportedFormats = [
        { value: 'pdf', label: 'PDF文档 (*.pdf)' },
        { value: 'docx', label: 'Word文档 (*.docx)' },
        { value: 'html', label: 'HTML网页 (*.html)' },
        { value: 'md', label: 'Markdown文档 (*.md)' },
        { value: 'txt', label: '纯文本文档 (*.txt)' },
        { value: 'json', label: 'JSON数据 (*.json)' },
        { value: 'csv', label: 'CSV表格 (*.csv)' },
        { value: 'xlsx', label: 'Excel表格 (*.xlsx)' },
        { value: 'png', label: 'PNG图片 (*.png)' },
        { value: 'jpg', label: 'JPG图片 (*.jpg)' },
        { value: 'rtf', label: '富文本格式 (*.rtf)' },
        { value: 'xml', label: 'XML数据 (*.xml)' }
      ];
      
      supportedFormats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.label;
        if (format.value === initialFormat) {
          option.selected = true;
        }
        formatSelect.appendChild(option);
      });
      
      formatGroup.appendChild(formatLabel);
      formatGroup.appendChild(formatSelect);
      
      dialogContent.appendChild(formatGroup);
      
      // 添加一个注释说明
      const noteText = document.createElement('p');
      noteText.style.fontSize = '12px';
      noteText.style.color = '#888';
      noteText.style.marginTop = '5px';
      noteText.textContent = '注意：选择不同的保存类型时，可能需要不同的软件才能打开该文件。';
      dialogContent.appendChild(noteText);
    } else {
      // 在仅位置模式下，显示所选格式但不允许修改
      const formatInfoGroup = document.createElement('div');
      formatInfoGroup.style.marginBottom = '20px';
      
      const formatInfoLabel = document.createElement('label');
      formatInfoLabel.textContent = '文件格式：';
      formatInfoLabel.style.display = 'block';
      formatInfoLabel.style.marginBottom = '8px';
      formatInfoLabel.style.fontWeight = 'bold';
      
      const formatInfo = document.createElement('div');
      formatInfo.style.padding = '10px';
      formatInfo.style.backgroundColor = '#f9f9f9';
      formatInfo.style.borderRadius = '4px';
      formatInfo.style.border = '1px solid #ddd';
      
      // 获取格式显示名称
      let formatDisplayName = initialFormat.toUpperCase();
      switch (initialFormat) {
        case 'pdf': formatDisplayName = 'PDF 文档'; break;
        case 'docx': formatDisplayName = 'Word 文档 (DOCX)'; break;
        case 'html': formatDisplayName = 'HTML 网页'; break;
        case 'md': formatDisplayName = 'Markdown 文档'; break;
        case 'txt': formatDisplayName = '纯文本文档 (TXT)'; break;
        case 'json': formatDisplayName = 'JSON 数据'; break;
        case 'csv': formatDisplayName = 'CSV 表格'; break;
        case 'xlsx': formatDisplayName = 'Excel 表格 (XLSX)'; break;
        case 'png': formatDisplayName = 'PNG 图片'; break;
        case 'jpg': formatDisplayName = 'JPG 图片'; break;
        case 'rtf': formatDisplayName = '富文本格式 (RTF)'; break;
        case 'xml': formatDisplayName = 'XML 数据'; break;
      }
      
      formatInfo.textContent = formatDisplayName;
      
      formatInfoGroup.appendChild(formatInfoLabel);
      formatInfoGroup.appendChild(formatInfo);
      
      dialogContent.appendChild(formatInfoGroup);
    }
    
    dialogContent.appendChild(filenameGroup);
    dialogContent.appendChild(pathGroup);
    
    // 对话框底部按钮
    const dialogFooter = document.createElement('div');
    dialogFooter.style.display = 'flex';
    dialogFooter.style.justifyContent = 'flex-end';
    dialogFooter.style.padding = '15px 20px';
    dialogFooter.style.borderTop = '1px solid #eee';
    dialogFooter.style.gap = '10px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.style.padding = '8px 15px';
    cancelBtn.style.backgroundColor = '#f0f0f0';
    cancelBtn.style.border = '1px solid #ddd';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '导出';  // 改为"导出"而不是"保存"
    saveBtn.className = 'btn btn-primary';
    saveBtn.style.padding = '8px 20px';
    saveBtn.style.backgroundColor = '#1890ff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = '1px solid #1890ff';
    saveBtn.style.borderRadius = '4px';
    saveBtn.style.cursor = 'pointer';
    
    dialogFooter.appendChild(cancelBtn);
    dialogFooter.appendChild(saveBtn);
    
    dialogBox.appendChild(dialogHeader);
    dialogBox.appendChild(dialogContent);
    dialogBox.appendChild(dialogFooter);
    
    dialogOverlay.appendChild(dialogBox);
    document.body.appendChild(dialogOverlay);
    
    // 应用主题样式
    const isDarkTheme = document.body.classList.contains('theme-dark');
    const isGoldTheme = document.body.classList.contains('theme-gold');
    
    if (isDarkTheme) {
      dialogBox.style.backgroundColor = '#1f1f1f';
      dialogBox.style.color = '#e0e0e0';
      dialogHeader.style.borderBottomColor = '#444';
      dialogFooter.style.borderTopColor = '#444';
      filenameInput.style.backgroundColor = '#333';
      filenameInput.style.color = '#e0e0e0';
      filenameInput.style.borderColor = '#555';
      pathInput.style.backgroundColor = '#333';
      pathInput.style.color = '#e0e0e0';
      pathInput.style.borderColor = '#555';
      if (formatSelect) {
        formatSelect.style.backgroundColor = '#333';
        formatSelect.style.color = '#e0e0e0';
        formatSelect.style.borderColor = '#555';
      }
      browseBtn.style.backgroundColor = '#444';
      browseBtn.style.color = '#e0e0e0';
      browseBtn.style.borderColor = '#555';
      cancelBtn.style.backgroundColor = '#444';
      cancelBtn.style.color = '#e0e0e0';
      cancelBtn.style.borderColor = '#555';
    } else if (isGoldTheme) {
      dialogBox.style.backgroundColor = '#faf5e6';
      dialogBox.style.color = '#5a4a2f';
      dialogHeader.style.borderBottomColor = '#e6d7b0';
      dialogFooter.style.borderTopColor = '#e6d7b0';
      filenameInput.style.backgroundColor = '#fff';
      filenameInput.style.color = '#5a4a2f';
      filenameInput.style.borderColor = '#e6d7b0';
      pathInput.style.backgroundColor = '#fff';
      pathInput.style.color = '#5a4a2f';
      pathInput.style.borderColor = '#e6d7b0';
      if (formatSelect) {
        formatSelect.style.backgroundColor = '#fff';
        formatSelect.style.color = '#5a4a2f';
        formatSelect.style.borderColor = '#e6d7b0';
      }
      browseBtn.style.backgroundColor = '#f5e9cc';
      browseBtn.style.color = '#5a4a2f';
      browseBtn.style.borderColor = '#e6d7b0';
      cancelBtn.style.backgroundColor = '#f5e9cc';
      cancelBtn.style.color = '#5a4a2f';
      cancelBtn.style.borderColor = '#e6d7b0';
      saveBtn.style.backgroundColor = '#d4b06c';
      saveBtn.style.borderColor = '#c4a05c';
    }
    
    // 初始设置文件扩展名
    if (!filenameInput.value.includes('.')) {
      filenameInput.value += `.${initialFormat}`;
    }
    
    // 添加确保文件扩展名匹配格式的函数
    function ensureCorrectExtension(filename, format) {
      if (!filename) return `健康报告.${format}`;
      
      // 提取基本文件名和当前扩展名
      const parts = filename.split('.');
      const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
      const baseName = parts.join('.');
      
      // 如果没有扩展名或扩展名与格式不匹配，添加正确的扩展名
      if (!extension || extension !== format) {
        return `${baseName}.${format}`;
      }
      
      return filename;
    }
    
    // 在格式变化时更新文件名扩展名
    if (formatSelect) {
      formatSelect.addEventListener('change', function() {
        const selectedFormat = this.value;
        const currentName = filenameInput.value.split('.')[0] || filenameInput.value;
        filenameInput.value = `${currentName}.${selectedFormat}`;
      });
    }
    
    // 浏览按钮点击事件
    browseBtn.addEventListener('click', function() {
      // 模拟选择文件夹
      // 在实际应用中，这里应该调用文件系统API或Electron的dialog.showSaveDialog
      // 这里只是模拟效果
      const defaultPaths = [
        '我的文档',
        '桌面',
        '下载'
      ];
      
      const simulatePathSelection = async () => {
        // 创建临时对话框
        const folderDialogOverlay = document.createElement('div');
        folderDialogOverlay.style.position = 'fixed';
        folderDialogOverlay.style.top = '0';
        folderDialogOverlay.style.left = '0';
        folderDialogOverlay.style.width = '100%';
        folderDialogOverlay.style.height = '100%';
        folderDialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        folderDialogOverlay.style.zIndex = '10001'; // 确保高于保存路径对话框
        folderDialogOverlay.style.display = 'flex';
        folderDialogOverlay.style.justifyContent = 'center';
        folderDialogOverlay.style.alignItems = 'center';
        
        const folderDialog = document.createElement('div');
        folderDialog.style.backgroundColor = isDarkTheme ? '#1f1f1f' : isGoldTheme ? '#faf5e6' : '#fff';
        folderDialog.style.padding = '20px';
        folderDialog.style.borderRadius = '4px';
        folderDialog.style.width = '350px';
        folderDialog.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        
        const folderTitle = document.createElement('h4');
        folderTitle.textContent = '选择文件夹';
        folderTitle.style.margin = '0 0 15px 0';
        folderTitle.style.color = isDarkTheme ? '#e0e0e0' : isGoldTheme ? '#5a4a2f' : '#333';
        
        const folderList = document.createElement('div');
        folderList.style.maxHeight = '200px';
        folderList.style.overflowY = 'auto';
        folderList.style.border = isDarkTheme ? '1px solid #444' : isGoldTheme ? '1px solid #e6d7b0' : '1px solid #ddd';
        folderList.style.borderRadius = '4px';
        folderList.style.marginBottom = '15px';
        
        defaultPaths.forEach(path => {
          const pathItem = document.createElement('div');
          pathItem.textContent = path;
          pathItem.style.padding = '10px 15px';
          pathItem.style.borderBottom = isDarkTheme ? '1px solid #444' : isGoldTheme ? '1px solid #e6d7b0' : '1px solid #eee';
          pathItem.style.cursor = 'pointer';
          pathItem.style.color = isDarkTheme ? '#e0e0e0' : isGoldTheme ? '#5a4a2f' : '#333';
          
          pathItem.addEventListener('mouseover', function() {
            this.style.backgroundColor = isDarkTheme ? '#333' : isGoldTheme ? '#f5e9cc' : '#f5f5f5';
          });
          
          pathItem.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
          });
          
          pathItem.addEventListener('click', function() {
            document.body.removeChild(folderDialogOverlay);
            pathInput.value = `C:\\Users\\用户\\${this.textContent}`;
          });
          
          folderList.appendChild(pathItem);
        });
        
        const folderBtns = document.createElement('div');
        folderBtns.style.display = 'flex';
        folderBtns.style.justifyContent = 'flex-end';
        folderBtns.style.gap = '10px';
        
        const cancelFolderBtn = document.createElement('button');
        cancelFolderBtn.textContent = '取消';
        cancelFolderBtn.style.padding = '8px 15px';
        cancelFolderBtn.style.backgroundColor = isDarkTheme ? '#444' : isGoldTheme ? '#f5e9cc' : '#f0f0f0';
        cancelFolderBtn.style.color = isDarkTheme ? '#e0e0e0' : isGoldTheme ? '#5a4a2f' : '#333';
        cancelFolderBtn.style.border = isDarkTheme ? '1px solid #555' : isGoldTheme ? '1px solid #e6d7b0' : '1px solid #ddd';
        cancelFolderBtn.style.borderRadius = '4px';
        cancelFolderBtn.style.cursor = 'pointer';
        
        cancelFolderBtn.addEventListener('click', function() {
          document.body.removeChild(folderDialogOverlay);
        });
        
        folderBtns.appendChild(cancelFolderBtn);
        
        folderDialog.appendChild(folderTitle);
        folderDialog.appendChild(folderList);
        folderDialog.appendChild(folderBtns);
        
        folderDialogOverlay.appendChild(folderDialog);
        document.body.appendChild(folderDialogOverlay);
        
        return new Promise(resolve => {
          cancelFolderBtn.addEventListener('click', () => resolve(false));
        });
      };
      
      simulatePathSelection();
    });
    
    // 返回Promise
    return new Promise(resolve => {
      // 关闭按钮事件
      closeBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
        resolve('cancel');
      };
      
      // 取消按钮事件
      cancelBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
        resolve('cancel');
      };
      
      // 保存按钮事件
      saveBtn.onclick = () => {
        const filename = filenameInput.value;
        const path = pathInput.value;
        const format = formatSelect ? formatSelect.value : initialFormat;
        
        // 验证输入
        if (!filename) {
          alert('请输入文件名');
          return;
        }
        
        // 验证路径
        if (!path) {
          alert('请选择保存位置');
          return;
        }
        
        // 确保文件名与格式匹配
        const correctedFilename = ensureCorrectExtension(filename, format);
        
        document.body.removeChild(dialogOverlay);
        resolve({
          filename: correctedFilename,
          path: path,
          format: format
        });
      };
    });
  }
  
  /**
   * 更新导出选项面板（已禁用）
   * 此函数已被禁用，不再显示点击单个历史记录时的导出选项
   */
  function updateExportOptions() {
    console.log("Export options disabled - using new flow instead");
    return; // 直接返回，不再创建导出选项面板
  }
})();
