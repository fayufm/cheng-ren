// 获取electron的ipcRenderer
const { ipcRenderer } = require('electron');
const marked = require('marked');

// API密钥
const TONGYI_API_KEY = 'sk-07ef4701031d41668beebb521e80eaf0';
const DEEPSEEK_API_KEY = 'sk-0b2be14756fe4195a7bc2bcb78d19f8f';
// API使用限制相关常量
const API_USAGE_KEY = 'health_api_usage';
const dailyApiUsageLimit = 10;
let dailyApiUsageCount = 0;

// 当前使用的API类型（默认使用通义千问API）
let currentAPI = 'tongyi';
// 自定义API配置
let customAPIConfig = null;

// 当前语言设置
let currentLanguage = 'zh-CN';
// 语言包
const translations = {
  'zh-CN': {
    appTitle: '秤人 - 个人健康管理与分析系统',
    inputData: '输入您的身体数据',
    height: '身高 (cm)',
    weight: '体重 (kg)',
    age: '年龄',
    gender: '性别',
    genderOptions: {
      select: '请选择',
      male: '男',
      female: '女',
      other: '其他'
    },
    bloodPressure: '血压 (mmHg)',
    systolic: '收缩压',
    diastolic: '舒张压',
    heartRate: '心率 (次/分)',
    sleepHours: '平均睡眠时长 (小时)',
    exerciseFrequency: '每周运动频率',
    exerciseOptions: {
      select: '请选择',
      none: '不运动',
      few: '1-2次',
      some: '3-4次',
      many: '5次及以上'
    },
    medical: '病史 (可选)',
    medicalPlaceholder: '请描述您的病史、家族病史或当前正在用药情况等',
    lifestyle: '生活习惯',
    lifestylePlaceholder: '请描述您的作息时间、运动频率、工作性质等',
    diet: '饮食习惯',
    dietPlaceholder: '请描述您的日常饮食结构、喜好、忌口等',
    concern: '主要健康顾虑 (可选)',
    concernPlaceholder: '您目前最关心的健康问题',
    allergens: '过敏源 (可选)',
    otherAllergens: '请输入其他过敏源',
    submit: '生成健康报告',
    reset: '重置',
    report: '您的健康报告',
    download: '下载报告',
    back: '返回',
    settings: '设置',
    history: '历史记录',
    theme: '主题',
    api: 'API 设置',
    language: '语言',
    saveSettings: '保存设置',
    resetSettings: '重置',
    loading: '加载中...',
    noData: '暂无数据',
    error: '出错了',
    success: '成功',
    warning: '警告',
    info: '提示',
    // 健康记录图表相关翻译
    healthChart: '健康记录图表',
    recordChart: '记录图',
    closeChart: '关闭图表',
    healthScore: '健康评分',
    chartMetrics: {
      healthScore: '健康评分',
      weight: '体重',
      bmi: 'BMI',
      bloodPressure: '血压',
      heartRate: '心率'
    }
  },
  'en-GB': {
    appTitle: 'Health Manager - Personal Health Management and Analysis System',
    inputData: 'Enter Your Health Data',
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    age: 'Age',
    gender: 'Gender',
    genderOptions: {
      select: 'Please select',
      male: 'Male',
      female: 'Female',
      other: 'Other'
    },
    bloodPressure: 'Blood Pressure (mmHg)',
    systolic: 'Systolic',
    diastolic: 'Diastolic',
    heartRate: 'Heart Rate (bpm)',
    sleepHours: 'Average Sleep Duration (hours)',
    exerciseFrequency: 'Weekly Exercise Frequency',
    exerciseOptions: {
      select: 'Please select',
      none: 'No exercise',
      few: '1-2 times',
      some: '3-4 times',
      many: '5+ times'
    },
    medical: 'Medical History (optional)',
    medicalPlaceholder: 'Please describe your medical history, family history or current medications',
    lifestyle: 'Lifestyle Habits',
    lifestylePlaceholder: 'Please describe your daily routine, exercise habits, work nature, etc.',
    diet: 'Dietary Habits',
    dietPlaceholder: 'Please describe your daily diet structure, preferences, restrictions, etc.',
    concern: 'Main Health Concerns (optional)',
    concernPlaceholder: 'What health issues are you most concerned about currently',
    allergens: 'Allergens (optional)',
    otherAllergens: 'Please enter other allergens',
    submit: 'Generate Health Report',
    reset: 'Reset',
    report: 'Your Health Report',
    download: 'Download Report',
    back: 'Back',
    settings: 'Settings',
    history: 'History',
    theme: 'Theme',
    api: 'API Settings',
    language: 'Language',
    saveSettings: 'Save Settings',
    resetSettings: 'Reset',
    loading: 'Loading...',
    noData: 'No data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    // 健康记录图表相关翻译
    healthChart: 'Health Record Chart',
    recordChart: 'Record Chart',
    closeChart: 'Close Chart',
    healthScore: 'Health Score',
    chartMetrics: {
      healthScore: 'Health Score',
      weight: 'Weight',
      bmi: 'BMI',
      bloodPressure: 'Blood Pressure',
      heartRate: 'Heart Rate'
    }
  },
  'en-US': {
    appTitle: 'Health Manager - Personal Health Management and Analysis System',
    inputData: 'Enter Your Health Data',
    height: 'Height (in)',
    weight: 'Weight (lb)',
    age: 'Age',
    gender: 'Gender',
    genderOptions: {
      select: 'Please select',
      male: 'Male',
      female: 'Female',
      other: 'Other'
    },
    bloodPressure: 'Blood Pressure (mmHg)',
    systolic: 'Systolic',
    diastolic: 'Diastolic',
    heartRate: 'Heart Rate (bpm)',
    sleepHours: 'Average Sleep Duration (hours)',
    exerciseFrequency: 'Weekly Exercise Frequency',
    exerciseOptions: {
      select: 'Please select',
      none: 'No exercise',
      few: '1-2 times',
      some: '3-4 times',
      many: '5+ times'
    },
    medical: 'Medical History (optional)',
    medicalPlaceholder: 'Please describe your medical history, family history or current medications',
    lifestyle: 'Lifestyle Habits',
    lifestylePlaceholder: 'Please describe your daily routine, exercise habits, work nature, etc.',
    diet: 'Dietary Habits',
    dietPlaceholder: 'Please describe your daily diet structure, preferences, restrictions, etc.',
    concern: 'Main Health Concerns (optional)',
    concernPlaceholder: 'What health issues are you most concerned about currently',
    allergens: 'Allergens (optional)',
    otherAllergens: 'Please enter other allergens',
    submit: 'Generate Health Report',
    reset: 'Reset',
    report: 'Your Health Report',
    download: 'Download Report',
    back: 'Back',
    settings: 'Settings',
    history: 'History',
    theme: 'Theme',
    api: 'API Settings',
    language: 'Language',
    saveSettings: 'Save Settings',
    resetSettings: 'Reset',
    loading: 'Loading...',
    noData: 'No data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    // 健康记录图表相关翻译
    healthChart: 'Health Record Chart',
    recordChart: 'Record Chart',
    closeChart: 'Close Chart',
    chartMetrics: {
      weight: 'Weight',
      bmi: 'BMI',
      bloodPressure: 'Blood Pressure',
      heartRate: 'Heart Rate'
    }
  },
  'fr-FR': {
    appTitle: 'Gestionnaire de Santé - Système de Gestion et d\'Analyse de Santé Personnelle',
    inputData: 'Entrez Vos Données de Santé',
    height: 'Taille (cm)',
    weight: 'Poids (kg)',
    age: 'Âge',
    gender: 'Genre',
    genderOptions: {
      select: 'Veuillez sélectionner',
      male: 'Homme',
      female: 'Femme',
      other: 'Autre'
    },
    bloodPressure: 'Tension Artérielle (mmHg)',
    systolic: 'Systolique',
    diastolic: 'Diastolique',
    heartRate: 'Fréquence Cardiaque (bpm)',
    sleepHours: 'Durée Moyenne de Sommeil (heures)',
    exerciseFrequency: 'Fréquence d\'Exercice Hebdomadaire',
    exerciseOptions: {
      select: 'Veuillez sélectionner',
      none: 'Pas d\'exercice',
      few: '1-2 fois',
      some: '3-4 fois',
      many: '5+ fois'
    },
    medical: 'Antécédents Médicaux (optionnel)',
    medicalPlaceholder: 'Veuillez décrire vos antécédents médicaux, familiaux ou médicaments actuels',
    lifestyle: 'Habitudes de Vie',
    lifestylePlaceholder: 'Veuillez décrire votre routine quotidienne, habitudes d\'exercice, nature du travail, etc.',
    diet: 'Habitudes Alimentaires',
    dietPlaceholder: 'Veuillez décrire votre structure alimentaire quotidienne, préférences, restrictions, etc.',
    concern: 'Principales Préoccupations de Santé (optionnel)',
    concernPlaceholder: 'Quels problèmes de santé vous préoccupent le plus actuellement',
    allergens: 'Allergènes (optionnel)',
    otherAllergens: 'Veuillez entrer d\'autres allergènes',
    submit: 'Générer un Rapport de Santé',
    reset: 'Réinitialiser',
    report: 'Votre Rapport de Santé',
    download: 'Télécharger le Rapport',
    back: 'Retour',
    settings: 'Paramètres',
    history: 'Historique',
    theme: 'Thème',
    api: 'Paramètres API',
    language: 'Langue',
    saveSettings: 'Enregistrer les Paramètres',
    resetSettings: 'Réinitialiser',
    loading: 'Chargement...',
    noData: 'Aucune donnée',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Info'
  },
  'es-ES': {
    appTitle: 'Gestor de Salud - Sistema de Gestión y Análisis de Salud Personal',
    inputData: 'Ingrese Sus Datos de Salud',
    height: 'Altura (cm)',
    weight: 'Peso (kg)',
    age: 'Edad',
    gender: 'Género',
    genderOptions: {
      select: 'Por favor seleccione',
      male: 'Hombre',
      female: 'Mujer',
      other: 'Otro'
    },
    bloodPressure: 'Presión Arterial (mmHg)',
    systolic: 'Sistólica',
    diastolic: 'Diastólica',
    heartRate: 'Frecuencia Cardíaca (lpm)',
    sleepHours: 'Duración Media del Sueño (horas)',
    exerciseFrequency: 'Frecuencia de Ejercicio Semanal',
    exerciseOptions: {
      select: 'Por favor seleccione',
      none: 'Sin ejercicio',
      few: '1-2 veces',
      some: '3-4 veces',
      many: '5+ veces'
    },
    medical: 'Historial Médico (opcional)',
    medicalPlaceholder: 'Por favor describa su historial médico, antecedentes familiares o medicamentos actuales',
    lifestyle: 'Hábitos de Vida',
    lifestylePlaceholder: 'Por favor describa su rutina diaria, hábitos de ejercicio, naturaleza del trabajo, etc.',
    diet: 'Hábitos Alimenticios',
    dietPlaceholder: 'Por favor describa su estructura de dieta diaria, preferencias, restricciones, etc.',
    concern: 'Principales Preocupaciones de Salud (opcional)',
    concernPlaceholder: '¿Qué problemas de salud le preocupan más actualmente?',
    allergens: 'Alérgenos (opcional)',
    otherAllergens: 'Por favor ingrese otros alérgenos',
    submit: 'Generar Informe de Salud',
    reset: 'Reiniciar',
    report: 'Su Informe de Salud',
    download: 'Descargar Informe',
    back: 'Volver',
    settings: 'Configuración',
    history: 'Historial',
    theme: 'Tema',
    api: 'Configuración API',
    language: 'Idioma',
    saveSettings: 'Guardar Configuración',
    resetSettings: 'Reiniciar',
    loading: 'Cargando...',
    noData: 'Sin datos',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información'
  },
  'ar-EG': {
    appTitle: 'مدير الصحة - نظام إدارة وتحليل الصحة الشخصية',
    inputData: 'أدخل بيانات صحتك',
    height: 'الطول (سم)',
    weight: 'الوزن (كجم)',
    age: 'العمر',
    gender: 'الجنس',
    genderOptions: {
      select: 'يرجى الاختيار',
      male: 'ذكر',
      female: 'أنثى',
      other: 'آخر'
    },
    bloodPressure: 'ضغط الدم (مم زئبق)',
    systolic: 'الانقباضي',
    diastolic: 'الانبساطي',
    heartRate: 'معدل ضربات القلب (نبضة/دقيقة)',
    sleepHours: 'متوسط مدة النوم (ساعات)',
    exerciseFrequency: 'معدل ممارسة الرياضة أسبوعيًا',
    exerciseOptions: {
      select: 'يرجى الاختيار',
      none: 'لا تمارين',
      few: '1-2 مرات',
      some: '3-4 مرات',
      many: '5+ مرات'
    },
    medical: 'التاريخ الطبي (اختياري)',
    medicalPlaceholder: 'يرجى وصف تاريخك الطبي أو تاريخ العائلة أو الأدوية الحالية',
    lifestyle: 'أنماط الحياة',
    lifestylePlaceholder: 'يرجى وصف روتينك اليومي، وعادات التمرين، وطبيعة العمل، إلخ.',
    diet: 'العادات الغذائية',
    dietPlaceholder: 'يرجى وصف هيكل نظامك الغذائي اليومي، والتفضيلات، والقيود، إلخ.',
    concern: 'المخاوف الصحية الرئيسية (اختياري)',
    concernPlaceholder: 'ما هي المشاكل الصحية التي تشغلك حاليًا',
    allergens: 'مسببات الحساسية (اختياري)',
    otherAllergens: 'يرجى إدخال مسببات الحساسية الأخرى',
    submit: 'إنشاء تقرير صحي',
    reset: 'إعادة تعيين',
    report: 'تقريرك الصحي',
    download: 'تنزيل التقرير',
    back: 'رجوع',
    settings: 'الإعدادات',
    history: 'السجل',
    theme: 'السمة',
    api: 'إعدادات API',
    language: 'اللغة',
    saveSettings: 'حفظ الإعدادات',
    resetSettings: 'إعادة تعيين',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
    error: 'خطأ',
    success: 'نجاح',
    warning: 'تحذير',
    info: 'معلومات'
  },
  'ru-RU': {
    appTitle: 'Менеджер здоровья - Система управления и анализа личного здоровья',
    inputData: 'Введите данные о вашем здоровье',
    height: 'Рост (см)',
    weight: 'Вес (кг)',
    age: 'Возраст',
    gender: 'Пол',
    genderOptions: {
      select: 'Выберите',
      male: 'Мужской',
      female: 'Женский',
      other: 'Другой'
    },
    bloodPressure: 'Кровяное давление (мм рт.ст.)',
    systolic: 'Систолическое',
    diastolic: 'Диастолическое',
    heartRate: 'Пульс (уд/мин)',
    sleepHours: 'Средняя продолжительность сна (часов)',
    exerciseFrequency: 'Частота тренировок в неделю',
    exerciseOptions: {
      select: 'Выберите',
      none: 'Нет тренировок',
      few: '1-2 раза',
      some: '3-4 раза',
      many: '5+ раз'
    },
    medical: 'Медицинская история (необязательно)',
    medicalPlaceholder: 'Опишите вашу медицинскую историю, семейную историю или текущие лекарства',
    lifestyle: 'Образ жизни',
    lifestylePlaceholder: 'Опишите ваш ежедневный распорядок, привычки тренировок, характер работы и т.д.',
    diet: 'Пищевые привычки',
    dietPlaceholder: 'Опишите вашу ежедневную структуру питания, предпочтения, ограничения и т.д.',
    concern: 'Основные проблемы здоровья (необязательно)',
    concernPlaceholder: 'Какие проблемы здоровья вас больше всего беспокоят в настоящее время',
    allergens: 'Аллергены (необязательно)',
    otherAllergens: 'Введите другие аллергены',
    submit: 'Сгенерировать отчет о здоровье',
    reset: 'Сбросить',
    report: 'Ваш отчет о здоровье',
    download: 'Скачать отчет',
    back: 'Назад',
    settings: 'Настройки',
    history: 'История',
    theme: 'Тема',
    api: 'Настройки API',
    language: 'Язык',
    saveSettings: 'Сохранить настройки',
    resetSettings: 'Сбросить',
    loading: 'Загрузка...',
    noData: 'Нет данных',
    error: 'Ошибка',
    success: 'Успех',
    warning: 'Предупреждение',
    info: 'Информация'
  },
  'ja-JP': {
    appTitle: 'ヘルスマネージャー - 個人健康管理・分析システム',
    inputData: '健康データを入力してください',
    height: '身長 (cm)',
    weight: '体重 (kg)',
    age: '年齢',
    gender: '性別',
    genderOptions: {
      select: '選択してください',
      male: '男性',
      female: '女性',
      other: 'その他'
    },
    bloodPressure: '血圧 (mmHg)',
    systolic: '収縮期',
    diastolic: '拡張期',
    heartRate: '心拍数 (拍/分)',
    sleepHours: '平均睡眠時間 (時間)',
    exerciseFrequency: '週間運動頻度',
    exerciseOptions: {
      select: '選択してください',
      none: '運動なし',
      few: '1-2回',
      some: '3-4回',
      many: '5回以上'
    },
    medical: '病歴 (任意)',
    medicalPlaceholder: 'あなたの病歴、家族歴、または現在の薬について記述してください',
    lifestyle: '生活習慣',
    lifestylePlaceholder: '日常のルーティン、運動習慣、仕事の性質などについて記述してください',
    diet: '食事習慣',
    dietPlaceholder: '毎日の食事構成、好み、制限などについて記述してください',
    concern: '主な健康上の懸念 (任意)',
    concernPlaceholder: '現在最も懸念している健康問題は何ですか',
    allergens: 'アレルゲン (任意)',
    otherAllergens: '他のアレルゲンを入力してください',
    submit: '健康レポートを生成',
    reset: 'リセット',
    report: 'あなたの健康レポート',
    download: 'レポートをダウンロード',
    back: '戻る',
    settings: '設定',
    history: '履歴',
    theme: 'テーマ',
    api: 'API設定',
    language: '言語',
    saveSettings: '設定を保存',
    resetSettings: 'リセット',
    loading: '読み込み中...',
    noData: 'データなし',
    error: 'エラー',
    success: '成功',
    warning: '警告',
    info: '情報'
  },
  'ko-KR': {
    appTitle: '헬스 매니저 - 개인 건강 관리 및 분석 시스템',
    inputData: '건강 데이터 입력',
    height: '키 (cm)',
    weight: '체중 (kg)',
    age: '나이',
    gender: '성별',
    genderOptions: {
      select: '선택하세요',
      male: '남성',
      female: '여성',
      other: '기타'
    },
    bloodPressure: '혈압 (mmHg)',
    systolic: '수축기',
    diastolic: '이완기',
    heartRate: '심박수 (회/분)',
    sleepHours: '평균 수면 시간 (시간)',
    exerciseFrequency: '주간 운동 빈도',
    exerciseOptions: {
      select: '선택하세요',
      none: '운동 안함',
      few: '1-2회',
      some: '3-4회',
      many: '5회 이상'
    },
    medical: '병력 (선택사항)',
    medicalPlaceholder: '귀하의 병력, 가족력 또는 현재 복용 중인 약물에 대해 설명해주세요',
    lifestyle: '생활 습관',
    lifestylePlaceholder: '일상 루틴, 운동 습관, 업무 특성 등을 설명해주세요',
    diet: '식습관',
    dietPlaceholder: '일일 식단 구성, 선호도, 제한사항 등을 설명해주세요',
    concern: '주요 건강 우려사항 (선택사항)',
    concernPlaceholder: '현재 가장 우려하는 건강 문제는 무엇입니까',
    allergens: '알레르기 항원 (선택사항)',
    otherAllergens: '다른 알레르기 항원을 입력하세요',
    submit: '건강 보고서 생성',
    reset: '초기화',
    report: '귀하의 건강 보고서',
    download: '보고서 다운로드',
    back: '뒤로',
    settings: '설정',
    history: '기록',
    theme: '테마',
    api: 'API 설정',
    language: '언어',
    saveSettings: '설정 저장',
    resetSettings: '초기화',
    loading: '로딩 중...',
    noData: '데이터 없음',
    error: '오류',
    success: '성공',
    warning: '경고',
    info: '정보',
    // 건강 차트 관련 번역
    healthChart: '건강 기록 차트',
    recordChart: '기록 차트',
    closeChart: '차트 닫기',
    healthScore: '건강 점수',
    chartMetrics: {
      healthScore: '건강 점수',
      weight: '체중',
      bmi: 'BMI',
      bloodPressure: '혈압',
      heartRate: '심박수'
    },
    expandChart: '확장',
    languageSettings: '언어 설정',
    selectLanguage: '언어 선택',
    languageInfo: '언어를 전환하면 인터페이스 텍스트, 측정 단위 및 건강 표준이 변경됩니다.',
    themeSettings: '테마 설정',
    themeOptions: '테마 옵션',
    lightTheme: '라이트',
    darkTheme: '다크',
    goldTheme: '골드',
    backgroundImage: '배경 이미지',
    noBackground: '배경 없음',
    localImage: '로컬 이미지',
    imageUrl: '이미지 URL',
    selectFile: '파일 선택',
    clear: '지우기',
    apply: '적용',
    backgroundPreview: '배경 미리보기',
    backgroundAdjustments: '배경 이미지 조정',
    opacity: '불투명도',
    blurLevel: '블러 수준',
    zIndex: 'Z-인덱스',
    zIndexDescription: '음수 값은 콘텐츠 뒤에, 양수 값은 콘텐츠 앞에',
    animationEffects: '애니메이션 효과',
    animationDescription: '클릭 시 무작위 색상의 이모티콘 또는 이모지 표시',
    pageOpacity: '페이지 불투명도',
    pageOpacityDescription: '"건강 데이터 입력" 페이지 배경의 투명도 조정',
    fontOpacity: '글꼴 불투명도',
    fontOpacityDescription: '페이지 텍스트의 투명도 조정',
    supportAuthor: '작성자 지원',
    apiSettings: 'API 설정',
    apiKey: 'API 키',
    apiEndpoint: 'API 엔드포인트',
    apiModel: 'API 모델',
    apiProvider: 'API 제공자',
    apiUsageInfo: 'API 사용 정보',
    remainingCalls: '남은 API 호출',
    totalCalls: '총 API 호출 횟수',
    resetUsage: '사용 데이터 재설정',
    customApiSettings: '사용자 정의 API 설정',
    useCustomApi: '사용자 정의 API 사용',
    exportOptions: '내보내기 옵션',
    exportSelectedRecords: '선택한 레코드 내보내기',
    historyChart: '기록 차트',
    unitConverter: '단위 변환기',
    convertFrom: '변환 원본',
    convertTo: '변환 대상',
    conversionResult: '변환 결과',
    convertValue: '변환할 값',
    convertButton: '변환',
    conversionFormula: '변환 공식',
    measurementType: '측정 유형',
    lengthUnits: '길이',
    weightUnits: '무게',
    temperatureUnits: '온도',
    volumeUnits: '부피',
    areaUnits: '면적',
    addCustomField: '사용자 정의 필드 추가',
    customFieldName: '필드 이름',
    customFieldValue: '값',
    customFieldUnit: '단위 (선택사항)',
    deleteField: '필드 삭제',
    closeConverter: '변환기 닫기'
  },
  'zh-classical': {
    appTitle: '秤人 - 養生察形之術',
    inputData: '錄爾體之數',
    height: '身長 (尺)',
    weight: '體重 (斤)',
    age: '年歲',
    gender: '性別',
    genderOptions: {
      select: '請選之',
      male: '男',
      female: '女',
      other: '其他'
    },
    bloodPressure: '血壓 (分)',
    systolic: '上壓',
    diastolic: '下壓',
    heartRate: '脈搏 (次/刻)',
    sleepHours: '寐時 (時辰)',
    exerciseFrequency: '動作頻次 (每七日)',
    exerciseOptions: {
      select: '請選之',
      none: '不動',
      few: '一至二次',
      some: '三至四次',
      many: '五次以上'
    },
    medical: '病史 (可缺)',
    medicalPlaceholder: '請述爾病史、家族病史或當前用藥',
    lifestyle: '生活之道',
    lifestylePlaceholder: '請述爾作息、動作習慣、工作性質等',
    diet: '飲食之道',
    dietPlaceholder: '請述爾日常食物、嗜好、忌口等',
    concern: '主要養生之慮 (可缺)',
    concernPlaceholder: '爾當下最為關心之養生問題',
    allergens: '過敏之源 (可缺)',
    otherAllergens: '請錄其他過敏之源',
    submit: '生成養生報告',
    reset: '重置',
    report: '爾之養生報告',
    download: '下載報告',
    back: '返回',
    settings: '設置',
    history: '記錄',
    theme: '主題',
    api: 'API 設置',
    language: '語言',
    saveSettings: '存設置',
    resetSettings: '重置',
    loading: '載入中...',
    noData: '無數據',
    error: '有誤',
    success: '成功',
    warning: '警示',
    info: '提示'
  },
  'pt-BR': {
    appTitle: 'Gerenciador de Saúde - Sistema de Gerenciamento e Análise de Saúde Pessoal',
    inputData: 'Insira Seus Dados de Saúde',
    height: 'Altura (cm)',
    weight: 'Peso (kg)',
    age: 'Idade',
    gender: 'Gênero',
    genderOptions: {
      select: 'Por favor selecione',
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro'
    },
    bloodPressure: 'Pressão Arterial (mmHg)',
    systolic: 'Sistólica',
    diastolic: 'Diastólica',
    heartRate: 'Frequência Cardíaca (bpm)',
    sleepHours: 'Duração Média do Sono (horas)',
    exerciseFrequency: 'Frequência de Exercício Semanal',
    exerciseOptions: {
      select: 'Por favor selecione',
      none: 'Sem exercício',
      few: '1-2 vezes',
      some: '3-4 vezes',
      many: '5+ vezes'
    },
    medical: 'Histórico Médico (opcional)',
    medicalPlaceholder: 'Por favor descreva seu histórico médico, histórico familiar ou medicamentos atuais',
    lifestyle: 'Hábitos de Vida',
    lifestylePlaceholder: 'Por favor descreva sua rotina diária, hábitos de exercício, natureza do trabalho, etc.',
    diet: 'Hábitos Alimentares',
    dietPlaceholder: 'Por favor descreva sua estrutura alimentar diária, preferências, restrições, etc.',
    concern: 'Principais Preocupações de Saúde (opcional)',
    concernPlaceholder: 'Quais problemas de saúde mais te preocupam atualmente',
    allergens: 'Alérgenos (opcional)',
    otherAllergens: 'Por favor insira outros alérgenos',
    submit: 'Gerar Relatório de Saúde',
    reset: 'Redefinir',
    report: 'Seu Relatório de Saúde',
    download: 'Baixar Relatório',
    back: 'Voltar',
    settings: 'Configurações',
    history: 'Histórico',
    theme: 'Tema',
    api: 'Configurações de API',
    language: 'Idioma',
    saveSettings: 'Salvar Configurações',
    resetSettings: 'Redefinir',
    loading: 'Carregando...',
    noData: 'Sem dados',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Info'
  },
  'hi-IN': {
    appTitle: 'स्वास्थ्य प्रबंधक - व्यक्तिगत स्वास्थ्य प्रबंधन और विश्लेषण प्रणाली',
    inputData: 'अपना स्वास्थ्य डेटा दर्ज करें',
    height: 'ऊंचाई (सेमी)',
    weight: 'वजन (किलो)',
    age: 'उम्र',
    gender: 'लिंग',
    genderOptions: {
      select: 'कृपया चुनें',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य'
    },
    bloodPressure: 'रक्तचाप (mmHg)',
    systolic: 'सिस्टोलिक',
    diastolic: 'डायस्टोलिक',
    heartRate: 'हृदय गति (बीपीएम)',
    sleepHours: 'औसत नींद अवधि (घंटे)',
    exerciseFrequency: 'साप्ताहिक व्यायाम आवृत्ति',
    exerciseOptions: {
      select: 'कृपया चुनें',
      none: 'कोई व्यायाम नहीं',
      few: '1-2 बार',
      some: '3-4 बार',
      many: '5+ बार'
    },
    medical: 'चिकित्सा इतिहास (वैकल्पिक)',
    medicalPlaceholder: 'कृपया अपने चिकित्सा इतिहास, परिवार के इतिहास या वर्तमान दवाओं का वर्णन करें',
    lifestyle: 'जीवनशैली की आदतें',
    lifestylePlaceholder: 'कृपया अपनी दैनिक दिनचर्या, व्यायाम की आदतें, काम की प्रकृति, आदि का वर्णन करें',
    diet: 'आहार संबंधी आदतें',
    dietPlaceholder: 'कृपया अपने दैनिक आहार संरचना, प्राथमिकताएं, प्रतिबंध, आदि का वर्णन करें',
    concern: 'मुख्य स्वास्थ्य चिंताएं (वैकल्पिक)',
    concernPlaceholder: 'वर्तमान में आप किन स्वास्थ्य समस्याओं से सबसे अधिक चिंतित हैं',
    allergens: 'एलर्जेन (वैकल्पिक)',
    otherAllergens: 'कृपया अन्य एलर्जेन दर्ज करें',
    submit: 'स्वास्थ्य रिपोर्ट उत्पन्न करें',
    reset: 'रीसेट',
    report: 'आपकी स्वास्थ्य रिपोर्ट',
    download: 'रिपोर्ट डाउनलोड करें',
    back: 'वापस',
    settings: 'सेटिंग्स',
    history: 'इतिहास',
    theme: 'थीम',
    api: 'API सेटिंग्स',
    language: 'भाषा',
    saveSettings: 'सेटिंग्स सहेजें',
    resetSettings: 'रीसेट',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा नहीं',
    error: 'त्रुटि',
    success: 'सफलता',
    warning: 'चेतावनी',
    info: 'जानकारी'
  },
  'de-DE': {
    appTitle: 'Gesundheitsmanager - System für persönliches Gesundheitsmanagement und -analyse',
    inputData: 'Geben Sie Ihre Gesundheitsdaten ein',
    height: 'Größe (cm)',
    weight: 'Gewicht (kg)',
    age: 'Alter',
    gender: 'Geschlecht',
    genderOptions: {
      select: 'Bitte auswählen',
      male: 'Männlich',
      female: 'Weiblich',
      other: 'Andere'
    },
    bloodPressure: 'Blutdruck (mmHg)',
    systolic: 'Systolisch',
    diastolic: 'Diastolisch',
    heartRate: 'Herzfrequenz (bpm)',
    sleepHours: 'Durchschnittliche Schlafdauer (Stunden)',
    exerciseFrequency: 'Wöchentliche Trainingsfrequenz',
    exerciseOptions: {
      select: 'Bitte auswählen',
      none: 'Kein Training',
      few: '1-2 mal',
      some: '3-4 mal',
      many: '5+ mal'
    },
    medical: 'Krankengeschichte (optional)',
    medicalPlaceholder: 'Bitte beschreiben Sie Ihre Krankengeschichte, Familiengeschichte oder aktuelle Medikamente',
    lifestyle: 'Lebensstilgewohnheiten',
    lifestylePlaceholder: 'Bitte beschreiben Sie Ihre tägliche Routine, Trainingsgewohnheiten, Arbeitsart usw.',
    diet: 'Ernährungsgewohnheiten',
    dietPlaceholder: 'Bitte beschreiben Sie Ihre tägliche Ernährungsstruktur, Vorlieben, Einschränkungen usw.',
    concern: 'Hauptgesundheitsbedenken (optional)',
    concernPlaceholder: 'Welche Gesundheitsprobleme bereiten Ihnen derzeit am meisten Sorgen',
    allergens: 'Allergene (optional)',
    otherAllergens: 'Bitte geben Sie andere Allergene ein',
    submit: 'Gesundheitsbericht erstellen',
    reset: 'Zurücksetzen',
    report: 'Ihr Gesundheitsbericht',
    download: 'Bericht herunterladen',
    back: 'Zurück',
    settings: 'Einstellungen',
    history: 'Verlauf',
    theme: 'Thema',
    api: 'API-Einstellungen',
    language: 'Sprache',
    saveSettings: 'Einstellungen speichern',
    resetSettings: 'Zurücksetzen',
    loading: 'Laden...',
    noData: 'Keine Daten',
    error: 'Fehler',
    success: 'Erfolg',
    warning: 'Warnung',
    info: 'Info'
  },
  'ur-PK': {
    appTitle: 'صحت منیجر - ذاتی صحت کے انتظام اور تجزیہ کا نظام',
    inputData: 'اپنا صحت کا ڈیٹا درج کریں',
    height: 'قد (سینٹی میٹر)',
    weight: 'وزن (کلوگرام)',
    age: 'عمر',
    gender: 'جنس',
    genderOptions: {
      select: 'براہ کرم منتخب کریں',
      male: 'مرد',
      female: 'عورت',
      other: 'دیگر'
    },
    bloodPressure: 'بلڈ پریشر (mmHg)',
    systolic: 'سسٹولک',
    diastolic: 'ڈایسٹولک',
    heartRate: 'دل کی دھڑکن (bpm)',
    sleepHours: 'اوسط نیند کی مدت (گھنٹے)',
    exerciseFrequency: 'ہفتہ وار ورزش کی تعداد',
    exerciseOptions: {
      select: 'براہ کرم منتخب کریں',
      none: 'کوئی ورزش نہیں',
      few: '1-2 بار',
      some: '3-4 بار',
      many: '5+ بار'
    },
    medical: 'طبی تاریخ (اختیاری)',
    medicalPlaceholder: 'براہ کرم اپنی طبی تاریخ، خاندانی تاریخ یا موجودہ ادویات کی وضاحت کریں',
    lifestyle: 'طرز زندگی کی عادات',
    lifestylePlaceholder: 'براہ کرم اپنی روزانہ کی روٹین، ورزش کی عادات، کام کی نوعیت وغیرہ کی وضاحت کریں',
    diet: 'غذائی عادات',
    dietPlaceholder: 'براہ کرم اپنی روزانہ کی غذائی ساخت، ترجیحات، پابندیاں وغیرہ کی وضاحت کریں',
    concern: 'اہم صحت کی تشویشات (اختیاری)',
    concernPlaceholder: 'آپ فی الحال کن صحت کے مسائل سے سب سے زیادہ فکر مند ہیں',
    allergens: 'الرجن (اختیاری)',
    otherAllergens: 'براہ کرم دیگر الرجن درج کریں',
    submit: 'صحت کی رپورٹ بنائیں',
    reset: 'دوبارہ ترتیب دیں',
    report: 'آپ کی صحت کی رپورٹ',
    download: 'رپورٹ ڈاؤن لوڈ کریں',
    back: 'واپس',
    settings: 'ترتیبات',
    history: 'تاریخ',
    theme: 'تھیم',
    api: 'API ترتیبات',
    language: 'زبان',
    saveSettings: 'ترتیبات محفوظ کریں',
    resetSettings: 'دوبارہ ترتیب دیں',
    loading: 'لوڈ ہو رہا ہے...',
    noData: 'کوئی ڈیٹا نہیں',
    error: 'خرابی',
    success: 'کامیابی',
    warning: 'انتباہ',
    info: 'معلومات',
    // صحت چارٹ سے متعلق ترجمے
    healthChart: 'صحت کا ریکارڈ چارٹ',
    recordChart: 'ریکارڈ چارٹ',
    closeChart: 'چارٹ بند کریں',
    healthScore: 'صحت کا اسکور',
    chartMetrics: {
      healthScore: 'صحت کا اسکور',
      weight: 'وزن',
      bmi: 'بی ایم آئی',
      bloodPressure: 'بلڈ پریشر',
      heartRate: 'دل کی دھڑکن'
    },
    expandChart: 'توسیع کریں',
    languageSettings: 'زبان کی ترتیبات',
    selectLanguage: 'زبان منتخب کریں',
    languageInfo: 'زبان تبدیل کرنے سے انٹرفیس کا متن، پیمائشی یونٹس اور صحت کے معیارات تبدیل ہو جائیں گے۔',
    themeSettings: 'تھیم کی ترتیبات',
    themeOptions: 'تھیم کے اختیارات',
    lightTheme: 'روشن',
    darkTheme: 'تاریک',
    goldTheme: 'سنہری',
    backgroundImage: 'پس منظر کی تصویر',
    noBackground: 'کوئی پس منظر نہیں',
    localImage: 'مقامی تصویر',
    imageUrl: 'تصویر کا URL',
    selectFile: 'فائل منتخب کریں',
    clear: 'صاف کریں',
    apply: 'لاگو کریں',
    backgroundPreview: 'پس منظر کا پیش نظارہ',
    backgroundAdjustments: 'پس منظر کی تصویر کی ایڈجسٹمنٹس',
    opacity: 'غیر شفافیت',
    blurLevel: 'دھندلاپن کی سطح',
    zIndex: 'Z-انڈیکس',
    zIndexDescription: 'منفی اقدار مواد کے پیچھے، مثبت اقدار مواد کے سامنے',
    animationEffects: 'اینیمیشن کے اثرات',
    animationDescription: 'کلک کرتے وقت بے ترتیب رنگین کاوموجی یا ایموجی دکھائیں',
    pageOpacity: 'صفحہ کی غیر شفافیت',
    pageOpacityDescription: 'اپنا صحت کا ڈیٹا درج کریں صفحہ کے پس منظر کی شفافیت کو ایڈجسٹ کریں',
    fontOpacity: 'فونٹ کی غیر شفافیت',
    fontOpacityDescription: 'صفحہ کے متن کی شفافیت کو ایڈجسٹ کریں',
    supportAuthor: 'مصنف کی حمایت کریں',
    apiSettings: 'API ترتیبات',
    apiKey: 'API کلید',
    apiEndpoint: 'API اینڈپوائنٹ',
    apiModel: 'API ماڈل',
    apiProvider: 'API فراہم کنندہ',
    apiUsageInfo: 'API استعمال کی معلومات',
    remainingCalls: 'باقی API کالز',
    totalCalls: 'کل API کالز کی گئیں',
    resetUsage: 'استعمال کا ڈیٹا دوبارہ ترتیب دیں',
    customApiSettings: 'حسب ضرورت API ترتیبات',
    useCustomApi: 'حسب ضرورت API استعمال کریں',
    exportOptions: 'برآمد کے اختیارات',
    exportSelectedRecords: 'منتخب ریکارڈز برآمد کریں',
    historyChart: 'تاریخ کا چارٹ',
    unitConverter: 'یونٹ کنورٹر',
    convertFrom: 'تبدیل کریں از',
    convertTo: 'تبدیل کریں میں',
    conversionResult: 'تبدیلی کا نتیجہ',
    convertValue: 'تبدیل کرنے کی قیمت',
    convertButton: 'تبدیل کریں',
    conversionFormula: 'تبدیلی کا فارمولا',
    measurementType: 'پیمائش کی قسم',
    lengthUnits: 'لمبائی',
    weightUnits: 'وزن',
    temperatureUnits: 'درجہ حرارت',
    volumeUnits: 'حجم',
    areaUnits: 'رقبہ',
    addCustomField: 'حسب ضرورت فیلڈ شامل کریں',
    customFieldName: 'فیلڈ کا نام',
    customFieldValue: 'قیمت',
    customFieldUnit: 'یونٹ (اختیاری)',
    deleteField: 'فیلڈ حذف کریں',
    closeConverter: 'کنورٹر بند کریں'
  }
};

