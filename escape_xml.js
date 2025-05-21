//
XML转义函数

/**
 * 转义XML中的特殊字符
 * @param {string} unsafe 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return unsafe.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeXml };
}
