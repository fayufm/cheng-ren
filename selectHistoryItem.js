// 选择历史记录项
function selectHistoryItem(item, element) {
  // 移除其他项的选中状态
  document.querySelectorAll('.history-item').forEach(el => {
    el.classList.remove('selected');
  });
  
  // 添加选中状态
  element.classList.add('selected');
  
  // 保存选中的项
  selectedHistoryItem = item;
  
  // 不再显示导出面板
  // exportPanel.style.display = 'block';
}