// 主题设置
let currentTheme = 'light';
let customBackground = null;
let animationEnabled = false;

// DOM元素
const healthForm = document.getElementById('healthForm');
const reportSection = document.getElementById('reportSection');
const reportContent = document.getElementById('reportContent');
const formSection = document.querySelector('.form-section');
const backToFormBtn = document.getElementById('backToFormBtn');
const downloadBtn = document.getElementById('downloadBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const historyList = document.getElementById('historyList');
const exportPanel = document.getElementById('exportPanel');
const exportBtn = document.getElementById('exportBtn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const allergenOther = document.getElementById('allergenOther');
const otherAllergens = document.getElementById('otherAllergens');

// API设置相关元素
const apiProvider = document.getElementById('apiProvider');
const customApiSettings = document.getElementById('customApiSettings');
const apiEndpoint = document.getElementById('apiEndpoint');
const apiKey = document.getElementById('apiKey');
const apiModel = document.getElementById('apiModel');
const apiHeaders = document.getElementById('apiHeaders');
const saveApiSettings = document.getElementById('saveApiSettings');
const resetApiSettings = document.getElementById('resetApiSettings');

// 主题设置相关元素
const themeOptions = document.querySelectorAll('.theme-option');
const bgTypeRadios = document.querySelectorAll('input[name="bgType"]');
const bgLocalContainer = document.getElementById('bgLocalContainer');
const bgUrlContainer = document.getElementById('bgUrlContainer');
const bgLocalFile = document.getElementById('bgLocalFile');
const bgUrlInput = document.getElementById('bgUrlInput');
const applyBgUrl = document.getElementById('applyBgUrl');
const clearBgLocal = document.getElementById('clearBgLocal');
const bgPreview = document.getElementById('bgPreview');
const bgPreviewImg = document.getElementById('bgPreviewImg');
const bgAdjustments = document.getElementById('bgAdjustments');
const bgOpacity = document.getElementById('bgOpacity');
const bgOpacityValue = document.getElementById('bgOpacityValue');
const bgBlur = document.getElementById('bgBlur');
const bgBlurValue = document.getElementById('bgBlurValue');
const bgZIndex = document.getElementById('bgZIndex');
const bgZIndexValue = document.getElementById('bgZIndexValue');
const animationSwitch = document.getElementById('animationSwitch');
const formOpacity = document.getElementById('formOpacity');
const opacityValue = document.getElementById('opacityValue');
const fontOpacity = document.getElementById('fontOpacity');
const fontOpacityValue = document.getElementById('fontOpacityValue');
const saveThemeSettings = document.getElementById('saveThemeSettings');
const resetThemeSettings = document.getElementById('resetThemeSettings');

// 表情和颜文字列表
const emojis = ['😊', '😂', '🎉', '✨', '❤️', '👍', '🌟', '🔥', '💯', '🙌', '👏', '💪', '🤩', '😍', '🥳'];
const kaomojis = ['(≧▽≦)', '(✿◠‿◠)', '(◕‿◕✿)', '(づ｡◕‿‿◕｡)づ', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(｡♥‿♥｡)', 'ヽ(・∀・)ﾉ', '(●´ω｀●)', '(≧◡≦)', '(´• ω •`)'];

// 当前报告数据
let currentReportData = null;
// 当前选中的历史记录
let selectedHistoryItem = null;

// 背景图片设置
let bgSettings = {
  opacity: 100,
  blur: 0,
  zIndex: 0
};

// 语言设置相关元素
const languageOptions = document.querySelectorAll('.language-option');
const saveLanguageSettings = document.getElementById('saveLanguageSettings');

// 单位换算定义
const unitDefinitions = {
  length: {
    units: {
      'm': { name: '米', nameEN: 'meter', factor: 1 },
      'cm': { name: '厘米', nameEN: 'centimeter', factor: 0.01 },
      'mm': { name: '毫米', nameEN: 'millimeter', factor: 0.001 },
      'km': { name: '千米', nameEN: 'kilometer', factor: 1000 },
      'in': { name: '英寸', nameEN: 'inch', factor: 0.0254 },
      'ft': { name: '英尺', nameEN: 'foot', factor: 0.3048 },
      'yd': { name: '码', nameEN: 'yard', factor: 0.9144 },
      'mi': { name: '英里', nameEN: 'mile', factor: 1609.344 },
      'li': { name: '里', nameEN: 'li', factor: 500 },
      'chi': { name: '尺', nameEN: 'chi', factor: 0.333 },
      'cun': { name: '寸', nameEN: 'cun', factor: 0.0333 },
      'zhang': { name: '丈', nameEN: 'zhang', factor: 3.33 }
    },
    baseUnit: 'm'
  },
  weight: {
    units: {
      'kg': { name: '千克', nameEN: 'kilogram', factor: 1 },
      'g': { name: '克', nameEN: 'gram', factor: 0.001 },
      'mg': { name: '毫克', nameEN: 'milligram', factor: 0.000001 },
      't': { name: '吨', nameEN: 'ton', factor: 1000 },
      'lb': { name: '磅', nameEN: 'pound', factor: 0.45359237 },
      'oz': { name: '盎司', nameEN: 'ounce', factor: 0.028349523125 },
      'jin': { name: '斤', nameEN: 'jin', factor: 0.5 },
      'liang': { name: '两', nameEN: 'liang', factor: 0.05 },
      'qian': { name: '钱', nameEN: 'qian', factor: 0.005 }
    },
    baseUnit: 'kg'
  },
  temperature: {
    units: {
      'C': { name: '摄氏度', nameEN: 'Celsius', factor: 1, offset: 0 },
      'F': { name: '华氏度', nameEN: 'Fahrenheit', factor: 5/9, offset: -32 * 5/9 },
      'K': { name: '开尔文', nameEN: 'Kelvin', factor: 1, offset: -273.15 }
    },
    baseUnit: 'C',
    specialConversion: true
  },
  area: {
    units: {
      'm2': { name: '平方米', nameEN: 'square meter', factor: 1 },
      'cm2': { name: '平方厘米', nameEN: 'square centimeter', factor: 0.0001 },
      'km2': { name: '平方千米', nameEN: 'square kilometer', factor: 1000000 },
      'ha': { name: '公顷', nameEN: 'hectare', factor: 10000 },
      'in2': { name: '平方英寸', nameEN: 'square inch', factor: 0.00064516 },
      'ft2': { name: '平方英尺', nameEN: 'square foot', factor: 0.09290304 },
      'yd2': { name: '平方码', nameEN: 'square yard', factor: 0.83612736 },
      'ac': { name: '英亩', nameEN: 'acre', factor: 4046.8564224 },
      'mu': { name: '亩', nameEN: 'mu', factor: 666.6666667 }
    },
    baseUnit: 'm2'
  },
  volume: {
    units: {
      'L': { name: '升', nameEN: 'liter', factor: 1 },
      'mL': { name: '毫升', nameEN: 'milliliter', factor: 0.001 },
      'm3': { name: '立方米', nameEN: 'cubic meter', factor: 1000 },
      'cm3': { name: '立方厘米', nameEN: 'cubic centimeter', factor: 0.001 },
      'in3': { name: '立方英寸', nameEN: 'cubic inch', factor: 0.016387064 },
      'ft3': { name: '立方英尺', nameEN: 'cubic foot', factor: 28.316846592 },
      'gal_us': { name: '美制加仑', nameEN: 'US gallon', factor: 3.785411784 },
      'gal_uk': { name: '英制加仑', nameEN: 'UK gallon', factor: 4.54609 },
      'sheng': { name: '升 (中国传统)', nameEN: 'sheng', factor: 1 },
      'dou': { name: '斗', nameEN: 'dou', factor: 10 },
      'dan': { name: '石', nameEN: 'dan', factor: 100 }
    },
    baseUnit: 'L'
  },
  speed: {
    units: {
      'm/s': { name: '米/秒', nameEN: 'meter per second', factor: 1 },
      'km/h': { name: '千米/时', nameEN: 'kilometer per hour', factor: 0.277777778 },
      'mph': { name: '英里/时', nameEN: 'mile per hour', factor: 0.44704 },
      'kn': { name: '节', nameEN: 'knot', factor: 0.514444444 },
      'ft/s': { name: '英尺/秒', nameEN: 'foot per second', factor: 0.3048 }
    },
    baseUnit: 'm/s'
  },
  time: {
    units: {
      's': { name: '秒', nameEN: 'second', factor: 1 },
      'min': { name: '分钟', nameEN: 'minute', factor: 60 },
      'h': { name: '小时', nameEN: 'hour', factor: 3600 },
      'd': { name: '天', nameEN: 'day', factor: 86400 },
      'wk': { name: '周', nameEN: 'week', factor: 604800 },
      'mo': { name: '月 (平均)', nameEN: 'month', factor: 2628000 },
      'y': { name: '年 (平均)', nameEN: 'year', factor: 31536000 },
      'shi': { name: '时 (古代)', nameEN: 'ancient hour', factor: 7200 },
      'ke': { name: '刻 (古代)', nameEN: 'ancient quarter', factor: 900 }
    },
    baseUnit: 's'
  },
  pressure: {
    units: {
      'Pa': { name: '帕斯卡', nameEN: 'pascal', factor: 1 },
      'kPa': { name: '千帕', nameEN: 'kilopascal', factor: 1000 },
      'MPa': { name: '兆帕', nameEN: 'megapascal', factor: 1000000 },
      'bar': { name: '巴', nameEN: 'bar', factor: 100000 },
      'atm': { name: '标准大气压', nameEN: 'atmosphere', factor: 101325 },
      'mmHg': { name: '毫米汞柱', nameEN: 'millimeter of mercury', factor: 133.322 },
      'inHg': { name: '英寸汞柱', nameEN: 'inch of mercury', factor: 3386.389 },
      'psi': { name: '磅/平方英寸', nameEN: 'pound per square inch', factor: 6894.757 }
    },
    baseUnit: 'Pa'
  },
  energy: {
    units: {
      'J': { name: '焦耳', nameEN: 'joule', factor: 1 },
      'kJ': { name: '千焦', nameEN: 'kilojoule', factor: 1000 },
      'cal': { name: '卡路里', nameEN: 'calorie', factor: 4.184 },
      'kcal': { name: '千卡', nameEN: 'kilocalorie', factor: 4184 },
      'Wh': { name: '瓦时', nameEN: 'watt hour', factor: 3600 },
      'kWh': { name: '千瓦时', nameEN: 'kilowatt hour', factor: 3600000 },
      'eV': { name: '电子伏特', nameEN: 'electronvolt', factor: 1.602176634e-19 },
      'BTU': { name: '英热单位', nameEN: 'British thermal unit', factor: 1055.05585262 }
    },
    baseUnit: 'J'
  }
};

// 不同语言的单位翻译和文本
const unitTranslations = {
  'zh-CN': {
    typeNames: {
      'length': '长度',
      'weight': '重量',
      'temperature': '温度',
      'area': '面积',
      'volume': '体积',
      'speed': '速度',
      'time': '时间',
      'pressure': '压力',
      'energy': '能量'
    },
    converterTitle: '单位换算工具',
    conversionType: '换算类型',
    fromValue: '数值',
    fromUnit: '从',
    toUnit: '到',
    displayLanguage: '显示语言',
    convert: '换算',
    instructions: '使用说明',
    instructionsText: '选择换算类型，输入数值和单位，点击"换算"按钮即可获得结果。',
    languageNote: '可以选择不同的语言来显示换算结果和公式。',
    supportedTypesTitle: '支持换算的类型：',
    equals: '等于',
    formula: '换算公式：'
  },
  'en-GB': {
    typeNames: {
      'length': 'Length',
      'weight': 'Weight',
      'temperature': 'Temperature',
      'area': 'Area',
      'volume': 'Volume',
      'speed': 'Speed',
      'time': 'Time',
      'pressure': 'Pressure',
      'energy': 'Energy'
    },
    converterTitle: 'Unit Converter Tool',
    conversionType: 'Conversion Type',
    fromValue: 'Value',
    fromUnit: 'From',
    toUnit: 'To',
    displayLanguage: 'Display Language',
    convert: 'Convert',
    instructions: 'Instructions',
    instructionsText: 'Select a conversion type, enter a value and units, then click "Convert" to get the result.',
    languageNote: 'You can select different languages to display the conversion results and formula.',
    supportedTypesTitle: 'Supported conversion types:',
    equals: 'equals',
    formula: 'Conversion formula:'
  },
  'en-US': {
    typeNames: {
      'length': 'Length',
      'weight': 'Weight',
      'temperature': 'Temperature',
      'area': 'Area',
      'volume': 'Volume',
      'speed': 'Speed',
      'time': 'Time',
      'pressure': 'Pressure',
      'energy': 'Energy'
    },
    converterTitle: 'Unit Converter Tool',
    conversionType: 'Conversion Type',
    fromValue: 'Value',
    fromUnit: 'From',
    toUnit: 'To',
    displayLanguage: 'Display Language',
    convert: 'Convert',
    instructions: 'Instructions',
    instructionsText: 'Select a conversion type, enter a value and units, then click "Convert" to get the result.',
    languageNote: 'You can select different languages to display the conversion results and formula.',
    supportedTypesTitle: 'Supported conversion types:',
    equals: 'equals',
    formula: 'Conversion formula:'
  },
  'fr-FR': {
    typeNames: {
      'length': 'Longueur',
      'weight': 'Poids',
      'temperature': 'Température',
      'area': 'Surface',
      'volume': 'Volume',
      'speed': 'Vitesse',
      'time': 'Temps',
      'pressure': 'Pression',
      'energy': 'Énergie'
    },
    converterTitle: 'Outil de Conversion d\'Unités',
    conversionType: 'Type de Conversion',
    fromValue: 'Valeur',
    fromUnit: 'De',
    toUnit: 'À',
    displayLanguage: 'Langue d\'Affichage',
    convert: 'Convertir',
    instructions: 'Instructions',
    instructionsText: 'Sélectionnez un type de conversion, entrez une valeur et des unités, puis cliquez sur "Convertir" pour obtenir le résultat.',
    languageNote: 'Vous pouvez sélectionner différentes langues pour afficher les résultats de conversion et la formule.',
    supportedTypesTitle: 'Types de conversion pris en charge:',
    equals: 'égale',
    formula: 'Formule de conversion:'
  },
  'es-ES': {
    typeNames: {
      'length': 'Longitud',
      'weight': 'Peso',
      'temperature': 'Temperatura',
      'area': 'Área',
      'volume': 'Volumen',
      'speed': 'Velocidad',
      'time': 'Tiempo',
      'pressure': 'Presión',
      'energy': 'Energía'
    },
    converterTitle: 'Herramienta de Conversión de Unidades',
    conversionType: 'Tipo de Conversión',
    fromValue: 'Valor',
    fromUnit: 'De',
    toUnit: 'A',
    displayLanguage: 'Idioma de Visualización',
    convert: 'Convertir',
    instructions: 'Instrucciones',
    instructionsText: 'Seleccione un tipo de conversión, ingrese un valor y unidades, luego haga clic en "Convertir" para obtener el resultado.',
    languageNote: 'Puede seleccionar diferentes idiomas para mostrar los resultados de la conversión y la fórmula.',
    supportedTypesTitle: 'Tipos de conversión admitidos:',
    equals: 'equivale a',
    formula: 'Fórmula de conversión:'
  },
  'zh-classical': {
    typeNames: {
      'length': '長度',
      'weight': '重量',
      'temperature': '溫度',
      'area': '面積',
      'volume': '體積',
      'speed': '速度',
      'time': '時間',
      'pressure': '壓力',
      'energy': '能量'
    },
    converterTitle: '單位換算之工具',
    conversionType: '換算之類',
    fromValue: '數值',
    fromUnit: '始',
    toUnit: '終',
    displayLanguage: '顯示之語',
    convert: '換算',
    instructions: '使用說明',
    instructionsText: '選擇換算之類，輸入數值與單位，點擊"換算"按鈕即可得結果。',
    languageNote: '可選不同之語，以顯示換算結果與公式。',
    supportedTypesTitle: '支持換算之類：',
    equals: '等於',
    formula: '換算公式：'
  },
  'pt-BR': {
    typeNames: {
      'length': 'Comprimento',
      'weight': 'Peso',
      'temperature': 'Temperatura',
      'area': 'Área',
      'volume': 'Volume',
      'speed': 'Velocidade',
      'time': 'Tempo',
      'pressure': 'Pressão',
      'energy': 'Energia'
    },
    converterTitle: 'Ferramenta de Conversão de Unidades',
    conversionType: 'Tipo de Conversão',
    fromValue: 'Valor',
    fromUnit: 'De',
    toUnit: 'Para',
    displayLanguage: 'Idioma de Exibição',
    convert: 'Converter',
    instructions: 'Instruções',
    instructionsText: 'Selecione um tipo de conversão, insira um valor e unidades, depois clique em "Converter" para obter o resultado.',
    languageNote: 'Você pode seleccionar diferentes idiomas para exibir os resultados da conversão e a fórmula.',
    supportedTypesTitle: 'Tipos de conversão suportados:',
    equals: 'é igual a',
    formula: 'Fórmula de conversão:'
  },
  'hi-IN': {
    typeNames: {
      'length': 'लंबाई',
      'weight': 'वजन',
      'temperature': 'दर्जा हरारत',
      'area': 'क्षेत्रफल',
      'volume': 'आयतन',
      'speed': 'गति',
      'time': 'समय',
      'pressure': 'दबाव',
      'energy': 'ऊर्जा'
    },
    converterTitle: 'इकाई परिवर्तन उपकरण',
    conversionType: 'परिवर्तन प्रकार',
    fromValue: 'मान',
    fromUnit: 'से',
    toUnit: 'तक',
    displayLanguage: 'प्रदर्शन भाषा',
    convert: 'परिवर्तित करें',
    instructions: 'निर्देश',
    instructionsText: 'परिवर्तन प्रकार चुनें, मान और इकाइयां दर्ज करें, फिर परिणाम प्राप्त करने के लिए "परिवर्तित करें" पर क्लिक करें।',
    languageNote: 'आप परिवर्तन परिणामों और सूत्र को प्रदर्शित करने के लिए विभिन्न भाषाएँ चुन सकते हैं।',
    supportedTypesTitle: 'समर्थित परिवर्तन प्रकार:',
    equals: 'बराबर है',
    formula: 'परिवर्तन सूत्र:'
  },
  'de-DE': {
    typeNames: {
      'length': 'Länge',
      'weight': 'Gewicht',
      'temperature': 'Temperatur',
      'area': 'Fläche',
      'volume': 'Volumen',
      'speed': 'Geschwindigkeit',
      'time': 'Zeit',
      'pressure': 'Druck',
      'energy': 'Energie'
    },
    converterTitle: 'Einheitenumrechnungstool',
    conversionType: 'Umrechnungstyp',
    fromValue: 'Wert',
    fromUnit: 'Von',
    toUnit: 'Nach',
    displayLanguage: 'Anzeigesprache',
    convert: 'Umrechnen',
    instructions: 'Anleitung',
    instructionsText: 'Wählen Sie einen Umrechnungstyp, geben Sie einen Wert und Einheiten ein, und klicken Sie dann auf "Umrechnen", um das Ergebnis zu erhalten.',
    languageNote: 'Sie können verschiedene Sprachen auswählen, um die Umrechnungsergebnisse und die Formel anzuzeigen.',
    supportedTypesTitle: 'Unterstützte Umrechnungstypen:',
    equals: 'ist gleich',
    formula: 'Umrechnungsformel:'
  },
  'ur-PK': {
    typeNames: {
      'length': 'لمبائی',
      'weight': 'وزن',
      'temperature': 'درجہ حرارت',
      'area': 'رقبہ',
      'volume': 'حجم',
      'speed': 'رفتار',
      'time': 'وقت',
      'pressure': 'دباؤ',
      'energy': 'توانائی'
    },
    converterTitle: 'یونٹ تبدیلی کا آلہ',
    conversionType: 'تبدیلی کی قسم',
    fromValue: 'قیمت',
    fromUnit: 'سے',
    toUnit: 'تک',
    displayLanguage: 'ڈسپلے کی زبان',
    convert: 'تبدیل کریں',
    instructions: 'ہدایات',
    instructionsText: 'تبدیلی کی قسم منتخب کریں، قیمت اور یونٹس درج کریں، پھر نتیجہ حاصل کرنے کے لیے "تبدیل کریں" پر کلک کریں۔',
    languageNote: 'آپ تبدیلی کے نتائج اور فارمولہ دکھانے کے لیے مختلف زبانیں منتخب کر سکتے ہیں۔',
    supportedTypesTitle: 'سپورٹ شدہ تبدیلی کی اقسام:',
    equals: 'برابر ہے',
    formula: 'تبدیلی کا فارمولہ:'
  }
};

// 初始化单位选择器
function initializeUnitConverter() {
  const conversionTypeSelect = document.getElementById('conversionType');
  const fromUnitSelect = document.getElementById('fromUnit');
  const toUnitSelect = document.getElementById('toUnit');
  const converterLanguageSelect = document.getElementById('converterLanguage');
  const fromValueInput = document.getElementById('fromValue');
  const convertBtn = document.getElementById('convertBtn');
  const resultValueSpan = document.getElementById('resultValue');
  const resultFormulaSpan = document.getElementById('resultFormula');
  
  // 绑定事件处理程序
  conversionTypeSelect.addEventListener('change', updateUnitOptions);
  convertBtn.addEventListener('click', performConversion);
  converterLanguageSelect.addEventListener('change', updateConverterLanguage);
  
  // 初始化转换类型选项
  updateUnitOptions();
  
  // 更新转换器语言到当前系统语言
  converterLanguageSelect.value = currentLanguage;
  updateConverterLanguage();
  
  // 更新单位选项
  function updateUnitOptions() {
    const selectedType = conversionTypeSelect.value;
    const unitType = unitDefinitions[selectedType];
    
    if (!unitType) return;
    
    // 清空当前选项
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    
    // 添加新选项
    Object.keys(unitType.units).forEach(unitKey => {
      const unit = unitType.units[unitKey];
      
      const fromOption = document.createElement('option');
      fromOption.value = unitKey;
      fromOption.textContent = `${unit.name} (${unitKey})`;
      fromUnitSelect.appendChild(fromOption);
      
      const toOption = document.createElement('option');
      toOption.value = unitKey;
      toOption.textContent = `${unit.name} (${unitKey})`;
      toUnitSelect.appendChild(toOption);
    });
    
    // 默认选择不同的单位
    if (fromUnitSelect.options.length > 0) {
      fromUnitSelect.selectedIndex = 0;
    }
    
    if (toUnitSelect.options.length > 1) {
      toUnitSelect.selectedIndex = 1;
    } else if (toUnitSelect.options.length > 0) {
      toUnitSelect.selectedIndex = 0;
    }
  }
  
  // 执行单位转换
  function performConversion() {
    const selectedType = conversionTypeSelect.value;
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    const fromValue = parseFloat(fromValueInput.value);
    const selectedLanguage = converterLanguageSelect.value;
    
    if (isNaN(fromValue)) {
      showToast('请输入有效的数值', 'error');
      return;
    }
    
    const unitType = unitDefinitions[selectedType];
    if (!unitType) return;
    
    let result, formula;
    
    // 处理特殊的温度转换
    if (selectedType === 'temperature' && unitType.specialConversion) {
      result = convertTemperature(fromValue, fromUnit, toUnit);
      formula = getTemperatureFormula(fromValue, fromUnit, toUnit, selectedLanguage);
    } else {
      // 标准线性转换
      const fromFactor = unitType.units[fromUnit].factor;
      const toFactor = unitType.units[toUnit].factor;
      
      // 转换到基本单位，然后转换到目标单位
      const baseValue = fromValue * fromFactor;
      result = baseValue / toFactor;
      
      // 生成公式
      formula = getLinearFormula(fromValue, fromUnit, toUnit, fromFactor, toFactor, selectedLanguage);
    }
    
    // 显示结果
    const fromUnitName = getUnitName(selectedType, fromUnit, selectedLanguage);
    const toUnitName = getUnitName(selectedType, toUnit, selectedLanguage);
    const equalsText = unitTranslations[selectedLanguage]?.equals || '等于';
    
    resultValueSpan.textContent = `${fromValue} ${fromUnitName} ${equalsText} ${result.toFixed(6)} ${toUnitName}`;
    resultFormulaSpan.textContent = formula;
  }
  
  // 更新转换器语言
  function updateConverterLanguage() {
    const selectedLanguage = converterLanguageSelect.value;
    const translations = unitTranslations[selectedLanguage] || unitTranslations['zh-CN'];
    
    // 更新标题和标签
    document.querySelector('.converter-header h2').textContent = translations.converterTitle;
    document.querySelector('label[for="conversionType"]').textContent = translations.conversionType;
    document.querySelector('label[for="fromValue"]').textContent = translations.fromValue;
    document.querySelector('label[for="fromUnit"]').textContent = translations.fromUnit;
    document.querySelector('label[for="toUnit"]').textContent = translations.toUnit;
    document.querySelector('label[for="converterLanguage"]').textContent = translations.displayLanguage;
    convertBtn.textContent = translations.convert;
    
    // 更新类型选项
    conversionTypeSelect.innerHTML = '';
    Object.keys(translations.typeNames).forEach(typeKey => {
      const option = document.createElement('option');
      option.value = typeKey;
      option.textContent = translations.typeNames[typeKey];
      conversionTypeSelect.appendChild(option);
    });
    
    // 更新帮助文本
    document.querySelector('.converter-help h3').textContent = translations.instructions;
    document.querySelector('.converter-help p:nth-of-type(1)').textContent = translations.instructionsText;
    document.querySelector('.converter-help p:nth-of-type(2)').textContent = translations.languageNote;
    document.querySelector('.converter-help h4').textContent = translations.supportedTypesTitle;
    
    // 保持之前选择的类型
    const prevType = unitDefinitions[conversionTypeSelect.value] ? conversionTypeSelect.value : 'length';
    conversionTypeSelect.value = prevType;
    
    // 更新单位选项
    updateUnitOptions();
  }
  
  // 温度转换
  function convertTemperature(value, fromUnit, toUnit) {
    // 先转换到摄氏度
    let celsius;
    if (fromUnit === 'C') {
      celsius = value;
    } else if (fromUnit === 'F') {
      celsius = (value - 32) * 5/9;
    } else if (fromUnit === 'K') {
      celsius = value - 273.15;
    }
    
    // 从摄氏度转换到目标单位
    if (toUnit === 'C') {
      return celsius;
    } else if (toUnit === 'F') {
      return celsius * 9/5 + 32;
    } else if (toUnit === 'K') {
      return celsius + 273.15;
    }
    
    return 0;
  }
  
  // 获取温度转换公式
  function getTemperatureFormula(value, fromUnit, toUnit, lang) {
    const translations = unitTranslations[lang] || unitTranslations['zh-CN'];
    const formulaPrefix = translations.formula;
    
    if (fromUnit === 'C' && toUnit === 'F') {
      return `${formulaPrefix} ${value} °C × 9/5 + 32 = ${(value * 9/5 + 32).toFixed(2)} °F`;
    } else if (fromUnit === 'C' && toUnit === 'K') {
      return `${formulaPrefix} ${value} °C + 273.15 = ${(value + 273.15).toFixed(2)} K`;
    } else if (fromUnit === 'F' && toUnit === 'C') {
      return `${formulaPrefix} (${value} °F - 32) × 5/9 = ${((value - 32) * 5/9).toFixed(2)} °C`;
    } else if (fromUnit === 'F' && toUnit === 'K') {
      return `${formulaPrefix} (${value} °F - 32) × 5/9 + 273.15 = ${((value - 32) * 5/9 + 273.15).toFixed(2)} K`;
    } else if (fromUnit === 'K' && toUnit === 'C') {
      return `${formulaPrefix} ${value} K - 273.15 = ${(value - 273.15).toFixed(2)} °C`;
    } else if (fromUnit === 'K' && toUnit === 'F') {
      return `${formulaPrefix} (${value} K - 273.15) × 9/5 + 32 = ${((value - 273.15) * 9/5 + 32).toFixed(2)} °F`;
    } else {
      return `${formulaPrefix} ${value} ${getUnitName('temperature', fromUnit, lang)} = ${value} ${getUnitName('temperature', toUnit, lang)}`;
    }
  }
  
  // 获取线性转换公式
  function getLinearFormula(value, fromUnit, toUnit, fromFactor, toFactor, lang) {
    const translations = unitTranslations[lang] || unitTranslations['zh-CN'];
    const formulaPrefix = translations.formula;
    
    if (fromFactor === toFactor) {
      return `${formulaPrefix} ${value} ${getUnitName('', fromUnit, lang)} = ${value} ${getUnitName('', toUnit, lang)}`;
    }
    
    const conversionFactor = fromFactor / toFactor;
    return `${formulaPrefix} ${value} ${getUnitName('', fromUnit, lang)} × ${conversionFactor.toFixed(6)} = ${(value * conversionFactor).toFixed(6)} ${getUnitName('', toUnit, lang)}`;
  }
  
  // 根据语言获取单位名称
  function getUnitName(type, unitKey, lang) {
    if (!unitKey) return '';
    
    // 为英语和其他西方语言使用英文名称
    if (lang.startsWith('en') || lang.startsWith('fr') || lang.startsWith('es')) {
      if (type && unitDefinitions[type] && unitDefinitions[type].units[unitKey]) {
        return unitDefinitions[type].units[unitKey].nameEN;
      } else {
        // 查找所有类型中的单位
        for (const typeKey in unitDefinitions) {
          if (unitDefinitions[typeKey].units[unitKey]) {
            return unitDefinitions[typeKey].units[unitKey].nameEN;
          }
        }
      }
      return unitKey;
    }
    
    // 默认使用中文名称
    if (type && unitDefinitions[type] && unitDefinitions[type].units[unitKey]) {
      return unitDefinitions[type].units[unitKey].name;
    } else {
      // 查找所有类型中的单位
      for (const typeKey in unitDefinitions) {
        if (unitDefinitions[typeKey].units[unitKey]) {
          return unitDefinitions[typeKey].units[unitKey].name;
        }
      }
    }
    return unitKey;
  }
}

// 打开单位换算对话框
function openUnitConverter() {
  const dialog = document.getElementById('unitConverterDialog');
  const overlay = document.getElementById('converterOverlay');
  
  dialog.classList.add('active');
  overlay.classList.add('active');
  
  // 自动聚焦到数值输入框
  setTimeout(() => {
    document.getElementById('fromValue').focus();
  }, 300);
}

// 关闭单位换算对话框
function closeUnitConverter() {
  const dialog = document.getElementById('unitConverterDialog');
  const overlay = document.getElementById('converterOverlay');
  
  dialog.classList.remove('active');
  overlay.classList.remove('active');
}

// 帮助按钮点击事件
document.getElementById('helpBtn').addEventListener('click', openUnitConverter);
// 关闭按钮事件
document.getElementById('closeConverterBtn').addEventListener('click', closeUnitConverter);
// 点击遮罩层关闭对话框
document.getElementById('converterOverlay').addEventListener('click', closeUnitConverter);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化单位换算器
  initializeUnitConverter();
  
  // 调用主初始化函数
  init();
});

// 初始化函数
function init() {
  // 绑定事件监听
  healthForm.addEventListener('submit', handleFormSubmit);
  backToFormBtn.addEventListener('click', showForm);
  
  // 修改下载按钮事件，添加图表选择功能
  downloadBtn.addEventListener('click', async function() {
    // 如果没有报告数据，显示提示
    const noReportMessage = currentLanguage === 'zh-CN' ? '没有可下载的报告' :
                           currentLanguage === 'ru-RU' ? 'Нет отчета для скачивания' :
                           currentLanguage === 'ja-JP' ? 'ダウンロードできるレポートがありません' :
                           currentLanguage === 'ko-KR' ? '다운로드할 보고서가 없습니다' : 'No report to download';
    
    if (!currentReportData) {
      showToast(noReportMessage, 'warning');
      return;
    }
    
    try {
      // 显示图表选择对话框
      const chartSelectionDialog = document.getElementById('chartSelectionDialog');
      const chartDialogOverlay = document.getElementById('chartDialogOverlay');
      const closeChartDialogBtn = document.getElementById('closeChartDialogBtn');
      const chartContinueBtn = document.getElementById('chartContinueBtn');
      const chartCancelBtn = document.getElementById('chartCancelBtn');
      
      // 根据当前语言更新对话框内容
      if (currentLanguage !== 'zh-CN') {
        // 更新标题
        chartSelectionDialog.querySelector('.dialog-header h3').textContent = 
          currentLanguage === 'ru-RU' ? 'Параметры загрузки' :
          currentLanguage === 'ja-JP' ? 'ダウンロードオプション' :
          currentLanguage === 'ko-KR' ? '다운로드 옵션' : 'Download Options';
        
        // 更新描述
        chartSelectionDialog.querySelector('.dialog-content > p').textContent = 
          currentLanguage === 'ru-RU' ? 'Включить график в отчет?' :
          currentLanguage === 'ja-JP' ? 'レポートにグラフを含めますか？' :
          currentLanguage === 'ko-KR' ? '보고서에 그래프를 포함하시겠습니까?' : 'Include chart in the report?';
        
        // 更新选项标签
        const labels = chartSelectionDialog.querySelectorAll('.chart-option label');
        labels[0].textContent = 'No chart';
        labels[1].textContent = 'Include last 3 days';
        labels[2].textContent = 'Include last 7 days';
        labels[3].textContent = 'Include last 30 days';
        labels[4].textContent = 'Include last 60 days';
        
        // 更新提示信息
        chartSelectionDialog.querySelector('.format-notice').textContent = 
          currentLanguage === 'ru-RU' ? 'Примечание: Формат обычного текста (TXT) не поддерживает графики' :
          currentLanguage === 'ja-JP' ? '注意：プレーンテキスト（TXT）形式はグラフをサポートしていません' :
          currentLanguage === 'ko-KR' ? '참고: 일반 텍스트(TXT) 형식은 그래프를 지원하지 않습니다' : 
          'Note: Plain text (TXT) format does not support charts';
        
        // 更新按钮文本
        chartContinueBtn.textContent = 
          currentLanguage === 'ru-RU' ? 'Продолжить' :
          currentLanguage === 'ja-JP' ? '続行' :
          currentLanguage === 'ko-KR' ? '계속' : 'Continue';
        
        chartCancelBtn.textContent = 
          currentLanguage === 'ru-RU' ? 'Отмена' :
          currentLanguage === 'ja-JP' ? 'キャンセル' :
          currentLanguage === 'ko-KR' ? '취소' : 'Cancel';
      }
      
      // 显示对话框
      chartSelectionDialog.style.display = 'block';
      chartDialogOverlay.style.display = 'block';
      
      // 等待用户选择
      const chartDays = await new Promise(resolve => {
        // 关闭按钮事件
        closeChartDialogBtn.onclick = () => {
          chartSelectionDialog.style.display = 'none';
          chartDialogOverlay.style.display = 'none';
          resolve('cancel');
        };
        
        // 取消按钮事件
        chartCancelBtn.onclick = () => {
          chartSelectionDialog.style.display = 'none';
          chartDialogOverlay.style.display = 'none';
          resolve('cancel');
        };
        
        // 继续按钮事件
        chartContinueBtn.onclick = () => {
          const selectedOption = chartSelectionDialog.querySelector('input[name="chartOption"]:checked');
          chartSelectionDialog.style.display = 'none';
          chartDialogOverlay.style.display = 'none';
          resolve(selectedOption ? selectedOption.value : 'none');
        };
      });
      
      // 如果用户取消了操作，直接返回
      if (chartDays === 'cancel') {
        return;
      }
      
      // 获取选中的导出格式
      const formatElement = document.querySelector('input[name="exportFormat"]:checked');
      const format = formatElement ? formatElement.value : 'pdf';
      
      // 如果用户选择了包含折线图但格式是txt，显示警告
      if (chartDays !== 'none' && format === 'txt') {
        const warningMessage = currentLanguage === 'zh-CN' ? '纯文本格式不支持包含折线图，将只导出文本内容' :
                             currentLanguage === 'ru-RU' ? 'Текстовый формат не поддерживает графики, будет экспортирован только текст' :
                             currentLanguage === 'ja-JP' ? 'テキスト形式はグラフをサポートしていません。テキストのみがエクスポートされます' :
                             currentLanguage === 'ko-KR' ? '텍스트 형식은 그래프를 지원하지 않습니다. 텍스트만 내보냅니다' : 
                             'Text format does not support charts, only text will be exported';
        showToast(warningMessage, 'warning', 4000);
      }
      
      // 根据格式准备内容
      let content;
      switch (format) {
        case 'txt':
          content = currentReportData.report.replace(/#{1,6} /g, '').replace(/\*\*/g, '');
          break;
        case 'md':
          content = currentReportData.report;
          // 对于Markdown格式，警告不支持图表
          if (chartDays !== 'none') {
            const warningMessage = currentLanguage === 'zh-CN' ? 'Markdown格式暂不支持包含折线图' :
                                'Markdown format does not support embedded charts yet';
            showToast(warningMessage, 'warning', 3000);
          }
          break;
        case 'html':
          content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${currentLanguage === 'zh-CN' ? '健康报告' :
          currentLanguage === 'ru-RU' ? 'Отчет о здоровье' :
          currentLanguage === 'ja-JP' ? '健康レポート' :
          currentLanguage === 'ko-KR' ? '건강 보고서' : 'Health Report'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1890ff; }
    h2 { color: #333; margin-top: 20px; }
    p { line-height: 1.6; }
    .chart-section { margin-top: 30px; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
  </style>
</head>
<body>
  ${currentReportData.htmlContent}`;
          
          // 如果选择包含折线图且是HTML格式
          if (chartDays !== 'none') {
            content += `
  <div class="chart-section">
    <h2>${currentLanguage === 'zh-CN' ? '健康趋势图' :
          currentLanguage === 'ru-RU' ? 'График тенденций здоровья' :
          currentLanguage === 'ja-JP' ? '健康トレンドグラフ' :
          currentLanguage === 'ko-KR' ? '건강 추세 그래프' : 'Health Trend Chart'}</h2>
    <p>${currentLanguage === 'zh-CN' ? `显示最近${chartDays}天的健康数据趋势` : 
         `Showing health data trends for the last ${chartDays} days`}</p>
    <div class="chart-container">
      <!-- 这里将来可以添加实际的图表 -->
      <p style="text-align:center; color:#888;">
        ${currentLanguage === 'zh-CN' ? '图表将在下一版本中实现' : 'Chart will be implemented in the next version'}
      </p>
    </div>
  </div>`;
          }
          
          content += `
  <footer>
    <p>${currentLanguage === 'zh-CN' ? '生成时间' :
        currentLanguage === 'ru-RU' ? 'Время создания' :
        currentLanguage === 'ja-JP' ? '生成時間' :
        currentLanguage === 'ko-KR' ? '생성 시간' : 'Generated at'}: ${new Date(currentReportData.generatedAt).toLocaleString()}</p>
    <p>${currentLanguage === 'zh-CN' ? '由秤人健康系统生成' :
        currentLanguage === 'ru-RU' ? 'Создано системой управления здоровьем' :
        currentLanguage === 'ja-JP' ? 'ヘルスマネージャーシステムによって生成されました' :
        currentLanguage === 'ko-KR' ? '헬스 매니저 시스템에서 생성됨' : 'Generated by Health Manager System'}</p>
  </footer>
</body>
</html>
          `;
          break;
        default: // pdf
          content = currentReportData.report;
          
          // 对于PDF格式，警告不支持图表
          if (chartDays !== 'none') {
            const warningMessage = currentLanguage === 'zh-CN' ? 'PDF格式暂不支持包含折线图' :
                                'PDF format does not support embedded charts yet';
            showToast(warningMessage, 'warning', 3000);
          }
          break;
      }
      
      const result = await ipcRenderer.invoke('save-report', { content, format });
      
      if (result.success) {
        const successMessage = currentLanguage === 'zh-CN' ? '报告保存成功' :
                            currentLanguage === 'ru-RU' ? 'Отчет сохранен успешно' :
                            currentLanguage === 'ja-JP' ? 'レポートが正常に保存されました' :
                            currentLanguage === 'ko-KR' ? '보고서가 성공적으로 저장되었습니다' : 'Report saved successfully';
        
        showToast(successMessage, 'success');
      } else {
        const failMessage = currentLanguage === 'zh-CN' ? '保存失败' :
                         currentLanguage === 'ru-RU' ? 'Ошибка сохранения' :
                         currentLanguage === 'ja-JP' ? '保存に失敗しました' :
                         currentLanguage === 'ko-KR' ? '저장 실패' : 'Save failed';
        
        showToast(`${failMessage}: ${result.message}`, 'error');
      }
    } catch (error) {
      const errorMessage = currentLanguage === 'zh-CN' ? '保存报告出错' :
                        currentLanguage === 'ru-RU' ? 'Ошибка при сохранении отчета' :
                        currentLanguage === 'ja-JP' ? 'レポートの保存中にエラーが発生しました' :
                        currentLanguage === 'ko-KR' ? '보고서 저장 중 오류 발생' : 'Error saving report';
      
      showToast(`${errorMessage}: ${error.message}`, 'error');
    }
  });
  
  settingsBtn.addEventListener('click', toggleSettingsPanel);
  
  // 处理"其他"过敏源选项
  allergenOther.addEventListener('change', function() {
    otherAllergens.style.display = this.checked ? 'block' : 'none';
    if (!this.checked) {
      otherAllergens.value = '';
    }
  });
  
  // 初始化自定义字段功能
  initializeCustomFields();
  
  // 标签页切换
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // 激活当前标签
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 显示对应内容
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${tabName}Content`).classList.add('active');
      
      // 如果是历史记录标签，加载历史记录
      if (tabName === 'history') {
        loadHistory();
        
        // 确保记录图按钮事件绑定
        setTimeout(() => {
          const showHealthChartBtn = document.getElementById('showHealthChartBtn');
          if (showHealthChartBtn) {
            console.log('标签切换后重新绑定记录图按钮事件');
            showHealthChartBtn.onclick = function() {
              console.log('记录图按钮被点击');
              showHealthChart();
            };
          }
        }, 500); // 给一点时间让DOM更新
      }
    });
  });
  
  // 导出格式选择
  const exportFormatRadios = document.querySelectorAll('input[name="exportFormat"]');
  exportFormatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      console.log(`导出格式已更改为: ${e.target.value}`);
    });
  });
  
  // API设置相关事件
  apiProvider.addEventListener('change', toggleCustomApiSettings);
  saveApiSettings.addEventListener('click', saveApiConfiguration);
  resetApiSettings.addEventListener('click', resetApiConfiguration);
  
  // 主题设置相关事件
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      selectTheme(theme);
    });
  });
  
  bgTypeRadios.forEach(radio => {
    radio.addEventListener('change', handleBgTypeChange);
  });
  
  bgLocalFile.addEventListener('change', handleLocalFileSelect);
  applyBgUrl.addEventListener('click', handleBgUrlApply);
  clearBgLocal.addEventListener('click', clearLocalBackground);
  
  animationSwitch.addEventListener('change', function() {
    animationEnabled = this.checked;
    saveThemePreferences();
  });
  
  // 背景图片调整事件
  bgOpacity.addEventListener('input', function() {
    const value = this.value;
    bgOpacityValue.textContent = `${value}%`;
    bgSettings.opacity = value;
    updateBackgroundSettings();
  });
  
  bgBlur.addEventListener('input', function() {
    const value = this.value;
    bgBlurValue.textContent = `${value}px`;
    bgSettings.blur = value;
    updateBackgroundSettings();
  });
  
  bgZIndex.addEventListener('input', function() {
    const value = this.value;
    bgZIndexValue.textContent = value;
    bgSettings.zIndex = value;
    updateBackgroundSettings();
  });
  
  // 透明度滑块事件
  formOpacity.addEventListener('input', function() {
    const value = this.value;
    opacityValue.textContent = `${value}%`;
    updateFormOpacity(value);
  });
  
  fontOpacity.addEventListener('input', function() {
    const value = this.value;
    fontOpacityValue.textContent = `${value}%`;
    updateFontOpacity(value);
  });
  
  saveThemeSettings.addEventListener('click', saveThemePreferences);
  resetThemeSettings.addEventListener('click', resetThemePreferences);
  
  // 添加点击动画效果的事件监听
  document.addEventListener('click', handleClickAnimation);
  
  // 加载保存的API设置
  loadApiSettings();
  
  // 加载保存的主题设置
  loadThemePreferences();
  
  // 设置面板相关事件
  settingsBtn.addEventListener('click', openSettingsPanel);
  closeSettingsBtn.addEventListener('click', closeSettingsPanel);
  settingsOverlay.addEventListener('click', closeSettingsPanel);
  
  // 语言设置相关事件
  languageOptions.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      selectLanguage(lang);
    });
  });
  
  saveLanguageSettings.addEventListener('click', saveLanguagePreferences);
  
  // 加载保存的语言设置
  loadLanguagePreferences();
  
  // 创建自定义提示元素
  createToastContainer();
  
  // 支持作者按钮使用默认浏览器打开
  document.getElementById('supportAuthorBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const url = this.getAttribute('href');
    // 使用Electron的shell.openExternal打开外部浏览器
    // 如果不是在Electron环境中，则使用window.open
    if (window.electron && window.electron.shell) {
      window.electron.shell.openExternal(url);
    } else if (window.require) {
      try {
        const { shell } = require('electron');
        shell.openExternal(url);
      } catch (error) {
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  });
  
  // 初始化API使用限制
  loadApiUsageData();
  updateApiRemainingCount();
  
  // 健康记录图表相关事件
  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  const closeChartBtn = document.getElementById('closeChartBtn');
  const chartMetric = document.getElementById('chartMetric');
  
  if (showHealthChartBtn) {
    console.log('找到记录图按钮，添加点击事件');
    showHealthChartBtn.onclick = function() {
      console.log('记录图按钮被点击');
      showHealthChart();
    };
  } else {
    console.error('未找到记录图按钮元素');
  }
  
  if (closeChartBtn) {
    console.log('找到关闭图表按钮，添加点击事件');
    closeChartBtn.onclick = function() {
      console.log('关闭图表按钮被点击');
      closeHealthChart();
    };
    // 为确保事件绑定生效，添加addEventListener方式
    closeChartBtn.addEventListener('click', function() {
      console.log('关闭图表按钮通过addEventListener被点击');
      closeHealthChart();
    });
  } else {
    console.error('未找到关闭图表按钮元素');
  }
  
  if (chartMetric) {
    chartMetric.onchange = function() {
      console.log('图表指标被更改为:', this.value);
      currentMetric = this.value;
      drawHealthChart();
    };
  }
  
  // 放大图表按钮
  const expandChartBtn = document.getElementById('expandChartBtn');
  if (expandChartBtn) {
    console.log('找到放大图表按钮，添加点击事件');
    // 使用onclick方式绑定，增加兼容性
    expandChartBtn.onclick = function() {
      console.log('放大图表按钮被点击');
      showFullscreenChart();
    };
    // 同时使用addEventListener方式
    expandChartBtn.addEventListener('click', function() {
      console.log('放大图表按钮通过addEventListener被点击');
      showFullscreenChart();
    });
  } else {
    console.error('未找到放大图表按钮元素');
  }
  
  // 全屏图表相关事件
  const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
  if (closeFullscreenBtn) {
    console.log('找到关闭全屏按钮，添加点击事件');
    // 使用onclick方式绑定，增加兼容性
    closeFullscreenBtn.onclick = function() {
      console.log('关闭全屏按钮被点击');
      closeFullscreenChart();
    };
    // 同时使用addEventListener方式
    closeFullscreenBtn.addEventListener('click', function() {
      console.log('关闭全屏按钮通过addEventListener被点击');
      closeFullscreenChart();
    });
  } else {
    console.error('未找到关闭全屏按钮元素');
  }
  
  // 全屏模式下的指标切换
  const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
  if (fullscreenChartMetric) {
    console.log('找到全屏指标选择框，添加变更事件');
    fullscreenChartMetric.onchange = function() {
      console.log('全屏指标被更改为:', this.value);
      currentMetric = this.value;
      // 同时更新两个图表
      drawFullscreenChart();
      drawHealthChart();
    };
  } else {
    console.error('未找到全屏指标选择框元素');
  }
  
  // 图表相关按钮事件处理
  const setupChartButtonEvents = () => {
    console.log('正在设置图表按钮事件...');
    
    // 1. 记录图按钮
    const showHealthChartBtn = document.getElementById('showHealthChartBtn');
    if (showHealthChartBtn) {
      console.log('找到记录图按钮');
      
      // 移除所有已有的事件监听器（防止重复）
      const newShowBtn = showHealthChartBtn.cloneNode(true);
      showHealthChartBtn.parentNode.replaceChild(newShowBtn, showHealthChartBtn);
      
      // 添加新事件
      newShowBtn.addEventListener('click', function(e) {
        console.log('记录图按钮被点击', e);
        e.stopPropagation(); // 阻止事件冒泡
        showHealthChart();
      });
    } else {
      console.error('未找到记录图按钮元素');
    }
    
    // 2. 关闭图表按钮
    const closeChartBtn = document.getElementById('closeChartBtn');
    if (closeChartBtn) {
      console.log('找到关闭图表按钮');
      
      // 移除所有已有的事件监听器
      const newCloseBtn = closeChartBtn.cloneNode(true);
      closeChartBtn.parentNode.replaceChild(newCloseBtn, closeChartBtn);
      
      // 添加新事件，使用事件捕获
      newCloseBtn.addEventListener('click', function(e) {
        console.log('关闭图表按钮被点击', e);
        e.stopPropagation(); // 阻止事件冒泡
        closeHealthChart();
      }, true);
    } else {
      console.error('未找到关闭图表按钮元素');
    }
    
    // 3. 放大图表按钮
    const expandChartBtn = document.getElementById('expandChartBtn');
    if (expandChartBtn) {
      console.log('找到放大图表按钮');
      
      // 移除所有已有的事件监听器
      const newExpandBtn = expandChartBtn.cloneNode(true);
      expandChartBtn.parentNode.replaceChild(newExpandBtn, expandChartBtn);
      
      // 添加新事件，使用事件捕获
      newExpandBtn.addEventListener('click', function(e) {
        console.log('放大图表按钮被点击', e);
        e.stopPropagation(); // 阻止事件冒泡
        showFullscreenChart();
      }, true);
    } else {
      console.error('未找到放大图表按钮元素');
    }
    
    // 4. 图表指标选择框
    const chartMetric = document.getElementById('chartMetric');
    if (chartMetric) {
      console.log('找到图表指标选择框');
      
      // 移除所有已有的事件监听器
      const newChartMetric = chartMetric.cloneNode(true);
      chartMetric.parentNode.replaceChild(newChartMetric, chartMetric);
      
      // 添加新事件
      newChartMetric.addEventListener('change', function(e) {
        console.log('图表指标被更改为:', this.value);
        currentMetric = this.value;
        drawHealthChart();
      });
    } else {
      console.error('未找到图表指标选择框元素');
    }
    
    // 5. 关闭全屏按钮
    const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
    if (closeFullscreenBtn) {
      console.log('找到关闭全屏按钮');
      
      // 移除所有已有的事件监听器
      const newCloseFullBtn = closeFullscreenBtn.cloneNode(true);
      closeFullscreenBtn.parentNode.replaceChild(newCloseFullBtn, closeFullscreenBtn);
      
      // 添加新事件，使用事件捕获
      newCloseFullBtn.addEventListener('click', function(e) {
        console.log('关闭全屏按钮被点击', e);
        e.stopPropagation(); // 阻止事件冒泡
        closeFullscreenChart();
      }, true);
    } else {
      console.error('未找到关闭全屏按钮元素');
    }
    
    // 6. 全屏模式下的指标切换
    const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
    if (fullscreenChartMetric) {
      console.log('找到全屏指标选择框');
      
      // 移除所有已有的事件监听器
      const newFullChartMetric = fullscreenChartMetric.cloneNode(true);
      fullscreenChartMetric.parentNode.replaceChild(newFullChartMetric, fullscreenChartMetric);
      
      // 添加新事件
      newFullChartMetric.addEventListener('change', function(e) {
        console.log('全屏指标被更改为:', this.value);
        currentMetric = this.value;
        // 同时更新两个图表
        drawFullscreenChart();
        drawHealthChart();
      });
    } else {
      console.error('未找到全屏指标选择框元素');
    }
  };
  
  // 页面加载后和图表创建后都要确保按钮事件正常
  setupChartButtonEvents();
  
  // 在页面完全加载后再次设置事件（确保所有DOM元素都已经加载完毕）
  window.addEventListener('load', function() {
    console.log('页面完全加载，重新设置图表按钮事件');
    setupChartButtonEvents();
  });
}

// 创建自定义提示容器
function createToastContainer() {
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

// 显示自定义提示
function showToast(message, type = 'info', duration = 3000) {
  const toastContainer = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  
  // 根据类型设置图标
  switch(type) {
    case 'success':
      icon.innerHTML = '✓';
      break;
    case 'error':
      icon.innerHTML = '✗';
      break;
    case 'warning':
      icon.innerHTML = '!';
      break;
    default:
      icon.innerHTML = 'i';
  }
  
  const content = document.createElement('div');
  content.className = 'toast-content';
  content.textContent = message;
  
  toast.appendChild(icon);
  toast.appendChild(content);
  toastContainer.appendChild(toast);
  
  // 淡入效果
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // 设置自动消失
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, duration);
}

// 切换自定义API设置显示
function toggleCustomApiSettings() {
  if (apiProvider.value === 'custom') {
    customApiSettings.style.display = 'block';
  } else {
    customApiSettings.style.display = 'none';
  }
}

// 保存API配置
function saveApiConfiguration() {
  const provider = apiProvider.value;
  
  if (provider === 'custom') {
    const endpoint = apiEndpoint.value.trim();
    const key = apiKey.value.trim();
    const model = apiModel.value.trim();
    let headers = {};
    
    try {
      if (apiHeaders.value.trim()) {
        headers = JSON.parse(apiHeaders.value.trim());
      }
    } catch (error) {
      showToast('请提供有效的JSON格式的请求头', 'error');
      return;
    }
    
    // 保存API配置
    localStorage.setItem('apiProvider', provider);
    localStorage.setItem('apiEndpoint', endpoint);
    localStorage.setItem('apiKey', key);
    localStorage.setItem('apiModel', model);
    localStorage.setItem('apiHeaders', JSON.stringify(headers));
    
    showToast('API 设置已保存', 'success');
  } else {
    // 使用默认API
    localStorage.setItem('apiProvider', provider);
    localStorage.removeItem('apiEndpoint');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('apiModel');
    localStorage.removeItem('apiHeaders');
    
    showToast('已切换至默认 API', 'success');
  }
  
  // 关闭设置面板
  closeSettingsPanel();
  
  // 更新API剩余次数显示
  updateApiRemainingCount();
}

// 重置API配置
function resetApiConfiguration() {
  apiProvider.value = 'default';
  apiEndpoint.value = '';
  apiKey.value = '';
  apiModel.value = '';
  apiHeaders.value = '';
  customApiSettings.style.display = 'none';
  customAPIConfig = null;
  currentAPI = 'tongyi';
  localStorage.removeItem('customAPIConfig');
  showToast('API设置已重置', 'info');
}

// 加载保存的API设置
function loadApiSettings() {
  const provider = localStorage.getItem('apiProvider') || 'default';
  apiProvider.value = provider;
  
  if (provider === 'custom') {
    apiEndpoint.value = localStorage.getItem('apiEndpoint') || '';
    apiKey.value = localStorage.getItem('apiKey') || '';
    apiModel.value = localStorage.getItem('apiModel') || '';
    apiHeaders.value = localStorage.getItem('apiHeaders') || '';
    customApiSettings.style.display = 'block';
  } else {
    customApiSettings.style.display = 'none';
  }
  
  // 加载API使用数据并更新显示
  loadApiUsageData();
  updateApiRemainingCount();
}

// 选择主题
function selectTheme(theme) {
  // 移除之前的主题类
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-gold');
  
  // 添加新主题类
  if (theme !== 'light') {
    document.body.classList.add(`theme-${theme}`);
  }
  
  // 更新当前主题
  currentTheme = theme;
  
  // 更新主题选项的选中状态
  themeOptions.forEach(option => {
    if (option.dataset.theme === theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // 更新背景透明度颜色
  updateFormOpacity(formOpacity.value);
}

// 处理背景类型变更
function handleBgTypeChange() {
  const bgType = document.querySelector('input[name="bgType"]:checked').value;
  
  // 隐藏所有容器
  bgLocalContainer.style.display = 'none';
  bgUrlContainer.style.display = 'none';
  bgPreview.style.display = 'none';
  bgAdjustments.style.display = 'none';
  
  // 根据选择显示对应容器
  switch (bgType) {
    case 'local':
      bgLocalContainer.style.display = 'flex';
      if (customBackground && customBackground.type === 'local') {
        bgPreview.style.display = 'block';
        bgAdjustments.style.display = 'block';
      }
      break;
    case 'url':
      bgUrlContainer.style.display = 'flex';
      if (customBackground && customBackground.type === 'url') {
        bgPreview.style.display = 'block';
        bgAdjustments.style.display = 'block';
      }
      break;
    case 'none':
    default:
      // 移除背景
      removeCustomBackground();
      break;
  }
}

// 处理本地文件选择
function handleLocalFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    // 根据当前语言显示错误消息
    const errorMessage = currentLanguage === 'zh-CN' ? '请选择有效的图片文件' :
                        currentLanguage === 'ru-RU' ? 'Пожалуйста, выберите корректный файл изображения' :
                        currentLanguage === 'ja-JP' ? '有効な画像ファイルを選択してください' :
                        currentLanguage === 'ko-KR' ? '유효한 이미지 파일을 선택하세요' : 'Please select a valid image file';
    
    showToast(errorMessage, 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const dataUrl = event.target.result;
    
    // 更新预览
    bgPreviewImg.src = dataUrl;
    bgPreview.style.display = 'block';
    bgAdjustments.style.display = 'block';
    
    // 保存背景设置
    customBackground = {
      type: 'local',
      data: dataUrl
    };
    
    // 应用背景
    applyBackground();
  };
  
  reader.readAsDataURL(file);
}

// 处理URL背景应用
function handleBgUrlApply() {
  const url = bgUrlInput.value.trim();
  
  if (!url) {
    // 根据当前语言显示警告消息
    const warningMessage = currentLanguage === 'zh-CN' ? '请输入有效的图片URL' :
                          currentLanguage === 'ru-RU' ? 'Пожалуйста, введите корректный URL изображения' :
                          currentLanguage === 'ja-JP' ? '有効な画像URLを入力してください' :
                          currentLanguage === 'ko-KR' ? '유효한 이미지 URL을 입력하세요' : 'Please enter a valid image URL';
    
    showToast(warningMessage, 'warning');
    return;
  }
  
  // 加载图片以验证URL
  const img = new Image();
  img.onload = function() {
    // URL有效，更新预览
    bgPreviewImg.src = url;
    bgPreview.style.display = 'block';
    bgAdjustments.style.display = 'block';
    
    // 保存背景设置
    customBackground = {
      type: 'url',
      data: url
    };
    
    // 应用背景
    applyBackground();
    
    // 根据当前语言显示成功消息
    const successMessage = currentLanguage === 'zh-CN' ? '背景图片已应用' :
                          currentLanguage === 'ru-RU' ? 'Фоновое изображение применено' :
                          currentLanguage === 'ja-JP' ? '背景画像が適用されました' :
                          currentLanguage === 'ko-KR' ? '배경 이미지가 적용되었습니다' : 'Background image applied';
    
    showToast(successMessage, 'success');
  };
  
  img.onerror = function() {
    // 根据当前语言显示错误消息
    const errorMessage = currentLanguage === 'zh-CN' ? '无法加载图片，请检查URL是否有效' :
                        currentLanguage === 'ru-RU' ? 'Не удалось загрузить изображение, проверьте корректность URL' :
                        currentLanguage === 'ja-JP' ? '画像を読み込めません。URLが有効か確認してください' :
                        currentLanguage === 'ko-KR' ? '이미지를 로드할 수 없습니다. URL이 유효한지 확인하세요' : 'Could not load image, please check if the URL is valid';
    
    showToast(errorMessage, 'error');
  };
  
  img.src = url;
}

// 清除本地背景
function clearLocalBackground() {
  bgLocalFile.value = '';
  bgPreview.style.display = 'none';
  bgAdjustments.style.display = 'none';
  customBackground = null;
  removeCustomBackground();
}

// 移除自定义背景
function removeCustomBackground() {
  // 移除已有的背景容器
  const existingBgContainer = document.querySelector('.bg-container-wrapper');
  if (existingBgContainer) {
    document.body.removeChild(existingBgContainer);
  }
  
  document.body.style.backgroundImage = '';
  document.body.classList.remove('custom-bg');
}

// 更新背景设置
function updateBackgroundSettings() {
  const bgContainer = document.querySelector('.bg-image');
  if (bgContainer) {
    // 应用透明度
    bgContainer.style.opacity = bgSettings.opacity / 100;
    
    // 应用模糊度
    bgContainer.style.filter = `blur(${bgSettings.blur}px)`;
    
    // 应用层级
    const bgWrapper = document.querySelector('.bg-container-wrapper');
    bgWrapper.style.zIndex = bgSettings.zIndex;
    
    if (bgSettings.zIndex > 0) {
      bgWrapper.classList.add('front');
    } else {
      bgWrapper.classList.remove('front');
    }
  }
}

// 应用背景
function applyBackground() {
  // 移除之前的背景
  removeCustomBackground();
  
  // 如果有自定义背景，应用它
  if (customBackground) {
    // 创建背景容器
    const bgWrapper = document.createElement('div');
    bgWrapper.className = 'bg-container-wrapper';
    
    const bgImage = document.createElement('div');
    bgImage.className = 'bg-image';
    bgImage.style.backgroundImage = `url("${customBackground.data}")`;
    
    bgWrapper.appendChild(bgImage);
    document.body.appendChild(bgWrapper);
    
    // 应用背景设置
    updateBackgroundSettings();
    
    document.body.classList.add('custom-bg');
  }
}

// 更新表单透明度
function updateFormOpacity(value) {
  const opacity = value / 100;
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    
    // 如果是深色主题，使用深色背景
    if (currentTheme === 'dark') {
      mainContent.style.backgroundColor = `rgba(31, 31, 31, ${opacity})`;
    } 
    // 如果是金色主题，使用金色背景
    else if (currentTheme === 'gold') {
      mainContent.style.backgroundColor = `rgba(250, 245, 230, ${opacity})`;
    }
  }
}

// 更新字体透明度
function updateFontOpacity(value) {
  const opacity = value / 100;
  const textElements = document.querySelectorAll('.form-section label, .form-section h2, .form-section input, .form-section select, .form-section textarea');
  
  textElements.forEach(element => {
    element.style.opacity = opacity;
  });
}

// 保存主题偏好
function saveThemePreferences() {
  // 收集当前设置
  const preferences = {
    theme: currentTheme,
    background: customBackground,
    bgSettings: bgSettings,
    animation: animationSwitch.checked,
    formOpacity: formOpacity.value,
    fontOpacity: fontOpacity.value
  };
  
  // 保存到本地存储
  localStorage.setItem('themePreferences', JSON.stringify(preferences));
  
  // 应用设置
  selectTheme(currentTheme);
  applyBackground();
  animationEnabled = animationSwitch.checked;
  updateFormOpacity(formOpacity.value);
  updateFontOpacity(fontOpacity.value);
  
  // 关闭设置面板
  closeSettingsPanel();
  
  // 根据当前语言显示成功消息
  const successMessage = currentLanguage === 'zh-CN' ? '主题设置已保存' :
                        currentLanguage === 'ru-RU' ? 'Настройки темы сохранены' :
                        currentLanguage === 'ja-JP' ? 'テーマ設定が保存されました' :
                        currentLanguage === 'ko-KR' ? '테마 설정이 저장되었습니다' : 'Theme settings saved';
  
  showToast(successMessage, 'success');
}

// 重置主题偏好
function resetThemePreferences() {
  // 重置为默认设置
  currentTheme = 'light';
  customBackground = null;
  animationEnabled = false;
  
  // 重置背景设置
  bgSettings = {
    opacity: 100,
    blur: 0,
    zIndex: 0
  };
  
  // 更新UI
  selectTheme('light');
  removeCustomBackground();
  document.getElementById('bgNone').checked = true;
  bgLocalFile.value = '';
  bgUrlInput.value = '';
  bgPreview.style.display = 'none';
  bgAdjustments.style.display = 'none';
  bgOpacity.value = 100;
  bgOpacityValue.textContent = '100%';
  bgBlur.value = 0;
  bgBlurValue.textContent = '0px';
  bgZIndex.value = 0;
  bgZIndexValue.textContent = '0';
  animationSwitch.checked = false;
  formOpacity.value = 100;
  opacityValue.textContent = '100%';
  fontOpacity.value = 100;
  fontOpacityValue.textContent = '100%';
  
  // 应用重置的设置
  updateFormOpacity(100);
  updateFontOpacity(100);
  
  // 触发背景类型变更处理
  handleBgTypeChange();
  
  // 从本地存储中移除
  localStorage.removeItem('themePreferences');
  
  // 根据当前语言显示信息消息
  const infoMessage = currentLanguage === 'zh-CN' ? '主题设置已重置' :
                     currentLanguage === 'ru-RU' ? 'Настройки темы сброшены' :
                     currentLanguage === 'ja-JP' ? 'テーマ設定がリセットされました' :
                     currentLanguage === 'ko-KR' ? '테마 설정이 초기화되었습니다' : 'Theme settings reset';
  
  showToast(infoMessage, 'info');
}

// 加载主题偏好
function loadThemePreferences() {
  const savedPreferences = localStorage.getItem('themePreferences');
  
  if (savedPreferences) {
    try {
      const preferences = JSON.parse(savedPreferences);
      
      // 应用主题
      currentTheme = preferences.theme || 'light';
      selectTheme(currentTheme);
      
      // 加载背景设置
      if (preferences.bgSettings) {
        bgSettings = preferences.bgSettings;
        bgOpacity.value = bgSettings.opacity;
        bgOpacityValue.textContent = `${bgSettings.opacity}%`;
        bgBlur.value = bgSettings.blur;
        bgBlurValue.textContent = `${bgSettings.blur}px`;
        bgZIndex.value = bgSettings.zIndex;
        bgZIndexValue.textContent = bgSettings.zIndex;
      }
      
      // 应用背景
      customBackground = preferences.background;
      if (customBackground) {
        // 更新UI
        if (customBackground.type === 'local') {
          document.getElementById('bgLocal').checked = true;
          bgPreviewImg.src = customBackground.data;
          bgPreview.style.display = 'block';
          bgAdjustments.style.display = 'block';
          bgLocalContainer.style.display = 'flex';
        } else if (customBackground.type === 'url') {
          document.getElementById('bgUrl').checked = true;
          bgUrlInput.value = customBackground.data;
          bgPreviewImg.src = customBackground.data;
          bgPreview.style.display = 'block';
          bgAdjustments.style.display = 'block';
          bgUrlContainer.style.display = 'flex';
        }
        
        // 应用背景
        applyBackground();
      } else {
        document.getElementById('bgNone').checked = true;
      }
      
      // 应用动画设置
      animationEnabled = preferences.animation || false;
      animationSwitch.checked = animationEnabled;
      
      // 应用透明度设置
      if (preferences.formOpacity) {
        formOpacity.value = preferences.formOpacity;
        opacityValue.textContent = `${preferences.formOpacity}%`;
        updateFormOpacity(preferences.formOpacity);
      }
      
      // 应用字体透明度设置
      if (preferences.fontOpacity) {
        fontOpacity.value = preferences.fontOpacity;
        fontOpacityValue.textContent = `${preferences.fontOpacity}%`;
        updateFontOpacity(preferences.fontOpacity);
      }
      
    } catch (e) {
      console.error('加载主题设置失败:', e);
      
      // 根据当前语言显示错误消息
      const errorMessage = currentLanguage === 'zh-CN' ? '加载主题设置失败' :
                          currentLanguage === 'ru-RU' ? 'Не удалось загрузить настройки темы' :
                          currentLanguage === 'ja-JP' ? 'テーマ設定の読み込みに失敗しました' :
                          currentLanguage === 'ko-KR' ? '테마 설정 로드 실패' : 'Failed to load theme settings';
      
      showToast(errorMessage, 'error');
    }
  }
}

// 处理点击动画
function handleClickAnimation(e) {
  if (!animationEnabled) return;
  
  // 随机选择表情或颜文字
  const items = Math.random() > 0.5 ? emojis : kaomojis;
  const item = items[Math.floor(Math.random() * items.length)];
  
  // 随机颜色
  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue}, 80%, 60%)`;
  
  // 创建动画元素
  const animEl = document.createElement('div');
  animEl.className = 'emoji-animation';
  animEl.textContent = item;
  animEl.style.color = color;
  
  // 随机位置而不是鼠标位置
  const maxWidth = window.innerWidth - 100;
  const maxHeight = window.innerHeight - 100;
  const randomX = Math.floor(Math.random() * maxWidth);
  const randomY = Math.floor(Math.random() * maxHeight);
  
  animEl.style.left = `${randomX}px`;
  animEl.style.top = `${randomY}px`;
  
  // 添加到页面
  document.body.appendChild(animEl);
  
  // 5秒后移除元素
  setTimeout(() => {
    if (document.body.contains(animEl)) {
      document.body.removeChild(animEl);
    }
  }, 5000);
}

