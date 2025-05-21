//
报告保存功能

const { escapeXml } = require('./escape_xml');
const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

/**
 * 格式化并保存报告
 * @param {Object} options - 保存选项
 * @param {string|Object} options.content - 报告内容
 * @param {string} options.format - 保存格式
 * @param {boolean} [options.includeChart=false] - 是否包含图表
 * @param {number} [options.chartDays=0] - 图表天数
 * @param {string} [options.savePath=''] - 保存路径
 * @param {string} [options.filename=''] - 文件名
 * @returns {Promise<Object>} 保存结果
 */
async function saveReport(options) {
  const { content, format, savePath, filename } = options;
  
  try {
    // 构建完整的保存路径
    let fullSavePath = '';
    if (savePath && filename) {
      fullSavePath = path.join(savePath, filename);
    } else if (savePath) {
      // 如果只有路径没有文件名，生成一个默认文件名
      fullSavePath = path.join(savePath, `健康报告_${new Date().toISOString().slice(0, 10)}.${format}`);
    }
    
    console.log(`正在保存到: ${fullSavePath || '默认位置'}`);
    
    // 如果没有提供保存路径，则返回错误
    if (!fullSavePath) {
      return { success: false, message: '未提供有效的保存路径' };
    }
    
    // 直接使用提供的路径保存文件
    switch (format) {
      case 'txt':
        return await saveTxtReport(content, fullSavePath);
      case 'md':
        return await saveMarkdownReport(content, fullSavePath);
      case 'html':
        return await saveHtmlReport(content, fullSavePath);
      case 'pdf':
        return await savePdfReport(content, fullSavePath);
      case 'json':
        return await saveJsonReport(content, fullSavePath);
      case 'csv':
        return await saveCsvReport(content, fullSavePath);
      case 'xml':
        return await saveXmlReport(content, fullSavePath);
      case 'docx':
        return await saveDocxReport(content, fullSavePath);
      case 'xlsx':
        return await saveXlsxReport(content, fullSavePath);
      case 'rtf':
        return await saveRtfReport(content, fullSavePath);
      case 'png':
        return await savePngReport(content, fullSavePath);
      case 'jpg':
        return await saveJpgReport(content, fullSavePath);
      default:
        return { success: false, message: `不支持的格式: ${format}` };
    }
  } catch (error) {
    console.error('保存报告出错:', error);
    return { success: false, message: error.message };
  }
}

/**
 * 使用IPC通道直接保存文件
 * @param {string|Object} content - 要保存的内容
 * @param {string} savePath - 完整的保存路径（包含文件名）
 * @returns {Promise<Object>} 保存结果
 */
async function saveViaIPC(content, savePath) {
  try {
    // 对象类型内容转换为字符串
    const contentStr = typeof content === 'object' ? JSON.stringify(content) : content;
    
    console.log(`直接保存文件到: ${savePath}`);
    
    // 使用IPC向主进程发送保存请求，确保使用直接保存的通道
    const result = await ipcRenderer.invoke('save-file-direct', {
      filePath: savePath,
      content: contentStr
    });
    
    return result;
  } catch (error) {
    console.error('IPC保存文件失败:', error);
    return { success: false, message: `保存失败: ${error.message}` };
  }
}

