// 根据语言更新输入框的placeholder
if (lang === 'en-US') {
  // 美制单位
  document.getElementById('height').placeholder = "Example: 70";
  document.getElementById('weight').placeholder = "Example: 150";
} else if (lang === 'ru-RU') {
  // 俄语公制单位
  document.getElementById('height').placeholder = "например: 170";
  document.getElementById('weight').placeholder = "например: 70";
} else if (lang === 'ja-JP') {
  // 日语公制单位
  document.getElementById('height').placeholder = "例: 170";
  document.getElementById('weight').placeholder = "例: 65";
} else if (lang === 'ko-KR') {
  // 韩语公制单位
  document.getElementById('height').placeholder = "예: 170";
  document.getElementById('weight').placeholder = "예: 65";
} else if (lang === 'zh-CN') {
  // 中文公制单位
  document.getElementById('height').placeholder = "例如: 170";
  document.getElementById('weight').placeholder = "例如: 65";
} else if (lang === 'fr-FR') {
  // 法语公制单位
  document.getElementById('height').placeholder = "ex: 170";
  document.getElementById('weight').placeholder = "ex: 65";
} else if (lang === 'es-ES') {
  // 西班牙语公制单位
  document.getElementById('height').placeholder = "ej: 170";
  document.getElementById('weight').placeholder = "ej: 65";
} else if (lang === 'ar-EG') {
  // 阿拉伯语公制单位
  document.getElementById('height').placeholder = "مثال: 170";
  document.getElementById('weight').placeholder = "مثال: 65";
} else if (lang === 'zh-classical') {
  // 文言文古代单位
  document.getElementById('height').placeholder = "例如: 五尺六寸";
  document.getElementById('weight').placeholder = "例如: 一百三十斤";
} else {
  // 其他语言使用公制单位，不设置特定的占位符
  document.getElementById('height').placeholder = "";
  document.getElementById('weight').placeholder = "";
}

// 更新单位换算器的占位符
const fromValueInput = document.getElementById('fromValue');
if (fromValueInput) {
  if (unitTranslations[lang]) {
    fromValueInput.placeholder = unitTranslations[lang].fromValue;
  } else {
    fromValueInput.placeholder = "输入数值";
  }
}

// 更新API剩余次数显示 