// 获取选中的过敏源
function getSelectedAllergens() {
  const allergens = [];
  const allergenCheckboxes = document.querySelectorAll('input[name="allergens"]:checked');
  
  allergenCheckboxes.forEach(checkbox => {
    if (checkbox.value === '其他' && otherAllergens.value) {
      allergens.push(otherAllergens.value);
    } else if (checkbox.value !== '其他') {
      allergens.push(checkbox.value);
    }
  });
  
  return allergens;
}

// 处理表单提交
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // 获取当前API设置
  const apiProvider = localStorage.getItem('apiProvider') || 'default';
  
  // 检查是否是使用默认API，如果是则检查使用限制
  if (apiProvider === 'default' && dailyApiUsageCount >= dailyApiUsageLimit) {
    // 根据当前语言显示不同的错误消息
    let errorMsg = '';
    switch (currentLanguage) {
      case 'zh-CN':
        errorMsg = '您今日已达到内置API使用上限（10次），请明天再试或设置自己的API';
        break;
      case 'en-GB':
      case 'en-US':
        errorMsg = 'You have reached the daily limit (10) for built-in API usage. Please try again tomorrow or configure your own API';
        break;
      default:
        errorMsg = 'API daily limit reached. Please try again tomorrow or use custom API';
    }
    
    showToast(errorMsg, 'error');
    return;
  }
  
  // 显示加载状态
  reportContent.innerHTML = `<div class="loading">${translations[currentLanguage].loading}</div>`;
  showReport();
  
  // 收集表单数据
  const formData = {
    height: document.getElementById('height').value,
    weight: document.getElementById('weight').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    systolic: document.getElementById('systolic').value,
    diastolic: document.getElementById('diastolic').value,
    heartRate: document.getElementById('heartRate').value,
    sleepHours: document.getElementById('sleepHours').value,
    exerciseFrequency: document.getElementById('exerciseFrequency').value,
    medical: document.getElementById('medical').value,
    lifestyle: document.getElementById('lifestyle').value,
    diet: document.getElementById('diet').value,
    concern: document.getElementById('concern').value,
    allergens: getSelectedAllergens(),
    language: currentLanguage,
    customFields: getCustomFieldsData() // 添加自定义字段数据
  };
  
  // 单位转换（如果是美制单位）
  if (currentLanguage === 'en-US') {
    // 英寸转厘米
    formData.heightCm = (formData.height * 2.54).toFixed(1);
    // 磅转千克
    formData.weightKg = (formData.weight * 0.453592).toFixed(1);
  } else {
    // 对于其他语言（中文、英式英语、俄语、日语、韩语），使用公制单位
    formData.heightCm = formData.height;
    formData.weightKg = formData.weight;
  }
  
  try {
    // 获取AI生成的健康报告
    const report = await generateHealthReport(formData);
    
    // 如果使用的是默认API，增加使用计数
    if (apiProvider === 'default') {
      dailyApiUsageCount++;
      saveApiUsageData();
      updateApiRemainingCount();
    }
    
    // 显示报告
    displayReport(report, formData);
    
    // 保存到历史记录
    saveToHistory(formData, report);
    
  } catch (error) {
    reportContent.innerHTML = `<div class="error">${translations[currentLanguage].error}: ${error.message}</div>`;
    showToast(`${translations[currentLanguage].error}: ${error.message}`, 'error');
  }
}

