// 修复英语placeholder - 找到第5315-5318行
if (lang === 'en-US') {
  // 美制单位
  document.getElementById('height').placeholder = "Example: 70";
  document.getElementById('weight').placeholder = "Example: 150";
} 

// 添加单位换算器placeholder - 在5356行前添加
// 更新单位换算器的占位符
const fromValueInput = document.getElementById('fromValue');
if (fromValueInput) {
  if (unitTranslations[lang]) {
    fromValueInput.placeholder = unitTranslations[lang].fromValue;
  } else {
    fromValueInput.placeholder = "输入数值";
  }
} 