/**
 * 本地直接保存文件（浏览器环境中不可用）
 * @param {string} content - 要保存的内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveFileDirectly(content, filePath) {
  try {
    // 确保目录存在
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(filePath, content);
    return { success: true, message: '保存成功' };
  } catch (error) {
    console.error('直接保存文件失败:', error);
    return { success: false, message: `保存失败: ${error.message}` };
  }
}

/**
 * 保存TXT格式报告
 * @param {string} content - 报告文本内容
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveTxtReport(content, savePath) {
  try {
    // 使用IPC保存或直接保存
    const result = await saveViaIPC(content, savePath);
    if (result.success) {
      return { success: true, message: '纯文本报告保存成功' };
    } else {
      // 尝试直接保存
      const directResult = await saveFileDirectly(content, savePath);
      return directResult.success 
        ? { success: true, message: '纯文本报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `纯文本报告保存失败: ${error.message}` };
  }
}

/**
 * 保存Markdown格式报告
 * @param {string} content - Markdown格式报告内容
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveMarkdownReport(content, savePath) {
  try {
    const result = await saveViaIPC(content, savePath);
    if (result.success) {
      return { success: true, message: 'Markdown报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(content, savePath);
      return directResult.success 
        ? { success: true, message: 'Markdown报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `Markdown报告保存失败: ${error.message}` };
  }
}

/**
 * 保存HTML格式报告
 * @param {string} content - HTML格式报告内容
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveHtmlReport(content, savePath) {
  try {
    const result = await saveViaIPC(content, savePath);
    if (result.success) {
      return { success: true, message: 'HTML报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(content, savePath);
      return directResult.success 
        ? { success: true, message: 'HTML报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `HTML报告保存失败: ${error.message}` };
  }
}

/**
 * 保存PDF格式报告
 * @param {Object} content - 报告内容和相关数据
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function savePdfReport(content, savePath) {
  try {
    // PDF需要特殊处理，这里简化为字符串
    const pdfContent = typeof content === 'object' ? JSON.stringify(content) : content;
    
    const result = await saveViaIPC(pdfContent, savePath);
    if (result.success) {
      return { success: true, message: 'PDF报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(pdfContent, savePath);
      return directResult.success 
        ? { success: true, message: 'PDF报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `PDF报告保存失败: ${error.message}` };
  }
}

/**
 * 保存JSON格式报告
 * @param {string} content - JSON格式报告内容
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveJsonReport(content, savePath) {
  try {
    const result = await saveViaIPC(content, savePath);
    if (result.success) {
      return { success: true, message: 'JSON报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(content, savePath);
      return directResult.success 
        ? { success: true, message: 'JSON报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `JSON报告保存失败: ${error.message}` };
  }
}

/**
 * 保存CSV格式报告
 * @param {string} content - CSV格式报告内容
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveCsvReport(content, savePath) {
  try {
    const result = await saveViaIPC(content, savePath);
    if (result.success) {
      return { success: true, message: 'CSV报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(content, savePath);
      return directResult.success 
        ? { success: true, message: 'CSV报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `CSV报告保存失败: ${error.message}` };
  }
}

/**
 * 保存XML格式报告
 * @param {string} content - XML格式报告内容
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveXmlReport(content, savePath) {
  try {
    const result = await saveViaIPC(content, savePath);
    if (result.success) {
      return { success: true, message: 'XML报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(content, savePath);
      return directResult.success 
        ? { success: true, message: 'XML报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `XML报告保存失败: ${error.message}` };
  }
}

/**
 * 保存DOCX格式报告
 * @param {Object} content - 报告内容和相关数据
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveDocxReport(content, savePath) {
  try {
    // DOCX需要特殊处理，这里简化为字符串
    const docxContent = typeof content === 'object' ? JSON.stringify(content) : content;
    
    const result = await saveViaIPC(docxContent, savePath);
    if (result.success) {
      return { success: true, message: 'Word文档报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(docxContent, savePath);
      return directResult.success 
        ? { success: true, message: 'Word文档报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `Word文档报告保存失败: ${error.message}` };
  }
}

/**
 * 保存XLSX格式报告
 * @param {Object} content - 报告内容和相关数据
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveXlsxReport(content, savePath) {
  try {
    // XLSX需要特殊处理，这里简化为字符串
    const xlsxContent = typeof content === 'object' ? JSON.stringify(content) : content;
    
    const result = await saveViaIPC(xlsxContent, savePath);
    if (result.success) {
      return { success: true, message: 'Excel表格报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(xlsxContent, savePath);
      return directResult.success 
        ? { success: true, message: 'Excel表格报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `Excel表格报告保存失败: ${error.message}` };
  }
}

/**
 * 保存RTF格式报告
 * @param {Object} content - 报告内容和相关数据
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveRtfReport(content, savePath) {
  try {
    // RTF需要特殊处理，这里简化为字符串
    const rtfContent = typeof content === 'object' ? JSON.stringify(content) : content;
    
    const result = await saveViaIPC(rtfContent, savePath);
    if (result.success) {
      return { success: true, message: '富文本格式报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(rtfContent, savePath);
      return directResult.success 
        ? { success: true, message: '富文本格式报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `富文本格式报告保存失败: ${error.message}` };
  }
}

/**
 * 保存PNG格式报告
 * @param {Object} content - 报告内容和相关数据
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function savePngReport(content, savePath) {
  try {
    // PNG需要特殊处理，这里简化为字符串
    const pngContent = typeof content === 'object' ? JSON.stringify(content) : content;
    
    const result = await saveViaIPC(pngContent, savePath);
    if (result.success) {
      return { success: true, message: 'PNG图片报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(pngContent, savePath);
      return directResult.success 
        ? { success: true, message: 'PNG图片报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `PNG图片报告保存失败: ${error.message}` };
  }
}

/**
 * 保存JPG格式报告
 * @param {Object} content - 报告内容和相关数据
 * @param {string} savePath - 保存路径
 * @returns {Promise<Object>} 保存结果
 */
async function saveJpgReport(content, savePath) {
  try {
    // JPG需要特殊处理，这里简化为字符串
    const jpgContent = typeof content === 'object' ? JSON.stringify(content) : content;
    
    const result = await saveViaIPC(jpgContent, savePath);
    if (result.success) {
      return { success: true, message: 'JPG图片报告保存成功' };
    } else {
      const directResult = await saveFileDirectly(jpgContent, savePath);
      return directResult.success 
        ? { success: true, message: 'JPG图片报告保存成功' }
        : directResult;
    }
  } catch (error) {
    return { success: false, message: `JPG图片报告保存失败: ${error.message}` };
  }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { saveReport };
}