// 生成健康报告
async function generateHealthReport(data) {
  // 计算BMI（使用公制值）
  const bmi = (data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1);
  
  // 计算健康评分 (0-100分)
  let healthScore = 70; // 基础分数
  
  // 根据BMI调整分数
  if (bmi >= 18.5 && bmi <= 24.9) {
    healthScore += 10; // 理想BMI
  } else if ((bmi >= 17 && bmi < 18.5) || (bmi > 24.9 && bmi <= 29.9)) {
    healthScore -= 5; // 轻度超重或轻度偏瘦
  } else {
    healthScore -= 15; // 肥胖或严重偏瘦
  }
  
  // 根据血压调整分数
  const systolic = parseInt(data.systolic);
  const diastolic = parseInt(data.diastolic);
  if ((systolic >= 90 && systolic <= 120) && (diastolic >= 60 && diastolic <= 80)) {
    healthScore += 10; // 理想血压
  } else if ((systolic > 120 && systolic <= 140) || (diastolic > 80 && diastolic <= 90)) {
    healthScore -= 5; // 轻度高血压
  } else if (systolic > 140 || diastolic > 90) {
    healthScore -= 15; // 高血压
  } else if (systolic < 90 || diastolic < 60) {
    healthScore -= 10; // 低血压
  }
  
  // 根据心率调整分数
  const heartRate = parseInt(data.heartRate);
  if (heartRate >= 60 && heartRate <= 100) {
    healthScore += 5; // 正常心率
  } else {
    healthScore -= 5; // 心率异常
  }
  
  // 根据睡眠调整分数
  const sleepHours = parseFloat(data.sleepHours);
  if (sleepHours >= 7 && sleepHours <= 9) {
    healthScore += 5; // 理想睡眠
  } else if (sleepHours >= 6 && sleepHours < 7) {
    healthScore -= 3; // 轻度睡眠不足
  } else {
    healthScore -= 8; // 严重睡眠不足或过量
  }
  
  // 根据运动频率调整分数
  if (data.exerciseFrequency === '3-4' || data.exerciseFrequency === '5+') {
    healthScore += 5; // 适当运动
  } else if (data.exerciseFrequency === '1-2') {
    healthScore += 2; // 少量运动
  } else {
    healthScore -= 5; // 不运动
  }
  
  // 限制评分范围在0-100之间
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // 保存健康评分到data对象
  data.healthScore = Math.round(healthScore);

  // 构建提示词
  let fullPrompt = '';
  let firstHalfPrompt = '';
  let secondHalfPrompt = '';
  
  // 添加自定义字段信息
  let customFieldsText = '';
  if (data.customFields && Object.keys(data.customFields).length > 0) {
    customFieldsText = '\n自定义数据:\n';
    Object.entries(data.customFields).forEach(([label, value]) => {
      customFieldsText += `- ${label}: ${value}\n`;
    });
  }
  
  if (data.language === 'zh-CN') {
    fullPrompt = `
你是一名专业的健康顾问和营养师。根据用户提供的以下健康数据，提供一份全面的健康评估和建议：

身高: ${data.height}cm
体重: ${data.weight}kg
年龄: ${data.age}岁
性别: ${data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : '其他'}
BMI: ${bmi}
健康评分: ${data.healthScore}/100
血压: ${data.systolic}/${data.diastolic} mmHg
心率: ${data.heartRate} 次/分
平均睡眠时长: ${data.sleepHours} 小时
每周运动频率: ${data.exerciseFrequency}
病史: ${data.medical || '无'}
生活习惯: ${data.lifestyle}
饮食习惯: ${data.diet}
主要健康顾虑: ${data.concern || '无特别顾虑'}
过敏源: ${data.allergens.length > 0 ? data.allergens.join(', ') : '无'}${customFieldsText}

请提供以下内容：
1. 身体状况总体评估（包括健康评分解释、BMI分析、血压和心率分析）
2. 潜在健康风险分析
3. 生活习惯改善建议（包括睡眠和运动建议）
4. 饮食调整建议（考虑过敏源）
5. 运动建议（基于当前运动频率）
6. 未来3-6个月的健康目标和计划

请详细且专业地回答，给出具体的建议而非泛泛而谈。回答使用Markdown格式。
`;

    firstHalfPrompt = `
你是一名专业的健康顾问和营养师。根据用户提供的以下健康数据，提供一份健康评估的前半部分：

身高: ${data.height}cm
体重: ${data.weight}kg
年龄: ${data.age}岁
性别: ${data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : '其他'}
BMI: ${bmi}
健康评分: ${data.healthScore}/100
血压: ${data.systolic}/${data.diastolic} mmHg
心率: ${data.heartRate} 次/分
平均睡眠时长: ${data.sleepHours} 小时
每周运动频率: ${data.exerciseFrequency}
病史: ${data.medical || '无'}
生活习惯: ${data.lifestyle}
饮食习惯: ${data.diet}${customFieldsText}

请提供以下内容（仅需提供这些内容，不需要其他）：
1. 身体状况总体评估（包括健康评分解释、BMI分析、血压和心率分析）
2. 潜在健康风险分析
3. 生活习惯改善建议（包括睡眠和运动建议）

请使用Markdown格式，给出专业详细的建议。你的内容将作为报告的前半部分，会与另一位专家撰写的后半部分合并。
`;

    secondHalfPrompt = `
你是一名专业的健康顾问和营养师。根据用户提供的以下健康数据，提供一份健康建议的后半部分：

身高: ${data.height}cm
体重: ${data.weight}kg
年龄: ${data.age}岁
性别: ${data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : '其他'}
BMI: ${bmi}
健康评分: ${data.healthScore}/100
血压: ${data.systolic}/${data.diastolic} mmHg
心率: ${data.heartRate} 次/分
每周运动频率: ${data.exerciseFrequency}
病史: ${data.medical || '无'}
饮食习惯: ${data.diet}
主要健康顾虑: ${data.concern || '无特别顾虑'}
过敏源: ${data.allergens.length > 0 ? data.allergens.join(', ') : '无'}${customFieldsText}

请提供以下内容（仅需提供这些内容，不需要其他）：
4. 饮食调整建议（考虑过敏源）
5. 运动建议（基于当前运动频率）
6. 未来3-6个月的健康目标和计划

请使用Markdown格式，给出专业详细的建议。你的内容将作为报告的后半部分，会与另一位专家撰写的前半部分合并。
`;
  } else if (data.language === 'en-GB') {
    fullPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide a comprehensive health assessment and recommendations:

Height: ${data.height} cm
Weight: ${data.weight} kg
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Blood Pressure: ${data.systolic}/${data.diastolic} mmHg
Heart Rate: ${data.heartRate} bpm
Average Sleep Duration: ${data.sleepHours} hours
Weekly Exercise Frequency: ${data.exerciseFrequency}
Medical History: ${data.medical || 'None'}
Lifestyle Habits: ${data.lifestyle}
Dietary Habits: ${data.diet}
Main Health Concerns: ${data.concern || 'No specific concerns'}
Allergens: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'None'}

Please provide the following:
1. Overall physical condition assessment (including explanation of health score, BMI analysis, blood pressure and heart rate analysis)
2. Potential health risk analysis
3. Lifestyle improvement suggestions (including sleep and exercise recommendations)
4. Dietary adjustment recommendations (considering allergens)
5. Exercise recommendations (based on current exercise frequency)
6. Health goals and plans for the next 3-6 months

Please answer in detail and professionally, giving specific recommendations rather than general advice. Format your answer in Markdown.
Use British health standards and metrics. 
`;

    firstHalfPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide the first half of a comprehensive health assessment:

Height: ${data.height} cm
Weight: ${data.weight} kg
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Blood Pressure: ${data.systolic}/${data.diastolic} mmHg
Heart Rate: ${data.heartRate} bpm
Average Sleep Duration: ${data.sleepHours} hours
Weekly Exercise Frequency: ${data.exerciseFrequency}
Medical History: ${data.medical || 'None'}
Lifestyle Habits: ${data.lifestyle}

Please provide only the following sections (no additional content needed):
1. Overall physical condition assessment (including explanation of health score, BMI analysis, blood pressure and heart rate analysis)
2. Potential health risk analysis
3. Lifestyle improvement suggestions (including sleep and exercise recommendations)

Please use Markdown format and provide detailed professional advice. Your content will be the first half of the report and will be combined with the second half written by another expert.
Use British health standards and metrics.
`;

    secondHalfPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide the second half of a comprehensive health assessment:

Height: ${data.height} cm
Weight: ${data.weight} kg
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Weekly Exercise Frequency: ${data.exerciseFrequency}
Dietary Habits: ${data.diet}
Main Health Concerns: ${data.concern || 'No specific concerns'}
Allergens: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'None'}

