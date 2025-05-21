// 1. 向translations对象各语言部分添加的新键

// 中文
apiUsageNotice: '内置API一天最多生成报告10次，用户自己设置API后则无上限。',
languageInfoText: '切换语言将改变界面文本、度量单位和健康标准。',

// 英语 (GB和US)
apiUsageNotice: 'Built-in API allows generating reports up to 10 times a day. No limit when using your own API.',
languageInfoText: 'Switching language will change interface text, measurement units, and health standards.',

// 法语
apiUsageNotice: 'L\'API intégrée permet de générer des rapports jusqu\'à 10 fois par jour. Pas de limite lors de l\'utilisation de votre propre API.',
languageInfoText: 'Changer de langue modifiera le texte de l\'interface, les unités de mesure et les normes de santé.',

// 西班牙语
apiUsageNotice: 'La API integrada permite generar informes hasta 10 veces al día. Sin límite cuando se usa su propia API.',
languageInfoText: 'Cambiar el idioma modificará el texto de la interfaz, las unidades de medida y los estándares de salud.',

// 阿拉伯语
apiUsageNotice: 'تسمح واجهة برمجة التطبيقات المدمجة بإنشاء التقارير حتى 10 مرات في اليوم. لا حدود عند استخدام واجهة برمجة التطبيقات الخاصة بك.',
languageInfoText: 'سيؤدي تغيير اللغة إلى تغيير نص الواجهة ووحدات القياس ومعايير الصحة.',

// 俄语
apiUsageNotice: 'Встроенный API позволяет генерировать отчеты до 10 раз в день. Нет ограничений при использовании собственного API.',
languageInfoText: 'Изменение языка изменит текст интерфейса, единицы измерения и стандарты здоровья.',

// 日语
apiUsageNotice: '組み込みAPIは1日に最大10回のレポート生成を許可します。独自のAPIを使用する場合は制限はありません。',
languageInfoText: '言語を切り替えると、インターフェーステキスト、測定単位、健康基準が変更されます。',

// 韩语
apiUsageNotice: '내장 API는 하루에 최대 10회의 보고서 생성을 허용합니다. 자신의 API를 사용할 때는 제한이 없습니다.',
languageInfoText: '언어를 전환하면 인터페이스 텍스트, 측정 단위 및 건강 표준이 변경됩니다.',

// 文言文
apiUsageNotice: '内建通序一日可生報告十次，用己之通序则无限。',
languageInfoText: '易语则易文本、易度量衡、易养生之则。',

// 2. 添加到applyLanguage函数的代码
// 更新API使用说明和语言信息文本
const apiUsageNotice = document.getElementById('apiUsageNotice');
if (apiUsageNotice && translations[lang].apiUsageNotice) {
  apiUsageNotice.textContent = translations[lang].apiUsageNotice;
}

const languageInfoText = document.getElementById('languageInfoText');
if (languageInfoText && translations[lang].languageInfoText) {
  languageInfoText.textContent = translations[lang].languageInfoText;
} 