Please provide only the following sections (no additional content needed):
4. Dietary adjustment recommendations (considering allergens)
5. Exercise recommendations (based on current exercise frequency)
6. Health goals and plans for the next 3-6 months

Please use Markdown format and provide detailed professional advice. Your content will be the second half of the report and will be combined with the first half written by another expert.
Use British health standards and metrics.
`;
  } else if (data.language === 'en-US') {
    fullPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide a comprehensive health assessment and recommendations:

Height: ${data.height} inches (${data.heightCm} cm)
Weight: ${data.weight} pounds (${data.weightKg} kg)
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Blood Pressure: ${data.systolic}/${data.diastolic} mmHg
Heart Rate: ${data.heartRate} bpm
Average Sleep Duration: ${data.sleepHours} hours
Weekly Exercise Frequency: ${data.exerciseFrequency}
Medical History: ${data.medical || 'None'}
Lifestyle Habits: ${data.lifestyle}
Dietary Habits: ${data.diet}
Main Health Concerns: ${data.concern || 'No specific concerns'}
Allergens: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'None'}

Please provide the following:
1. Overall physical condition assessment (including explanation of health score, BMI analysis, blood pressure and heart rate analysis)
2. Potential health risk analysis
3. Lifestyle improvement suggestions (including sleep and exercise recommendations)
4. Dietary adjustment recommendations (considering allergens)
5. Exercise recommendations (based on current exercise frequency)
6. Health goals and plans for the next 3-6 months

Please answer in detail and professionally, giving specific recommendations rather than general advice. Format your answer in Markdown.
Use American health standards and metrics (include both imperial and metric units in your response).
`;

    firstHalfPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide the first half of a comprehensive health assessment:

Height: ${data.height} inches (${data.heightCm} cm)
Weight: ${data.weight} pounds (${data.weightKg} kg)
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Blood Pressure: ${data.systolic}/${data.diastolic} mmHg
Heart Rate: ${data.heartRate} bpm
Average Sleep Duration: ${data.sleepHours} hours
Weekly Exercise Frequency: ${data.exerciseFrequency}
Medical History: ${data.medical || 'None'}
Lifestyle Habits: ${data.lifestyle}

Please provide only the following sections (no additional content needed):
1. Overall physical condition assessment (including explanation of health score, BMI analysis, blood pressure and heart rate analysis)
2. Potential health risk analysis
3. Lifestyle improvement suggestions (including sleep and exercise recommendations)

Please use Markdown format and provide detailed professional advice. Your content will be the first half of the report and will be combined with the second half written by another expert.
Use American health standards and metrics (include both imperial and metric units in your response).
`;

    secondHalfPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide the second half of a comprehensive health assessment:

Height: ${data.height} inches (${data.heightCm} cm)
Weight: ${data.weight} pounds (${data.weightKg} kg)
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Weekly Exercise Frequency: ${data.exerciseFrequency}
Dietary Habits: ${data.diet}
Main Health Concerns: ${data.concern || 'No specific concerns'}
Allergens: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'None'}

Please provide only the following sections (no additional content needed):
4. Dietary adjustment recommendations (considering allergens)
5. Exercise recommendations (based on current exercise frequency)
6. Health goals and plans for the next 3-6 months

Please use Markdown format and provide detailed professional advice. Your content will be the second half of the report and will be combined with the first half written by another expert.
Use American health standards and metrics (include both imperial and metric units in your response).
`;
  } else if (data.language === 'ru-RU') {
    fullPrompt = `
Вы профессиональный консультант по здоровью и диетолог. На основе следующих данных о здоровье, предоставленных пользователем, предоставьте комплексную оценку здоровья и рекомендации:

Рост: ${data.height} см
Вес: ${data.weight} кг
Возраст: ${data.age}
Пол: ${data.gender === 'male' ? 'Мужской' : data.gender === 'female' ? 'Женский' : 'Другой'}
ИМТ: ${bmi}
Оценка здоровья: ${data.healthScore}/100
Кровяное давление: ${data.systolic}/${data.diastolic} мм рт.ст.
Пульс: ${data.heartRate} уд/мин
Средняя продолжительность сна: ${data.sleepHours} часов
Частота тренировок в неделю: ${data.exerciseFrequency}
Медицинская история: ${data.medical || 'Нет'}
Образ жизни: ${data.lifestyle}
Пищевые привычки: ${data.diet}
Основные проблемы здоровья: ${data.concern || 'Нет особых проблем'}
Аллергены: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'Нет'}

Пожалуйста, предоставьте следующее:
1. Общая оценка физического состояния (включая объяснение оценки здоровья, анализ ИМТ, кровяного давления и пульса)
2. Анализ потенциальных рисков для здоровья
3. Предложения по улучшению образа жизни (включая рекомендации по сну и физической активности)
4. Рекомендации по корректировке питания (с учетом аллергенов)
5. Рекомендации по физическим упражнениям (на основе текущей частоты тренировок)
6. Цели и планы по здоровью на следующие 3-6 месяцев

Пожалуйста, ответьте подробно и профессионально, давая конкретные рекомендации, а не общие советы. Оформите ваш ответ в формате Markdown.
Используйте российские стандарты и метрики здоровья.
`;

    firstHalfPrompt = `
Вы профессиональный консультант по здоровью и диетолог. На основе следующих данных о здоровье, предоставленных пользователем, предоставьте первую часть комплексной оценки здоровья:

Рост: ${data.height} см
Вес: ${data.weight} кг
Возраст: ${data.age}
Пол: ${data.gender === 'male' ? 'Мужской' : data.gender === 'female' ? 'Женский' : 'Другой'}
ИМТ: ${bmi}
Оценка здоровья: ${data.healthScore}/100
Кровяное давление: ${data.systolic}/${data.diastolic} мм рт.ст.
Пульс: ${data.heartRate} уд/мин
Средняя продолжительность сна: ${data.sleepHours} часов
Частота тренировок в неделю: ${data.exerciseFrequency}
Медицинская история: ${data.medical || 'Нет'}
Образ жизни: ${data.lifestyle}

Пожалуйста, предоставьте только следующие разделы (без дополнительного содержания):
1. Общая оценка физического состояния (включая объяснение оценки здоровья, анализ ИМТ, кровяного давления и пульса)
2. Анализ потенциальных рисков для здоровья
3. Предложения по улучшению образа жизни (включая рекомендации по сну и физической активности)

Пожалуйста, используйте формат Markdown и предоставьте детальные профессиональные советы. Ваш контент будет первой частью отчета и будет объединен со второй частью, написанной другим экспертом.
Используйте российские стандарты и метрики здоровья.
`;

    secondHalfPrompt = `
Вы профессиональный консультант по здоровью и диетолог. На основе следующих данных о здоровье, предоставленных пользователем, предоставьте вторую часть комплексной оценки здоровья:

Рост: ${data.height} см
Вес: ${data.weight} кг
Возраст: ${data.age}
Пол: ${data.gender === 'male' ? 'Мужской' : data.gender === 'female' ? 'Женский' : 'Другой'}
ИМТ: ${bmi}
Оценка здоровья: ${data.healthScore}/100
Частота тренировок в неделю: ${data.exerciseFrequency}
Пищевые привычки: ${data.diet}
Основные проблемы здоровья: ${data.concern || 'Нет особых проблем'}
Аллергены: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'Нет'}

Пожалуйста, предоставьте только следующие разделы (без дополнительного содержания):
4. Рекомендации по корректировке питания (с учетом аллергенов)
5. Рекомендации по физическим упражнениям (на основе текущей частоты тренировок)
6. Цели и планы по здоровью на следующие 3-6 месяцев

Пожалуйста, используйте формат Markdown и предоставьте детальные профессиональные советы. Ваш контент будет второй частью отчета и будет объединен с первой частью, написанной другим экспертом.
Используйте российские стандарты и метрики здоровья.
`;
  } else if (data.language === 'ja-JP') {
    fullPrompt = `
あなたはプロの健康コンサルタントと栄養士です。ユーザーから提供された次の健康データに基づいて、包括的な健康評価と推奨事項を提供してください：

身長: ${data.height} cm
体重: ${data.weight} kg
年齢: ${data.age}
性別: ${data.gender === 'male' ? '男性' : data.gender === 'female' ? '女性' : 'その他'}
BMI: ${bmi}
健康スコア: ${data.healthScore}/100
血圧: ${data.systolic}/${data.diastolic} mmHg
心拍数: ${data.heartRate} 拍/分
平均睡眠時間: ${data.sleepHours} 時間
週間運動頻度: ${data.exerciseFrequency}
病歴: ${data.medical || 'なし'}
生活習慣: ${data.lifestyle}
食事習慣: ${data.diet}
主な健康上の懸念: ${data.concern || '特になし'}
アレルゲン: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'なし'}

以下の内容を提供してください：
1. 全体的な身体状態の評価（健康スコアの説明、BMI分析、血圧および心拍数分析を含む）
2. 潜在的な健康リスク分析
3. 生活習慣の改善提案（睡眠と運動の推奨事項を含む）
4. 食事調整の推奨事項（アレルゲンを考慮）
5. 運動の推奨事項（現在の運動頻度に基く）
6. 今後3〜6ヶ月の健康目標と計画

詳細かつプロフェッショナルに回答し、一般的なアドバイスではなく具体的な推奨事項を提供してください。回答はMarkdown形式で作成してください。
日本の健康基準と指標を使用してください。
`;

    firstHalfPrompt = `
あなたはプロの健康コンサルタントと栄養士です。ユーザーから提供された次の健康データに基づいて、包括的な健康評価の前半部分を提供してください：

身長: ${data.height} cm
体重: ${data.weight} kg
年齢: ${data.age}
性別: ${data.gender === 'male' ? '男性' : data.gender === 'female' ? '女性' : 'その他'}
BMI: ${bmi}
健康スコア: ${data.healthScore}/100
血圧: ${data.systolic}/${data.diastolic} mmHg
心拍数: ${data.heartRate} bpm
平均睡眠時間: ${data.sleepHours} 時間
週間運動頻度: ${data.exerciseFrequency}
病歴: ${data.medical || 'なし'}
生活習慣: ${data.lifestyle}

以下のセクションのみを提供してください（追加のコンテンツは不要です）：
1. 全体的な身体状態の評価（健康スコアの説明、BMI分析、血圧と心拍数の分析を含む）
2. 潜在的な健康リスクの分析
3. 生活習慣の改善提案（睡眠と運動の推奨事項を含む）

Markdown形式を使用し、詳細な専門的アドバイスを提供してください。あなたのコンテンツはレポートの前半部分となり、別の専門家が書いた後半部分と組み合わされます。
日本の健康基準と指標を使用してください。
`;

    secondHalfPrompt = `
あなたはプロの健康コンサルタントと栄養士です。ユーザーから提供された次の健康データに基づいて、包括的な健康評価の後半部分を提供してください：

身長: ${data.height} cm
体重: ${data.weight} kg
年齢: ${data.age}
性別: ${data.gender === 'male' ? '男性' : data.gender === 'female' ? '女性' : 'その他'}
BMI: ${bmi}
健康スコア: ${data.healthScore}/100
週間運動頻度: ${data.exerciseFrequency}
食習慣: ${data.diet}
主な健康上の懸念: ${data.concern || '特になし'}
アレルゲン: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'なし'}

以下のセクションのみを提供してください（追加のコンテンツは不要です）：
4. 食事調整の推奨事項（アレルゲンを考慮）
5. 運動の推奨事項（現在の運動頻度に基づく）
6. 今後3〜6ヶ月の健康目標と計画

Markdown形式を使用し、詳細な専門的アドバイスを提供してください。あなたのコンテンツはレポートの後半部分となり、別の専門家が書いた前半部分と組み合わされます。
日本の健康基準と指標を使用してください。
`;
  } else {
    // 使用中文模板作为其他语言的默认模板
    fullPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide a comprehensive health assessment and recommendations:

Height: ${data.height} cm
Weight: ${data.weight} kg
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Blood Pressure: ${data.systolic}/${data.diastolic} mmHg
Heart Rate: ${data.heartRate} bpm
Average Sleep Duration: ${data.sleepHours} hours
Weekly Exercise Frequency: ${data.exerciseFrequency}
Medical History: ${data.medical || 'None'}
Lifestyle Habits: ${data.lifestyle}
Dietary Habits: ${data.diet}
Main Health Concerns: ${data.concern || 'No specific concerns'}
Allergens: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'None'}

Please provide the following:
1. Overall physical condition assessment (including explanation of health score, BMI analysis, blood pressure and heart rate analysis)
2. Potential health risk analysis
3. Lifestyle improvement suggestions (including sleep and exercise recommendations)
4. Dietary adjustment recommendations (considering allergens)
5. Exercise recommendations (based on current exercise frequency)
6. Health goals and plans for the next 3-6 months

Please answer in detail and professionally, giving specific recommendations rather than general advice. Format your answer in Markdown.
`;

    firstHalfPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide the first half of a comprehensive health assessment:

Height: ${data.height} cm
Weight: ${data.weight} kg
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Blood Pressure: ${data.systolic}/${data.diastolic} mmHg
Heart Rate: ${data.heartRate} bpm
Average Sleep Duration: ${data.sleepHours} hours
Weekly Exercise Frequency: ${data.exerciseFrequency}
Medical History: ${data.medical || 'None'}
Lifestyle Habits: ${data.lifestyle}

Please provide only the following sections (no additional content needed):
1. Overall physical condition assessment (including explanation of health score, BMI analysis, blood pressure and heart rate analysis)
2. Potential health risk analysis
3. Lifestyle improvement suggestions (including sleep and exercise recommendations)

Please use Markdown format and provide detailed professional advice. Your content will be the first half of the report and will be combined with the second half written by another expert.
`;

    secondHalfPrompt = `
You are a professional health consultant and nutritionist. Based on the following health data provided by the user, provide the second half of a comprehensive health assessment:

Height: ${data.height} cm
Weight: ${data.weight} kg
Age: ${data.age}
Gender: ${data.gender}
BMI: ${bmi}
Health Score: ${data.healthScore}/100
Weekly Exercise Frequency: ${data.exerciseFrequency}
Dietary Habits: ${data.diet}
Main Health Concerns: ${data.concern || 'No specific concerns'}
Allergens: ${data.allergens.length > 0 ? data.allergens.join(', ') : 'None'}

Please provide only the following sections (no additional content needed):
4. Dietary adjustment recommendations (considering allergens)
5. Exercise recommendations (based on current exercise frequency)
6. Health goals and plans for the next 3-6 months

Please use Markdown format and provide detailed professional advice. Your content will be the second half of the report and will be combined with the first half written by another expert.
`;
  }

  try {
    // 获取当前API设置
    const apiProvider = localStorage.getItem('apiProvider') || 'default';
    
    // 如果用户设置了自己的API
    if (apiProvider === 'custom') {
      // 使用用户配置的API
      return await callCustomAPI(fullPrompt);
    } else {
      // 使用内置API并行生成报告
      // 存储需要并行请求的API调用
      const apiCalls = [];
      
      // 根据设置添加API调用
      apiCalls.push(callTongyiAPI(firstHalfPrompt));
      apiCalls.push(callDeepseekAPI(secondHalfPrompt));
      
      // 并行执行API调用
      const [firstHalf, secondHalf] = await Promise.all(apiCalls);
      
      // 全面处理前半部分内容
      let processedFirstHalf = firstHalf.trim();
      if (!processedFirstHalf.endsWith('\n')) {
        processedFirstHalf += '\n';
      }
      
      // 全面处理后半部分内容
      let processedSecondHalf = secondHalf.trim();
      
      // 标准化处理函数
      const standardizeMarkdown = (text) => {
        return text
          // 移除可能存在的头部标题
          .replace(/^#+\s*健康报告.*?\n/i, '')
          .replace(/^#+\s*健康评估.*?\n/i, '')
          .replace(/^#+\s*Health Report.*?\n/i, '')
          .replace(/^#+\s*Health Assessment.*?\n/i, '')
          
          // 处理中文序号标题格式
          .replace(/^([一二三四五六七八九十]+)[、\.\s]+([^\n]+)/gm, '## $1. $2')
          
          // 处理数字序号标题格式
          .replace(/^(\d+)[、\.\s]+(?!#)([^\n]+)/gm, '## $1. $2')
          
          // 确保所有二级标题格式一致
          .replace(/^##[\s]*(\d+)[\s\.、]*[\s]*([^\n]+)/gm, '## $1. $2')
          
          // 处理可能的特殊格式如 "## A. 标题"
          .replace(/^##[\s]*([A-Za-z])[\.、]*[\s]*([^\n]+)/gm, '## $1. $2')
          
          // 统一使用 - 作为无序列表符号
          .replace(/^[•※○●■]\s+/gm, '- ')
          
          // 确保列表项之间有适当间距
          .replace(/^(- .+)\n(?![\s\n-])/gm, '$1\n\n');
      };
      
      // 应用标准化处理
      processedFirstHalf = standardizeMarkdown(processedFirstHalf);
      processedSecondHalf = standardizeMarkdown(processedSecondHalf);
      
      // 如果后半部分以数字编号开头，但不是Markdown格式，将其转为Markdown格式
      // 例如: "4. 运动建议" => "## 4. 运动建议"
      processedSecondHalf = processedSecondHalf
        .replace(/^(\d+)\.\s+([^\n]+)/gm, '## $1. $2');
      
      // 确保特定的章节存在于后半部分，一般是第4-6章节
      const lastSectionNumber = (processedFirstHalf.match(/##\s*(\d+)\./g) || [])
        .map(s => parseInt(s.replace(/[^0-9]/g, '')))
        .sort((a, b) => b - a)[0] || 3;
      
      // 检查第一部分最后的章节号，确保第二部分从下一个章节开始
      const nextSectionIndex = lastSectionNumber + 1;
      
      // 根据最后的章节号调整后半部分章节的起始编号
      const sectionMapping = {
        4: '四',
        5: '五', 
        6: '六'
      };
      
      // 处理可能用中文数字的章节标题
      for (let i = 4; i <= 6; i++) {
        const chineseSectionRegex = new RegExp(`^${sectionMapping[i]}[、\\.\\s]([^\\n]+)`, 'gm');
        processedSecondHalf = processedSecondHalf.replace(chineseSectionRegex, `## ${i}. $1`);
      }
      
      // 添加分隔符和专家过渡文本
      const separator = '\n\n---\n\n以上为健康评估报告的前半部分内容，请参考建议逐步调整生活方式，后续将由另一位专家提供更详细的饮食计划和具体健康管理方案。\n\n---\n\n';
      
      // 合并报告内容
      return processedFirstHalf + separator + processedSecondHalf;
    }
  } catch (error) {
    throw new Error(`无法生成健康报告: ${error.message}`);
  }
}

// 调用自定义API
async function callCustomAPI(prompt) {
  try {
    // 准备请求头
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customAPIConfig.key}`,
      ...customAPIConfig.headers
    };
    
    // 准备请求体 - 使用OpenAI兼容格式
    const body = JSON.stringify({
      model: customAPIConfig.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    
    const response = await fetch(customAPIConfig.endpoint, {
      method: 'POST',
      headers,
      body
    });
    
    if (!response.ok) {
      throw new Error(`API返回错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 尝试处理不同的API响应格式
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else if (data.output && data.output.text) {
      return data.output.text;
    } else if (data.response) {
      return data.response;
    } else {
      console.warn('未知的API响应格式:', data);
      return JSON.stringify(data);
    }
  } catch (error) {
    console.error('自定义API调用失败:', error);
    return `# 健康报告

## 自定义API调用失败

错误信息: ${error.message}

请检查您的API设置和网络连接。

`;
  }
}

// 调用通义千问API
async function callTongyiAPI(prompt) {
  try {
    // 这里需要根据通义千问的实际API规范进行调用
    // 以下是示例代码，请根据实际API文档调整
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TONGYI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        input: {
          prompt: prompt
        },
        parameters: {
          max_tokens: 2000,
          temperature: 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API返回错误: ${response.status}`);
    }
    
    const data = await response.json();
    return data.output.text || '无法获取响应';
  } catch (error) {
    console.error('通义千问API调用失败:', error);
    
    // API调用失败时使用备用内容
    return `# 健康报告

## 身体状况总体评估

根据您提供的信息，您的BMI值为${(data.weight / ((data.height / 100) ** 2)).toFixed(1)}。

*注: 此为本地生成的示例报告，API调用失败。*

## 健康建议

1. 保持均衡饮食
2. 定期锻炼
3. 充足睡眠
4. 定期体检

`;
  }
}

// 调用Deepseek API
async function callDeepseekAPI(prompt) {
  try {
    // 这里需要根据Deepseek的实际API规范进行调用
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`API返回错误: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content || '无法获取响应';
  } catch (error) {
    console.error('Deepseek API调用失败:', error);
    return `# 健康报告

## 身体状况总体评估

*注: 此为本地生成的示例报告，API调用失败。*

请检查网络连接或API配置。

`;
  }
}

// 显示报告
function displayReport(report, formData) {
  // 预处理报告文本，确保标题格式统一
  let processedReport = report;
  
  // 1. 移除所有可能存在的头部标题
  processedReport = processedReport
    .replace(/^#+\s*健康报告.*?\n/i, '')
    .replace(/^#+\s*健康评估.*?\n/i, '')
    .replace(/^#+\s*Health Report.*?\n/i, '')
    .replace(/^#+\s*Health Assessment.*?\n/i, '');
  
  // 2. 标准化Markdown标记
  // 处理星号强调的文本，例如 **血压** 替换为 <strong>血压</strong>
  processedReport = processedReport.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 3. 统一标题格式
  processedReport = processedReport
    // 处理中文序号标题格式
    .replace(/^([一二三四五六七八九十]+)[、\.\s]+([^\n]+)/gm, '## $1. $2')
    // 处理数字序号标题格式，但避免处理已格式化的标题
    .replace(/^(\d+)[、\.\s]+(?!#)([^\n]+)/gm, '## $1. $2')
    // 确保所有二级标题格式一致
    .replace(/^##[\s]*(\d+)[\s\.、]*[\s]*([^\n]+)/gm, '## $1. $2')
    // 处理可能的特殊格式如 "## A. 标题"
    .replace(/^##[\s]*([A-Za-z])[\.、]*[\s]*([^\n]+)/gm, '## $1. $2');
  
  // 4. 处理可能的列表项不一致问题
  processedReport = processedReport
    // 统一使用 - 作为无序列表符号
    .replace(/^[•※○●■]\s+/gm, '- ')
    // 确保列表项之间有适当间距
    .replace(/^(- .+)\n(?![\s\n-])/gm, '$1\n\n');
  
  // 5. 为过渡段落添加特殊样式标记
  // 查找分隔符和专家过渡文本部分
  processedReport = processedReport.replace(
    /(---\n\n.*?后续将由另一位专家提供更详细的饮食计划和具体健康管理方案。\n\n---)/s,
    '<div class="expert-transition">$1</div>'
  );
  
  // 使用marked将Markdown转换为HTML，确保正确配置选项
  const htmlContent = marked.parse(processedReport, {
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
    smartLists: true,
    smartypants: true
  });
  
  // 保存当前报告数据
  currentReportData = {
    formData: formData,
    report: processedReport,
    htmlContent: htmlContent,
    generatedAt: new Date().toISOString()
  };
  
  // 显示报告内容
  reportContent.innerHTML = htmlContent;
  
  // 应用样式
  applyReportStyle();
}

// 应用报告样式
function applyReportStyle() {
  // 添加样式到所有标题
  const headings = reportContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    heading.style.color = currentTheme === 'dark' ? '#e0e0e0' : '#333';
    heading.style.marginBottom = '15px';
    heading.style.marginTop = '25px';
    heading.style.fontWeight = 'bold';
    
    // 为h2添加下划线，使其更加突出
    if (heading.tagName === 'H2') {
      heading.style.borderBottom = currentTheme === 'dark' ? '1px solid #444' : '1px solid #ddd';
      heading.style.paddingBottom = '8px';
    }
  });
  
  // 添加样式到所有段落
  const paragraphs = reportContent.querySelectorAll('p');
  paragraphs.forEach(p => {
    p.style.lineHeight = '1.6';
    p.style.marginBottom = '12px';
  });
  
  // 添加样式到所有列表
  const lists = reportContent.querySelectorAll('ul, ol');
  lists.forEach(list => {
    list.style.marginBottom = '15px';
    list.style.paddingLeft = '25px';
  });
  
  const listItems = reportContent.querySelectorAll('li');
  listItems.forEach(item => {
    item.style.marginBottom = '8px';
    item.style.lineHeight = '1.5';
  });
  
  // 添加样式到分隔线
  const hrs = reportContent.querySelectorAll('hr');
  hrs.forEach(hr => {
    hr.style.margin = '30px 0';
    hr.style.border = 'none';
    hr.style.height = '1px';
    hr.style.background = currentTheme === 'dark' ? '#444' : '#ddd';
  });
  
  // 添加样式到粗体文本
  const bolds = reportContent.querySelectorAll('strong');
  bolds.forEach(bold => {
    bold.style.fontWeight = '600';
    bold.style.color = currentTheme === 'dark' ? '#f0f0f0' : '#222';
  });
  
  // 添加样式到表格（如果有）
  const tables = reportContent.querySelectorAll('table');
  tables.forEach(table => {
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginBottom = '20px';
    table.style.border = currentTheme === 'dark' ? '1px solid #444' : '1px solid #ddd';
  });
  
  const tds = reportContent.querySelectorAll('td, th');
  tds.forEach(td => {
    td.style.padding = '8px 12px';
    td.style.border = currentTheme === 'dark' ? '1px solid #444' : '1px solid #ddd';
  });
  
  const ths = reportContent.querySelectorAll('th');
  ths.forEach(th => {
    th.style.backgroundColor = currentTheme === 'dark' ? '#333' : '#f5f5f5';
    th.style.textAlign = 'left';
  });
  
  // 添加样式到专家过渡文本
  const expertTransition = reportContent.querySelector('.expert-transition');
  if (expertTransition) {
    // 创建一个新的样式化容器
    const transitionContainer = document.createElement('div');
    transitionContainer.className = 'expert-transition-container';
    transitionContainer.style.backgroundColor = currentTheme === 'dark' ? '#2a2a2a' : '#f8f8f8';
    transitionContainer.style.border = currentTheme === 'dark' ? '1px solid #444' : '1px solid #ddd';
    transitionContainer.style.borderRadius = '8px';
    transitionContainer.style.padding = '15px 20px';
    transitionContainer.style.margin = '30px 0';
    transitionContainer.style.textAlign = 'center';
    transitionContainer.style.fontStyle = 'italic';
    transitionContainer.style.position = 'relative';
    
    // 将原来的内容包装在新容器中
    const parentNode = expertTransition.parentNode;
    parentNode.insertBefore(transitionContainer, expertTransition);
    transitionContainer.appendChild(expertTransition);
    
    // 移除内部的<div>标签，但保留内容
    const content = expertTransition.innerHTML;
    expertTransition.outerHTML = content;
  }
}

// 保存到历史记录
async function saveToHistory(formData, report) {
  try {
    const data = {
      formData: formData,
      report: report,
      healthScore: formData.healthScore || 70, // 保存健康评分，默认值为70
      generatedAt: new Date().toISOString()
    };
    
    const result = await ipcRenderer.invoke('save-to-history', data);
    console.log('保存到历史记录:', result);
  } catch (error) {
    console.error('保存历史记录失败:', error);
    showToast('保存历史记录失败', 'error');
  }
}

// 健康记录图表相关变量
let healthChart = null;
let healthChartData = [];
let currentMetric = 'healthScore'; // 默认显示健康评分
let fullscreenChart = null; // 全屏图表实例
let isAllMetricsMode = false; // 是否处于全部展示模式

// 显示健康记录图表
function showHealthChart() {
  console.log('showHealthChart函数被调用');
  
  
  const healthChartWrapper = document.getElementById('healthChartWrapper');
  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  
  if (!healthChartWrapper || !showHealthChartBtn) {
    console.error('图表容器或按钮元素未找到', { 
      healthChartWrapper: !!healthChartWrapper, 
      showHealthChartBtn: !!showHealthChartBtn 
    });
    return;
  }
  
  // 显示图表容器
  healthChartWrapper.style.display = 'block';
  showHealthChartBtn.style.display = 'none';
  
  // 确保所有按钮可点击
  const chartButtons = document.querySelectorAll('.chart-controls button');
  chartButtons.forEach(button => {
    button.style.pointerEvents = 'auto';
    button.style.position = 'relative';
    button.style.zIndex = '5';
  });
  
  // 加载历史数据并绘制图表
  loadHealthChartData();
}

// 关闭健康记录图表
function closeHealthChart() {
  console.log('closeHealthChart函数被调用');
  
  const healthChartWrapper = document.getElementById('healthChartWrapper');
  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  
  if (!healthChartWrapper || !showHealthChartBtn) {
    console.error('图表容器或按钮元素未找到', {
      healthChartWrapper: !!healthChartWrapper,
      showHealthChartBtn: !!showHealthChartBtn
    });
    return;
  }
  
  // 隐藏图表容器
  healthChartWrapper.style.display = 'none';
  showHealthChartBtn.style.display = 'block';
  
  // 销毁图表实例
  if (healthChart) {
    healthChart.destroy();
    healthChart = null;
  }
}

// 全屏显示图表
function showFullscreenChart() {
  console.log('showFullscreenChart函数被调用');
  
  const fullscreenContainer = document.getElementById('fullscreenChartContainer');
  const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
  
  if (!fullscreenContainer || !fullscreenChartMetric) {
    console.error('全屏图表容器或下拉框元素未找到', {
      fullscreenContainer: !!fullscreenContainer,
      fullscreenChartMetric: !!fullscreenChartMetric
    });
    return;
  }
  
  // 显式重置全部展示模式标志
  console.log('重置全部展示模式标志，之前状态:', isAllMetricsMode);
  isAllMetricsMode = false;
  console.log('重置后状态:', isAllMetricsMode);
  
  // 确保按钮文本正确显示
  const showAllDataBtn = document.getElementById('showAllDataBtn');
  if (showAllDataBtn) {
    showAllDataBtn.textContent = '全部展示';
  }
  
  // 设置全屏选择框的值与当前选择的指标一致
  fullscreenChartMetric.value = currentMetric;
  fullscreenChartMetric.disabled = false; // 确保下拉框可用
  
  // 显示全屏容器
  fullscreenContainer.style.display = 'flex';
  
  // 确保按钮和控件可点击
  const fullscreenControls = document.querySelector('.fullscreen-controls');
  if (fullscreenControls) {
    fullscreenControls.style.position = 'relative';
    fullscreenControls.style.zIndex = '1002';
    fullscreenControls.style.pointerEvents = 'auto';
    
    const buttons = fullscreenControls.querySelectorAll('button, select');
    buttons.forEach(button => {
      button.style.pointerEvents = 'auto';
      button.style.position = 'relative';
      button.style.zIndex = '1003';
    });
  }
  
  // 使用统一的按钮事件绑定函数
  setTimeout(bindFullscreenChartButtons, 100);
  
  // 绘制全屏图表
  drawFullscreenChart();
}

// 切换全部展示模式
function toggleAllMetricsMode() {
  console.log('toggleAllMetricsMode函数被调用，当前状态:', isAllMetricsMode);
  
  // 切换模式状态
  isAllMetricsMode = !isAllMetricsMode;
  
  console.log('切换后的状态:', isAllMetricsMode);
  
  const showAllDataBtn = document.getElementById('showAllDataBtn');
  
  if (showAllDataBtn) {
    // 更新按钮文本
    showAllDataBtn.textContent = isAllMetricsMode ? '单项展示' : '全部展示';
    console.log('按钮文本已更新为:', showAllDataBtn.textContent);
  }
  
  const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
  if (fullscreenChartMetric) {
    // 全部展示模式时禁用下拉框
    fullscreenChartMetric.disabled = isAllMetricsMode;
  }
  
  if (isAllMetricsMode) {
    // 绘制多指标图表
    console.log('切换为多指标图表模式');
    drawAllMetricsChart();
  } else {
    // 恢复单指标图表
    console.log('切换为单指标图表模式');
    drawFullscreenChart();
  }
  
  // 重新绑定按钮事件，确保在模式切换后仍能正常点击
  setTimeout(bindFullscreenChartButtons, 100);
}

// 绘制全部指标图表
function drawAllMetricsChart() {
  const fullscreenChartContainer = document.getElementById('fullscreenChart');
  
  // 清除旧内容
  fullscreenChartContainer.innerHTML = '';
  
  // 如果没有数据，显示提示信息
  if (healthChartData.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 添加all-metrics-mode类
  fullscreenChartContainer.classList.add('all-metrics-mode');
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  fullscreenChartContainer.appendChild(canvas);
  
  // 准备所有图表数据
  const chartLabels = [];
  const datasets = [];
  
  // 获取所有日期（去重）
  healthChartData.forEach(item => {
    const dateStr = formatDate(item.date);
    if (!chartLabels.includes(dateStr)) {
      chartLabels.push(dateStr);
    }
  });
  
  // 对日期进行排序（从旧到新）
  chartLabels.sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  });
  
  // 1. 健康评分数据集
  const healthScoreData = Array(chartLabels.length).fill(null);
  healthChartData.forEach(item => {
    if (item.data && (item.data.healthScore || item.healthScore)) {
      const dateIndex = chartLabels.indexOf(formatDate(item.date));
      if (dateIndex !== -1) {
        const score = item.data.healthScore || item.healthScore || 70;
        healthScoreData[dateIndex] = parseInt(score);
      }
    }
  });
  
  if (healthScoreData.some(d => d !== null)) {
    datasets.push({
      label: translations[currentLanguage].healthScore || '健康评分',
      data: healthScoreData,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-healthScore'
    });
  }
  
  // 2. 体重数据集
  const weightData = Array(chartLabels.length).fill(null);
  healthChartData.forEach(item => {
    if (item.data && item.data.formData && item.data.formData.weight) {
      const dateIndex = chartLabels.indexOf(formatDate(item.date));
      if (dateIndex !== -1) {
        weightData[dateIndex] = parseFloat(item.data.formData.weight);
      }
    }
  });
  
  if (weightData.some(d => d !== null)) {
    datasets.push({
      label: translations[currentLanguage].weight || '体重',
      data: weightData,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-weight'
    });
  }
  
  // 3. BMI数据集
  const bmiData = Array(chartLabels.length).fill(null);
  healthChartData.forEach(item => {
    if (item.data && item.data.formData && item.data.formData.weight && item.data.formData.height) {
      const dateIndex = chartLabels.indexOf(formatDate(item.date));
      if (dateIndex !== -1) {
        const height = parseFloat(item.data.formData.height) / 100; // 转换为米
        const weight = parseFloat(item.data.formData.weight);
        const bmi = weight / (height * height);
        bmiData[dateIndex] = parseFloat(bmi.toFixed(1));
      }
    }
  });
  
  if (bmiData.some(d => d !== null)) {
    datasets.push({
      label: 'BMI',
      data: bmiData,
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-bmi'
    });
  }
  
  // 4. 血压数据集
  const systolicData = Array(chartLabels.length).fill(null);
  const diastolicData = Array(chartLabels.length).fill(null);
  
  healthChartData.forEach(item => {
    if (item.data && item.data.formData && item.data.formData.systolic && item.data.formData.diastolic) {
      const dateIndex = chartLabels.indexOf(formatDate(item.date));
      if (dateIndex !== -1) {
        systolicData[dateIndex] = parseInt(item.data.formData.systolic);
        diastolicData[dateIndex] = parseInt(item.data.formData.diastolic);
      }
    }
  });
  
  if (systolicData.some(d => d !== null)) {
    datasets.push({
      label: translations[currentLanguage].systolic || '收缩压',
      data: systolicData,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-bloodPressure'
    });
  }
  
  if (diastolicData.some(d => d !== null)) {
    datasets.push({
      label: translations[currentLanguage].diastolic || '舒张压',
      data: diastolicData,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-bloodPressure'
    });
  }
  
  // 5. 心率数据集
  const heartRateData = Array(chartLabels.length).fill(null);
  healthChartData.forEach(item => {
    if (item.data && item.data.formData && item.data.formData.heartRate) {
      const dateIndex = chartLabels.indexOf(formatDate(item.date));
      if (dateIndex !== -1) {
        heartRateData[dateIndex] = parseInt(item.data.formData.heartRate);
      }
    }
  });
  
  if (heartRateData.some(d => d !== null)) {
    datasets.push({
      label: translations[currentLanguage].heartRate || '心率',
      data: heartRateData,
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-heartRate'
    });
  }
  
  // 如果没有有效数据，显示提示信息
  if (datasets.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 销毁旧图表
  if (fullscreenChart) {
    fullscreenChart.destroy();
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  fullscreenChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      events: [],  // 空数组表示不处理任何事件
      onHover: null,
      onClick: null,
      interaction: {
        mode: null,
        intersect: false,
        includeInvisible: false,
        events: []
      },
      scales: {
        'y-healthScore': {
          type: 'linear',
          display: datasets.some(d => d.yAxisID === 'y-healthScore'),
          position: 'left',
          title: {
            display: true,
            text: translations[currentLanguage].healthScore || '健康评分',
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666'
          },
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: { size: 12 }
          },
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        'y-weight': {
          type: 'linear',
          display: datasets.some(d => d.yAxisID === 'y-weight'),
          position: 'right',
          title: {
            display: true,
            text: translations[currentLanguage].weight || '体重',
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666'
          },
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: { size: 12 }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        'y-bmi': {
          type: 'linear',
          display: datasets.some(d => d.yAxisID === 'y-bmi'),
          position: 'right',
          title: {
            display: true,
            text: 'BMI',
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666'
          },
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: { size: 12 }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        'y-bloodPressure': {
          type: 'linear',
          display: datasets.some(d => d.yAxisID === 'y-bloodPressure'),
          position: 'left',
          title: {
            display: true,
            text: translations[currentLanguage].bloodPressure || '血压',
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666'
          },
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: { size: 12 }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        'y-heartRate': {
          type: 'linear',
          display: datasets.some(d => d.yAxisID === 'y-heartRate'),
          position: 'right',
          title: {
            display: true,
            text: translations[currentLanguage].heartRate || '心率',
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666'
          },
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: { size: 12 }
          },
          grid: {
            drawOnChartArea: false
          }
        },
        x: {
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: { size: 14 }
          },
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: { size: 14 },
            boxWidth: 40,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: currentTheme === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: currentTheme === 'dark' ? '#fff' : '#333',
          bodyColor: currentTheme === 'dark' ? '#e0e0e0' : '#666',
          borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          titleFont: { size: 16 },
          bodyFont: { size: 14 }
        }
      }
    }
  });
  
  // 图表创建完成后，确保按钮事件正常工作
  setTimeout(() => {
    console.log('多指标图表创建完成，重新设置按钮事件');
    try {
      // 所有按钮的处理
      const buttons = document.querySelectorAll('#fullscreenChartContainer button');
      buttons.forEach(button => {
        button.style.zIndex = "2000";
        button.style.position = "relative";
        button.style.pointerEvents = "auto";
        button.style.cursor = "pointer";
      });
      
      // "全部展示"按钮处理
  const showAllDataBtn = document.getElementById('showAllDataBtn');
  if (showAllDataBtn) {
        showAllDataBtn.onclick = null; // 先清除可能的事件
    showAllDataBtn.addEventListener('click', function(e) {
      console.log('全部展示/单项展示按钮被点击', e);
      e.stopPropagation(); // 阻止事件冒泡
      toggleAllMetricsMode();
    }, true);
      }
      
      // 关闭全屏按钮处理
      const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
      if (closeFullscreenBtn) {
        closeFullscreenBtn.onclick = null; // 先清除可能的事件
        closeFullscreenBtn.addEventListener('click', function(e) {
          console.log('关闭全屏按钮被直接点击', e);
          e.stopPropagation(); // 阻止事件冒泡
          closeFullscreenChart();
        }, true);
      }
    } catch (e) {
      console.error('重新设置按钮事件失败:', e);
    }
  }, 100);
}

// 关闭全屏图表
function closeFullscreenChart() {
  console.log('closeFullscreenChart函数被调用');
  
  const fullscreenContainer = document.getElementById('fullscreenChartContainer');
  const fullscreenChart = document.getElementById('fullscreenChart');
  
  if (!fullscreenContainer) {
    console.error('全屏图表容器元素未找到');
    return;
  }
  
  // 隐藏全屏容器
  fullscreenContainer.style.display = 'none';
  
  // 重置状态
  isAllMetricsMode = false;
  
  // 移除多指标模式类
  if (fullscreenChart) {
    fullscreenChart.classList.remove('all-metrics-mode');
  }
  
  // 销毁图表实例
  if (fullscreenChart) {
    fullscreenChart.destroy();
    fullscreenChart = null;
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 加载历史记录
async function loadHistory() {
  try {
    // 根据当前语言显示加载消息
    const loadingMessage = currentLanguage === 'zh-CN' ? '加载中...' :
                          currentLanguage === 'ru-RU' ? 'Загрузка...' :
                          currentLanguage === 'ja-JP' ? '読み込み中...' :
                          currentLanguage === 'ko-KR' ? '로딩 중...' : 'Loading...';
    
    historyList.innerHTML = `<div class="loading">${loadingMessage}</div>`;
    exportPanel.style.display = 'none';
    selectedHistoryItem = null;
    
    const history = await ipcRenderer.invoke('get-history');
    
    if (history.length === 0) {
      // 根据当前语言显示"暂无历史记录"消息
      const noDataMessage = currentLanguage === 'zh-CN' ? '暂无历史记录' :
                           currentLanguage === 'ru-RU' ? 'Нет истории' :
                           currentLanguage === 'ja-JP' ? '履歴はありません' :
                           currentLanguage === 'ko-KR' ? '기록이 없습니다' : 'No history';
      
      historyList.innerHTML = `<div class="no-data">${noDataMessage}</div>`;
      return;
    }
    
    // 显示历史记录
    historyList.innerHTML = '';
    history.forEach(item => {
      const date = new Date(item.date).toLocaleString('zh-CN');
      const formData = item.data.formData;
      
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.dataset.id = item.id;
      
      // 根据当前语言确定性别显示文本
      let genderText = '';
      if (formData.gender === 'male') {
        genderText = currentLanguage === 'zh-CN' ? '男' : 
                    currentLanguage === 'ru-RU' ? 'Мужской' :
                    currentLanguage === 'ja-JP' ? '男性' :
                    currentLanguage === 'ko-KR' ? '남성' : 'Male';
      } else if (formData.gender === 'female') {
        genderText = currentLanguage === 'zh-CN' ? '女' : 
                    currentLanguage === 'ru-RU' ? 'Женский' :
                    currentLanguage === 'ja-JP' ? '女性' :
                    currentLanguage === 'ko-KR' ? '여성' : 'Female';
      } else {
        genderText = currentLanguage === 'zh-CN' ? '其他' : 
                    currentLanguage === 'ru-RU' ? 'Другой' :
                    currentLanguage === 'ja-JP' ? 'その他' :
                    currentLanguage === 'ko-KR' ? '기타' : 'Other';
      }
      
      // 血压文本
      const bpText = currentLanguage === 'zh-CN' ? '血压' : 
                    currentLanguage === 'ru-RU' ? 'Давление' :
                    currentLanguage === 'ja-JP' ? '血圧' :
                    currentLanguage === 'ko-KR' ? '혈압' : 'BP';
      
      historyItem.innerHTML = `
        <div class="history-date">${date}</div>
        <div class="history-info">
          <div class="history-stats">
            ${formData.age}${currentLanguage === 'zh-CN' ? '岁' : ''} | ${formData.height}${currentLanguage === 'en-US' ? 'in' : 'cm'} | ${formData.weight}${currentLanguage === 'en-US' ? 'lb' : 'kg'} | 
            ${genderText}
            ${formData.systolic && formData.diastolic ? `<br>${bpText}: ${formData.systolic}/${formData.diastolic} mmHg` : ''}
          </div>
          <div class="history-actions">
            <button class="view-btn" data-id="${item.id}">${currentLanguage === 'zh-CN' ? '查看' : 
                                                           currentLanguage === 'ru-RU' ? 'Просмотр' :
                                                           currentLanguage === 'ja-JP' ? '表示' :
                                                           currentLanguage === 'ko-KR' ? '보기' : 'View'}</button>
            <button class="delete-btn" data-id="${item.id}">${currentLanguage === 'zh-CN' ? '删除' : 
                                                             currentLanguage === 'ru-RU' ? 'Удалить' :
                                                             currentLanguage === 'ja-JP' ? '削除' :
                                                             currentLanguage === 'ko-KR' ? '삭제' : 'Delete'}</button>
          </div>
        </div>
      `;
      
      historyList.appendChild(historyItem);
      
      // 绑定查看和删除按钮事件
      historyItem.querySelector('.view-btn').addEventListener('click', () => {
        viewHistoryReport(item);
      });
      
      historyItem.querySelector('.delete-btn').addEventListener('click', async () => {
        // 根据当前语言显示确认消息
        let confirmMessage = '';
        if (currentLanguage === 'zh-CN') {
          confirmMessage = '确定要删除这条记录吗？';
        } else if (currentLanguage === 'ru-RU') {
          confirmMessage = 'Вы уверены, что хотите удалить эту запись?';
        } else if (currentLanguage === 'ja-JP') {
          confirmMessage = 'このレコードを削除してもよろしいですか？';
        } else if (currentLanguage === 'ko-KR') {
          confirmMessage = '이 기록을 삭제하시겠습니까?';
        } else {
          confirmMessage = 'Are you sure you want to delete this record?';
        }
        
        showConfirmDialog(confirmMessage, async () => {
          await deleteHistoryItem(item.id);
          historyItem.remove();
          
          if (historyList.children.length === 0) {
            // 根据当前语言显示"暂无历史记录"消息
            const noDataMessage = currentLanguage === 'zh-CN' ? '暂无历史记录' :
                                 currentLanguage === 'ru-RU' ? 'Нет истории' :
                                 currentLanguage === 'ja-JP' ? '履歴はありません' :
                                 currentLanguage === 'ko-KR' ? '기록이 없습니다' : 'No history';
            
            historyList.innerHTML = `<div class="no-data">${noDataMessage}</div>`;
          }
          
          // 如果删除的是当前选中的项目，隐藏导出面板
          if (selectedHistoryItem && selectedHistoryItem.id === item.id) {
            exportPanel.style.display = 'none';
            selectedHistoryItem = null;
          }
        });
      });
      
      // 点击整个历史记录项选中
      historyItem.addEventListener('click', (e) => {
        // 排除点击按钮的情况
        if (e.target.tagName !== 'BUTTON') {
          selectHistoryItem(item, historyItem);
        }
      });
    });
  } catch (error) {
    // 根据当前语言显示错误消息
    const errorMessage = currentLanguage === 'zh-CN' ? '加载历史记录失败' :
                        currentLanguage === 'ru-RU' ? 'Ошибка загрузки истории' :
                        currentLanguage === 'ja-JP' ? '履歴の読み込みに失敗しました' :
                        currentLanguage === 'ko-KR' ? '기록 로딩 실패' : 'Failed to load history';
    
    historyList.innerHTML = `<div class="error">${errorMessage}: ${error.message}</div>`;
    showToast(`${errorMessage}`, 'error');
  }
  
  // 重新绑定记录图按钮事件
  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  if (showHealthChartBtn) {
    console.log('历史记录加载后重新绑定记录图按钮事件');
    showHealthChartBtn.onclick = function() {
      console.log('记录图按钮被点击');
      showHealthChart();
    };
  }
}

// 显示确认对话框
function showConfirmDialog(message, onConfirm) {
  // 创建对话框容器
  const dialogOverlay = document.createElement('div');
  dialogOverlay.className = 'dialog-overlay';
  
  const dialogBox = document.createElement('div');
  dialogBox.className = 'dialog-box';
  
  // 创建对话框内容
  const dialogContent = document.createElement('div');
  dialogContent.className = 'dialog-content';
  dialogContent.textContent = message;
  
  // 创建按钮容器
  const dialogActions = document.createElement('div');
  dialogActions.className = 'dialog-actions';
  
  // 创建确认和取消按钮
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary';
  
  // 根据当前语言设置确认按钮文本
  if (currentLanguage === 'zh-CN') {
    confirmBtn.textContent = '确定';
  } else if (currentLanguage === 'ru-RU') {
    confirmBtn.textContent = 'Подтвердить';
  } else if (currentLanguage === 'ja-JP') {
    confirmBtn.textContent = '確認';
  } else if (currentLanguage === 'ko-KR') {
    confirmBtn.textContent = '확인';
  } else {
    confirmBtn.textContent = 'Confirm';
  }
  
  confirmBtn.addEventListener('click', () => {
    document.body.removeChild(dialogOverlay);
    onConfirm();
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  
  // 根据当前语言设置取消按钮文本
  if (currentLanguage === 'zh-CN') {
    cancelBtn.textContent = '取消';
  } else if (currentLanguage === 'ru-RU') {
    cancelBtn.textContent = 'Отмена';
  } else if (currentLanguage === 'ja-JP') {
    cancelBtn.textContent = 'キャンセル';
  } else if (currentLanguage === 'ko-KR') {
    cancelBtn.textContent = '취소';
  } else {
    cancelBtn.textContent = 'Cancel';
  }
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(dialogOverlay);
  });
  
  // 组装对话框
  dialogActions.appendChild(cancelBtn);
  dialogActions.appendChild(confirmBtn);
  
  dialogBox.appendChild(dialogContent);
  dialogBox.appendChild(dialogActions);
  
  dialogOverlay.appendChild(dialogBox);
  
  // 添加到页面
  document.body.appendChild(dialogOverlay);
}

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
  
  // 显示导出面板
  exportPanel.style.display = 'block';
}

// 查看历史报告
function viewHistoryReport(item) {
  const report = item.data.report;
  const formData = item.data.formData;
  
  // 显示报告
  displayReport(report, formData);
  
  // 显示报告区域
  showReport();
  
  // 关闭设置面板
  settingsPanel.classList.remove('active');
  settingsOverlay.classList.remove('active');
  document.body.style.overflow = ''; // 恢复滚动
}

// 删除历史记录
async function deleteHistoryItem(id) {
  try {
    await ipcRenderer.invoke('delete-history', id);
    console.log('删除历史记录成功');
    
    // 根据当前语言显示成功消息
    const successMessage = currentLanguage === 'zh-CN' ? '记录已删除' :
                          currentLanguage === 'ru-RU' ? 'Запись удалена' :
                          currentLanguage === 'ja-JP' ? 'レコードが削除されました' :
                          currentLanguage === 'ko-KR' ? '기록이 삭제되었습니다' : 'Record deleted';
    
    showToast(successMessage, 'success');
  } catch (error) {
    console.error('删除历史记录失败:', error);
    
    // 根据当前语言显示错误消息
    const errorMessage = currentLanguage === 'zh-CN' ? '删除失败' :
                        currentLanguage === 'ru-RU' ? 'Ошибка удаления' :
                        currentLanguage === 'ja-JP' ? '削除に失敗しました' :
                        currentLanguage === 'ko-KR' ? '삭제 실패' : 'Delete failed';
    
    showToast(`${errorMessage}: ${error.message}`, 'error');
  }
}

// 处理导出历史记录
async function handleExportHistory() {
  // 根据当前语言确定提示消息
  const selectItemMessage = currentLanguage === 'zh-CN' ? '请先选择一条历史记录' :
                           currentLanguage === 'ru-RU' ? 'Пожалуйста, выберите сначала запись истории' :
                           currentLanguage === 'ja-JP' ? '最初に履歴レコードを選択してください' :
                           currentLanguage === 'ko-KR' ? '먼저 기록을 선택해주세요' : 'Please select a history record first';
  
  if (!selectedHistoryItem) {
    showToast(selectItemMessage, 'warning');
    return;
  }
  
  // 获取选中的导出格式
  const formatElement = document.querySelector('input[name="exportFormat"]:checked');
  const format = formatElement ? formatElement.value : 'pdf';
  
  const report = selectedHistoryItem.data.report;
  const formData = selectedHistoryItem.data.formData;
  const generatedAt = selectedHistoryItem.date;
  
  // 根据格式准备内容
  let content;
  switch (format) {
    case 'txt':
      content = report.replace(/#{1,6} /g, '').replace(/\*\*/g, '');
      break;
    case 'md':
      content = report;
      break;
    case 'html':
      // 使用marked将Markdown转换为HTML
      const htmlContent = marked.parse(report);
      content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${currentLanguage === 'zh-CN' ? '健康报告' :
          currentLanguage === 'ru-RU' ? 'Отчет о здоровье' :
          currentLanguage === 'ja-JP' ? '健康レポート' :
          currentLanguage === 'ko-KR' ? '건강 보고서' : 'Health Report'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1890ff; }
    h2 { color: #333; margin-top: 20px; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  ${htmlContent}
  <footer>
    <p>${currentLanguage === 'zh-CN' ? '生成时间' :
        currentLanguage === 'ru-RU' ? 'Время создания' :
        currentLanguage === 'ja-JP' ? '生成時間' :
        currentLanguage === 'ko-KR' ? '생성 시간' : 'Generated at'}: ${new Date(generatedAt).toLocaleString()}</p>
    <p>${currentLanguage === 'zh-CN' ? '由秤人健康系统生成' :
        currentLanguage === 'ru-RU' ? 'Создано системой управления здоровьем' :
        currentLanguage === 'ja-JP' ? 'ヘルスマネージャーシステムによって生成されました' :
        currentLanguage === 'ko-KR' ? '헬스 매니저 시스템에서 생성됨' : 'Generated by Health Manager System'}</p>
  </footer>
</body>
</html>
      `;
      break;
    default:
      content = report;
  }
  
  try {
    const result = await ipcRenderer.invoke('save-report', { content, format });
    
    if (result.success) {
      const successMessage = currentLanguage === 'zh-CN' ? '报告保存成功' :
                            currentLanguage === 'ru-RU' ? 'Отчет сохранен успешно' :
                            currentLanguage === 'ja-JP' ? 'レポートが正常に保存されました' :
                            currentLanguage === 'ko-KR' ? '보고서가 성공적으로 저장되었습니다' : 'Report saved successfully';
      
      showToast(successMessage, 'success');
    } else {
      const failMessage = currentLanguage === 'zh-CN' ? '保存失败' :
                         currentLanguage === 'ru-RU' ? 'Ошибка сохранения' :
                         currentLanguage === 'ja-JP' ? '保存に失敗しました' :
                         currentLanguage === 'ko-KR' ? '저장 실패' : 'Save failed';
      
      showToast(`${failMessage}: ${result.message}`, 'error');
    }
  } catch (error) {
    const errorMessage = currentLanguage === 'zh-CN' ? '保存报告出错' :
                        currentLanguage === 'ru-RU' ? 'Ошибка при сохранении отчета' :
                        currentLanguage === 'ja-JP' ? 'レポートの保存中にエラーが発生しました' :
                        currentLanguage === 'ko-KR' ? '보고서 저장 중 오류 발생' : 'Error saving report';
    
    showToast(`${errorMessage}: ${error.message}`, 'error');
  }
}

// 处理下载报告
async function handleDownload() {
  // 根据当前语言确定提示消息
  const noReportMessage = currentLanguage === 'zh-CN' ? '没有可下载的报告' :
                         currentLanguage === 'ru-RU' ? 'Нет отчета для скачивания' :
                         currentLanguage === 'ja-JP' ? 'ダウンロードできるレポートがありません' :
                         currentLanguage === 'ko-KR' ? '다운로드할 보고서가 없습니다' : 'No report to download';
  
  if (!currentReportData) {
    showToast(noReportMessage, 'warning');
    return;
  }
  
  // 获取选中的导出格式
  const formatElement = document.querySelector('input[name="exportFormat"]:checked');
  const format = formatElement ? formatElement.value : 'pdf';
  
  // 根据格式准备内容
  let content;
  switch (format) {
    case 'txt':
      content = currentReportData.report.replace(/#{1,6} /g, '').replace(/\*\*/g, '');
      break;
    case 'md':
      content = currentReportData.report;
      break;
    case 'html':
      content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${currentLanguage === 'zh-CN' ? '健康报告' :
          currentLanguage === 'ru-RU' ? 'Отчет о здоровье' :
          currentLanguage === 'ja-JP' ? '健康レポート' :
          currentLanguage === 'ko-KR' ? '건강 보고서' : 'Health Report'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1890ff; }
    h2 { color: #333; margin-top: 20px; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  ${currentReportData.htmlContent}
  <footer>
    <p>${currentLanguage === 'zh-CN' ? '生成时间' :
        currentLanguage === 'ru-RU' ? 'Время создания' :
        currentLanguage === 'ja-JP' ? '生成時間' :
        currentLanguage === 'ko-KR' ? '생성 시간' : 'Generated at'}: ${new Date(currentReportData.generatedAt).toLocaleString()}</p>
    <p>${currentLanguage === 'zh-CN' ? '由秤人健康系统生成' :
        currentLanguage === 'ru-RU' ? 'Создано системой управления здоровьем' :
        currentLanguage === 'ja-JP' ? 'ヘルスマネージャーシステムによって生成されました' :
        currentLanguage === 'ko-KR' ? '헬스 매니저 시스템에서 생성됨' : 'Generated by Health Manager System'}</p>
  </footer>
</body>
</html>
      `;
      break;
    default:
      content = currentReportData.report;
  }
  
  try {
    const result = await ipcRenderer.invoke('save-report', { content, format });
    
    if (result.success) {
      const successMessage = currentLanguage === 'zh-CN' ? '报告保存成功' :
                            currentLanguage === 'ru-RU' ? 'Отчет сохранен успешно' :
                            currentLanguage === 'ja-JP' ? 'レポートが正常に保存されました' :
                            currentLanguage === 'ko-KR' ? '보고서가 성공적으로 저장되었습니다' : 'Report saved successfully';
      
      showToast(successMessage, 'success');
    } else {
      const failMessage = currentLanguage === 'zh-CN' ? '保存失败' :
                         currentLanguage === 'ru-RU' ? 'Ошибка сохранения' :
                         currentLanguage === 'ja-JP' ? '保存に失敗しました' :
                         currentLanguage === 'ko-KR' ? '저장 실패' : 'Save failed';
      
      showToast(`${failMessage}: ${result.message}`, 'error');
    }
  } catch (error) {
    const errorMessage = currentLanguage === 'zh-CN' ? '保存报告出错' :
                        currentLanguage === 'ru-RU' ? 'Ошибка при сохранении отчета' :
                        currentLanguage === 'ja-JP' ? 'レポートの保存中にエラーが発生しました' :
                        currentLanguage === 'ko-KR' ? '보고서 저장 중 오류 발생' : 'Error saving report';
    
    showToast(`${errorMessage}: ${error.message}`, 'error');
  }
}

// 切换设置面板
function toggleSettingsPanel() {
  if (settingsPanel.classList.contains('active')) {
    closeSettingsPanel();
  } else {
    openSettingsPanel();
  }
}

// 显示报告区域
function showReport() {
  formSection.style.display = 'none';
  reportSection.style.display = 'block';
}

// 显示表单区域
function showForm() {
  reportSection.style.display = 'none';
  formSection.style.display = 'block';
}

// 打开设置面板
function openSettingsPanel() {
  settingsPanel.classList.add('active');
  settingsOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // 防止背景滚动
  
  // 初始标签默认是历史记录，所以打开面板时加载历史记录
  const activeTab = document.querySelector('.tab.active');
  if (activeTab && activeTab.dataset.tab === 'history') {
    loadHistory();
  }
}

// 关闭设置面板
function closeSettingsPanel() {
  settingsPanel.classList.remove('active');
  settingsOverlay.classList.remove('active');
  document.body.style.overflow = ''; // 恢复滚动
}

// 选择语言
function selectLanguage(lang) {
  // 移除所有语言选项的选中状态
  languageOptions.forEach(option => {
    option.classList.remove('active');
  });
  
  // 添加当前选择的语言的选中状态
  const selectedOption = document.querySelector(`.language-option[data-lang="${lang}"]`);
  if (selectedOption) {
    selectedOption.classList.add('active');
  }
  
  // 更新当前语言
  currentLanguage = lang;
}

// 应用语言
function applyLanguage(lang) {
  if (!translations[lang]) {
    console.error('不支持的语言:', lang);
    return;
  }
  
  // 更新当前语言
  currentLanguage = lang;
  
  // 检查是否是RTL语言（从右到左阅读的语言）
  const rtlLanguages = ['ar-EG', 'ur-PK'];
  if (rtlLanguages.includes(lang)) {
    document.body.classList.add('rtl');
    document.dir = 'rtl';
  } else {
    document.body.classList.remove('rtl');
    document.dir = 'ltr';
  }
  
  // 更新文档标题
  document.title = translations[lang].appTitle;
  
  // 更新表单标签和占位符
  document.querySelector('.form-section h2').textContent = translations[lang].inputData;
  document.querySelector('label[for="height"]').textContent = translations[lang].height;
  document.querySelector('label[for="weight"]').textContent = translations[lang].weight;
  document.querySelector('label[for="age"]').textContent = translations[lang].age;
  document.querySelector('label[for="gender"]').textContent = translations[lang].gender;
  
  // 更新性别选项
  const genderSelect = document.getElementById('gender');
  genderSelect.options[0].textContent = translations[lang].genderOptions.select;
  genderSelect.options[1].textContent = translations[lang].genderOptions.male;
  genderSelect.options[2].textContent = translations[lang].genderOptions.female;
  genderSelect.options[3].textContent = translations[lang].genderOptions.other;
  
  // 更新血压和心率标签
  document.querySelector('label[for="bloodPressure"]').textContent = translations[lang].bloodPressure;
  document.getElementById('systolic').placeholder = translations[lang].systolic;
  document.getElementById('diastolic').placeholder = translations[lang].diastolic;
  document.querySelector('label[for="heartRate"]').textContent = translations[lang].heartRate;
  
  // 更新睡眠和运动频率标签
  document.querySelector('label[for="sleepHours"]').textContent = translations[lang].sleepHours;
  document.querySelector('label[for="exerciseFrequency"]').textContent = translations[lang].exerciseFrequency;
  
  // 更新运动频率选项
  const exerciseSelect = document.getElementById('exerciseFrequency');
  exerciseSelect.options[0].textContent = translations[lang].exerciseOptions.select;
  exerciseSelect.options[1].textContent = translations[lang].exerciseOptions.none;
  exerciseSelect.options[2].textContent = translations[lang].exerciseOptions.few;
  exerciseSelect.options[3].textContent = translations[lang].exerciseOptions.some;
  exerciseSelect.options[4].textContent = translations[lang].exerciseOptions.many;
  
  // 更新其他表单标签和占位符
  document.querySelector('label[for="medical"]').textContent = translations[lang].medical;
  document.getElementById('medical').placeholder = translations[lang].medicalPlaceholder;
  document.querySelector('label[for="lifestyle"]').textContent = translations[lang].lifestyle;
  document.getElementById('lifestyle').placeholder = translations[lang].lifestylePlaceholder;
  document.querySelector('label[for="diet"]').textContent = translations[lang].diet;
  document.getElementById('diet').placeholder = translations[lang].dietPlaceholder;
  document.querySelector('label[for="concern"]').textContent = translations[lang].concern;
  document.getElementById('concern').placeholder = translations[lang].concernPlaceholder;
  
  // 更新过敏源标签
  const allergensLabel = document.querySelector('.allergens-container').previousElementSibling;
  if (allergensLabel) {
    allergensLabel.textContent = translations[lang].allergens;
  }
  document.getElementById('otherAllergens').placeholder = translations[lang].otherAllergens;
      
      // 更新按钮文本
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = translations[lang].submit;
  const resetBtn = document.querySelector('button[type="reset"]');
  if (resetBtn) resetBtn.textContent = translations[lang].reset;
  
  // 更新报告区域文本
  const reportHeaderH2 = document.querySelector('.report-header h2');
  if (reportHeaderH2) reportHeaderH2.textContent = translations[lang].report;
  if (downloadBtn) downloadBtn.textContent = translations[lang].download;
  if (backToFormBtn) backToFormBtn.textContent = translations[lang].back;
  
  // 更新设置文本
  const settingsBtnSpan = settingsBtn.querySelector('span');
  if (settingsBtnSpan) settingsBtnSpan.textContent = translations[lang].settings;
  
  // 更新设置面板文本
  const settingsHeaderH2 = document.querySelector('.settings-header h2');
  if (settingsHeaderH2) settingsHeaderH2.textContent = translations[lang].settings;
  
  // 更新标签页文本
  const historyTab = document.querySelector('.tab[data-tab="history"]');
  if (historyTab) historyTab.textContent = translations[lang].history;
  
  const themeTab = document.querySelector('.tab[data-tab="theme"]');
  if (themeTab) themeTab.textContent = translations[lang].theme;
  
  const languageTab = document.querySelector('.tab[data-tab="language"]');
  if (languageTab) languageTab.textContent = translations[lang].language;
  
  const apiTab = document.querySelector('.tab[data-tab="api"]');
  if (apiTab) apiTab.textContent = translations[lang].api;
  
  // 更新设置中的标题
  const languageH3 = document.querySelector('#languageContent h3');
  if (languageH3) languageH3.textContent = translations[lang].language;
  
  const themeH3 = document.querySelector('#themeContent h3');
  if (themeH3) themeH3.textContent = translations[lang].theme;
  
  const apiH3 = document.querySelector('#apiContent h3');
  if (apiH3) apiH3.textContent = translations[lang].api;
  
  // 更新设置中的按钮
  const saveLanguageBtn = document.getElementById('saveLanguageSettings');
  if (saveLanguageBtn) saveLanguageBtn.textContent = translations[lang].saveSettings;
  
  const saveThemeBtn = document.getElementById('saveThemeSettings');
  if (saveThemeBtn) saveThemeBtn.textContent = translations[lang].saveSettings;
  
  const resetThemeBtn = document.getElementById('resetThemeSettings');
  if (resetThemeBtn) resetThemeBtn.textContent = translations[lang].resetSettings;
  
  const saveApiBtn = document.getElementById('saveApiSettings');
  if (saveApiBtn) saveApiBtn.textContent = translations[lang].saveSettings;
  
  const resetApiBtn = document.getElementById('resetApiSettings');
  if (resetApiBtn) resetApiBtn.textContent = translations[lang].resetSettings;
  
  // 根据语言更新输入框的placeholder
  if (lang === 'en-US') {
    // 美制单位
    document.getElementById('height').placeholder = "例如: 70";
    document.getElementById('weight').placeholder = "例如: 150";
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
  
  // 更新API剩余次数显示
  updateApiRemainingCount();
}

// 保存语言偏好
function saveLanguagePreferences() {
  // 保存到本地存储
  localStorage.setItem('language', currentLanguage);
  
  // 应用语言
  applyLanguage(currentLanguage);
  
  // 关闭设置面板
  closeSettingsPanel();
  
  // 显示提示
  const successMsg = currentLanguage === 'zh-CN' ? '语言设置已保存' : 
                     currentLanguage === 'en-GB' ? 'Language settings saved' : 
                     currentLanguage === 'en-US' ? 'Language settings saved' :
                     currentLanguage === 'fr-FR' ? 'Paramètres de langue enregistrés' :
                     currentLanguage === 'es-ES' ? 'Configuración de idioma guardada' :
                     currentLanguage === 'ar-EG' ? 'تم حفظ إعدادات اللغة' :
                     currentLanguage === 'ru-RU' ? 'Настройки языка сохранены' :
                     currentLanguage === 'ja-JP' ? '言語設定が保存されました' :
                     currentLanguage === 'ko-KR' ? '언어 설정이 저장되었습니다' :
                     currentLanguage === 'zh-classical' ? '語言設置已存' :
                     'Language settings saved';
                     
  showToast(successMsg, 'success');
}

// 加载语言偏好
function loadLanguagePreferences() {
  const savedLanguage = localStorage.getItem('language');
  
  if (savedLanguage && translations[savedLanguage]) {
    // 更新UI
    selectLanguage(savedLanguage);
    
    // 应用语言
    applyLanguage(savedLanguage);
  } else {
    // 默认语言为中文
    selectLanguage('zh-CN');
  }
}

// 加载API使用数据
function loadApiUsageData() {
  const savedData = localStorage.getItem(API_USAGE_KEY);
  if (savedData) {
    try {
      const apiData = JSON.parse(savedData);
      // 检查是否是今天的数据
      const today = new Date().toDateString();
      if (apiData.date === today) {
        dailyApiUsageCount = apiData.count;
      } else {
        // 如果不是今天的数据，重置计数并更新存储
        resetApiUsageData();
      }
    } catch (error) {
      console.error('Error parsing API usage data:', error);
      resetApiUsageData();
    }
  } else {
    resetApiUsageData();
  }
}

// 重置API使用数据
function resetApiUsageData() {
  dailyApiUsageCount = 0;
  saveApiUsageData();
}

// 保存API使用数据
function saveApiUsageData() {
  const today = new Date().toDateString();
  const apiData = {
    date: today,
    count: dailyApiUsageCount
  };
  localStorage.setItem(API_USAGE_KEY, JSON.stringify(apiData));
}

// 更新API剩余次数显示
function updateApiRemainingCount() {
  const remainingCountElement = document.getElementById('apiRemainingCount');
  if (remainingCountElement) {
    const remaining = Math.max(0, dailyApiUsageLimit - dailyApiUsageCount);
    
    // 根据当前语言显示不同的文本
    let text = '';
    switch (currentLanguage) {
      case 'zh-CN':
        text = `今日剩余次数：${remaining}`;
        break;
      case 'en-GB':
      case 'en-US':
        text = `Remaining today: ${remaining}`;
        break;
      case 'de-DE':
        text = `Heute verbleibend: ${remaining}`;
        break;
      case 'fr-FR':
        text = `Restant aujourd'hui: ${remaining}`;
        break;
      case 'es-ES':
        text = `Restante hoy: ${remaining}`;
        break;
      case 'pt-BR':
        text = `Restante hoje: ${remaining}`;
        break;
      case 'ar-EG':
        text = `المتبقي اليوم: ${remaining}`;
        break;
      case 'ur-PK':
        text = `آج باقی: ${remaining}`;
        break;
      case 'ru-RU':
        text = `Осталось сегодня: ${remaining}`;
        break;
      case 'hi-IN':
        text = `आज शेष: ${remaining}`;
        break;
      case 'ja-JP':
        text = `今日の残り回数: ${remaining}`;
        break;
      case 'ko-KR':
        text = `오늘 남은 횟수: ${remaining}`;
        break;
      case 'zh-classical':
        text = `今日余额: ${remaining}`;
        break;
      default:
        text = `Today remaining: ${remaining}`;
    }
    
    remainingCountElement.textContent = text;
  }
}

// 加载健康记录图表数据
async function loadHealthChartData() {
  try {
    // 获取历史记录数据
    const history = await ipcRenderer.invoke('get-history');
    
    if (history.length === 0) {
      document.getElementById('healthChart').innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
      return;
    }
    
    // 处理历史数据，提取最近6个月的记录
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // 过滤并排序数据（从旧到新）
    healthChartData = history
      .filter(item => new Date(item.date) >= sixMonthsAgo)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 绘制图表
    drawHealthChart();
    
  } catch (error) {
    console.error('加载健康记录图表数据失败:', error);
    document.getElementById('healthChart').innerHTML = `<div class="error">${translations[currentLanguage].error}: ${error.message}</div>`;
  }
}

// 绘制健康记录图表
function drawHealthChart() {
  // 获取图表容器
  const chartCanvas = document.getElementById('healthChart');
  
  // 添加调试日志
  console.log('drawHealthChart被调用，当前指标:', currentMetric);
  
  // 更新选择框状态以匹配当前指标
  const chartMetric = document.getElementById('chartMetric');
  if (chartMetric && chartMetric.value !== currentMetric) {
    chartMetric.value = currentMetric;
  }
  
  // 如果没有数据，显示提示信息
  if (healthChartData.length === 0) {
    chartCanvas.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 清除旧内容
  chartCanvas.innerHTML = '';
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  chartCanvas.appendChild(canvas);
  
  // 根据当前选择的指标准备数据
  const chartLabels = [];
  const chartValues = [];
  const chartData = {
    labels: [],
    datasets: []
  };
  
  // 根据选择的指标处理数据
  switch (currentMetric) {
    case 'healthScore':
      // 健康评分数据
      healthChartData.forEach(item => {
        if (item.data && (item.data.healthScore || item.healthScore)) {
          chartLabels.push(formatDate(item.date));
          // 兼容两种数据格式
          const score = item.data.healthScore || item.healthScore || 70;
          chartValues.push(parseInt(score));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].healthScore || '健康评分',
        data: chartValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
      
    case 'weight':
      // 体重数据
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseFloat(item.data.formData.weight));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].weight || '体重',
        data: chartValues,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
      
    case 'bmi':
      // BMI数据
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight && item.data.formData.height) {
          const height = parseFloat(item.data.formData.height) / 100; // 转换为米
          const weight = parseFloat(item.data.formData.weight);
          const bmi = weight / (height * height);
          
          chartLabels.push(formatDate(item.date));
          chartValues.push(bmi.toFixed(1));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: 'BMI',
        data: chartValues,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
      
    case 'bloodPressure':
      // 血压数据
      const systolicValues = [];
      const diastolicValues = [];
      
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.systolic && item.data.formData.diastolic) {
          chartLabels.push(formatDate(item.date));
          systolicValues.push(parseInt(item.data.formData.systolic));
          diastolicValues.push(parseInt(item.data.formData.diastolic));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [
        {
          label: translations[currentLanguage].systolic || '收缩压',
          data: systolicValues,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: translations[currentLanguage].diastolic || '舒张压',
          data: diastolicValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ];
      break;
      
    case 'heartRate':
      // 心率数据
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.heartRate) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseInt(item.data.formData.heartRate));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].heartRate || '心率',
        data: chartValues,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
  }
  
  // 如果没有有效数据，显示提示信息
  if (chartData.labels.length === 0) {
    chartCanvas.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 销毁旧图表
  if (healthChart) {
    healthChart.destroy();
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  healthChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // 完全禁用Chart.js的默认事件处理
      events: [],  // 空数组表示不处理任何事件
      onHover: null,
      onClick: null,
      interaction: {
        mode: null, // 不使用任何交互模式
        intersect: false,
        includeInvisible: false,
        events: []
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 14 // 全屏模式下更大的字体
            }
          },
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 14 // 全屏模式下更大的字体
            }
          },
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 16 // 全屏模式下更大的字体
            }
          }
        },
        tooltip: {
          backgroundColor: currentTheme === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: currentTheme === 'dark' ? '#fff' : '#333',
          bodyColor: currentTheme === 'dark' ? '#e0e0e0' : '#666',
          borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          titleFont: {
            size: 16 // 全屏模式下更大的字体
          },
          bodyFont: {
            size: 14 // 全屏模式下更大的字体
          }
        }
      }
    }
  });
  
  // 图表创建完成后，确保按钮事件正常工作
  setTimeout(() => {
    console.log('图表创建完成，重新设置按钮事件');
    try {
      if (typeof setupChartButtonEvents === 'function') {
        setupChartButtonEvents();
      }
    } catch (e) {
      console.error('重新设置按钮事件失败:', e);
    }
  }, 100);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init); 

// 自定义字段相关变量
let customFieldsCount = 0;
const customFields = {};

// 添加自定义字段
function addCustomField() {
  const customFieldsContainer = document.getElementById('customFields');
  
  // 创建自定义字段
  const fieldId = `customField_${customFieldsCount}`;
  const fieldDiv = document.createElement('div');
  fieldDiv.className = 'custom-field';
  fieldDiv.dataset.fieldId = fieldId;
  
  // 创建标签输入框
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'form-control custom-field-label';
  labelInput.id = `${fieldId}_label`;
  labelInput.placeholder = '字段名称';
  labelInput.required = true;
  
  // 创建值输入框
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.className = 'form-control custom-field-input';
  valueInput.id = `${fieldId}_value`;
  valueInput.placeholder = '字段值';
  
  // 创建删除按钮
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'custom-field-remove';
  removeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  removeBtn.title = '删除此字段';
  
  // 添加删除功能
  removeBtn.addEventListener('click', () => {
    customFieldsContainer.removeChild(fieldDiv);
    delete customFields[fieldId];
  });
  
  // 将元素添加到字段容器
  fieldDiv.appendChild(labelInput);
  fieldDiv.appendChild(valueInput);
  fieldDiv.appendChild(removeBtn);
  customFieldsContainer.appendChild(fieldDiv);
  
  // 增加计数并保存字段引用
  customFieldsCount++;
  customFields[fieldId] = {
    labelInput: labelInput,
    valueInput: valueInput
  };
  
  // 聚焦于新添加的标签输入框
  labelInput.focus();
}

// 获取所有自定义字段的数据
function getCustomFieldsData() {
  const customData = {};
  
  // 遍历所有自定义字段
  Object.keys(customFields).forEach(fieldId => {
    const field = customFields[fieldId];
    const label = field.labelInput.value.trim();
    const value = field.valueInput.value.trim();
    
    // 只添加有标签的字段
    if (label) {
      customData[label] = value;
    }
  });
  
  return customData;
}

// 初始化自定义字段功能
function initializeCustomFields() {
  const addCustomFieldBtn = document.getElementById('addCustomFieldBtn');
  if (addCustomFieldBtn) {
    addCustomFieldBtn.addEventListener('click', addCustomField);
  }
}

// 绘制全屏图表 - 单指标模式
function drawFullscreenChart() {
  const fullscreenChartContainer = document.getElementById('fullscreenChart');
  
  // 清除旧内容
  fullscreenChartContainer.innerHTML = '';
  
  // 移除多指标模式类
  fullscreenChartContainer.classList.remove('all-metrics-mode');
  
  // 如果没有数据，显示提示信息
  if (healthChartData.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
      return;
    }
    
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  fullscreenChartContainer.appendChild(canvas);
  
  // 准备图表数据（与drawHealthChart相同的数据处理逻辑）
  const chartLabels = [];
  const chartValues = [];
  const chartData = {
    labels: [],
    datasets: []
  };
  
  // 根据选择的指标处理数据
  switch (currentMetric) {
    case 'healthScore':
      // 健康评分数据
      healthChartData.forEach(item => {
        if (item.data && (item.data.healthScore || item.healthScore)) {
          chartLabels.push(formatDate(item.date));
          // 兼容两种数据格式
          const score = item.data.healthScore || item.healthScore || 70;
          chartValues.push(parseInt(score));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].healthScore || '健康评分',
        data: chartValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
        break;
      
    case 'weight':
      // 体重数据
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseFloat(item.data.formData.weight));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].weight || '体重',
        data: chartValues,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
        break;
      
    case 'bmi':
      // BMI数据
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight && item.data.formData.height) {
          const height = parseFloat(item.data.formData.height) / 100; // 转换为米
          const weight = parseFloat(item.data.formData.weight);
          const bmi = weight / (height * height);
          
          chartLabels.push(formatDate(item.date));
          chartValues.push(bmi.toFixed(1));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: 'BMI',
        data: chartValues,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
        break;
      
    case 'bloodPressure':
      // 血压数据
      const systolicValues = [];
      const diastolicValues = [];
      
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.systolic && item.data.formData.diastolic) {
          chartLabels.push(formatDate(item.date));
          systolicValues.push(parseInt(item.data.formData.systolic));
          diastolicValues.push(parseInt(item.data.formData.diastolic));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [
        {
          label: translations[currentLanguage].systolic || '收缩压',
          data: systolicValues,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: translations[currentLanguage].diastolic || '舒张压',
          data: diastolicValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ];
        break;
      
    case 'heartRate':
      // 心率数据
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.heartRate) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseInt(item.data.formData.heartRate));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].heartRate || '心率',
        data: chartValues,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
  }
  
  // 如果没有有效数据，显示提示信息
  if (chartData.labels.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 销毁旧图表
  if (fullscreenChart) {
    fullscreenChart.destroy();
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  fullscreenChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // 完全禁用Chart.js的默认事件处理
      events: [],  // 空数组表示不处理任何事件
      onHover: null,
      onClick: null,
      interaction: {
        mode: null, // 不使用任何交互模式
        intersect: false,
        includeInvisible: false,
        events: []
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 14 // 全屏模式下更大的字体
            }
          },
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 14 // 全屏模式下更大的字体
            }
          },
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 16 // 全屏模式下更大的字体
            }
          }
        },
        tooltip: {
          backgroundColor: currentTheme === 'dark' ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: currentTheme === 'dark' ? '#fff' : '#333',
          bodyColor: currentTheme === 'dark' ? '#e0e0e0' : '#666',
          borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          titleFont: {
            size: 16 // 全屏模式下更大的字体
          },
          bodyFont: {
            size: 14 // 全屏模式下更大的字体
          }
        }
      }
    }
  });
  
  // 图表创建完成后，确保按钮事件正常工作
  setTimeout(() => {
    console.log('全屏图表创建完成，重新设置按钮事件');
    try {
      if (typeof setupChartButtonEvents === 'function') {
        setupChartButtonEvents();
      }
      
      // 额外处理，确保全屏按钮可点击
  const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
  if (closeFullscreenBtn) {
        closeFullscreenBtn.onclick = null; // 先清除可能的事件
    closeFullscreenBtn.addEventListener('click', function(e) {
      console.log('关闭全屏按钮被直接点击', e);
      e.stopPropagation(); // 阻止事件冒泡
      closeFullscreenChart();
    }, true);
    
        // 设置按钮样式确保可见和可点击
    closeFullscreenBtn.style.zIndex = "2000";
    closeFullscreenBtn.style.position = "relative";
    closeFullscreenBtn.style.pointerEvents = "auto";
    closeFullscreenBtn.style.cursor = "pointer";
  }
      
      // 确保全部展示按钮可点击
      const showAllDataBtn = document.getElementById('showAllDataBtn');
      if (showAllDataBtn) {
        showAllDataBtn.onclick = null; // 先清除可能的事件
        showAllDataBtn.addEventListener('click', function(e) {
          console.log('全部展示按钮被直接点击', e);
          e.stopPropagation(); // 阻止事件冒泡
          toggleAllMetricsMode();
        }, true);
        
        // 设置按钮样式确保可见和可点击
        showAllDataBtn.style.zIndex = "2000";
        showAllDataBtn.style.position = "relative";
        showAllDataBtn.style.pointerEvents = "auto";
        showAllDataBtn.style.cursor = "pointer";
      }
    } catch (e) {
      console.error('重新设置按钮事件失败:', e);
    }
  }, 100);
}

// 绑定全屏图表按钮事件
function bindFullscreenChartButtons() {
  console.log('绑定全屏图表按钮事件...');
  
  try {
    // 全部展示/单项展示按钮
    const showAllDataBtn = document.getElementById('showAllDataBtn');
    if (showAllDataBtn) {
      // 先清除所有现有事件
      showAllDataBtn.onclick = null;
      
      // 直接添加新事件监听，不再使用克隆替换方式
      showAllDataBtn.addEventListener('click', function(e) {
        console.log('全部展示/单项展示按钮被点击', e);
        e.stopPropagation(); // 阻止事件冒泡
        toggleAllMetricsMode();
        return false;
      }, true);
      
      // 确保按钮可见和可点击
      showAllDataBtn.style.zIndex = "2000";
      showAllDataBtn.style.position = "relative";
      showAllDataBtn.style.pointerEvents = "auto";
      showAllDataBtn.style.cursor = "pointer";
    }
    
    // 关闭全屏按钮
    const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
    if (closeFullscreenBtn) {
      // 移除所有现有事件（克隆并替换节点）
      const newBtn = closeFullscreenBtn.cloneNode(true);
      closeFullscreenBtn.parentNode.replaceChild(newBtn, closeFullscreenBtn);
      
      // 添加新事件监听
      newBtn.addEventListener('click', function(e) {
        console.log('关闭全屏按钮被点击', e);
        e.stopPropagation(); // 阻止事件冒泡
        closeFullscreenChart();
        return false;
      }, true);
      
      // 确保按钮可见和可点击
      newBtn.style.zIndex = "2000";
      newBtn.style.position = "relative";
      newBtn.style.pointerEvents = "auto";
      newBtn.style.cursor = "pointer";
    }
    
    // 指标选择下拉框
    const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
    if (fullscreenChartMetric) {
      fullscreenChartMetric.addEventListener('change', function(e) {
        e.stopPropagation();
        currentMetric = this.value;
        drawFullscreenChart();
      });
    }
  } catch (err) {
    console.error('绑定全屏图表按钮事件失败:', err);
  }
}

