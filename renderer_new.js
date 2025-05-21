﻿// 鑾峰彇electron鐨刬pcRenderer
const { ipcRenderer } = require('electron');
const marked = require('marked');

// API瀵嗛挜
const TONGYI_API_KEY = 'sk-07ef4701031d41668beebb521e80eaf0';
const DEEPSEEK_API_KEY = 'sk-0b2be14756fe4195a7bc2bcb78d19f8f';
// API浣跨敤闄愬埗鐩稿叧甯搁噺
const API_USAGE_KEY = 'health_api_usage';
const dailyApiUsageLimit = 10;
let dailyApiUsageCount = 0;

// 褰撳墠浣跨敤鐨凙PI绫诲瀷锛堥粯璁や娇鐢ㄩ€氫箟鍗冮棶API锛?let currentAPI = 'tongyi';
// 鑷畾涔堿PI閰嶇疆
let customAPIConfig = null;

// 褰撳墠璇█璁剧疆
let currentLanguage = 'zh-CN';
// 璇█鍖?const translations = {
  'zh-CN': {
    appTitle: '绉や汉 - 涓汉鍋ュ悍绠＄悊涓庡垎鏋愮郴缁?,
    inputData: '杈撳叆鎮ㄧ殑韬綋鏁版嵁',
    height: '韬珮 (cm)',
    weight: '浣撻噸 (kg)',
    age: '骞撮緞',
    gender: '鎬у埆',
    genderOptions: {
      select: '璇烽€夋嫨',
      male: '鐢?,
      female: '濂?,
      other: '鍏朵粬'
    },
    bloodPressure: '琛€鍘?(mmHg)',
    systolic: '鏀剁缉鍘?,
    diastolic: '鑸掑紶鍘?,
    heartRate: '蹇冪巼 (娆?鍒?',
    sleepHours: '骞冲潎鐫＄湢鏃堕暱 (灏忔椂)',
    exerciseFrequency: '姣忓懆杩愬姩棰戠巼',
    exerciseOptions: {
      select: '璇烽€夋嫨',
      none: '涓嶈繍鍔?,
      few: '1-2娆?,
      some: '3-4娆?,
      many: '5娆″強浠ヤ笂'
    },
    medical: '鐥呭彶 (鍙€?',
    medicalPlaceholder: '璇锋弿杩版偍鐨勭梾鍙层€佸鏃忕梾鍙叉垨褰撳墠姝ｅ湪鐢ㄨ嵂鎯呭喌绛?,
    lifestyle: '鐢熸椿涔犳儻',
    lifestylePlaceholder: '璇锋弿杩版偍鐨勪綔鎭椂闂淬€佽繍鍔ㄩ鐜囥€佸伐浣滄€ц川绛?,
    diet: '楗涔犳儻',
    dietPlaceholder: '璇锋弿杩版偍鐨勬棩甯搁ギ椋熺粨鏋勩€佸枩濂姐€佸繉鍙ｇ瓑',
    concern: '涓昏鍋ュ悍椤捐檻 (鍙€?',
    concernPlaceholder: '鎮ㄧ洰鍓嶆渶鍏冲績鐨勫仴搴烽棶棰?,
    allergens: '杩囨晱婧?(鍙€?',
    otherAllergens: '璇疯緭鍏ュ叾浠栬繃鏁忔簮',
    submit: '鐢熸垚鍋ュ悍鎶ュ憡',
    reset: '閲嶇疆',
    report: '鎮ㄧ殑鍋ュ悍鎶ュ憡',
    download: '涓嬭浇鎶ュ憡',
    back: '杩斿洖',
    settings: '璁剧疆',
    history: '鍘嗗彶璁板綍',
    theme: '涓婚',
    api: 'API 璁剧疆',
    language: '璇█',
    saveSettings: '淇濆瓨璁剧疆',
    resetSettings: '閲嶇疆',
    loading: '鍔犺浇涓?..',
    noData: '鏆傛棤鏁版嵁',
    error: '鍑洪敊浜?,
    success: '鎴愬姛',
    warning: '璀﹀憡',
    info: '鎻愮ず',
    // 鍋ュ悍璁板綍鍥捐〃鐩稿叧缈昏瘧
    healthChart: '鍋ュ悍璁板綍鍥捐〃',
    recordChart: '璁板綍鍥?,
    closeChart: '鍏抽棴鍥捐〃',
    healthScore: '鍋ュ悍璇勫垎',
    chartMetrics: {
      healthScore: '鍋ュ悍璇勫垎',
      weight: '浣撻噸',
      bmi: 'BMI',
      bloodPressure: '琛€鍘?,
      heartRate: '蹇冪巼'
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
    // 鍋ュ悍璁板綍鍥捐〃鐩稿叧缈昏瘧
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
    // 鍋ュ悍璁板綍鍥捐〃鐩稿叧缈昏瘧
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
    appTitle: 'Gestionnaire de Sant茅 - Syst猫me de Gestion et d\'Analyse de Sant茅 Personnelle',
    inputData: 'Entrez Vos Donn茅es de Sant茅',
    height: 'Taille (cm)',
    weight: 'Poids (kg)',
    age: '脗ge',
    gender: 'Genre',
    genderOptions: {
      select: 'Veuillez s茅lectionner',
      male: 'Homme',
      female: 'Femme',
      other: 'Autre'
    },
    bloodPressure: 'Tension Art茅rielle (mmHg)',
    systolic: 'Systolique',
    diastolic: 'Diastolique',
    heartRate: 'Fr茅quence Cardiaque (bpm)',
    sleepHours: 'Dur茅e Moyenne de Sommeil (heures)',
    exerciseFrequency: 'Fr茅quence d\'Exercice Hebdomadaire',
    exerciseOptions: {
      select: 'Veuillez s茅lectionner',
      none: 'Pas d\'exercice',
      few: '1-2 fois',
      some: '3-4 fois',
      many: '5+ fois'
    },
    medical: 'Ant茅c茅dents M茅dicaux (optionnel)',
    medicalPlaceholder: 'Veuillez d茅crire vos ant茅c茅dents m茅dicaux, familiaux ou m茅dicaments actuels',
    lifestyle: 'Habitudes de Vie',
    lifestylePlaceholder: 'Veuillez d茅crire votre routine quotidienne, habitudes d\'exercice, nature du travail, etc.',
    diet: 'Habitudes Alimentaires',
    dietPlaceholder: 'Veuillez d茅crire votre structure alimentaire quotidienne, pr茅f茅rences, restrictions, etc.',
    concern: 'Principales Pr茅occupations de Sant茅 (optionnel)',
    concernPlaceholder: 'Quels probl猫mes de sant茅 vous pr茅occupent le plus actuellement',
    allergens: 'Allerg猫nes (optionnel)',
    otherAllergens: 'Veuillez entrer d\'autres allerg猫nes',
    submit: 'G茅n茅rer un Rapport de Sant茅',
    reset: 'R茅initialiser',
    report: 'Votre Rapport de Sant茅',
    download: 'T茅l茅charger le Rapport',
    back: 'Retour',
    settings: 'Param猫tres',
    history: 'Historique',
    theme: 'Th猫me',
    api: 'Param猫tres API',
    language: 'Langue',
    saveSettings: 'Enregistrer les Param猫tres',
    resetSettings: 'R茅initialiser',
    loading: 'Chargement...',
    noData: 'Aucune donn茅e',
    error: 'Erreur',
    success: 'Succ猫s',
    warning: 'Avertissement',
    info: 'Info'
  },
  'es-ES': {
    appTitle: 'Gestor de Salud - Sistema de Gesti贸n y An谩lisis de Salud Personal',
    inputData: 'Ingrese Sus Datos de Salud',
    height: 'Altura (cm)',
    weight: 'Peso (kg)',
    age: 'Edad',
    gender: 'G茅nero',
    genderOptions: {
      select: 'Por favor seleccione',
      male: 'Hombre',
      female: 'Mujer',
      other: 'Otro'
    },
    bloodPressure: 'Presi贸n Arterial (mmHg)',
    systolic: 'Sist贸lica',
    diastolic: 'Diast贸lica',
    heartRate: 'Frecuencia Card铆aca (lpm)',
    sleepHours: 'Duraci贸n Media del Sue帽o (horas)',
    exerciseFrequency: 'Frecuencia de Ejercicio Semanal',
    exerciseOptions: {
      select: 'Por favor seleccione',
      none: 'Sin ejercicio',
      few: '1-2 veces',
      some: '3-4 veces',
      many: '5+ veces'
    },
    medical: 'Historial M茅dico (opcional)',
    medicalPlaceholder: 'Por favor describa su historial m茅dico, antecedentes familiares o medicamentos actuales',
    lifestyle: 'H谩bitos de Vida',
    lifestylePlaceholder: 'Por favor describa su rutina diaria, h谩bitos de ejercicio, naturaleza del trabajo, etc.',
    diet: 'H谩bitos Alimenticios',
    dietPlaceholder: 'Por favor describa su estructura de dieta diaria, preferencias, restricciones, etc.',
    concern: 'Principales Preocupaciones de Salud (opcional)',
    concernPlaceholder: '驴Qu茅 problemas de salud le preocupan m谩s actualmente?',
    allergens: 'Al茅rgenos (opcional)',
    otherAllergens: 'Por favor ingrese otros al茅rgenos',
    submit: 'Generar Informe de Salud',
    reset: 'Reiniciar',
    report: 'Su Informe de Salud',
    download: 'Descargar Informe',
    back: 'Volver',
    settings: 'Configuraci贸n',
    history: 'Historial',
    theme: 'Tema',
    api: 'Configuraci贸n API',
    language: 'Idioma',
    saveSettings: 'Guardar Configuraci贸n',
    resetSettings: 'Reiniciar',
    loading: 'Cargando...',
    noData: 'Sin datos',
    error: 'Error',
    success: '脡xito',
    warning: 'Advertencia',
    info: 'Informaci贸n'
  },
  'ar-EG': {
    appTitle: '賲丿賷乇 丕賱氐丨丞 - 賳馗丕賲 廿丿丕乇丞 賵鬲丨賱賷賱 丕賱氐丨丞 丕賱卮禺氐賷丞',
    inputData: '兀丿禺賱 亘賷丕賳丕鬲 氐丨鬲賰',
    height: '丕賱胤賵賱 (爻賲)',
    weight: '丕賱賵夭賳 (賰噩賲)',
    age: '丕賱毓賲乇',
    gender: '丕賱噩賳爻',
    genderOptions: {
      select: '賷乇噩賶 丕賱丕禺鬲賷丕乇',
      male: '匕賰乇',
      female: '兀賳孬賶',
      other: '丌禺乇'
    },
    bloodPressure: '囟睾胤 丕賱丿賲 (賲賲 夭卅亘賯)',
    systolic: '丕賱丕賳賯亘丕囟賷',
    diastolic: '丕賱丕賳亘爻丕胤賷',
    heartRate: '賲毓丿賱 囟乇亘丕鬲 丕賱賯賱亘 (賳亘囟丞/丿賯賷賯丞)',
    sleepHours: '賲鬲賵爻胤 賲丿丞 丕賱賳賵賲 (爻丕毓丕鬲)',
    exerciseFrequency: '賲毓丿賱 賲賲丕乇爻丞 丕賱乇賷丕囟丞 兀爻亘賵毓賷賸丕',
    exerciseOptions: {
      select: '賷乇噩賶 丕賱丕禺鬲賷丕乇',
      none: '賱丕 鬲賲丕乇賷賳',
      few: '1-2 賲乇丕鬲',
      some: '3-4 賲乇丕鬲',
      many: '5+ 賲乇丕鬲'
    },
    medical: '丕賱鬲丕乇賷禺 丕賱胤亘賷 (丕禺鬲賷丕乇賷)',
    medicalPlaceholder: '賷乇噩賶 賵氐賮 鬲丕乇賷禺賰 丕賱胤亘賷 兀賵 鬲丕乇賷禺 丕賱毓丕卅賱丞 兀賵 丕賱兀丿賵賷丞 丕賱丨丕賱賷丞',
    lifestyle: '兀賳賲丕胤 丕賱丨賷丕丞',
    lifestylePlaceholder: '賷乇噩賶 賵氐賮 乇賵鬲賷賳賰 丕賱賷賵賲賷貙 賵毓丕丿丕鬲 丕賱鬲賲乇賷賳貙 賵胤亘賷毓丞 丕賱毓賲賱貙 廿賱禺.',
    diet: '丕賱毓丕丿丕鬲 丕賱睾匕丕卅賷丞',
    dietPlaceholder: '賷乇噩賶 賵氐賮 賴賷賰賱 賳馗丕賲賰 丕賱睾匕丕卅賷 丕賱賷賵賲賷貙 賵丕賱鬲賮囟賷賱丕鬲貙 賵丕賱賯賷賵丿貙 廿賱禺.',
    concern: '丕賱賲禺丕賵賮 丕賱氐丨賷丞 丕賱乇卅賷爻賷丞 (丕禺鬲賷丕乇賷)',
    concernPlaceholder: '賲丕 賴賷 丕賱賲卮丕賰賱 丕賱氐丨賷丞 丕賱鬲賷 鬲卮睾賱賰 丨丕賱賷賸丕',
    allergens: '賲爻亘亘丕鬲 丕賱丨爻丕爻賷丞 (丕禺鬲賷丕乇賷)',
    otherAllergens: '賷乇噩賶 廿丿禺丕賱 賲爻亘亘丕鬲 丕賱丨爻丕爻賷丞 丕賱兀禺乇賶',
    submit: '廿賳卮丕亍 鬲賯乇賷乇 氐丨賷',
    reset: '廿毓丕丿丞 鬲毓賷賷賳',
    report: '鬲賯乇賷乇賰 丕賱氐丨賷',
    download: '鬲賳夭賷賱 丕賱鬲賯乇賷乇',
    back: '乇噩賵毓',
    settings: '丕賱廿毓丿丕丿丕鬲',
    history: '丕賱爻噩賱',
    theme: '丕賱爻賲丞',
    api: '廿毓丿丕丿丕鬲 API',
    language: '丕賱賱睾丞',
    saveSettings: '丨賮馗 丕賱廿毓丿丕丿丕鬲',
    resetSettings: '廿毓丕丿丞 鬲毓賷賷賳',
    loading: '噩丕乇賷 丕賱鬲丨賲賷賱...',
    noData: '賱丕 鬲賵噩丿 亘賷丕賳丕鬲',
    error: '禺胤兀',
    success: '賳噩丕丨',
    warning: '鬲丨匕賷乇',
    info: '賲毓賱賵賲丕鬲'
  },
  'ru-RU': {
    appTitle: '袦械薪械写卸械褉 蟹写芯褉芯胁褜褟 - 小懈褋褌械屑邪 褍锌褉邪胁谢械薪懈褟 懈 邪薪邪谢懈蟹邪 谢懈褔薪芯谐芯 蟹写芯褉芯胁褜褟',
    inputData: '袙胁械写懈褌械 写邪薪薪褘械 芯 胁邪褕械屑 蟹写芯褉芯胁褜械',
    height: '袪芯褋褌 (褋屑)',
    weight: '袙械褋 (泻谐)',
    age: '袙芯蟹褉邪褋褌',
    gender: '袩芯谢',
    genderOptions: {
      select: '袙褘斜械褉懈褌械',
      male: '袦褍卸褋泻芯泄',
      female: '袞械薪褋泻懈泄',
      other: '袛褉褍谐芯泄'
    },
    bloodPressure: '袣褉芯胁褟薪芯械 写邪胁谢械薪懈械 (屑屑 褉褌.褋褌.)',
    systolic: '小懈褋褌芯谢懈褔械褋泻芯械',
    diastolic: '袛懈邪褋褌芯谢懈褔械褋泻芯械',
    heartRate: '袩褍谢褜褋 (褍写/屑懈薪)',
    sleepHours: '小褉械写薪褟褟 锌褉芯写芯谢卸懈褌械谢褜薪芯褋褌褜 褋薪邪 (褔邪褋芯胁)',
    exerciseFrequency: '效邪褋褌芯褌邪 褌褉械薪懈褉芯胁芯泻 胁 薪械写械谢褞',
    exerciseOptions: {
      select: '袙褘斜械褉懈褌械',
      none: '袧械褌 褌褉械薪懈褉芯胁芯泻',
      few: '1-2 褉邪蟹邪',
      some: '3-4 褉邪蟹邪',
      many: '5+ 褉邪蟹'
    },
    medical: '袦械写懈褑懈薪褋泻邪褟 懈褋褌芯褉懈褟 (薪械芯斜褟蟹邪褌械谢褜薪芯)',
    medicalPlaceholder: '袨锌懈褕懈褌械 胁邪褕褍 屑械写懈褑懈薪褋泻褍褞 懈褋褌芯褉懈褞, 褋械屑械泄薪褍褞 懈褋褌芯褉懈褞 懈谢懈 褌械泻褍褖懈械 谢械泻邪褉褋褌胁邪',
    lifestyle: '袨斜褉邪蟹 卸懈蟹薪懈',
    lifestylePlaceholder: '袨锌懈褕懈褌械 胁邪褕 械卸械写薪械胁薪褘泄 褉邪褋锌芯褉褟写芯泻, 锌褉懈胁褘褔泻懈 褌褉械薪懈褉芯胁芯泻, 褏邪褉邪泻褌械褉 褉邪斜芯褌褘 懈 褌.写.',
    diet: '袩懈褖械胁褘械 锌褉懈胁褘褔泻懈',
    dietPlaceholder: '袨锌懈褕懈褌械 胁邪褕褍 械卸械写薪械胁薪褍褞 褋褌褉褍泻褌褍褉褍 锌懈褌邪薪懈褟, 锌褉械写锌芯褔褌械薪懈褟, 芯谐褉邪薪懈褔械薪懈褟 懈 褌.写.',
    concern: '袨褋薪芯胁薪褘械 锌褉芯斜谢械屑褘 蟹写芯褉芯胁褜褟 (薪械芯斜褟蟹邪褌械谢褜薪芯)',
    concernPlaceholder: '袣邪泻懈械 锌褉芯斜谢械屑褘 蟹写芯褉芯胁褜褟 胁邪褋 斜芯谢褜褕械 胁褋械谐芯 斜械褋锌芯泻芯褟褌 胁 薪邪褋褌芯褟褖械械 胁褉械屑褟',
    allergens: '袗谢谢械褉谐械薪褘 (薪械芯斜褟蟹邪褌械谢褜薪芯)',
    otherAllergens: '袙胁械写懈褌械 写褉褍谐懈械 邪谢谢械褉谐械薪褘',
    submit: '小谐械薪械褉懈褉芯胁邪褌褜 芯褌褔械褌 芯 蟹写芯褉芯胁褜械',
    reset: '小斜褉芯褋懈褌褜',
    report: '袙邪褕 芯褌褔械褌 芯 蟹写芯褉芯胁褜械',
    download: '小泻邪褔邪褌褜 芯褌褔械褌',
    back: '袧邪蟹邪写',
    settings: '袧邪褋褌褉芯泄泻懈',
    history: '袠褋褌芯褉懈褟',
    theme: '孝械屑邪',
    api: '袧邪褋褌褉芯泄泻懈 API',
    language: '携蟹褘泻',
    saveSettings: '小芯褏褉邪薪懈褌褜 薪邪褋褌褉芯泄泻懈',
    resetSettings: '小斜褉芯褋懈褌褜',
    loading: '袟邪谐褉褍蟹泻邪...',
    noData: '袧械褌 写邪薪薪褘褏',
    error: '袨褕懈斜泻邪',
    success: '校褋锌械褏',
    warning: '袩褉械写褍锌褉械卸写械薪懈械',
    info: '袠薪褎芯褉屑邪褑懈褟'
  },
  'ja-JP': {
    appTitle: '銉樸儷銈广優銉嶃兗銈搞儯銉?- 鍊嬩汉鍋ュ悍绠＄悊銉诲垎鏋愩偡銈广儐銉?,
    inputData: '鍋ュ悍銉囥兗銈裤倰鍏ュ姏銇椼仸銇忋仩銇曘亜',
    height: '韬暦 (cm)',
    weight: '浣撻噸 (kg)',
    age: '骞撮舰',
    gender: '鎬у垾',
    genderOptions: {
      select: '閬告姙銇椼仸銇忋仩銇曘亜',
      male: '鐢锋€?,
      female: '濂虫€?,
      other: '銇濄伄浠?
    },
    bloodPressure: '琛€鍦?(mmHg)',
    systolic: '鍙庣府鏈?,
    diastolic: '鎷″嫉鏈?,
    heartRate: '蹇冩媿鏁?(鎷?鍒?',
    sleepHours: '骞冲潎鐫＄湢鏅傞枔 (鏅傞枔)',
    exerciseFrequency: '閫遍枔閬嬪嫊闋诲害',
    exerciseOptions: {
      select: '閬告姙銇椼仸銇忋仩銇曘亜',
      none: '閬嬪嫊銇仐',
      few: '1-2鍥?,
      some: '3-4鍥?,
      many: '5鍥炰互涓?
    },
    medical: '鐥呮 (浠绘剰)',
    medicalPlaceholder: '銇傘仾銇熴伄鐥呮銆佸鏃忔銆併伨銇熴伅鐝惧湪銇柆銇仱銇勩仸瑷樿堪銇椼仸銇忋仩銇曘亜',
    lifestyle: '鐢熸椿缈掓叄',
    lifestylePlaceholder: '鏃ュ父銇儷銉笺儐銈ｃ兂銆侀亱鍕曠繏鎱ｃ€佷粫浜嬨伄鎬ц唱銇仼銇仱銇勩仸瑷樿堪銇椼仸銇忋仩銇曘亜',
    diet: '椋熶簨缈掓叄',
    dietPlaceholder: '姣庢棩銇浜嬫鎴愩€佸ソ銇裤€佸埗闄愩仾銇┿伀銇ゃ亜銇﹁杩般仐銇︺亸銇犮仌銇?,
    concern: '涓汇仾鍋ュ悍涓娿伄鎳稿康 (浠绘剰)',
    concernPlaceholder: '鐝惧湪鏈€銈傛嚫蹇点仐銇︺亜銈嬪仴搴峰晱椤屻伅浣曘仹銇欍亱',
    allergens: '銈儸銉偛銉?(浠绘剰)',
    otherAllergens: '浠栥伄銈儸銉偛銉炽倰鍏ュ姏銇椼仸銇忋仩銇曘亜',
    submit: '鍋ュ悍銉儩銉笺儓銈掔敓鎴?,
    reset: '銉偦銉冦儓',
    report: '銇傘仾銇熴伄鍋ュ悍銉儩銉笺儓',
    download: '銉儩銉笺儓銈掋儉銈︺兂銉兗銉?,
    back: '鎴汇倠',
    settings: '瑷畾',
    history: '灞ユ',
    theme: '銉嗐兗銉?,
    api: 'API瑷畾',
    language: '瑷€瑾?,
    saveSettings: '瑷畾銈掍繚瀛?,
    resetSettings: '銉偦銉冦儓',
    loading: '瑾伩杈笺伩涓?..',
    noData: '銉囥兗銈裤仾銇?,
    error: '銈ㄣ儵銉?,
    success: '鎴愬姛',
    warning: '璀﹀憡',
    info: '鎯呭牨'
  },
  'ko-KR': {
    appTitle: '項姢 毵る媹鞝€ - 臧滌澑 瓯搓皶 甏€毽?氚?攵勳劃 鞁滌姢韰?,
    inputData: '瓯搓皶 雿办澊韯?鞛呺牓',
    height: '韨?(cm)',
    weight: '觳挫 (kg)',
    age: '雮橃澊',
    gender: '靹彪硠',
    genderOptions: {
      select: '靹犿儩頃橃劯鞖?,
      male: '雮劚',
      female: '鞐劚',
      other: '旮绊儉'
    },
    bloodPressure: '順堨晻 (mmHg)',
    systolic: '靾橃稌旮?,
    diastolic: '鞚挫檮旮?,
    heartRate: '鞁皶靾?(須?攵?',
    sleepHours: '韽夑窢 靾橂┐ 鞁滉皠 (鞁滉皠)',
    exerciseFrequency: '欤缄皠 鞖措彊 牍堧弰',
    exerciseOptions: {
      select: '靹犿儩頃橃劯鞖?,
      none: '鞖措彊 鞎堩暔',
      few: '1-2須?,
      some: '3-4須?,
      many: '5須?鞚挫儊'
    },
    medical: '氤戨牓 (靹犿儩靷暛)',
    medicalPlaceholder: '攴€頃橃潣 氤戨牓, 臧€臁彪牓 霕愲姅 順勳灛 氤奠毄 欷戩澑 鞎诫鞐?雽€頃?靹る獏頃挫＜靹胳殧',
    lifestyle: '靸濏櫆 鞀店磤',
    lifestylePlaceholder: '鞚检儊 耄嫶, 鞖措彊 鞀店磤, 鞐呺 韸轨劚 霌膘潉 靹る獏頃挫＜靹胳殧',
    diet: '鞁濎姷甏€',
    dietPlaceholder: '鞚检澕 鞁濍嫧 甑劚, 靹犿樃霃? 鞝滍暅靷暛 霌膘潉 靹る獏頃挫＜靹胳殧',
    concern: '欤检殧 瓯搓皶 鞖半牑靷暛 (靹犿儩靷暛)',
    concernPlaceholder: '順勳灛 臧€鞛?鞖半牑頃橂姅 瓯搓皶 氍胳牅電?氍挫棁鞛呺媹旯?,
    allergens: '鞎岆爤毳搓赴 頃洂 (靹犿儩靷暛)',
    otherAllergens: '雼るジ 鞎岆爤毳搓赴 頃洂鞚?鞛呺牓頃橃劯鞖?,
    submit: '瓯搓皶 氤搓碃靹?靸濎劚',
    reset: '齑堦赴頇?,
    report: '攴€頃橃潣 瓯搓皶 氤搓碃靹?,
    download: '氤搓碃靹?雼れ毚搿滊摐',
    back: '霋る',
    settings: '靹れ爼',
    history: '旮半',
    theme: '韰岆',
    api: 'API 靹れ爼',
    language: '鞏胳柎',
    saveSettings: '靹れ爼 鞝€鞛?,
    resetSettings: '齑堦赴頇?,
    loading: '搿滊敥 欷?..',
    noData: '雿办澊韯?鞐嗢潓',
    error: '鞓る',
    success: '靹标车',
    warning: '瓴疥碃',
    info: '鞝曤炒',
    // 瓯搓皶 彀姼 甏€霠?氩堨棴
    healthChart: '瓯搓皶 旮半 彀姼',
    recordChart: '旮半 彀姼',
    closeChart: '彀姼 雼赴',
    healthScore: '瓯搓皶 鞝愳垬',
    chartMetrics: {
      healthScore: '瓯搓皶 鞝愳垬',
      weight: '觳挫',
      bmi: 'BMI',
      bloodPressure: '順堨晻',
      heartRate: '鞁皶靾?
    },
    expandChart: '頇曥灔',
    languageSettings: '鞏胳柎 靹れ爼',
    selectLanguage: '鞏胳柎 靹犿儩',
    languageInfo: '鞏胳柎毳?鞝勴櫂頃橂┐ 鞚疙劙韼橃澊鞀?韰嶌姢韸? 旄§爼 雼渼 氚?瓯搓皶 響滌鞚?氤€瓴诫惄雼堧嫟.',
    themeSettings: '韰岆 靹れ爼',
    themeOptions: '韰岆 鞓奠厴',
    lightTheme: '霛检澊韸?,
    darkTheme: '雼ろ伂',
    goldTheme: '瓿摐',
    backgroundImage: '氚瓣步 鞚措歆€',
    noBackground: '氚瓣步 鞐嗢潓',
    localImage: '搿滌滑 鞚措歆€',
    imageUrl: '鞚措歆€ URL',
    selectFile: '韺岇澕 靹犿儩',
    clear: '歆€鞖瓣赴',
    apply: '鞝侅毄',
    backgroundPreview: '氚瓣步 氙鸽Μ氤搓赴',
    backgroundAdjustments: '氚瓣步 鞚措歆€ 臁办爼',
    opacity: '攵堩埇氇呺弰',
    blurLevel: '敫旊煬 靾橃',
    zIndex: 'Z-鞚鸽嵄鞀?,
    zIndexDescription: '鞚岇垬 臧掛潃 旖橅厫旄?霋れ棎, 鞏戩垬 臧掛潃 旖橅厫旄?鞎烄棎',
    animationEffects: '鞎犽媹氅旍澊靺?須臣',
    animationDescription: '韥措Ν 鞁?氍挫瀾鞙?靸夓儊鞚?鞚措韹办綐 霕愲姅 鞚措歆€ 響滌嫓',
    pageOpacity: '韼橃澊歆€ 攵堩埇氇呺弰',
    pageOpacityDescription: '"瓯搓皶 雿办澊韯?鞛呺牓" 韼橃澊歆€ 氚瓣步鞚?韴獏霃?臁办爼',
    fontOpacity: '旮€昙?攵堩埇氇呺弰',
    fontOpacityDescription: '韼橃澊歆€ 韰嶌姢韸胳潣 韴獏霃?臁办爼',
    supportAuthor: '鞛戩劚鞛?歆€鞗?,
    apiSettings: 'API 靹れ爼',
    apiKey: 'API 韨?,
    apiEndpoint: 'API 鞐旊摐韽澑韸?,
    apiModel: 'API 氇嵏',
    apiProvider: 'API 鞝滉车鞛?,
    apiUsageInfo: 'API 靷毄 鞝曤炒',
    remainingCalls: '雮潃 API 順胳稖',
    totalCalls: '齑?API 順胳稖 須熿垬',
    resetUsage: '靷毄 雿办澊韯?鞛劋鞝?,
    customApiSettings: '靷毄鞛?鞝曥潣 API 靹れ爼',
    useCustomApi: '靷毄鞛?鞝曥潣 API 靷毄',
    exportOptions: '雮措炒雮搓赴 鞓奠厴',
    exportSelectedRecords: '靹犿儩頃?霠堨綌霌?雮措炒雮搓赴',
    historyChart: '旮半 彀姼',
    unitConverter: '雼渼 氤€頇橁赴',
    convertFrom: '氤€頇?鞗愲掣',
    convertTo: '氤€頇?雽€靸?,
    conversionResult: '氤€頇?瓴瓣臣',
    convertValue: '氤€頇橅暊 臧?,
    convertButton: '氤€頇?,
    conversionFormula: '氤€頇?瓿奠嫕',
    measurementType: '旄§爼 鞙犿槙',
    lengthUnits: '旮胳澊',
    weightUnits: '氍搓矊',
    temperatureUnits: '鞓弰',
    volumeUnits: '攵€頂?,
    areaUnits: '氅挫爜',
    addCustomField: '靷毄鞛?鞝曥潣 頃勲摐 於旉皜',
    customFieldName: '頃勲摐 鞚措',
    customFieldValue: '臧?,
    customFieldUnit: '雼渼 (靹犿儩靷暛)',
    deleteField: '頃勲摐 靷牅',
    closeConverter: '氤€頇橁赴 雼赴'
  },
  'zh-classical': {
    appTitle: '绉や汉 - 椁婄敓瀵熷舰涔嬭',
    inputData: '閷勭埦楂斾箣鏁?,
    height: '韬暦 (灏?',
    weight: '楂旈噸 (鏂?',
    age: '骞存',
    gender: '鎬у垾',
    genderOptions: {
      select: '璜嬮伕涔?,
      male: '鐢?,
      female: '濂?,
      other: '鍏朵粬'
    },
    bloodPressure: '琛€澹?(鍒?',
    systolic: '涓婂',
    diastolic: '涓嬪',
    heartRate: '鑴堟悘 (娆?鍒?',
    sleepHours: '瀵愭檪 (鏅傝景)',
    exerciseFrequency: '鍕曚綔闋绘 (姣忎竷鏃?',
    exerciseOptions: {
      select: '璜嬮伕涔?,
      none: '涓嶅嫊',
      few: '涓€鑷充簩娆?,
      some: '涓夎嚦鍥涙',
      many: '浜旀浠ヤ笂'
    },
    medical: '鐥呭彶 (鍙己)',
    medicalPlaceholder: '璜嬭堪鐖剧梾鍙层€佸鏃忕梾鍙叉垨鐣跺墠鐢ㄨ棩',
    lifestyle: '鐢熸椿涔嬮亾',
    lifestylePlaceholder: '璜嬭堪鐖句綔鎭€佸嫊浣滅繏鎱ｃ€佸伐浣滄€ц唱绛?,
    diet: '椋查涔嬮亾',
    dietPlaceholder: '璜嬭堪鐖炬棩甯搁鐗┿€佸棞濂姐€佸繉鍙ｇ瓑',
    concern: '涓昏椁婄敓涔嬫叜 (鍙己)',
    concernPlaceholder: '鐖剧暥涓嬫渶鐐洪棞蹇冧箣椁婄敓鍟忛',
    allergens: '閬庢晱涔嬫簮 (鍙己)',
    otherAllergens: '璜嬮寗鍏朵粬閬庢晱涔嬫簮',
    submit: '鐢熸垚椁婄敓鍫卞憡',
    reset: '閲嶇疆',
    report: '鐖句箣椁婄敓鍫卞憡',
    download: '涓嬭級鍫卞憡',
    back: '杩斿洖',
    settings: '瑷疆',
    history: '瑷橀寗',
    theme: '涓婚',
    api: 'API 瑷疆',
    language: '瑾炶█',
    saveSettings: '瀛樿ō缃?,
    resetSettings: '閲嶇疆',
    loading: '杓夊叆涓?..',
    noData: '鐒℃暩鎿?,
    error: '鏈夎',
    success: '鎴愬姛',
    warning: '璀︾ず',
    info: '鎻愮ず'
  },
  'pt-BR': {
    appTitle: 'Gerenciador de Sa煤de - Sistema de Gerenciamento e An谩lise de Sa煤de Pessoal',
    inputData: 'Insira Seus Dados de Sa煤de',
    height: 'Altura (cm)',
    weight: 'Peso (kg)',
    age: 'Idade',
    gender: 'G锚nero',
    genderOptions: {
      select: 'Por favor selecione',
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro'
    },
    bloodPressure: 'Press茫o Arterial (mmHg)',
    systolic: 'Sist贸lica',
    diastolic: 'Diast贸lica',
    heartRate: 'Frequ锚ncia Card铆aca (bpm)',
    sleepHours: 'Dura莽茫o M茅dia do Sono (horas)',
    exerciseFrequency: 'Frequ锚ncia de Exerc铆cio Semanal',
    exerciseOptions: {
      select: 'Por favor selecione',
      none: 'Sem exerc铆cio',
      few: '1-2 vezes',
      some: '3-4 vezes',
      many: '5+ vezes'
    },
    medical: 'Hist贸rico M茅dico (opcional)',
    medicalPlaceholder: 'Por favor descreva seu hist贸rico m茅dico, hist贸rico familiar ou medicamentos atuais',
    lifestyle: 'H谩bitos de Vida',
    lifestylePlaceholder: 'Por favor descreva sua rotina di谩ria, h谩bitos de exerc铆cio, natureza do trabalho, etc.',
    diet: 'H谩bitos Alimentares',
    dietPlaceholder: 'Por favor descreva sua estrutura alimentar di谩ria, prefer锚ncias, restri莽玫es, etc.',
    concern: 'Principais Preocupa莽玫es de Sa煤de (opcional)',
    concernPlaceholder: 'Quais problemas de sa煤de mais te preocupam atualmente',
    allergens: 'Al茅rgenos (opcional)',
    otherAllergens: 'Por favor insira outros al茅rgenos',
    submit: 'Gerar Relat贸rio de Sa煤de',
    reset: 'Redefinir',
    report: 'Seu Relat贸rio de Sa煤de',
    download: 'Baixar Relat贸rio',
    back: 'Voltar',
    settings: 'Configura莽玫es',
    history: 'Hist贸rico',
    theme: 'Tema',
    api: 'Configura莽玫es de API',
    language: 'Idioma',
    saveSettings: 'Salvar Configura莽玫es',
    resetSettings: 'Redefinir',
    loading: 'Carregando...',
    noData: 'Sem dados',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Info'
  },
  'hi-IN': {
    appTitle: '啶膏啶掂ぞ啶膏啶ム啶?啶啶班が啶傕ぇ啶?- 啶掂啶啷嵿い啶苦啶?啶膏啶掂ぞ啶膏啶ム啶?啶啶班が啶傕ぇ啶?啶斷ぐ 啶掂た啶多啶侧啶粪ぃ 啶啶班ぃ啶距げ啷€',
    inputData: '啶呧お啶ㄠぞ 啶膏啶掂ぞ啶膏啶ム啶?啶∴啶熰ぞ 啶︵ぐ啷嵿 啶曕ぐ啷囙',
    height: '啶娻啶氞ぞ啶?(啶膏啶)',
    weight: '啶掂啶?(啶曕た啶侧)',
    age: '啶夃ぎ啷嵿ぐ',
    gender: '啶侧た啶傕',
    genderOptions: {
      select: '啶曕啶く啶?啶氞啶ㄠ啶?,
      male: '啶啶班啶?,
      female: '啶す啶苦げ啶?,
      other: '啶呧え啷嵿く'
    },
    bloodPressure: '啶班啷嵿い啶氞ぞ啶?(mmHg)',
    systolic: '啶膏た啶膏啶熰啶侧た啶?,
    diastolic: '啶∴ぞ啶じ啷嵿啷嬥げ啶苦',
    heartRate: '啶灌啶︵く 啶椸い啶?(啶啶啶忇ぎ)',
    sleepHours: '啶斷じ啶?啶ㄠ啶傕う 啶呧さ啶оた (啶樴啶熰)',
    exerciseFrequency: '啶膏ぞ啶啶むぞ啶灌た啶?啶掂啶ぞ啶ぞ啶?啶嗋さ啷冟い啷嵿い啶?,
    exerciseOptions: {
      select: '啶曕啶く啶?啶氞啶ㄠ啶?,
      none: '啶曕啶?啶掂啶ぞ啶ぞ啶?啶ㄠす啷€啶?,
      few: '1-2 啶ぞ啶?,
      some: '3-4 啶ぞ啶?,
      many: '5+ 啶ぞ啶?
    },
    medical: '啶氞た啶曕た啶む啶膏ぞ 啶囙い啶苦す啶距じ (啶掂啶曕げ啷嵿お啶苦)',
    medicalPlaceholder: '啶曕啶く啶?啶呧お啶ㄠ 啶氞た啶曕た啶む啶膏ぞ 啶囙い啶苦す啶距じ, 啶ぐ啶苦さ啶距ぐ 啶曕 啶囙い啶苦す啶距じ 啶ぞ 啶掂ぐ啷嵿い啶ぞ啶?啶︵さ啶距啶?啶曕ぞ 啶掂ぐ啷嵿ぃ啶?啶曕ぐ啷囙',
    lifestyle: '啶溹啶掂え啶多啶侧 啶曕 啶嗋う啶む啶?,
    lifestylePlaceholder: '啶曕啶く啶?啶呧お啶ㄠ 啶︵啶ㄠた啶?啶︵た啶ㄠ啶班啶ぞ, 啶掂啶ぞ啶ぞ啶?啶曕 啶嗋う啶む啶? 啶曕ぞ啶?啶曕 啶啶班啷冟い啶? 啶嗋う啶?啶曕ぞ 啶掂ぐ啷嵿ぃ啶?啶曕ぐ啷囙',
    diet: '啶嗋す啶距ぐ 啶膏啶啶о 啶嗋う啶む啶?,
    dietPlaceholder: '啶曕啶く啶?啶呧お啶ㄠ 啶︵啶ㄠた啶?啶嗋す啶距ぐ 啶膏啶班啶ㄠぞ, 啶啶班ぞ啶ムぎ啶苦啶むぞ啶忇, 啶啶班い啶苦が啶傕ぇ, 啶嗋う啶?啶曕ぞ 啶掂ぐ啷嵿ぃ啶?啶曕ぐ啷囙',
    concern: '啶啶栢啶?啶膏啶掂ぞ啶膏啶ム啶?啶氞た啶傕い啶距啶?(啶掂啶曕げ啷嵿お啶苦)',
    concernPlaceholder: '啶掂ぐ啷嵿い啶ぞ啶?啶啶?啶嗋お 啶曕た啶?啶膏啶掂ぞ啶膏啶ム啶?啶膏ぎ啶膏啶ぞ啶撪 啶膏 啶膏が啶膏 啶呧ぇ啶苦 啶氞た啶傕い啶苦い 啶灌啶?,
    allergens: '啶忇げ啶班啶溹啶?(啶掂啶曕げ啷嵿お啶苦)',
    otherAllergens: '啶曕啶く啶?啶呧え啷嵿く 啶忇げ啶班啶溹啶?啶︵ぐ啷嵿 啶曕ぐ啷囙',
    submit: '啶膏啶掂ぞ啶膏啶ム啶?啶班た啶啶班啶?啶夃い啷嵿お啶ㄠ啶?啶曕ぐ啷囙',
    reset: '啶班啶膏啶?,
    report: '啶嗋お啶曕 啶膏啶掂ぞ啶膏啶ム啶?啶班た啶啶班啶?,
    download: '啶班た啶啶班啶?啶∴ぞ啶夃え啶侧啶?啶曕ぐ啷囙',
    back: '啶掂ぞ啶じ',
    settings: '啶膏啶熰た啶傕啷嵿じ',
    history: '啶囙い啶苦す啶距じ',
    theme: '啶ム啶?,
    api: 'API 啶膏啶熰た啶傕啷嵿じ',
    language: '啶ぞ啶粪ぞ',
    saveSettings: '啶膏啶熰た啶傕啷嵿じ 啶膏す啷囙啷囙',
    resetSettings: '啶班啶膏啶?,
    loading: '啶侧啶?啶灌 啶班す啶?啶灌...',
    noData: '啶曕啶?啶∴啶熰ぞ 啶ㄠす啷€啶?,
    error: '啶む啶班啶熰た',
    success: '啶膏か啶侧い啶?,
    warning: '啶氞啶むぞ啶掂え啷€',
    info: '啶溹ぞ啶ㄠ啶距ぐ啷€'
  },
  'de-DE': {
    appTitle: 'Gesundheitsmanager - System f眉r pers枚nliches Gesundheitsmanagement und -analyse',
    inputData: 'Geben Sie Ihre Gesundheitsdaten ein',
    height: 'Gr枚脽e (cm)',
    weight: 'Gewicht (kg)',
    age: 'Alter',
    gender: 'Geschlecht',
    genderOptions: {
      select: 'Bitte ausw盲hlen',
      male: 'M盲nnlich',
      female: 'Weiblich',
      other: 'Andere'
    },
    bloodPressure: 'Blutdruck (mmHg)',
    systolic: 'Systolisch',
    diastolic: 'Diastolisch',
    heartRate: 'Herzfrequenz (bpm)',
    sleepHours: 'Durchschnittliche Schlafdauer (Stunden)',
    exerciseFrequency: 'W枚chentliche Trainingsfrequenz',
    exerciseOptions: {
      select: 'Bitte ausw盲hlen',
      none: 'Kein Training',
      few: '1-2 mal',
      some: '3-4 mal',
      many: '5+ mal'
    },
    medical: 'Krankengeschichte (optional)',
    medicalPlaceholder: 'Bitte beschreiben Sie Ihre Krankengeschichte, Familiengeschichte oder aktuelle Medikamente',
    lifestyle: 'Lebensstilgewohnheiten',
    lifestylePlaceholder: 'Bitte beschreiben Sie Ihre t盲gliche Routine, Trainingsgewohnheiten, Arbeitsart usw.',
    diet: 'Ern盲hrungsgewohnheiten',
    dietPlaceholder: 'Bitte beschreiben Sie Ihre t盲gliche Ern盲hrungsstruktur, Vorlieben, Einschr盲nkungen usw.',
    concern: 'Hauptgesundheitsbedenken (optional)',
    concernPlaceholder: 'Welche Gesundheitsprobleme bereiten Ihnen derzeit am meisten Sorgen',
    allergens: 'Allergene (optional)',
    otherAllergens: 'Bitte geben Sie andere Allergene ein',
    submit: 'Gesundheitsbericht erstellen',
    reset: 'Zur眉cksetzen',
    report: 'Ihr Gesundheitsbericht',
    download: 'Bericht herunterladen',
    back: 'Zur眉ck',
    settings: 'Einstellungen',
    history: 'Verlauf',
    theme: 'Thema',
    api: 'API-Einstellungen',
    language: 'Sprache',
    saveSettings: 'Einstellungen speichern',
    resetSettings: 'Zur眉cksetzen',
    loading: 'Laden...',
    noData: 'Keine Daten',
    error: 'Fehler',
    success: 'Erfolg',
    warning: 'Warnung',
    info: 'Info',
    healthChart: 'Gesundheitsverlauf',
    recordChart: 'Datenverlauf',
    closeChart: 'Diagramm schlie脽en',
    healthScore: 'Gesundheitsscore',
    chartMetrics: {
      healthScore: 'Gesundheitsscore',
      weight: 'Gewicht',
      bmi: 'BMI',
      bloodPressure: 'Blutdruck',
      heartRate: 'Herzfrequenz'
    },
    expandChart: 'Erweitern',
    languageSettings: 'Spracheinstellungen',
    selectLanguage: 'Sprache ausw盲hlen',
    languageInfo: 'Sprache 盲ndern wird die Texte, Einheiten und Gesundheitsmetriken entsprechend 盲ndern.',
    themeSettings: 'Themeneinstellungen',
    themeOptions: 'Themenoptionen',
    lightTheme: 'Hell',
    darkTheme: 'Dunkel',
    goldTheme: 'Gold',
    backgroundImage: 'Hintergrundbild',
    noBackground: 'Kein Hintergrund',
    localImage: 'Lokales Bild',
    imageUrl: 'Bild-URL',
    selectFile: 'Datei ausw盲hlen',
    clear: 'L枚schen',
    apply: 'Anwenden',
    backgroundPreview: 'Hintergrundvorschau',
    backgroundAdjustments: 'Hintergrundanpassungen',
    opacity: 'Deckkraft',
    blurLevel: 'Unsch盲rfe',
    zIndex: 'Z-Index',
    zIndexDescription: 'Negative Werte hinter dem Inhalt, positive Werte vor dem Inhalt',
    animationEffects: 'Animations-Effekte',
    animationDescription: 'Zuf盲llige Emojis oder Emoticons anzeigen, wenn geklickt',
    pageOpacity: 'Seiten-Deckkraft',
    pageOpacityDescription: 'Deckkraft des Hintergrunds der Gesundheitsdateneingabe-Seite anpassen',
    fontOpacity: 'Schrift-Deckkraft',
    fontOpacityDescription: 'Deckkraft des Seiten-Textes anpassen',
    supportAuthor: 'Autor unterst眉tzen',
    apiSettings: 'API-Einstellungen',
    apiKey: 'API-Schl眉ssel',
    apiEndpoint: 'API-Endpunkt',
    apiModel: 'API-Modell',
    apiProvider: 'API-Anbieter',
    apiUsageInfo: 'API-Nutzungsinformationen',
    remainingCalls: 'Verbleibende API-Aufrufe',
    totalCalls: 'Gesamtanzahl der API-Aufrufe',
    resetUsage: 'Nutzungsdaten zur眉cksetzen',
    customApiSettings: 'Benutzerdefinierte API-Einstellungen',
    useCustomApi: 'Benutzerdefinierte API verwenden',
    exportOptions: 'Exportoptionen',
    exportSelectedRecords: 'Ausgew盲hlte Datens盲tze exportieren',
    historyChart: 'Verlaufsdiagramm',
    unitConverter: 'Einheit-Konverter',
    convertFrom: 'Umrechnen von',
    convertTo: 'Umrechnen in',
    conversionResult: 'Umrechnungsergebnis',
    convertValue: 'Wert umrechnen',
    convertButton: 'Umrechnen',
    conversionFormula: 'Umrechnungsformel',
    measurementType: 'Messart',
    lengthUnits: 'L盲nge',
    weightUnits: 'Gewicht',
    temperatureUnits: 'Temperatur',
    volumeUnits: 'Volumen',
    areaUnits: 'Fl盲che',
    addCustomField: 'Benutzerdefiniertes Feld hinzuf眉gen',
    customFieldName: 'Feldname',
    customFieldValue: 'Wert',
    customFieldUnit: 'Einheit (optional)',
    deleteField: 'Feld l枚schen',
    closeConverter: 'Konverter schlie脽en'
  },
  'ur-PK': {
    appTitle: '氐丨鬲 賲賳蹖噩乇 - 匕丕鬲蹖 氐丨鬲 讴蹝 丕賳鬲馗丕賲 丕賵乇 鬲噩夭蹖蹃 讴丕 賳馗丕賲',
    inputData: '丕倬賳丕 氐丨鬲 讴丕 趫蹖俟丕 丿乇噩 讴乇蹖诤',
    height: '賯丿 (爻蹖賳俟蹖 賲蹖俟乇)',
    weight: '賵夭賳 (讴賱賵诏乇丕賲)',
    age: '毓賲乇',
    gender: '噩賳爻',
    genderOptions: {
      select: '亘乇丕蹃 讴乇賲 賲賳鬲禺亘 讴乇蹖诤',
      male: '賲乇丿',
      female: '毓賵乇鬲',
      other: '丿蹖诏乇'
    },
    bloodPressure: '亘賱趫 倬乇蹖卮乇 (mmHg)',
    systolic: '爻爻俟賵賱讴',
    diastolic: '趫丕蹖爻俟賵賱讴',
    heartRate: '丿賱 讴蹖 丿诰趹讴賳 (bpm)',
    sleepHours: '丕賵爻胤 賳蹖賳丿 讴蹖 賲丿鬲 (诏诰賳俟蹝)',
    exerciseFrequency: '蹃賮鬲蹃 賵丕乇 賵乇夭卮 讴蹖 鬲毓丿丕丿',
    exerciseOptions: {
      select: '亘乇丕蹃 讴乇賲 賲賳鬲禺亘 讴乇蹖诤',
      none: '讴賵卅蹖 賵乇夭卮 賳蹃蹖诤',
      few: '1-2 亘丕乇',
      some: '3-4 亘丕乇',
      many: '5+ 亘丕乇'
    },
    medical: '胤亘蹖 鬲丕乇蹖禺 (丕禺鬲蹖丕乇蹖)',
    medicalPlaceholder: '亘乇丕蹃 讴乇賲 丕倬賳蹖 胤亘蹖 鬲丕乇蹖禺貙 禺丕賳丿丕賳蹖 鬲丕乇蹖禺 蹖丕 賲賵噩賵丿蹃 丕丿賵蹖丕鬲 讴蹖 賵囟丕丨鬲 讴乇蹖诤',
    lifestyle: '胤乇夭 夭賳丿诏蹖 讴蹖 毓丕丿丕鬲',
    lifestylePlaceholder: '亘乇丕蹃 讴乇賲 丕倬賳蹖 乇賵夭丕賳蹃 讴蹖 乇賵俟蹖賳貙 賵乇夭卮 讴蹖 毓丕丿丕鬲貙 讴丕賲 讴蹖 賳賵毓蹖鬲 賵睾蹖乇蹃 讴蹖 賵囟丕丨鬲 讴乇蹖诤',
    diet: '睾匕丕卅蹖 毓丕丿丕鬲',
    dietPlaceholder: '亘乇丕蹃 讴乇賲 丕倬賳蹖 乇賵夭丕賳蹃 讴蹖 睾匕丕卅蹖 爻丕禺鬲貙 鬲乇噩蹖丨丕鬲貙 倬丕亘賳丿蹖丕诤 賵睾蹖乇蹃 讴蹖 賵囟丕丨鬲 讴乇蹖诤',
    concern: '丕蹃賲 氐丨鬲 讴蹖 鬲卮賵蹖卮丕鬲 (丕禺鬲蹖丕乇蹖)',
    concernPlaceholder: '丌倬 賮蹖 丕賱丨丕賱 讴賳 氐丨鬲 讴蹝 賲爻丕卅賱 爻蹝 爻亘 爻蹝 夭蹖丕丿蹃 賮讴乇 賲賳丿 蹃蹖诤',
    allergens: '丕賱乇噩賳 (丕禺鬲蹖丕乇蹖)',
    otherAllergens: '亘乇丕蹃 讴乇賲 丿蹖诏乇 丕賱乇噩賳 丿乇噩 讴乇蹖诤',
    submit: '氐丨鬲 讴蹖 乇倬賵乇俟 亘賳丕卅蹖诤',
    reset: '丿賵亘丕乇蹃 鬲乇鬲蹖亘 丿蹖诤',
    report: '丌倬 讴蹖 氐丨鬲 讴蹖 乇倬賵乇俟',
    download: '乇倬賵乇俟 趫丕丐賳 賱賵趫 讴乇蹖诤',
    back: '賵丕倬爻',
    settings: '鬲乇鬲蹖亘丕鬲',
    history: '鬲丕乇蹖禺',
    theme: '鬲诰蹖賲',
    api: 'API 鬲乇鬲蹖亘丕鬲',
    language: '夭亘丕賳',
    saveSettings: '鬲乇鬲蹖亘丕鬲 賲丨賮賵馗 讴乇蹖诤',
    resetSettings: '丿賵亘丕乇蹃 鬲乇鬲蹖亘 丿蹖诤',
    loading: '賱賵趫 蹃賵 乇蹃丕 蹃蹝...',
    noData: '讴賵卅蹖 趫蹖俟丕 賳蹃蹖诤',
    error: '禺乇丕亘蹖',
    success: '讴丕賲蹖丕亘蹖',
    warning: '丕賳鬲亘丕蹃',
    info: '賲毓賱賵賲丕鬲',
    healthChart: '氐丨鬲 讴丕 乇蹖讴丕乇趫 趩丕乇俟',
    recordChart: '乇蹖讴丕乇趫 趩丕乇俟',
    closeChart: '趩丕乇俟 亘賳丿 讴乇蹖诤',
    healthScore: '氐丨鬲 讴丕 丕爻讴賵乇',
    chartMetrics: {
      healthScore: '氐丨鬲 讴丕 丕爻讴賵乇',
      weight: '賵夭賳',
      bmi: '亘蹖 丕蹖賲 丌卅蹖',
      bloodPressure: '亘賱趫 倬乇蹖卮乇',
      heartRate: '丿賱 讴蹖 丿诰趹讴賳'
    },
    expandChart: '鬲賵爻蹖毓 讴乇蹖诤',
    languageSettings: '夭亘丕賳 讴蹖 鬲乇鬲蹖亘丕鬲',
    selectLanguage: '夭亘丕賳 賲賳鬲禺亘 讴乇蹖诤',
    languageInfo: '夭亘丕賳 鬲亘丿蹖賱 讴乇賳蹝 爻蹝 丕賳俟乇賮蹖爻 讴丕 賲鬲賳貙 倬蹖賲丕卅卮蹖 蹖賵賳俟爻 丕賵乇 氐丨鬲 讴蹝 賲毓蹖丕乇丕鬲 鬲亘丿蹖賱 蹃賵 噩丕卅蹖诤 诏蹝蹟',
    themeSettings: '鬲诰蹖賲 讴蹖 鬲乇鬲蹖亘丕鬲',
    themeOptions: '鬲诰蹖賲 讴蹝 丕禺鬲蹖丕乇丕鬲',
    lightTheme: '乇賵卮賳',
    darkTheme: '鬲丕乇蹖讴',
    goldTheme: '爻賳蹃乇蹖',
    backgroundImage: '倬爻 賲賳馗乇 讴蹖 鬲氐賵蹖乇',
    noBackground: '讴賵卅蹖 倬爻 賲賳馗乇 賳蹃蹖诤',
    localImage: '賲賯丕賲蹖 鬲氐賵蹖乇',
    imageUrl: '鬲氐賵蹖乇 讴丕 URL',
    selectFile: '賮丕卅賱 賲賳鬲禺亘 讴乇蹖诤',
    clear: '氐丕賮 讴乇蹖诤',
    apply: '賱丕诏賵 讴乇蹖诤',
    backgroundPreview: '倬爻 賲賳馗乇 讴丕 倬蹖卮 賳馗丕乇蹃',
    backgroundAdjustments: '倬爻 賲賳馗乇 讴蹖 鬲氐賵蹖乇 讴蹖 丕蹖趫噩爻俟賲賳俟爻',
    opacity: '睾蹖乇 卮賮丕賮蹖鬲',
    blurLevel: '丿诰賳丿賱丕倬賳 讴蹖 爻胤丨',
    zIndex: 'Z-丕賳趫蹖讴爻',
    zIndexDescription: '賲賳賮蹖 丕賯丿丕乇 賲賵丕丿 讴蹝 倬蹖趩诰蹝貙 賲孬亘鬲 丕賯丿丕乇 賲賵丕丿 讴蹝 爻丕賲賳蹝',
    animationEffects: '丕蹖賳蹖賲蹖卮賳 讴蹝 丕孬乇丕鬲',
    animationDescription: '讴賱讴 讴乇鬲蹝 賵賯鬲 亘蹝 鬲乇鬲蹖亘 乇賳诏蹖賳 讴丕賵賲賵噩蹖 蹖丕 丕蹖賲賵噩蹖 丿讴诰丕卅蹖诤',
    pageOpacity: '氐賮丨蹃 讴蹖 睾蹖乇 卮賮丕賮蹖鬲',
    pageOpacityDescription: '丕倬賳丕 氐丨鬲 讴丕 趫蹖俟丕 丿乇噩 讴乇蹖诤 氐賮丨蹃 讴蹝 倬爻 賲賳馗乇 讴蹖 卮賮丕賮蹖鬲 讴賵 丕蹖趫噩爻俟 讴乇蹖诤',
    fontOpacity: '賮賵賳俟 讴蹖 睾蹖乇 卮賮丕賮蹖鬲',
    fontOpacityDescription: '氐賮丨蹃 讴蹝 賲鬲賳 讴蹖 卮賮丕賮蹖鬲 讴賵 丕蹖趫噩爻俟 讴乇蹖诤',
    supportAuthor: '賲氐賳賮 讴蹖 丨賲丕蹖鬲 讴乇蹖诤',
    apiSettings: 'API 鬲乇鬲蹖亘丕鬲',
    apiKey: 'API 讴賱蹖丿',
    apiEndpoint: 'API 丕蹖賳趫倬賵丕卅賳俟',
    apiModel: 'API 賲丕趫賱',
    apiProvider: 'API 賮乇丕蹃賲 讴賳賳丿蹃',
    apiUsageInfo: 'API 丕爻鬲毓賲丕賱 讴蹖 賲毓賱賵賲丕鬲',
    remainingCalls: '亘丕賯蹖 API 讴丕賱夭',
    totalCalls: '讴賱 API 讴丕賱夭 讴蹖 诏卅蹖诤',
    resetUsage: '丕爻鬲毓賲丕賱 讴丕 趫蹖俟丕 丿賵亘丕乇蹃 鬲乇鬲蹖亘 丿蹖诤',
    customApiSettings: '丨爻亘 囟乇賵乇鬲 API 鬲乇鬲蹖亘丕鬲',
    useCustomApi: '丨爻亘 囟乇賵乇鬲 API 丕爻鬲毓賲丕賱 讴乇蹖诤',
    exportOptions: '亘乇丌賲丿 讴蹝 丕禺鬲蹖丕乇丕鬲',
    exportSelectedRecords: '賲賳鬲禺亘 乇蹖讴丕乇趫夭 亘乇丌賲丿 讴乇蹖诤',
    historyChart: '鬲丕乇蹖禺 讴丕 趩丕乇俟',
    unitConverter: '蹖賵賳俟 讴賳賵乇俟乇',
    convertFrom: '鬲亘丿蹖賱 讴乇蹖诤 丕夭',
    convertTo: '鬲亘丿蹖賱 讴乇蹖诤 賲蹖诤',
    conversionResult: '鬲亘丿蹖賱蹖 讴丕 賳鬲蹖噩蹃',
    convertValue: '鬲亘丿蹖賱 讴乇賳蹝 讴蹖 賯蹖賲鬲',
    convertButton: '鬲亘丿蹖賱 讴乇蹖诤',
    conversionFormula: '鬲亘丿蹖賱蹖 讴丕 賮丕乇賲賵賱丕',
    measurementType: '倬蹖賲丕卅卮 讴蹖 賯爻賲',
    lengthUnits: '賱賲亘丕卅蹖',
    weightUnits: '賵夭賳',
    temperatureUnits: '丿乇噩蹃 丨乇丕乇鬲',
    volumeUnits: '丨噩賲',
    areaUnits: '乇賯亘蹃',
    addCustomField: '丨爻亘 囟乇賵乇鬲 賮蹖賱趫 卮丕賲賱 讴乇蹖诤',
    customFieldName: '賮蹖賱趫 讴丕 賳丕賲',
    customFieldValue: '賯蹖賲鬲',
    customFieldUnit: '蹖賵賳俟 (丕禺鬲蹖丕乇蹖)',
    deleteField: '賮蹖賱趫 丨匕賮 讴乇蹖诤',
    closeConverter: '讴賳賵乇俟乇 亘賳丿 讴乇蹖诤'
  }
};

// 涓婚璁剧疆
let currentTheme = 'light';
let customBackground = null;
let animationEnabled = false;

// DOM鍏冪礌
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

// API璁剧疆鐩稿叧鍏冪礌
const apiProvider = document.getElementById('apiProvider');
const customApiSettings = document.getElementById('customApiSettings');
const apiEndpoint = document.getElementById('apiEndpoint');
const apiKey = document.getElementById('apiKey');
const apiModel = document.getElementById('apiModel');
const apiHeaders = document.getElementById('apiHeaders');
const saveApiSettings = document.getElementById('saveApiSettings');
const resetApiSettings = document.getElementById('resetApiSettings');

// 涓婚璁剧疆鐩稿叧鍏冪礌
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

// 琛ㄦ儏鍜岄鏂囧瓧鍒楄〃
const emojis = ['馃槉', '馃槀', '馃帀', '鉁?, '鉂わ笍', '馃憤', '馃専', '馃敟', '馃挴', '馃檶', '馃憦', '馃挭', '馃ぉ', '馃槏', '馃コ'];
const kaomojis = ['(鈮р柦鈮?', '(鉁库棤鈥库棤)', '(鈼曗€库棔鉁?', '(銇ワ健鈼曗€库€库棔锝?銇?, '(锞夆棔銉棔)锞?:锝ワ緹鉁?, '(锝♀櫏鈥库櫏锝?', '銉?銉烩垁銉?锞?, '(鈼徛聪夛絸鈼?', '(鈮р棥鈮?', '(麓鈥?蠅 鈥)'];

// 褰撳墠鎶ュ憡鏁版嵁
let currentReportData = null;
// 褰撳墠閫変腑鐨勫巻鍙茶褰?let selectedHistoryItem = null;

// 鑳屾櫙鍥剧墖璁剧疆
let bgSettings = {
  opacity: 100,
  blur: 0,
  zIndex: 0
};

// 璇█璁剧疆鐩稿叧鍏冪礌
const languageOptions = document.querySelectorAll('.language-option');
const saveLanguageSettings = document.getElementById('saveLanguageSettings');

// 鍗曚綅鎹㈢畻瀹氫箟
const unitDefinitions = {
  length: {
    units: {
      'm': { name: '绫?, nameEN: 'meter', factor: 1 },
      'cm': { name: '鍘樼背', nameEN: 'centimeter', factor: 0.01 },
      'mm': { name: '姣背', nameEN: 'millimeter', factor: 0.001 },
      'km': { name: '鍗冪背', nameEN: 'kilometer', factor: 1000 },
      'in': { name: '鑻卞', nameEN: 'inch', factor: 0.0254 },
      'ft': { name: '鑻卞昂', nameEN: 'foot', factor: 0.3048 },
      'yd': { name: '鐮?, nameEN: 'yard', factor: 0.9144 },
      'mi': { name: '鑻遍噷', nameEN: 'mile', factor: 1609.344 },
      'li': { name: '閲?, nameEN: 'li', factor: 500 },
      'chi': { name: '灏?, nameEN: 'chi', factor: 0.333 },
      'cun': { name: '瀵?, nameEN: 'cun', factor: 0.0333 },
      'zhang': { name: '涓?, nameEN: 'zhang', factor: 3.33 }
    },
    baseUnit: 'm'
  },
  weight: {
    units: {
      'kg': { name: '鍗冨厠', nameEN: 'kilogram', factor: 1 },
      'g': { name: '鍏?, nameEN: 'gram', factor: 0.001 },
      'mg': { name: '姣厠', nameEN: 'milligram', factor: 0.000001 },
      't': { name: '鍚?, nameEN: 'ton', factor: 1000 },
      'lb': { name: '纾?, nameEN: 'pound', factor: 0.45359237 },
      'oz': { name: '鐩庡徃', nameEN: 'ounce', factor: 0.028349523125 },
      'jin': { name: '鏂?, nameEN: 'jin', factor: 0.5 },
      'liang': { name: '涓?, nameEN: 'liang', factor: 0.05 },
      'qian': { name: '閽?, nameEN: 'qian', factor: 0.005 }
    },
    baseUnit: 'kg'
  },
  temperature: {
    units: {
      'C': { name: '鎽勬皬搴?, nameEN: 'Celsius', factor: 1, offset: 0 },
      'F': { name: '鍗庢皬搴?, nameEN: 'Fahrenheit', factor: 5/9, offset: -32 * 5/9 },
      'K': { name: '寮€灏旀枃', nameEN: 'Kelvin', factor: 1, offset: -273.15 }
    },
    baseUnit: 'C',
    specialConversion: true
  },
  area: {
    units: {
      'm2': { name: '骞虫柟绫?, nameEN: 'square meter', factor: 1 },
      'cm2': { name: '骞虫柟鍘樼背', nameEN: 'square centimeter', factor: 0.0001 },
      'km2': { name: '骞虫柟鍗冪背', nameEN: 'square kilometer', factor: 1000000 },
      'ha': { name: '鍏》', nameEN: 'hectare', factor: 10000 },
      'in2': { name: '骞虫柟鑻卞', nameEN: 'square inch', factor: 0.00064516 },
      'ft2': { name: '骞虫柟鑻卞昂', nameEN: 'square foot', factor: 0.09290304 },
      'yd2': { name: '骞虫柟鐮?, nameEN: 'square yard', factor: 0.83612736 },
      'ac': { name: '鑻变憨', nameEN: 'acre', factor: 4046.8564224 },
      'mu': { name: '浜?, nameEN: 'mu', factor: 666.6666667 }
    },
    baseUnit: 'm2'
  },
  volume: {
    units: {
      'L': { name: '鍗?, nameEN: 'liter', factor: 1 },
      'mL': { name: '姣崌', nameEN: 'milliliter', factor: 0.001 },
      'm3': { name: '绔嬫柟绫?, nameEN: 'cubic meter', factor: 1000 },
      'cm3': { name: '绔嬫柟鍘樼背', nameEN: 'cubic centimeter', factor: 0.001 },
      'in3': { name: '绔嬫柟鑻卞', nameEN: 'cubic inch', factor: 0.016387064 },
      'ft3': { name: '绔嬫柟鑻卞昂', nameEN: 'cubic foot', factor: 28.316846592 },
      'gal_us': { name: '缇庡埗鍔犱粦', nameEN: 'US gallon', factor: 3.785411784 },
      'gal_uk': { name: '鑻卞埗鍔犱粦', nameEN: 'UK gallon', factor: 4.54609 },
      'sheng': { name: '鍗?(涓浗浼犵粺)', nameEN: 'sheng', factor: 1 },
      'dou': { name: '鏂?, nameEN: 'dou', factor: 10 },
      'dan': { name: '鐭?, nameEN: 'dan', factor: 100 }
    },
    baseUnit: 'L'
  },
  speed: {
    units: {
      'm/s': { name: '绫?绉?, nameEN: 'meter per second', factor: 1 },
      'km/h': { name: '鍗冪背/鏃?, nameEN: 'kilometer per hour', factor: 0.277777778 },
      'mph': { name: '鑻遍噷/鏃?, nameEN: 'mile per hour', factor: 0.44704 },
      'kn': { name: '鑺?, nameEN: 'knot', factor: 0.514444444 },
      'ft/s': { name: '鑻卞昂/绉?, nameEN: 'foot per second', factor: 0.3048 }
    },
    baseUnit: 'm/s'
  },
  time: {
    units: {
      's': { name: '绉?, nameEN: 'second', factor: 1 },
      'min': { name: '鍒嗛挓', nameEN: 'minute', factor: 60 },
      'h': { name: '灏忔椂', nameEN: 'hour', factor: 3600 },
      'd': { name: '澶?, nameEN: 'day', factor: 86400 },
      'wk': { name: '鍛?, nameEN: 'week', factor: 604800 },
      'mo': { name: '鏈?(骞冲潎)', nameEN: 'month', factor: 2628000 },
      'y': { name: '骞?(骞冲潎)', nameEN: 'year', factor: 31536000 },
      'shi': { name: '鏃?(鍙や唬)', nameEN: 'ancient hour', factor: 7200 },
      'ke': { name: '鍒?(鍙や唬)', nameEN: 'ancient quarter', factor: 900 }
    },
    baseUnit: 's'
  },
  pressure: {
    units: {
      'Pa': { name: '甯曟柉鍗?, nameEN: 'pascal', factor: 1 },
      'kPa': { name: '鍗冨笗', nameEN: 'kilopascal', factor: 1000 },
      'MPa': { name: '鍏嗗笗', nameEN: 'megapascal', factor: 1000000 },
      'bar': { name: '宸?, nameEN: 'bar', factor: 100000 },
      'atm': { name: '鏍囧噯澶ф皵鍘?, nameEN: 'atmosphere', factor: 101325 },
      'mmHg': { name: '姣背姹炴煴', nameEN: 'millimeter of mercury', factor: 133.322 },
      'inHg': { name: '鑻卞姹炴煴', nameEN: 'inch of mercury', factor: 3386.389 },
      'psi': { name: '纾?骞虫柟鑻卞', nameEN: 'pound per square inch', factor: 6894.757 }
    },
    baseUnit: 'Pa'
  },
  energy: {
    units: {
      'J': { name: '鐒﹁€?, nameEN: 'joule', factor: 1 },
      'kJ': { name: '鍗冪劍', nameEN: 'kilojoule', factor: 1000 },
      'cal': { name: '鍗¤矾閲?, nameEN: 'calorie', factor: 4.184 },
      'kcal': { name: '鍗冨崱', nameEN: 'kilocalorie', factor: 4184 },
      'Wh': { name: '鐡︽椂', nameEN: 'watt hour', factor: 3600 },
      'kWh': { name: '鍗冪摝鏃?, nameEN: 'kilowatt hour', factor: 3600000 },
      'eV': { name: '鐢靛瓙浼忕壒', nameEN: 'electronvolt', factor: 1.602176634e-19 },
      'BTU': { name: '鑻辩儹鍗曚綅', nameEN: 'British thermal unit', factor: 1055.05585262 }
    },
    baseUnit: 'J'
  }
};

// 涓嶅悓璇█鐨勫崟浣嶇炕璇戝拰鏂囨湰
const unitTranslations = {
  'zh-CN': {
    typeNames: {
      'length': '闀垮害',
      'weight': '閲嶉噺',
      'temperature': '娓╁害',
      'area': '闈㈢Н',
      'volume': '浣撶Н',
      'speed': '閫熷害',
      'time': '鏃堕棿',
      'pressure': '鍘嬪姏',
      'energy': '鑳介噺'
    },
    converterTitle: '鍗曚綅鎹㈢畻宸ュ叿',
    conversionType: '鎹㈢畻绫诲瀷',
    fromValue: '鏁板€?,
    fromUnit: '浠?,
    toUnit: '鍒?,
    displayLanguage: '鏄剧ず璇█',
    convert: '鎹㈢畻',
    instructions: '浣跨敤璇存槑',
    instructionsText: '閫夋嫨鎹㈢畻绫诲瀷锛岃緭鍏ユ暟鍊煎拰鍗曚綅锛岀偣鍑?鎹㈢畻"鎸夐挳鍗冲彲鑾峰緱缁撴灉銆?,
    languageNote: '鍙互閫夋嫨涓嶅悓鐨勮瑷€鏉ユ樉绀烘崲绠楃粨鏋滃拰鍏紡銆?,
    supportedTypesTitle: '鏀寔鎹㈢畻鐨勭被鍨嬶細',
    equals: '绛変簬',
    formula: '鎹㈢畻鍏紡锛?
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
      'temperature': 'Temp茅rature',
      'area': 'Surface',
      'volume': 'Volume',
      'speed': 'Vitesse',
      'time': 'Temps',
      'pressure': 'Pression',
      'energy': '脡nergie'
    },
    converterTitle: 'Outil de Conversion d\'Unit茅s',
    conversionType: 'Type de Conversion',
    fromValue: 'Valeur',
    fromUnit: 'De',
    toUnit: '脌',
    displayLanguage: 'Langue d\'Affichage',
    convert: 'Convertir',
    instructions: 'Instructions',
    instructionsText: 'S茅lectionnez un type de conversion, entrez une valeur et des unit茅s, puis cliquez sur "Convertir" pour obtenir le r茅sultat.',
    languageNote: 'Vous pouvez s茅lectionner diff茅rentes langues pour afficher les r茅sultats de conversion et la formule.',
    supportedTypesTitle: 'Types de conversion pris en charge:',
    equals: '茅gale',
    formula: 'Formule de conversion:'
  },
  'es-ES': {
    typeNames: {
      'length': 'Longitud',
      'weight': 'Peso',
      'temperature': 'Temperatura',
      'area': '脕rea',
      'volume': 'Volumen',
      'speed': 'Velocidad',
      'time': 'Tiempo',
      'pressure': 'Presi贸n',
      'energy': 'Energ铆a'
    },
    converterTitle: 'Herramienta de Conversi贸n de Unidades',
    conversionType: 'Tipo de Conversi贸n',
    fromValue: 'Valor',
    fromUnit: 'De',
    toUnit: 'A',
    displayLanguage: 'Idioma de Visualizaci贸n',
    convert: 'Convertir',
    instructions: 'Instrucciones',
    instructionsText: 'Seleccione un tipo de conversi贸n, ingrese un valor y unidades, luego haga clic en "Convertir" para obtener el resultado.',
    languageNote: 'Puede seleccionar diferentes idiomas para mostrar los resultados de la conversi贸n y la f贸rmula.',
    supportedTypesTitle: 'Tipos de conversi贸n admitidos:',
    equals: 'equivale a',
    formula: 'F贸rmula de conversi贸n:'
  },
  'zh-classical': {
    typeNames: {
      'length': '闀峰害',
      'weight': '閲嶉噺',
      'temperature': '婧害',
      'area': '闈㈢',
      'volume': '楂旂',
      'speed': '閫熷害',
      'time': '鏅傞枔',
      'pressure': '澹撳姏',
      'energy': '鑳介噺'
    },
    converterTitle: '鍠綅鎻涚畻涔嬪伐鍏?,
    conversionType: '鎻涚畻涔嬮',
    fromValue: '鏁稿€?,
    fromUnit: '濮?,
    toUnit: '绲?,
    displayLanguage: '椤ず涔嬭獮',
    convert: '鎻涚畻',
    instructions: '浣跨敤瑾槑',
    instructionsText: '閬告搰鎻涚畻涔嬮锛岃几鍏ユ暩鍊艰垏鍠綅锛岄粸鎿?鎻涚畻"鎸夐垥鍗冲彲寰楃祼鏋溿€?,
    languageNote: '鍙伕涓嶅悓涔嬭獮锛屼互椤ず鎻涚畻绲愭灉鑸囧叕寮忋€?,
    supportedTypesTitle: '鏀寔鎻涚畻涔嬮锛?,
    equals: '绛夋柤',
    formula: '鎻涚畻鍏紡锛?
  },
  'pt-BR': {
    typeNames: {
      'length': 'Comprimento',
      'weight': 'Peso',
      'temperature': 'Temperatura',
      'area': '脕rea',
      'volume': 'Volume',
      'speed': 'Velocidade',
      'time': 'Tempo',
      'pressure': 'Press茫o',
      'energy': 'Energia'
    },
    converterTitle: 'Ferramenta de Convers茫o de Unidades',
    conversionType: 'Tipo de Convers茫o',
    fromValue: 'Valor',
    fromUnit: 'De',
    toUnit: 'Para',
    displayLanguage: 'Idioma de Exibi莽茫o',
    convert: 'Converter',
    instructions: 'Instru莽玫es',
    instructionsText: 'Selecione um tipo de convers茫o, insira um valor e unidades, depois clique em "Converter" para obter o resultado.',
    languageNote: 'Voc锚 pode seleccionar diferentes idiomas para exibir os resultados da convers茫o e a f贸rmula.',
    supportedTypesTitle: 'Tipos de convers茫o suportados:',
    equals: '茅 igual a',
    formula: 'F贸rmula de convers茫o:'
  },
  'hi-IN': {
    typeNames: {
      'length': '啶侧啶ぞ啶?,
      'weight': '啶掂啶?,
      'temperature': '啶︵ぐ啷嵿啶?啶灌ぐ啶距ぐ啶?,
      'area': '啶曕啶粪啶む啶班か啶?,
      'volume': '啶嗋く啶むえ',
      'speed': '啶椸い啶?,
      'time': '啶膏ぎ啶?,
      'pressure': '啶︵が啶距さ',
      'energy': '啶娻ぐ啷嵿啶?
    },
    converterTitle: '啶囙啶距 啶ぐ啶苦さ啶班啶むえ 啶夃お啶曕ぐ啶?,
    conversionType: '啶ぐ啶苦さ啶班啶むえ 啶啶班啶距ぐ',
    fromValue: '啶ぞ啶?,
    fromUnit: '啶膏',
    toUnit: '啶む',
    displayLanguage: '啶啶班う啶班啶多え 啶ぞ啶粪ぞ',
    convert: '啶ぐ啶苦さ啶班啶むた啶?啶曕ぐ啷囙',
    instructions: '啶ㄠた啶班啶︵啶?,
    instructionsText: '啶ぐ啶苦さ啶班啶むえ 啶啶班啶距ぐ 啶氞啶ㄠ啶? 啶ぞ啶?啶斷ぐ 啶囙啶距啶ぞ啶?啶︵ぐ啷嵿 啶曕ぐ啷囙, 啶た啶?啶ぐ啶苦ぃ啶距ぎ 啶啶班ぞ啶啶?啶曕ぐ啶ㄠ 啶曕 啶侧た啶?"啶ぐ啶苦さ啶班啶むた啶?啶曕ぐ啷囙" 啶ぐ 啶曕啶侧た啶?啶曕ぐ啷囙啷?,
    languageNote: '啶嗋お 啶ぐ啶苦さ啶班啶むえ 啶ぐ啶苦ぃ啶距ぎ啷嬥 啶斷ぐ 啶膏啶む啶?啶曕 啶啶班う啶班啶多た啶?啶曕ぐ啶ㄠ 啶曕 啶侧た啶?啶掂た啶た啶ㄠ啶?啶ぞ啶粪ぞ啶忇 啶氞啶?啶膏啶む 啶灌啶傕イ',
    supportedTypesTitle: '啶膏ぎ啶班啶ムた啶?啶ぐ啶苦さ啶班啶むえ 啶啶班啶距ぐ:',
    equals: '啶ぐ啶距が啶?啶灌',
    formula: '啶ぐ啶苦さ啶班啶むえ 啶膏啶む啶?'
  },
  'de-DE': {
    typeNames: {
      'length': 'L盲nge',
      'weight': 'Gewicht',
      'temperature': 'Temperatur',
      'area': 'Fl盲che',
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
    instructionsText: 'W盲hlen Sie einen Umrechnungstyp, geben Sie einen Wert und Einheiten ein, und klicken Sie dann auf "Umrechnen", um das Ergebnis zu erhalten.',
    languageNote: 'Sie k枚nnen verschiedene Sprachen ausw盲hlen, um die Umrechnungsergebnisse und die Formel anzuzeigen.',
    supportedTypesTitle: 'Unterst眉tzte Umrechnungstypen:',
    equals: 'ist gleich',
    formula: 'Umrechnungsformel:'
  },
  'ur-PK': {
    typeNames: {
      'length': '賱賲亘丕卅蹖',
      'weight': '賵夭賳',
      'temperature': '丿乇噩蹃 丨乇丕乇鬲',
      'area': '乇賯亘蹃',
      'volume': '丨噩賲',
      'speed': '乇賮鬲丕乇',
      'time': '賵賯鬲',
      'pressure': '丿亘丕丐',
      'energy': '鬲賵丕賳丕卅蹖'
    },
    converterTitle: '蹖賵賳俟 鬲亘丿蹖賱蹖 讴丕 丌賱蹃',
    conversionType: '鬲亘丿蹖賱蹖 讴蹖 賯爻賲',
    fromValue: '賯蹖賲鬲',
    fromUnit: '爻蹝',
    toUnit: '鬲讴',
    displayLanguage: '趫爻倬賱蹝 讴蹖 夭亘丕賳',
    convert: '鬲亘丿蹖賱 讴乇蹖诤',
    instructions: '蹃丿丕蹖丕鬲',
    instructionsText: '鬲亘丿蹖賱蹖 讴蹖 賯爻賲 賲賳鬲禺亘 讴乇蹖诤貙 賯蹖賲鬲 丕賵乇 蹖賵賳俟爻 丿乇噩 讴乇蹖诤貙 倬诰乇 賳鬲蹖噩蹃 丨丕氐賱 讴乇賳蹝 讴蹝 賱蹖蹝 "鬲亘丿蹖賱 讴乇蹖诤" 倬乇 讴賱讴 讴乇蹖诤蹟',
    languageNote: '丌倬 鬲亘丿蹖賱蹖 讴蹝 賳鬲丕卅噩 丕賵乇 賮丕乇賲賵賱蹃 丿讴诰丕賳蹝 讴蹝 賱蹖蹝 賲禺鬲賱賮 夭亘丕賳蹖诤 賲賳鬲禺亘 讴乇 爻讴鬲蹝 蹃蹖诤蹟',
    supportedTypesTitle: '爻倬賵乇俟 卮丿蹃 鬲亘丿蹖賱蹖 讴蹖 丕賯爻丕賲:',
    equals: '亘乇丕亘乇 蹃蹝',
    formula: '鬲亘丿蹖賱蹖 讴丕 賮丕乇賲賵賱蹃:'
  }
};

// 鍒濆鍖栧崟浣嶉€夋嫨鍣?function initializeUnitConverter() {
  const conversionTypeSelect = document.getElementById('conversionType');
  const fromUnitSelect = document.getElementById('fromUnit');
  const toUnitSelect = document.getElementById('toUnit');
  const converterLanguageSelect = document.getElementById('converterLanguage');
  const fromValueInput = document.getElementById('fromValue');
  const convertBtn = document.getElementById('convertBtn');
  const resultValueSpan = document.getElementById('resultValue');
  const resultFormulaSpan = document.getElementById('resultFormula');
  
  // 缁戝畾浜嬩欢澶勭悊绋嬪簭
  conversionTypeSelect.addEventListener('change', updateUnitOptions);
  convertBtn.addEventListener('click', performConversion);
  converterLanguageSelect.addEventListener('change', updateConverterLanguage);
  
  // 鍒濆鍖栬浆鎹㈢被鍨嬮€夐」
  updateUnitOptions();
  
  // 鏇存柊杞崲鍣ㄨ瑷€鍒板綋鍓嶇郴缁熻瑷€
  converterLanguageSelect.value = currentLanguage;
  updateConverterLanguage();
  
  // 鏇存柊鍗曚綅閫夐」
  function updateUnitOptions() {
    const selectedType = conversionTypeSelect.value;
    const unitType = unitDefinitions[selectedType];
    
    if (!unitType) return;
    
    // 娓呯┖褰撳墠閫夐」
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    
    // 娣诲姞鏂伴€夐」
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
    
    // 榛樿閫夋嫨涓嶅悓鐨勫崟浣?    if (fromUnitSelect.options.length > 0) {
      fromUnitSelect.selectedIndex = 0;
    }
    
    if (toUnitSelect.options.length > 1) {
      toUnitSelect.selectedIndex = 1;
    } else if (toUnitSelect.options.length > 0) {
      toUnitSelect.selectedIndex = 0;
    }
  }
  
  // 鎵ц鍗曚綅杞崲
  function performConversion() {
    const selectedType = conversionTypeSelect.value;
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    const fromValue = parseFloat(fromValueInput.value);
    const selectedLanguage = converterLanguageSelect.value;
    
    if (isNaN(fromValue)) {
      showToast('璇疯緭鍏ユ湁鏁堢殑鏁板€?, 'error');
      return;
    }
    
    const unitType = unitDefinitions[selectedType];
    if (!unitType) return;
    
    let result, formula;
    
    // 澶勭悊鐗规畩鐨勬俯搴﹁浆鎹?    if (selectedType === 'temperature' && unitType.specialConversion) {
      result = convertTemperature(fromValue, fromUnit, toUnit);
      formula = getTemperatureFormula(fromValue, fromUnit, toUnit, selectedLanguage);
    } else {
      // 鏍囧噯绾挎€ц浆鎹?      const fromFactor = unitType.units[fromUnit].factor;
      const toFactor = unitType.units[toUnit].factor;
      
      // 杞崲鍒板熀鏈崟浣嶏紝鐒跺悗杞崲鍒扮洰鏍囧崟浣?      const baseValue = fromValue * fromFactor;
      result = baseValue / toFactor;
      
      // 鐢熸垚鍏紡
      formula = getLinearFormula(fromValue, fromUnit, toUnit, fromFactor, toFactor, selectedLanguage);
    }
    
    // 鏄剧ず缁撴灉
    const fromUnitName = getUnitName(selectedType, fromUnit, selectedLanguage);
    const toUnitName = getUnitName(selectedType, toUnit, selectedLanguage);
    const equalsText = unitTranslations[selectedLanguage]?.equals || '绛変簬';
    
    resultValueSpan.textContent = `${fromValue} ${fromUnitName} ${equalsText} ${result.toFixed(6)} ${toUnitName}`;
    resultFormulaSpan.textContent = formula;
  }
  
  // 鏇存柊杞崲鍣ㄨ瑷€
  function updateConverterLanguage() {
    const selectedLanguage = converterLanguageSelect.value;
    const translations = unitTranslations[selectedLanguage] || unitTranslations['zh-CN'];
    
    // 鏇存柊鏍囬鍜屾爣绛?    document.querySelector('.converter-header h2').textContent = translations.converterTitle;
    document.querySelector('label[for="conversionType"]').textContent = translations.conversionType;
    document.querySelector('label[for="fromValue"]').textContent = translations.fromValue;
    document.querySelector('label[for="fromUnit"]').textContent = translations.fromUnit;
    document.querySelector('label[for="toUnit"]').textContent = translations.toUnit;
    document.querySelector('label[for="converterLanguage"]').textContent = translations.displayLanguage;
    convertBtn.textContent = translations.convert;
    
    // 鏇存柊绫诲瀷閫夐」
    conversionTypeSelect.innerHTML = '';
    Object.keys(translations.typeNames).forEach(typeKey => {
      const option = document.createElement('option');
      option.value = typeKey;
      option.textContent = translations.typeNames[typeKey];
      conversionTypeSelect.appendChild(option);
    });
    
    // 鏇存柊甯姪鏂囨湰
    document.querySelector('.converter-help h3').textContent = translations.instructions;
    document.querySelector('.converter-help p:nth-of-type(1)').textContent = translations.instructionsText;
    document.querySelector('.converter-help p:nth-of-type(2)').textContent = translations.languageNote;
    document.querySelector('.converter-help h4').textContent = translations.supportedTypesTitle;
    
    // 淇濇寔涔嬪墠閫夋嫨鐨勭被鍨?    const prevType = unitDefinitions[conversionTypeSelect.value] ? conversionTypeSelect.value : 'length';
    conversionTypeSelect.value = prevType;
    
    // 鏇存柊鍗曚綅閫夐」
    updateUnitOptions();
  }
  
  // 娓╁害杞崲
  function convertTemperature(value, fromUnit, toUnit) {
    // 鍏堣浆鎹㈠埌鎽勬皬搴?    let celsius;
    if (fromUnit === 'C') {
      celsius = value;
    } else if (fromUnit === 'F') {
      celsius = (value - 32) * 5/9;
    } else if (fromUnit === 'K') {
      celsius = value - 273.15;
    }
    
    // 浠庢憚姘忓害杞崲鍒扮洰鏍囧崟浣?    if (toUnit === 'C') {
      return celsius;
    } else if (toUnit === 'F') {
      return celsius * 9/5 + 32;
    } else if (toUnit === 'K') {
      return celsius + 273.15;
    }
    
    return 0;
  }
  
  // 鑾峰彇娓╁害杞崲鍏紡
  function getTemperatureFormula(value, fromUnit, toUnit, lang) {
    const translations = unitTranslations[lang] || unitTranslations['zh-CN'];
    const formulaPrefix = translations.formula;
    
    if (fromUnit === 'C' && toUnit === 'F') {
      return `${formulaPrefix} ${value} 掳C 脳 9/5 + 32 = ${(value * 9/5 + 32).toFixed(2)} 掳F`;
    } else if (fromUnit === 'C' && toUnit === 'K') {
      return `${formulaPrefix} ${value} 掳C + 273.15 = ${(value + 273.15).toFixed(2)} K`;
    } else if (fromUnit === 'F' && toUnit === 'C') {
      return `${formulaPrefix} (${value} 掳F - 32) 脳 5/9 = ${((value - 32) * 5/9).toFixed(2)} 掳C`;
    } else if (fromUnit === 'F' && toUnit === 'K') {
      return `${formulaPrefix} (${value} 掳F - 32) 脳 5/9 + 273.15 = ${((value - 32) * 5/9 + 273.15).toFixed(2)} K`;
    } else if (fromUnit === 'K' && toUnit === 'C') {
      return `${formulaPrefix} ${value} K - 273.15 = ${(value - 273.15).toFixed(2)} 掳C`;
    } else if (fromUnit === 'K' && toUnit === 'F') {
      return `${formulaPrefix} (${value} K - 273.15) 脳 9/5 + 32 = ${((value - 273.15) * 9/5 + 32).toFixed(2)} 掳F`;
    } else {
      return `${formulaPrefix} ${value} ${getUnitName('temperature', fromUnit, lang)} = ${value} ${getUnitName('temperature', toUnit, lang)}`;
    }
  }
  
  // 鑾峰彇绾挎€ц浆鎹㈠叕寮?  function getLinearFormula(value, fromUnit, toUnit, fromFactor, toFactor, lang) {
    const translations = unitTranslations[lang] || unitTranslations['zh-CN'];
    const formulaPrefix = translations.formula;
    
    if (fromFactor === toFactor) {
      return `${formulaPrefix} ${value} ${getUnitName('', fromUnit, lang)} = ${value} ${getUnitName('', toUnit, lang)}`;
    }
    
    const conversionFactor = fromFactor / toFactor;
    return `${formulaPrefix} ${value} ${getUnitName('', fromUnit, lang)} 脳 ${conversionFactor.toFixed(6)} = ${(value * conversionFactor).toFixed(6)} ${getUnitName('', toUnit, lang)}`;
  }
  
  // 鏍规嵁璇█鑾峰彇鍗曚綅鍚嶇О
  function getUnitName(type, unitKey, lang) {
    if (!unitKey) return '';
    
    // 涓鸿嫳璇拰鍏朵粬瑗挎柟璇█浣跨敤鑻辨枃鍚嶇О
    if (lang.startsWith('en') || lang.startsWith('fr') || lang.startsWith('es')) {
      if (type && unitDefinitions[type] && unitDefinitions[type].units[unitKey]) {
        return unitDefinitions[type].units[unitKey].nameEN;
      } else {
        // 鏌ユ壘鎵€鏈夌被鍨嬩腑鐨勫崟浣?        for (const typeKey in unitDefinitions) {
          if (unitDefinitions[typeKey].units[unitKey]) {
            return unitDefinitions[typeKey].units[unitKey].nameEN;
          }
        }
      }
      return unitKey;
    }
    
    // 榛樿浣跨敤涓枃鍚嶇О
    if (type && unitDefinitions[type] && unitDefinitions[type].units[unitKey]) {
      return unitDefinitions[type].units[unitKey].name;
    } else {
      // 鏌ユ壘鎵€鏈夌被鍨嬩腑鐨勫崟浣?      for (const typeKey in unitDefinitions) {
        if (unitDefinitions[typeKey].units[unitKey]) {
          return unitDefinitions[typeKey].units[unitKey].name;
        }
      }
    }
    return unitKey;
  }
}

// 鎵撳紑鍗曚綅鎹㈢畻瀵硅瘽妗?function openUnitConverter() {
  const dialog = document.getElementById('unitConverterDialog');
  const overlay = document.getElementById('converterOverlay');
  
  dialog.classList.add('active');
  overlay.classList.add('active');
  
  // 鑷姩鑱氱劍鍒版暟鍊艰緭鍏ユ
  setTimeout(() => {
    document.getElementById('fromValue').focus();
  }, 300);
}

// 鍏抽棴鍗曚綅鎹㈢畻瀵硅瘽妗?function closeUnitConverter() {
  const dialog = document.getElementById('unitConverterDialog');
  const overlay = document.getElementById('converterOverlay');
  
  dialog.classList.remove('active');
  overlay.classList.remove('active');
}

// 甯姪鎸夐挳鐐瑰嚮浜嬩欢
document.getElementById('helpBtn').addEventListener('click', openUnitConverter);
// 鍏抽棴鎸夐挳浜嬩欢
document.getElementById('closeConverterBtn').addEventListener('click', closeUnitConverter);
// 鐐瑰嚮閬僵灞傚叧闂璇濇
document.getElementById('converterOverlay').addEventListener('click', closeUnitConverter);

// 椤甸潰鍔犺浇瀹屾垚鍚庡垵濮嬪寲
document.addEventListener('DOMContentLoaded', function() {
  // 鍒濆鍖栧崟浣嶆崲绠楀櫒
  initializeUnitConverter();
  
  // 璋冪敤涓诲垵濮嬪寲鍑芥暟
  init();
});

// 鍒濆鍖栧嚱鏁?function init() {
  // 缁戝畾浜嬩欢鐩戝惉
  healthForm.addEventListener('submit', handleFormSubmit);
  backToFormBtn.addEventListener('click', showForm);
  
  // 淇敼涓嬭浇鎸夐挳浜嬩欢锛屾坊鍔犲浘琛ㄩ€夋嫨鍔熻兘
  downloadBtn.addEventListener('click', async function() {
    // 濡傛灉娌℃湁鎶ュ憡鏁版嵁锛屾樉绀烘彁绀?    const noReportMessage = currentLanguage === 'zh-CN' ? '娌℃湁鍙笅杞界殑鎶ュ憡' :
                           currentLanguage === 'ru-RU' ? '袧械褌 芯褌褔械褌邪 写谢褟 褋泻邪褔懈胁邪薪懈褟' :
                           currentLanguage === 'ja-JP' ? '銉€銈︺兂銉兗銉夈仹銇嶃倠銉儩銉笺儓銇屻亗銈娿伨銇涖倱' :
                           currentLanguage === 'ko-KR' ? '雼れ毚搿滊摐頃?氤搓碃靹滉皜 鞐嗢姷雼堧嫟' : 'No report to download';
    
    if (!currentReportData) {
      showToast(noReportMessage, 'warning');
      return;
    }
    
    try {
      // 鏄剧ず鍥捐〃閫夋嫨瀵硅瘽妗?      const chartSelectionDialog = document.getElementById('chartSelectionDialog');
      const chartDialogOverlay = document.getElementById('chartDialogOverlay');
      const closeChartDialogBtn = document.getElementById('closeChartDialogBtn');
      const chartContinueBtn = document.getElementById('chartContinueBtn');
      const chartCancelBtn = document.getElementById('chartCancelBtn');
      
      // 鏍规嵁褰撳墠璇█鏇存柊瀵硅瘽妗嗗唴瀹?      if (currentLanguage !== 'zh-CN') {
        // 鏇存柊鏍囬
        chartSelectionDialog.querySelector('.dialog-header h3').textContent = 
          currentLanguage === 'ru-RU' ? '袩邪褉邪屑械褌褉褘 蟹邪谐褉褍蟹泻懈' :
          currentLanguage === 'ja-JP' ? '銉€銈︺兂銉兗銉夈偑銉椼偡銉с兂' :
          currentLanguage === 'ko-KR' ? '雼れ毚搿滊摐 鞓奠厴' : 'Download Options';
        
        // 鏇存柊鎻忚堪
        chartSelectionDialog.querySelector('.dialog-content > p').textContent = 
          currentLanguage === 'ru-RU' ? '袙泻谢褞褔懈褌褜 谐褉邪褎懈泻 胁 芯褌褔械褌?' :
          currentLanguage === 'ja-JP' ? '銉儩銉笺儓銇偘銉┿儠銈掑惈銈併伨銇欍亱锛? :
          currentLanguage === 'ko-KR' ? '氤搓碃靹滌棎 攴鸽灅頂勲ゼ 韽暔頃橃嫓瓴犾姷雼堦箤?' : 'Include chart in the report?';
        
        // 鏇存柊閫夐」鏍囩
        const labels = chartSelectionDialog.querySelectorAll('.chart-option label');
        labels[0].textContent = 'No chart';
        labels[1].textContent = 'Include last 3 days';
        labels[2].textContent = 'Include last 7 days';
        labels[3].textContent = 'Include last 30 days';
        labels[4].textContent = 'Include last 60 days';
        
        // 鏇存柊鎻愮ず淇℃伅
        chartSelectionDialog.querySelector('.format-notice').textContent = 
          currentLanguage === 'ru-RU' ? '袩褉懈屑械褔邪薪懈械: 肖芯褉屑邪褌 芯斜褘褔薪芯谐芯 褌械泻褋褌邪 (TXT) 薪械 锌芯写写械褉卸懈胁邪械褌 谐褉邪褎懈泻懈' :
          currentLanguage === 'ja-JP' ? '娉ㄦ剰锛氥儣銉兗銉炽儐銈偣銉堬紙TXT锛夊舰寮忋伅銈般儵銉曘倰銈点儩銉笺儓銇椼仸銇勩伨銇涖倱' :
          currentLanguage === 'ko-KR' ? '彀戈碃: 鞚茧皹 韰嶌姢韸?TXT) 順曥嫕鞚€ 攴鸽灅頂勲ゼ 歆€鞗愴晿歆€ 鞎婌姷雼堧嫟' : 
          'Note: Plain text (TXT) format does not support charts';
        
        // 鏇存柊鎸夐挳鏂囨湰
        chartContinueBtn.textContent = 
          currentLanguage === 'ru-RU' ? '袩褉芯写芯谢卸懈褌褜' :
          currentLanguage === 'ja-JP' ? '缍氳' :
          currentLanguage === 'ko-KR' ? '瓿勳啀' : 'Continue';
        
        chartCancelBtn.textContent = 
          currentLanguage === 'ru-RU' ? '袨褌屑械薪邪' :
          currentLanguage === 'ja-JP' ? '銈儯銉炽偦銉? :
          currentLanguage === 'ko-KR' ? '旆唽' : 'Cancel';
      }
      
      // 鏄剧ず瀵硅瘽妗?      chartSelectionDialog.style.display = 'block';
      chartDialogOverlay.style.display = 'block';
      
      // 绛夊緟鐢ㄦ埛閫夋嫨
      const chartDays = await new Promise(resolve => {
        // 鍏抽棴鎸夐挳浜嬩欢
        closeChartDialogBtn.onclick = () => {
          chartSelectionDialog.style.display = 'none';
          chartDialogOverlay.style.display = 'none';
          resolve('cancel');
        };
        
        // 鍙栨秷鎸夐挳浜嬩欢
        chartCancelBtn.onclick = () => {
          chartSelectionDialog.style.display = 'none';
          chartDialogOverlay.style.display = 'none';
          resolve('cancel');
        };
        
        // 缁х画鎸夐挳浜嬩欢
        chartContinueBtn.onclick = () => {
          const selectedOption = chartSelectionDialog.querySelector('input[name="chartOption"]:checked');
          chartSelectionDialog.style.display = 'none';
          chartDialogOverlay.style.display = 'none';
          resolve(selectedOption ? selectedOption.value : 'none');
        };
      });
      
      // 濡傛灉鐢ㄦ埛鍙栨秷浜嗘搷浣滐紝鐩存帴杩斿洖
      if (chartDays === 'cancel') {
        return;
      }
      
      // 鑾峰彇閫変腑鐨勫鍑烘牸寮?      const formatElement = document.querySelector('input[name="exportFormat"]:checked');
      const format = formatElement ? formatElement.value : 'pdf';
      
      // 濡傛灉鐢ㄦ埛閫夋嫨浜嗗寘鍚姌绾垮浘浣嗘牸寮忔槸txt锛屾樉绀鸿鍛?      if (chartDays !== 'none' && format === 'txt') {
        const warningMessage = currentLanguage === 'zh-CN' ? '绾枃鏈牸寮忎笉鏀寔鍖呭惈鎶樼嚎鍥撅紝灏嗗彧瀵煎嚭鏂囨湰鍐呭' :
                             currentLanguage === 'ru-RU' ? '孝械泻褋褌芯胁褘泄 褎芯褉屑邪褌 薪械 锌芯写写械褉卸懈胁邪械褌 谐褉邪褎懈泻懈, 斜褍写械褌 褝泻褋锌芯褉褌懈褉芯胁邪薪 褌芯谢褜泻芯 褌械泻褋褌' :
                             currentLanguage === 'ja-JP' ? '銉嗐偔銈广儓褰㈠紡銇偘銉┿儠銈掋偟銉濄兗銉堛仐銇︺亜銇俱仜銈撱€傘儐銈偣銉堛伄銇裤亴銈ㄣ偗銈广儩銉笺儓銇曘倢銇俱仚' :
                             currentLanguage === 'ko-KR' ? '韰嶌姢韸?順曥嫕鞚€ 攴鸽灅頂勲ゼ 歆€鞗愴晿歆€ 鞎婌姷雼堧嫟. 韰嶌姢韸鸽 雮措炒雰呺媹雼? : 
                             'Text format does not support charts, only text will be exported';
        showToast(warningMessage, 'warning', 4000);
      }
      
      // 鏍规嵁鏍煎紡鍑嗗鍐呭
      let content;
      switch (format) {
        case 'txt':
          content = currentReportData.report.replace(/#{1,6} /g, '').replace(/\*\*/g, '');
          break;
        case 'md':
          content = currentReportData.report;
          // 瀵逛簬Markdown鏍煎紡锛岃鍛婁笉鏀寔鍥捐〃
          if (chartDays !== 'none') {
            const warningMessage = currentLanguage === 'zh-CN' ? 'Markdown鏍煎紡鏆備笉鏀寔鍖呭惈鎶樼嚎鍥? : 
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
  <title>${currentLanguage === 'zh-CN' ? '鍋ュ悍鎶ュ憡' :
          currentLanguage === 'ru-RU' ? '袨褌褔械褌 芯 蟹写芯褉芯胁褜械' :
          currentLanguage === 'ja-JP' ? '鍋ュ悍銉儩銉笺儓' :
          currentLanguage === 'ko-KR' ? '瓯搓皶 氤搓碃靹? : 'Health Report'}</title>
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
          
          // 濡傛灉閫夋嫨鍖呭惈鎶樼嚎鍥句笖鏄疕TML鏍煎紡
          if (chartDays !== 'none') {
            content += `
  <div class="chart-section">
    <h2>${currentLanguage === 'zh-CN' ? '鍋ュ悍瓒嬪娍鍥? :
          currentLanguage === 'ru-RU' ? '袚褉邪褎懈泻 褌械薪写械薪褑懈泄 蟹写芯褉芯胁褜褟' :
          currentLanguage === 'ja-JP' ? '鍋ュ悍銉堛儸銉炽儔銈般儵銉? :
          currentLanguage === 'ko-KR' ? '瓯搓皶 於旍劯 攴鸽灅頂? : 'Health Trend Chart'}</h2>
    <p>${currentLanguage === 'zh-CN' ? `鏄剧ず鏈€杩?{chartDays}澶╃殑鍋ュ悍鏁版嵁瓒嬪娍` : 
         `Showing health data trends for the last ${chartDays} days`}</p>
    <div class="chart-container">
      <!-- 杩欓噷灏嗘潵鍙互娣诲姞瀹為檯鐨勫浘琛?-->
      <p style="text-align:center; color:#888;">
        ${currentLanguage === 'zh-CN' ? '鍥捐〃灏嗗湪涓嬩竴鐗堟湰涓疄鐜? : 'Chart will be implemented in the next version'}
      </p>
    </div>
  </div>`;
          }
          
          content += `
  <footer>
    <p>${currentLanguage === 'zh-CN' ? '鐢熸垚鏃堕棿' :
        currentLanguage === 'ru-RU' ? '袙褉械屑褟 褋芯蟹写邪薪懈褟' :
        currentLanguage === 'ja-JP' ? '鐢熸垚鏅傞枔' :
        currentLanguage === 'ko-KR' ? '靸濎劚 鞁滉皠' : 'Generated at'}: ${new Date(currentReportData.generatedAt).toLocaleString()}</p>
    <p>${currentLanguage === 'zh-CN' ? '鐢辩Г浜哄仴搴风郴缁熺敓鎴? :
        currentLanguage === 'ru-RU' ? '小芯蟹写邪薪芯 褋懈褋褌械屑芯泄 褍锌褉邪胁谢械薪懈褟 蟹写芯褉芯胁褜械屑' :
        currentLanguage === 'ja-JP' ? '銉樸儷銈广優銉嶃兗銈搞儯銉笺偡銈广儐銉犮伀銈堛仯銇︾敓鎴愩仌銈屻伨銇椼仧' :
        currentLanguage === 'ko-KR' ? '項姢 毵る媹鞝€ 鞁滌姢韰滌棎靹?靸濎劚霅? : 'Generated by Health Manager System'}</p>
  </footer>
</body>
</html>
          `;
          
          // 瀵逛簬PDF鏍煎紡锛岃鍛婁笉鏀寔鍥捐〃
          if (chartDays !== 'none') {
            const warningMessage = currentLanguage === 'zh-CN' ? 'PDF鏍煎紡鏆備笉鏀寔鍖呭惈鎶樼嚎鍥? :
                                'PDF format does not support embedded charts yet';
            showToast(warningMessage, 'warning', 3000);
          }
          break;
      }
      
      const result = await ipcRenderer.invoke('save-report', { content, format });
      
      if (result.success) {
        const successMessage = currentLanguage === 'zh-CN' ? '鎶ュ憡淇濆瓨鎴愬姛' :
                            currentLanguage === 'ru-RU' ? '袨褌褔械褌 褋芯褏褉邪薪械薪 褍褋锌械褕薪芯' :
                            currentLanguage === 'ja-JP' ? '銉儩銉笺儓銇屾甯搞伀淇濆瓨銇曘倢銇俱仐銇? :
                            currentLanguage === 'ko-KR' ? '氤搓碃靹滉皜 靹标车鞝侅溂搿?鞝€鞛ル悩鞐堨姷雼堧嫟' : 'Report saved successfully';
        
        showToast(successMessage, 'success');
      } else {
        const failMessage = currentLanguage === 'zh-CN' ? '淇濆瓨澶辫触' :
                         currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 褋芯褏褉邪薪械薪懈褟' :
                         currentLanguage === 'ja-JP' ? '淇濆瓨銇け鏁椼仐銇俱仐銇? :
                         currentLanguage === 'ko-KR' ? '鞝€鞛?鞁ろ尐' : 'Save failed';
        
        showToast(`${failMessage}: ${result.message}`, 'error');
      }
    } catch (error) {
      const errorMessage = currentLanguage === 'zh-CN' ? '淇濆瓨鎶ュ憡鍑洪敊' :
                        currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 锌褉懈 褋芯褏褉邪薪械薪懈懈 芯褌褔械褌邪' :
                        currentLanguage === 'ja-JP' ? '銉儩銉笺儓銇繚瀛樹腑銇偍銉┿兗銇岀櫤鐢熴仐銇俱仐銇? :
                        currentLanguage === 'ko-KR' ? '氤搓碃靹?鞝€鞛?欷?鞓る 氚滌儩' : 'Error saving report';
      
      showToast(`${errorMessage}: ${error.message}`, 'error');
    }
  });
  
  settingsBtn.addEventListener('click', toggleSettingsPanel);
  
  // 澶勭悊"鍏朵粬"杩囨晱婧愰€夐」
  allergenOther.addEventListener('change', function() {
    otherAllergens.style.display = this.checked ? 'block' : 'none';
    if (!this.checked) {
      otherAllergens.value = '';
    }
  });
  
  // 鍒濆鍖栬嚜瀹氫箟瀛楁鍔熻兘
  initializeCustomFields();
  
  // 鏍囩椤靛垏鎹?  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // 婵€娲诲綋鍓嶆爣绛?      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 鏄剧ず瀵瑰簲鍐呭
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${tabName}Content`).classList.add('active');
      
      // 濡傛灉鏄巻鍙茶褰曟爣绛撅紝鍔犺浇鍘嗗彶璁板綍
      if (tabName === 'history') {
        loadHistory();
        
        // 纭繚璁板綍鍥炬寜閽簨浠剁粦瀹?        setTimeout(() => {
          const showHealthChartBtn = document.getElementById('showHealthChartBtn');
          if (showHealthChartBtn) {
            console.log('鏍囩鍒囨崲鍚庨噸鏂扮粦瀹氳褰曞浘鎸夐挳浜嬩欢');
            showHealthChartBtn.onclick = function() {
              console.log('璁板綍鍥炬寜閽鐐瑰嚮');
              showHealthChart();
            };
          }
        }, 500); // 缁欎竴鐐规椂闂磋DOM鏇存柊
      }
    });
  });
  
  // 瀵煎嚭鏍煎紡閫夋嫨
  const exportFormatRadios = document.querySelectorAll('input[name="exportFormat"]');
  exportFormatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      console.log(`瀵煎嚭鏍煎紡宸叉洿鏀逛负: ${e.target.value}`);
    });
  });
  
  // API璁剧疆鐩稿叧浜嬩欢
  apiProvider.addEventListener('change', toggleCustomApiSettings);
  saveApiSettings.addEventListener('click', saveApiConfiguration);
  resetApiSettings.addEventListener('click', resetApiConfiguration);
  
  // 涓婚璁剧疆鐩稿叧浜嬩欢
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
  
  // 鑳屾櫙鍥剧墖璋冩暣浜嬩欢
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
  
  // 閫忔槑搴︽粦鍧椾簨浠?  formOpacity.addEventListener('input', function() {
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
  
  // 娣诲姞鐐瑰嚮鍔ㄧ敾鏁堟灉鐨勪簨浠剁洃鍚?  document.addEventListener('click', handleClickAnimation);
  
  // 鍔犺浇淇濆瓨鐨凙PI璁剧疆
  loadApiSettings();
  
  // 鍔犺浇淇濆瓨鐨勪富棰樿缃?  loadThemePreferences();
  
  // 璁剧疆闈㈡澘鐩稿叧浜嬩欢
  settingsBtn.addEventListener('click', openSettingsPanel);
  closeSettingsBtn.addEventListener('click', closeSettingsPanel);
  settingsOverlay.addEventListener('click', closeSettingsPanel);
  
  // 璇█璁剧疆鐩稿叧浜嬩欢
  languageOptions.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      selectLanguage(lang);
    });
  });
  
  saveLanguageSettings.addEventListener('click', saveLanguagePreferences);
  
  // 鍔犺浇淇濆瓨鐨勮瑷€璁剧疆
  loadLanguagePreferences();
  
  // 鍒涘缓鑷畾涔夋彁绀哄厓绱?  createToastContainer();
  
  // 鏀寔浣滆€呮寜閽娇鐢ㄩ粯璁ゆ祻瑙堝櫒鎵撳紑
  document.getElementById('supportAuthorBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const url = this.getAttribute('href');
    // 浣跨敤Electron鐨剆hell.openExternal鎵撳紑澶栭儴娴忚鍣?    // 濡傛灉涓嶆槸鍦‥lectron鐜涓紝鍒欎娇鐢╳indow.open
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
  
  // 鍒濆鍖朅PI浣跨敤闄愬埗
  loadApiUsageData();
  updateApiRemainingCount();
  
  // 鍋ュ悍璁板綍鍥捐〃鐩稿叧浜嬩欢
  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  const closeChartBtn = document.getElementById('closeChartBtn');
  const chartMetric = document.getElementById('chartMetric');
  
  if (showHealthChartBtn) {
    console.log('鎵惧埌璁板綍鍥炬寜閽紝娣诲姞鐐瑰嚮浜嬩欢');
    showHealthChartBtn.onclick = function() {
      console.log('璁板綍鍥炬寜閽鐐瑰嚮');
      showHealthChart();
    };
  } else {
    console.error('鏈壘鍒拌褰曞浘鎸夐挳鍏冪礌');
  }
  
  if (closeChartBtn) {
    console.log('鎵惧埌鍏抽棴鍥捐〃鎸夐挳锛屾坊鍔犵偣鍑讳簨浠?);
    closeChartBtn.onclick = function() {
      console.log('鍏抽棴鍥捐〃鎸夐挳琚偣鍑?);
      closeHealthChart();
    };
    // 涓虹‘淇濅簨浠剁粦瀹氱敓鏁堬紝娣诲姞addEventListener鏂瑰紡
    closeChartBtn.addEventListener('click', function() {
      console.log('鍏抽棴鍥捐〃鎸夐挳閫氳繃addEventListener琚偣鍑?);
      closeHealthChart();
    });
  } else {
    console.error('鏈壘鍒板叧闂浘琛ㄦ寜閽厓绱?);
  }
  
  if (chartMetric) {
    chartMetric.onchange = function() {
      console.log('鍥捐〃鎸囨爣琚洿鏀逛负:', this.value);
      currentMetric = this.value;
      drawHealthChart();
    };
  }
  
  // 鏀惧ぇ鍥捐〃鎸夐挳
  const expandChartBtn = document.getElementById('expandChartBtn');
  if (expandChartBtn) {
    console.log('鎵惧埌鏀惧ぇ鍥捐〃鎸夐挳锛屾坊鍔犵偣鍑讳簨浠?);
    // 浣跨敤onclick鏂瑰紡缁戝畾锛屽鍔犲吋瀹规€?    expandChartBtn.onclick = function() {
      console.log('鏀惧ぇ鍥捐〃鎸夐挳琚偣鍑?);
      showFullscreenChart();
    };
    // 鍚屾椂浣跨敤addEventListener鏂瑰紡
    expandChartBtn.addEventListener('click', function() {
      console.log('鏀惧ぇ鍥捐〃鎸夐挳閫氳繃addEventListener琚偣鍑?);
      showFullscreenChart();
    });
  } else {
    console.error('鏈壘鍒版斁澶у浘琛ㄦ寜閽厓绱?);
  }
  
  // 鍏ㄥ睆鍥捐〃鐩稿叧浜嬩欢
  const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
  if (closeFullscreenBtn) {
    console.log('鎵惧埌鍏抽棴鍏ㄥ睆鎸夐挳锛屾坊鍔犵偣鍑讳簨浠?);
    // 浣跨敤onclick鏂瑰紡缁戝畾锛屽鍔犲吋瀹规€?    closeFullscreenBtn.onclick = function() {
      console.log('鍏抽棴鍏ㄥ睆鎸夐挳琚偣鍑?);
      closeFullscreenChart();
    };
    // 鍚屾椂浣跨敤addEventListener鏂瑰紡
    closeFullscreenBtn.addEventListener('click', function() {
      console.log('鍏抽棴鍏ㄥ睆鎸夐挳閫氳繃addEventListener琚偣鍑?);
      closeFullscreenChart();
    });
  } else {
    console.error('鏈壘鍒板叧闂叏灞忔寜閽厓绱?);
  }
  
  // 鍏ㄥ睆妯″紡涓嬬殑鎸囨爣鍒囨崲
  const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
  if (fullscreenChartMetric) {
    console.log('鎵惧埌鍏ㄥ睆鎸囨爣閫夋嫨妗嗭紝娣诲姞鍙樻洿浜嬩欢');
    fullscreenChartMetric.onchange = function() {
      console.log('鍏ㄥ睆鎸囨爣琚洿鏀逛负:', this.value);
      currentMetric = this.value;
      // 鍚屾椂鏇存柊涓や釜鍥捐〃
      drawFullscreenChart();
      drawHealthChart();
    };
  } else {
    console.error('鏈壘鍒板叏灞忔寚鏍囬€夋嫨妗嗗厓绱?);
  }
  
  // 鍥捐〃鐩稿叧鎸夐挳浜嬩欢澶勭悊
  const setupChartButtonEvents = () => {
    console.log('姝ｅ湪璁剧疆鍥捐〃鎸夐挳浜嬩欢...');
    
    // 1. 璁板綍鍥炬寜閽?    const showHealthChartBtn = document.getElementById('showHealthChartBtn');
    if (showHealthChartBtn) {
      console.log('鎵惧埌璁板綍鍥炬寜閽?);
      
      // 绉婚櫎鎵€鏈夊凡鏈夌殑浜嬩欢鐩戝惉鍣紙闃叉閲嶅锛?      const newShowBtn = showHealthChartBtn.cloneNode(true);
      showHealthChartBtn.parentNode.replaceChild(newShowBtn, showHealthChartBtn);
      
      // 娣诲姞鏂颁簨浠?      newShowBtn.addEventListener('click', function(e) {
        console.log('璁板綍鍥炬寜閽鐐瑰嚮', e);
        e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
        showHealthChart();
      });
    } else {
      console.error('鏈壘鍒拌褰曞浘鎸夐挳鍏冪礌');
    }
    
    // 2. 鍏抽棴鍥捐〃鎸夐挳
    const closeChartBtn = document.getElementById('closeChartBtn');
    if (closeChartBtn) {
      console.log('鎵惧埌鍏抽棴鍥捐〃鎸夐挳');
      
      // 绉婚櫎鎵€鏈夊凡鏈夌殑浜嬩欢鐩戝惉鍣?      const newCloseBtn = closeChartBtn.cloneNode(true);
      closeChartBtn.parentNode.replaceChild(newCloseBtn, closeChartBtn);
      
      // 娣诲姞鏂颁簨浠讹紝浣跨敤浜嬩欢鎹曡幏
      newCloseBtn.addEventListener('click', function(e) {
        console.log('鍏抽棴鍥捐〃鎸夐挳琚偣鍑?, e);
        e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
        closeHealthChart();
      }, true);
    } else {
      console.error('鏈壘鍒板叧闂浘琛ㄦ寜閽厓绱?);
    }
    
    // 3. 鏀惧ぇ鍥捐〃鎸夐挳
    const expandChartBtn = document.getElementById('expandChartBtn');
    if (expandChartBtn) {
      console.log('鎵惧埌鏀惧ぇ鍥捐〃鎸夐挳');
      
      // 绉婚櫎鎵€鏈夊凡鏈夌殑浜嬩欢鐩戝惉鍣?      const newExpandBtn = expandChartBtn.cloneNode(true);
      expandChartBtn.parentNode.replaceChild(newExpandBtn, expandChartBtn);
      
      // 娣诲姞鏂颁簨浠讹紝浣跨敤浜嬩欢鎹曡幏
      newExpandBtn.addEventListener('click', function(e) {
        console.log('鏀惧ぇ鍥捐〃鎸夐挳琚偣鍑?, e);
        e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
        showFullscreenChart();
      }, true);
    } else {
      console.error('鏈壘鍒版斁澶у浘琛ㄦ寜閽厓绱?);
    }
    
    // 4. 鍥捐〃鎸囨爣閫夋嫨妗?    const chartMetric = document.getElementById('chartMetric');
    if (chartMetric) {
      console.log('鎵惧埌鍥捐〃鎸囨爣閫夋嫨妗?);
      
      // 绉婚櫎鎵€鏈夊凡鏈夌殑浜嬩欢鐩戝惉鍣?      const newChartMetric = chartMetric.cloneNode(true);
      chartMetric.parentNode.replaceChild(newChartMetric, chartMetric);
      
      // 娣诲姞鏂颁簨浠?      newChartMetric.addEventListener('change', function(e) {
        console.log('鍥捐〃鎸囨爣琚洿鏀逛负:', this.value);
        currentMetric = this.value;
        drawHealthChart();
      });
    } else {
      console.error('鏈壘鍒板浘琛ㄦ寚鏍囬€夋嫨妗嗗厓绱?);
    }
    
    // 5. 鍏抽棴鍏ㄥ睆鎸夐挳
    const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
    if (closeFullscreenBtn) {
      console.log('鎵惧埌鍏抽棴鍏ㄥ睆鎸夐挳');
      
      // 绉婚櫎鎵€鏈夊凡鏈夌殑浜嬩欢鐩戝惉鍣?      const newCloseFullBtn = closeFullscreenBtn.cloneNode(true);
      closeFullscreenBtn.parentNode.replaceChild(newCloseFullBtn, closeFullscreenBtn);
      
      // 娣诲姞鏂颁簨浠讹紝浣跨敤浜嬩欢鎹曡幏
      newCloseFullBtn.addEventListener('click', function(e) {
        console.log('鍏抽棴鍏ㄥ睆鎸夐挳琚偣鍑?, e);
        e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
        closeFullscreenChart();
      }, true);
    } else {
      console.error('鏈壘鍒板叧闂叏灞忔寜閽厓绱?);
    }
    
    // 6. 鍏ㄥ睆妯″紡涓嬬殑鎸囨爣鍒囨崲
    const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
    if (fullscreenChartMetric) {
      console.log('鎵惧埌鍏ㄥ睆鎸囨爣閫夋嫨妗?);
      
      // 绉婚櫎鎵€鏈夊凡鏈夌殑浜嬩欢鐩戝惉鍣?      const newFullChartMetric = fullscreenChartMetric.cloneNode(true);
      fullscreenChartMetric.parentNode.replaceChild(newFullChartMetric, fullscreenChartMetric);
      
      // 娣诲姞鏂颁簨浠?      newFullChartMetric.addEventListener('change', function(e) {
        console.log('鍏ㄥ睆鎸囨爣琚洿鏀逛负:', this.value);
        currentMetric = this.value;
        // 鍚屾椂鏇存柊涓や釜鍥捐〃
        drawFullscreenChart();
        drawHealthChart();
      });
    } else {
      console.error('鏈壘鍒板叏灞忔寚鏍囬€夋嫨妗嗗厓绱?);
    }
  };
  
  // 椤甸潰鍔犺浇鍚庡拰鍥捐〃鍒涘缓鍚庨兘瑕佺‘淇濇寜閽簨浠舵甯?  setupChartButtonEvents();
  
  // 鍦ㄩ〉闈㈠畬鍏ㄥ姞杞藉悗鍐嶆璁剧疆浜嬩欢锛堢‘淇濇墍鏈塂OM鍏冪礌閮藉凡缁忓姞杞藉畬姣曪級
  window.addEventListener('load', function() {
    console.log('椤甸潰瀹屽叏鍔犺浇锛岄噸鏂拌缃浘琛ㄦ寜閽簨浠?);
    setupChartButtonEvents();
  });
}

// 鍒涘缓鑷畾涔夋彁绀哄鍣?function createToastContainer() {
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

// 鏄剧ず鑷畾涔夋彁绀?function showToast(message, type = 'info', duration = 3000) {
  const toastContainer = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  
  // 鏍规嵁绫诲瀷璁剧疆鍥炬爣
  switch(type) {
    case 'success':
      icon.innerHTML = '鉁?;
      break;
    case 'error':
      icon.innerHTML = '鉁?;
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
  
  // 娣″叆鏁堟灉
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // 璁剧疆鑷姩娑堝け
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, duration);
}

// 鍒囨崲鑷畾涔堿PI璁剧疆鏄剧ず
function toggleCustomApiSettings() {
  if (apiProvider.value === 'custom') {
    customApiSettings.style.display = 'block';
  } else {
    customApiSettings.style.display = 'none';
  }
}

// 淇濆瓨API閰嶇疆
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
      showToast('璇锋彁渚涙湁鏁堢殑JSON鏍煎紡鐨勮姹傚ご', 'error');
      return;
    }
    
    // 淇濆瓨API閰嶇疆
    localStorage.setItem('apiProvider', provider);
    localStorage.setItem('apiEndpoint', endpoint);
    localStorage.setItem('apiKey', key);
    localStorage.setItem('apiModel', model);
    localStorage.setItem('apiHeaders', JSON.stringify(headers));
    
    showToast('API 璁剧疆宸蹭繚瀛?, 'success');
  } else {
    // 浣跨敤榛樿API
    localStorage.setItem('apiProvider', provider);
    localStorage.removeItem('apiEndpoint');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('apiModel');
    localStorage.removeItem('apiHeaders');
    
    showToast('宸插垏鎹㈣嚦榛樿 API', 'success');
  }
  
  // 鍏抽棴璁剧疆闈㈡澘
  closeSettingsPanel();
  
  // 鏇存柊API鍓╀綑娆℃暟鏄剧ず
  updateApiRemainingCount();
}

// 閲嶇疆API閰嶇疆
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
  showToast('API璁剧疆宸查噸缃?, 'info');
}

// 鍔犺浇淇濆瓨鐨凙PI璁剧疆
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
  
  // 鍔犺浇API浣跨敤鏁版嵁骞舵洿鏂版樉绀?  loadApiUsageData();
  updateApiRemainingCount();
}

// 閫夋嫨涓婚
function selectTheme(theme) {
  // 绉婚櫎涔嬪墠鐨勪富棰樼被
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-gold');
  
  // 娣诲姞鏂颁富棰樼被
  if (theme !== 'light') {
    document.body.classList.add(`theme-${theme}`);
  }
  
  // 鏇存柊褰撳墠涓婚
  currentTheme = theme;
  
  // 鏇存柊涓婚閫夐」鐨勯€変腑鐘舵€?  themeOptions.forEach(option => {
    if (option.dataset.theme === theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // 鏇存柊鑳屾櫙閫忔槑搴﹂鑹?  updateFormOpacity(formOpacity.value);
}

// 澶勭悊鑳屾櫙绫诲瀷鍙樻洿
function handleBgTypeChange() {
  const bgType = document.querySelector('input[name="bgType"]:checked').value;
  
  // 闅愯棌鎵€鏈夊鍣?  bgLocalContainer.style.display = 'none';
  bgUrlContainer.style.display = 'none';
  bgPreview.style.display = 'none';
  bgAdjustments.style.display = 'none';
  
  // 鏍规嵁閫夋嫨鏄剧ず瀵瑰簲瀹瑰櫒
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
      // 绉婚櫎鑳屾櫙
      removeCustomBackground();
      break;
  }
}

// 澶勭悊鏈湴鏂囦欢閫夋嫨
function handleLocalFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // 妫€鏌ユ枃浠剁被鍨?  if (!file.type.startsWith('image/')) {
    // 鏍规嵁褰撳墠璇█鏄剧ず閿欒娑堟伅
    const errorMessage = currentLanguage === 'zh-CN' ? '璇烽€夋嫨鏈夋晥鐨勫浘鐗囨枃浠? :
                        currentLanguage === 'ru-RU' ? '袩芯卸邪谢褍泄褋褌邪, 胁褘斜械褉懈褌械 泻芯褉褉械泻褌薪褘泄 褎邪泄谢 懈蟹芯斜褉邪卸械薪懈褟' :
                        currentLanguage === 'ja-JP' ? '鏈夊姽銇敾鍍忋儠銈°偆銉倰閬告姙銇椼仸銇忋仩銇曘亜' :
                        currentLanguage === 'ko-KR' ? '鞙犿毃頃?鞚措歆€ 韺岇澕鞚?靹犿儩頃橃劯鞖? : 'Please select a valid image file';
    
    showToast(errorMessage, 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const dataUrl = event.target.result;
    
    // 鏇存柊棰勮
    bgPreviewImg.src = dataUrl;
    bgPreview.style.display = 'block';
    bgAdjustments.style.display = 'block';
    
    // 淇濆瓨鑳屾櫙璁剧疆
    customBackground = {
      type: 'local',
      data: dataUrl
    };
    
    // 搴旂敤鑳屾櫙
    applyBackground();
  };
  
  reader.readAsDataURL(file);
}

// 澶勭悊URL鑳屾櫙搴旂敤
function handleBgUrlApply() {
  const url = bgUrlInput.value.trim();
  
  if (!url) {
    // 鏍规嵁褰撳墠璇█鏄剧ず璀﹀憡娑堟伅
    const warningMessage = currentLanguage === 'zh-CN' ? '璇疯緭鍏ユ湁鏁堢殑鍥剧墖URL' :
                          currentLanguage === 'ru-RU' ? '袩芯卸邪谢褍泄褋褌邪, 胁胁械写懈褌械 泻芯褉褉械泻褌薪褘泄 URL 懈蟹芯斜褉邪卸械薪懈褟' :
                          currentLanguage === 'ja-JP' ? '鏈夊姽銇敾鍍廢RL銈掑叆鍔涖仐銇︺亸銇犮仌銇? :
                          currentLanguage === 'ko-KR' ? '鞙犿毃頃?鞚措歆€ URL鞚?鞛呺牓頃橃劯鞖? : 'Please enter a valid image URL';
    
    showToast(warningMessage, 'warning');
    return;
  }
  
  // 鍔犺浇鍥剧墖浠ラ獙璇乁RL
  const img = new Image();
  img.onload = function() {
    // URL鏈夋晥锛屾洿鏂伴瑙?    bgPreviewImg.src = url;
    bgPreview.style.display = 'block';
    bgAdjustments.style.display = 'block';
    
    // 淇濆瓨鑳屾櫙璁剧疆
    customBackground = {
      type: 'url',
      data: url
    };
    
    // 搴旂敤鑳屾櫙
    applyBackground();
    
    // 鏍规嵁褰撳墠璇█鏄剧ず鎴愬姛娑堟伅
    const successMessage = currentLanguage === 'zh-CN' ? '鑳屾櫙鍥剧墖宸插簲鐢? :
                          currentLanguage === 'ru-RU' ? '肖芯薪芯胁芯械 懈蟹芯斜褉邪卸械薪懈械 锌褉懈屑械薪械薪芯' :
                          currentLanguage === 'ja-JP' ? '鑳屾櫙鐢诲儚銇岄仼鐢ㄣ仌銈屻伨銇椼仧' :
                          currentLanguage === 'ko-KR' ? '氚瓣步 鞚措歆€臧€ 鞝侅毄霅橃棃鞀惦媹雼? : 'Background image applied';
    
    showToast(successMessage, 'success');
  };
  
  img.onerror = function() {
    // 鏍规嵁褰撳墠璇█鏄剧ず閿欒娑堟伅
    const errorMessage = currentLanguage === 'zh-CN' ? '鏃犳硶鍔犺浇鍥剧墖锛岃妫€鏌RL鏄惁鏈夋晥' :
                        currentLanguage === 'ru-RU' ? '袧械 褍写邪谢芯褋褜 蟹邪谐褉褍蟹懈褌褜 懈蟹芯斜褉邪卸械薪懈械, 锌褉芯胁械褉褜褌械 泻芯褉褉械泻褌薪芯褋褌褜 URL' :
                        currentLanguage === 'ja-JP' ? '鐢诲儚銈掕銇胯炯銈併伨銇涖倱銆俇RL銇屾湁鍔广亱纰鸿獚銇椼仸銇忋仩銇曘亜' :
                        currentLanguage === 'ko-KR' ? '鞚措歆€毳?搿滊摐頃?靾?鞐嗢姷雼堧嫟. URL鞚?鞙犿毃頃滌 頇曥澑頃橃劯鞖? : 'Could not load image, please check if the URL is valid';
    
    showToast(errorMessage, 'error');
  };
  
  img.src = url;
}

// 娓呴櫎鏈湴鑳屾櫙
function clearLocalBackground() {
  bgLocalFile.value = '';
  bgPreview.style.display = 'none';
  bgAdjustments.style.display = 'none';
  customBackground = null;
  removeCustomBackground();
}

// 绉婚櫎鑷畾涔夎儗鏅?function removeCustomBackground() {
  // 绉婚櫎宸叉湁鐨勮儗鏅鍣?  const existingBgContainer = document.querySelector('.bg-container-wrapper');
  if (existingBgContainer) {
    document.body.removeChild(existingBgContainer);
  }
  
  document.body.style.backgroundImage = '';
  document.body.classList.remove('custom-bg');
}

// 鏇存柊鑳屾櫙璁剧疆
function updateBackgroundSettings() {
  const bgContainer = document.querySelector('.bg-image');
  if (bgContainer) {
    // 搴旂敤閫忔槑搴?    bgContainer.style.opacity = bgSettings.opacity / 100;
    
    // 搴旂敤妯＄硦搴?    bgContainer.style.filter = `blur(${bgSettings.blur}px)`;
    
    // 搴旂敤灞傜骇
    const bgWrapper = document.querySelector('.bg-container-wrapper');
    bgWrapper.style.zIndex = bgSettings.zIndex;
    
    if (bgSettings.zIndex > 0) {
      bgWrapper.classList.add('front');
    } else {
      bgWrapper.classList.remove('front');
    }
  }
}

// 搴旂敤鑳屾櫙
function applyBackground() {
  // 绉婚櫎涔嬪墠鐨勮儗鏅?  removeCustomBackground();
  
  // 濡傛灉鏈夎嚜瀹氫箟鑳屾櫙锛屽簲鐢ㄥ畠
  if (customBackground) {
    // 鍒涘缓鑳屾櫙瀹瑰櫒
    const bgWrapper = document.createElement('div');
    bgWrapper.className = 'bg-container-wrapper';
    
    const bgImage = document.createElement('div');
    bgImage.className = 'bg-image';
    bgImage.style.backgroundImage = `url("${customBackground.data}")`;
    
    bgWrapper.appendChild(bgImage);
    document.body.appendChild(bgWrapper);
    
    // 搴旂敤鑳屾櫙璁剧疆
    updateBackgroundSettings();
    
    document.body.classList.add('custom-bg');
  }
}

// 鏇存柊琛ㄥ崟閫忔槑搴?function updateFormOpacity(value) {
  const opacity = value / 100;
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    
    // 濡傛灉鏄繁鑹蹭富棰橈紝浣跨敤娣辫壊鑳屾櫙
    if (currentTheme === 'dark') {
      mainContent.style.backgroundColor = `rgba(31, 31, 31, ${opacity})`;
    } 
    // 濡傛灉鏄噾鑹蹭富棰橈紝浣跨敤閲戣壊鑳屾櫙
    else if (currentTheme === 'gold') {
      mainContent.style.backgroundColor = `rgba(250, 245, 230, ${opacity})`;
    }
  }
}

// 鏇存柊瀛椾綋閫忔槑搴?function updateFontOpacity(value) {
  const opacity = value / 100;
  const textElements = document.querySelectorAll('.form-section label, .form-section h2, .form-section input, .form-section select, .form-section textarea');
  
  textElements.forEach(element => {
    element.style.opacity = opacity;
  });
}

// 淇濆瓨涓婚鍋忓ソ
function saveThemePreferences() {
  // 鏀堕泦褰撳墠璁剧疆
  const preferences = {
    theme: currentTheme,
    background: customBackground,
    bgSettings: bgSettings,
    animation: animationSwitch.checked,
    formOpacity: formOpacity.value,
    fontOpacity: fontOpacity.value
  };
  
  // 淇濆瓨鍒版湰鍦板瓨鍌?  localStorage.setItem('themePreferences', JSON.stringify(preferences));
  
  // 搴旂敤璁剧疆
  selectTheme(currentTheme);
  applyBackground();
  animationEnabled = animationSwitch.checked;
  updateFormOpacity(formOpacity.value);
  updateFontOpacity(fontOpacity.value);
  
  // 鍏抽棴璁剧疆闈㈡澘
  closeSettingsPanel();
  
  // 鏍规嵁褰撳墠璇█鏄剧ず鎴愬姛娑堟伅
  const successMessage = currentLanguage === 'zh-CN' ? '涓婚璁剧疆宸蹭繚瀛? :
                        currentLanguage === 'ru-RU' ? '袧邪褋褌褉芯泄泻懈 褌械屑褘 褋芯褏褉邪薪械薪褘' :
                        currentLanguage === 'ja-JP' ? '銉嗐兗銉炶ō瀹氥亴淇濆瓨銇曘倢銇俱仐銇? :
                        currentLanguage === 'ko-KR' ? '韰岆 靹れ爼鞚?鞝€鞛ル悩鞐堨姷雼堧嫟' : 'Theme settings saved';
  
  showToast(successMessage, 'success');
}

// 閲嶇疆涓婚鍋忓ソ
function resetThemePreferences() {
  // 閲嶇疆涓洪粯璁よ缃?  currentTheme = 'light';
  customBackground = null;
  animationEnabled = false;
  
  // 閲嶇疆鑳屾櫙璁剧疆
  bgSettings = {
    opacity: 100,
    blur: 0,
    zIndex: 0
  };
  
  // 鏇存柊UI
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
  
  // 搴旂敤閲嶇疆鐨勮缃?  updateFormOpacity(100);
  updateFontOpacity(100);
  
  // 瑙﹀彂鑳屾櫙绫诲瀷鍙樻洿澶勭悊
  handleBgTypeChange();
  
  // 浠庢湰鍦板瓨鍌ㄤ腑绉婚櫎
  localStorage.removeItem('themePreferences');
  
  // 鏍规嵁褰撳墠璇█鏄剧ず淇℃伅娑堟伅
  const infoMessage = currentLanguage === 'zh-CN' ? '涓婚璁剧疆宸查噸缃? :
                     currentLanguage === 'ru-RU' ? '袧邪褋褌褉芯泄泻懈 褌械屑褘 褋斜褉芯褕械薪褘' :
                     currentLanguage === 'ja-JP' ? '銉嗐兗銉炶ō瀹氥亴銉偦銉冦儓銇曘倢銇俱仐銇? :
                     currentLanguage === 'ko-KR' ? '韰岆 靹れ爼鞚?齑堦赴頇旊悩鞐堨姷雼堧嫟' : 'Theme settings reset';
  
  showToast(infoMessage, 'info');
}

// 鍔犺浇涓婚鍋忓ソ
function loadThemePreferences() {
  const savedPreferences = localStorage.getItem('themePreferences');
  
  if (savedPreferences) {
    try {
      const preferences = JSON.parse(savedPreferences);
      
      // 搴旂敤涓婚
      currentTheme = preferences.theme || 'light';
      selectTheme(currentTheme);
      
      // 鍔犺浇鑳屾櫙璁剧疆
      if (preferences.bgSettings) {
        bgSettings = preferences.bgSettings;
        bgOpacity.value = bgSettings.opacity;
        bgOpacityValue.textContent = `${bgSettings.opacity}%`;
        bgBlur.value = bgSettings.blur;
        bgBlurValue.textContent = `${bgSettings.blur}px`;
        bgZIndex.value = bgSettings.zIndex;
        bgZIndexValue.textContent = bgSettings.zIndex;
      }
      
      // 搴旂敤鑳屾櫙
      customBackground = preferences.background;
      if (customBackground) {
        // 鏇存柊UI
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
        
        // 搴旂敤鑳屾櫙
        applyBackground();
      } else {
        document.getElementById('bgNone').checked = true;
      }
      
      // 搴旂敤鍔ㄧ敾璁剧疆
      animationEnabled = preferences.animation || false;
      animationSwitch.checked = animationEnabled;
      
      // 搴旂敤閫忔槑搴﹁缃?      if (preferences.formOpacity) {
        formOpacity.value = preferences.formOpacity;
        opacityValue.textContent = `${preferences.formOpacity}%`;
        updateFormOpacity(preferences.formOpacity);
      }
      
      // 搴旂敤瀛椾綋閫忔槑搴﹁缃?      if (preferences.fontOpacity) {
        fontOpacity.value = preferences.fontOpacity;
        fontOpacityValue.textContent = `${preferences.fontOpacity}%`;
        updateFontOpacity(preferences.fontOpacity);
      }
      
    } catch (e) {
      console.error('鍔犺浇涓婚璁剧疆澶辫触:', e);
      
      // 鏍规嵁褰撳墠璇█鏄剧ず閿欒娑堟伅
      const errorMessage = currentLanguage === 'zh-CN' ? '鍔犺浇涓婚璁剧疆澶辫触' :
                          currentLanguage === 'ru-RU' ? '袧械 褍写邪谢芯褋褜 蟹邪谐褉褍蟹懈褌褜 薪邪褋褌褉芯泄泻懈 褌械屑褘' :
                          currentLanguage === 'ja-JP' ? '銉嗐兗銉炶ō瀹氥伄瑾伩杈笺伩銇け鏁椼仐銇俱仐銇? :
                          currentLanguage === 'ko-KR' ? '韰岆 靹れ爼 搿滊摐 鞁ろ尐' : 'Failed to load theme settings';
      
      showToast(errorMessage, 'error');
    }
  }
}

// 澶勭悊鐐瑰嚮鍔ㄧ敾
function handleClickAnimation(e) {
  if (!animationEnabled) return;
  
  // 闅忔満閫夋嫨琛ㄦ儏鎴栭鏂囧瓧
  const items = Math.random() > 0.5 ? emojis : kaomojis;
  const item = items[Math.floor(Math.random() * items.length)];
  
  // 闅忔満棰滆壊
  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue}, 80%, 60%)`;
  
  // 鍒涘缓鍔ㄧ敾鍏冪礌
  const animEl = document.createElement('div');
  animEl.className = 'emoji-animation';
  animEl.textContent = item;
  animEl.style.color = color;
  
  // 闅忔満浣嶇疆鑰屼笉鏄紶鏍囦綅缃?  const maxWidth = window.innerWidth - 100;
  const maxHeight = window.innerHeight - 100;
  const randomX = Math.floor(Math.random() * maxWidth);
  const randomY = Math.floor(Math.random() * maxHeight);
  
  animEl.style.left = `${randomX}px`;
  animEl.style.top = `${randomY}px`;
  
  // 娣诲姞鍒伴〉闈?  document.body.appendChild(animEl);
  
  // 5绉掑悗绉婚櫎鍏冪礌
  setTimeout(() => {
    if (document.body.contains(animEl)) {
      document.body.removeChild(animEl);
    }
  }, 5000);
}

// 鑾峰彇閫変腑鐨勮繃鏁忔簮
function getSelectedAllergens() {
  const allergens = [];
  const allergenCheckboxes = document.querySelectorAll('input[name="allergens"]:checked');
  
  allergenCheckboxes.forEach(checkbox => {
    if (checkbox.value === '鍏朵粬' && otherAllergens.value) {
      allergens.push(otherAllergens.value);
    } else if (checkbox.value !== '鍏朵粬') {
      allergens.push(checkbox.value);
    }
  });
  
  return allergens;
}

// 澶勭悊琛ㄥ崟鎻愪氦
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // 鑾峰彇褰撳墠API璁剧疆
  const apiProvider = localStorage.getItem('apiProvider') || 'default';
  
  // 妫€鏌ユ槸鍚︽槸浣跨敤榛樿API锛屽鏋滄槸鍒欐鏌ヤ娇鐢ㄩ檺鍒?  if (apiProvider === 'default' && dailyApiUsageCount >= dailyApiUsageLimit) {
    // 鏍规嵁褰撳墠璇█鏄剧ず涓嶅悓鐨勯敊璇秷鎭?    let errorMsg = '';
    switch (currentLanguage) {
      case 'zh-CN':
        errorMsg = '鎮ㄤ粖鏃ュ凡杈惧埌鍐呯疆API浣跨敤涓婇檺锛?0娆★級锛岃鏄庡ぉ鍐嶈瘯鎴栬缃嚜宸辩殑API';
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
  
  // 鏄剧ず鍔犺浇鐘舵€?  reportContent.innerHTML = `<div class="loading">${translations[currentLanguage].loading}</div>`;
  showReport();
  
  // 鏀堕泦琛ㄥ崟鏁版嵁
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
    customFields: getCustomFieldsData() // 娣诲姞鑷畾涔夊瓧娈垫暟鎹?  };
  
  // 鍗曚綅杞崲锛堝鏋滄槸缇庡埗鍗曚綅锛?  if (currentLanguage === 'en-US') {
    // 鑻卞杞帢绫?    formData.heightCm = (formData.height * 2.54).toFixed(1);
    // 纾呰浆鍗冨厠
    formData.weightKg = (formData.weight * 0.453592).toFixed(1);
  } else {
    // 瀵逛簬鍏朵粬璇█锛堜腑鏂囥€佽嫳寮忚嫳璇€佷縿璇€佹棩璇€侀煩璇級锛屼娇鐢ㄥ叕鍒跺崟浣?    formData.heightCm = formData.height;
    formData.weightKg = formData.weight;
  }
  
  try {
    // 鑾峰彇AI鐢熸垚鐨勫仴搴锋姤鍛?    const report = await generateHealthReport(formData);
    
    // 濡傛灉浣跨敤鐨勬槸榛樿API锛屽鍔犱娇鐢ㄨ鏁?    if (apiProvider === 'default') {
      dailyApiUsageCount++;
      saveApiUsageData();
      updateApiRemainingCount();
    }
    
    // 鏄剧ず鎶ュ憡
    displayReport(report, formData);
    
    // 淇濆瓨鍒板巻鍙茶褰?    saveToHistory(formData, report);
    
  } catch (error) {
    reportContent.innerHTML = `<div class="error">${translations[currentLanguage].error}: ${error.message}</div>`;
    showToast(`${translations[currentLanguage].error}: ${error.message}`, 'error');
  }
}

// 鐢熸垚鍋ュ悍鎶ュ憡
async function generateHealthReport(data) {
  // 璁＄畻BMI锛堜娇鐢ㄥ叕鍒跺€硷級
  const bmi = (data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1);
  
  // 璁＄畻鍋ュ悍璇勫垎 (0-100鍒?
  let healthScore = 70; // 鍩虹鍒嗘暟
  
  // 鏍规嵁BMI璋冩暣鍒嗘暟
  if (bmi >= 18.5 && bmi <= 24.9) {
    healthScore += 10; // 鐞嗘兂BMI
  } else if ((bmi >= 17 && bmi < 18.5) || (bmi > 24.9 && bmi <= 29.9)) {
    healthScore -= 5; // 杞诲害瓒呴噸鎴栬交搴﹀亸鐦?  } else {
    healthScore -= 15; // 鑲ヨ儢鎴栦弗閲嶅亸鐦?  }
  
  // 鏍规嵁琛€鍘嬭皟鏁村垎鏁?  const systolic = parseInt(data.systolic);
  const diastolic = parseInt(data.diastolic);
  if ((systolic >= 90 && systolic <= 120) && (diastolic >= 60 && diastolic <= 80)) {
    healthScore += 10; // 鐞嗘兂琛€鍘?  } else if ((systolic > 120 && systolic <= 140) || (diastolic > 80 && diastolic <= 90)) {
    healthScore -= 5; // 杞诲害楂樿鍘?  } else if (systolic > 140 || diastolic > 90) {
    healthScore -= 15; // 楂樿鍘?  } else if (systolic < 90 || diastolic < 60) {
    healthScore -= 10; // 浣庤鍘?  }
  
  // 鏍规嵁蹇冪巼璋冩暣鍒嗘暟
  const heartRate = parseInt(data.heartRate);
  if (heartRate >= 60 && heartRate <= 100) {
    healthScore += 5; // 姝ｅ父蹇冪巼
  } else {
    healthScore -= 5; // 蹇冪巼寮傚父
  }
  
  // 鏍规嵁鐫＄湢璋冩暣鍒嗘暟
  const sleepHours = parseFloat(data.sleepHours);
  if (sleepHours >= 7 && sleepHours <= 9) {
    healthScore += 5; // 鐞嗘兂鐫＄湢
  } else if (sleepHours >= 6 && sleepHours < 7) {
    healthScore -= 3; // 杞诲害鐫＄湢涓嶈冻
  } else {
    healthScore -= 8; // 涓ラ噸鐫＄湢涓嶈冻鎴栬繃閲?  }
  
  // 鏍规嵁杩愬姩棰戠巼璋冩暣鍒嗘暟
  if (data.exerciseFrequency === '3-4' || data.exerciseFrequency === '5+') {
    healthScore += 5; // 閫傚綋杩愬姩
  } else if (data.exerciseFrequency === '1-2') {
    healthScore += 2; // 灏戦噺杩愬姩
  } else {
    healthScore -= 5; // 涓嶈繍鍔?  }
  
  // 闄愬埗璇勫垎鑼冨洿鍦?-100涔嬮棿
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // 淇濆瓨鍋ュ悍璇勫垎鍒癲ata瀵硅薄
  data.healthScore = Math.round(healthScore);

  // 鏋勫缓鎻愮ず璇?  let fullPrompt = '';
  let firstHalfPrompt = '';
  let secondHalfPrompt = '';
  
  // 娣诲姞鑷畾涔夊瓧娈典俊鎭?  let customFieldsText = '';
  if (data.customFields && Object.keys(data.customFields).length > 0) {
    customFieldsText = '\n鑷畾涔夋暟鎹?\n';
    Object.entries(data.customFields).forEach(([label, value]) => {
      customFieldsText += `- ${label}: ${value}\n`;
    });
  }
  
  if (data.language === 'zh-CN') {
    fullPrompt = `
浣犳槸涓€鍚嶄笓涓氱殑鍋ュ悍椤鹃棶鍜岃惀鍏诲笀銆傛牴鎹敤鎴锋彁渚涚殑浠ヤ笅鍋ュ悍鏁版嵁锛屾彁渚涗竴浠藉叏闈㈢殑鍋ュ悍璇勪及鍜屽缓璁細

韬珮: ${data.height}cm
浣撻噸: ${data.weight}kg
骞撮緞: ${data.age}宀?鎬у埆: ${data.gender === 'male' ? '鐢? : data.gender === 'female' ? '濂? : '鍏朵粬'}
BMI: ${bmi}
鍋ュ悍璇勫垎: ${data.healthScore}/100
琛€鍘? ${data.systolic}/${data.diastolic} mmHg
蹇冪巼: ${data.heartRate} 娆?鍒?骞冲潎鐫＄湢鏃堕暱: ${data.sleepHours} 灏忔椂
姣忓懆杩愬姩棰戠巼: ${data.exerciseFrequency}
鐥呭彶: ${data.medical || '鏃?}
鐢熸椿涔犳儻: ${data.lifestyle}
楗涔犳儻: ${data.diet}
涓昏鍋ュ悍椤捐檻: ${data.concern || '鏃犵壒鍒【铏?}
杩囨晱婧? ${data.allergens.length > 0 ? data.allergens.join(', ') : '鏃?}${customFieldsText}

璇锋彁渚涗互涓嬪唴瀹癸細
1. 韬綋鐘跺喌鎬讳綋璇勪及锛堝寘鎷仴搴疯瘎鍒嗚В閲娿€丅MI鍒嗘瀽銆佽鍘嬪拰蹇冪巼鍒嗘瀽锛?2. 娼滃湪鍋ュ悍椋庨櫓鍒嗘瀽
3. 鐢熸椿涔犳儻鏀瑰杽寤鸿锛堝寘鎷潯鐪犲拰杩愬姩寤鸿锛?4. 楗璋冩暣寤鸿锛堣€冭檻杩囨晱婧愶級
5. 杩愬姩寤鸿锛堝熀浜庡綋鍓嶈繍鍔ㄩ鐜囷級
6. 鏈潵3-6涓湀鐨勫仴搴风洰鏍囧拰璁″垝

璇疯缁嗕笖涓撲笟鍦板洖绛旓紝缁欏嚭鍏蜂綋鐨勫缓璁€岄潪娉涙硾鑰岃皥銆傚洖绛斾娇鐢∕arkdown鏍煎紡銆?`;

    firstHalfPrompt = `
浣犳槸涓€鍚嶄笓涓氱殑鍋ュ悍椤鹃棶鍜岃惀鍏诲笀銆傛牴鎹敤鎴锋彁渚涚殑浠ヤ笅鍋ュ悍鏁版嵁锛屾彁渚涗竴浠藉仴搴疯瘎浼扮殑鍓嶅崐閮ㄥ垎锛?
韬珮: ${data.height}cm
浣撻噸: ${data.weight}kg
骞撮緞: ${data.age}宀?鎬у埆: ${data.gender === 'male' ? '鐢? : data.gender === 'female' ? '濂? : '鍏朵粬'}
BMI: ${bmi}
鍋ュ悍璇勫垎: ${data.healthScore}/100
琛€鍘? ${data.systolic}/${data.diastolic} mmHg
蹇冪巼: ${data.heartRate} 娆?鍒?骞冲潎鐫＄湢鏃堕暱: ${data.sleepHours} 灏忔椂
姣忓懆杩愬姩棰戠巼: ${data.exerciseFrequency}
鐥呭彶: ${data.medical || '鏃?}
鐢熸椿涔犳儻: ${data.lifestyle}
楗涔犳儻: ${data.diet}${customFieldsText}

璇锋彁渚涗互涓嬪唴瀹癸紙浠呴渶鎻愪緵杩欎簺鍐呭锛屼笉闇€瑕佸叾浠栵級锛?1. 韬綋鐘跺喌鎬讳綋璇勪及锛堝寘鎷仴搴疯瘎鍒嗚В閲娿€丅MI鍒嗘瀽銆佽鍘嬪拰蹇冪巼鍒嗘瀽锛?2. 娼滃湪鍋ュ悍椋庨櫓鍒嗘瀽
3. 鐢熸椿涔犳儻鏀瑰杽寤鸿锛堝寘鎷潯鐪犲拰杩愬姩寤鸿锛?
璇蜂娇鐢∕arkdown鏍煎紡锛岀粰鍑轰笓涓氳缁嗙殑寤鸿銆備綘鐨勫唴瀹瑰皢浣滀负鎶ュ憡鐨勫墠鍗婇儴鍒嗭紝浼氫笌鍙︿竴浣嶄笓瀹舵挵鍐欑殑鍚庡崐閮ㄥ垎鍚堝苟銆?`;

    secondHalfPrompt = `
浣犳槸涓€鍚嶄笓涓氱殑鍋ュ悍椤鹃棶鍜岃惀鍏诲笀銆傛牴鎹敤鎴锋彁渚涚殑浠ヤ笅鍋ュ悍鏁版嵁锛屾彁渚涗竴浠藉仴搴峰缓璁殑鍚庡崐閮ㄥ垎锛?
韬珮: ${data.height}cm
浣撻噸: ${data.weight}kg
骞撮緞: ${data.age}宀?鎬у埆: ${data.gender === 'male' ? '鐢? : data.gender === 'female' ? '濂? : '鍏朵粬'}
BMI: ${bmi}
鍋ュ悍璇勫垎: ${data.healthScore}/100
琛€鍘? ${data.systolic}/${data.diastolic} mmHg
蹇冪巼: ${data.heartRate} 娆?鍒?姣忓懆杩愬姩棰戠巼: ${data.exerciseFrequency}
鐥呭彶: ${data.medical || '鏃?}
楗涔犳儻: ${data.diet}
涓昏鍋ュ悍椤捐檻: ${data.concern || '鏃犵壒鍒【铏?}
杩囨晱婧? ${data.allergens.length > 0 ? data.allergens.join(', ') : '鏃?}${customFieldsText}

璇锋彁渚涗互涓嬪唴瀹癸紙浠呴渶鎻愪緵杩欎簺鍐呭锛屼笉闇€瑕佸叾浠栵級锛?4. 楗璋冩暣寤鸿锛堣€冭檻杩囨晱婧愶級
5. 杩愬姩寤鸿锛堝熀浜庡綋鍓嶈繍鍔ㄩ鐜囷級
6. 鏈潵3-6涓湀鐨勫仴搴风洰鏍囧拰璁″垝

璇蜂娇鐢∕arkdown鏍煎紡锛岀粰鍑轰笓涓氳缁嗙殑寤鸿銆備綘鐨勫唴瀹瑰皢浣滀负鎶ュ憡鐨勫悗鍗婇儴鍒嗭紝浼氫笌鍙︿竴浣嶄笓瀹舵挵鍐欑殑鍓嶅崐閮ㄥ垎鍚堝苟銆?`;
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
袙褘 锌褉芯褎械褋褋懈芯薪邪谢褜薪褘泄 泻芯薪褋褍谢褜褌邪薪褌 锌芯 蟹写芯褉芯胁褜褞 懈 写懈械褌芯谢芯谐. 袧邪 芯褋薪芯胁械 褋谢械写褍褞褖懈褏 写邪薪薪褘褏 芯 蟹写芯褉芯胁褜械, 锌褉械写芯褋褌邪胁谢械薪薪褘褏 锌芯谢褜蟹芯胁邪褌械谢械屑, 锌褉械写芯褋褌邪胁褜褌械 泻芯屑锌谢械泻褋薪褍褞 芯褑械薪泻褍 蟹写芯褉芯胁褜褟 懈 褉械泻芯屑械薪写邪褑懈懈:

袪芯褋褌: ${data.height} 褋屑
袙械褋: ${data.weight} 泻谐
袙芯蟹褉邪褋褌: ${data.age}
袩芯谢: ${data.gender === 'male' ? '袦褍卸褋泻芯泄' : data.gender === 'female' ? '袞械薪褋泻懈泄' : '袛褉褍谐芯泄'}
袠袦孝: ${bmi}
袨褑械薪泻邪 蟹写芯褉芯胁褜褟: ${data.healthScore}/100
袣褉芯胁褟薪芯械 写邪胁谢械薪懈械: ${data.systolic}/${data.diastolic} 屑屑 褉褌.褋褌.
袩褍谢褜褋: ${data.heartRate} 褍写/屑懈薪
小褉械写薪褟褟 锌褉芯写芯谢卸懈褌械谢褜薪芯褋褌褜 褋薪邪: ${data.sleepHours} 褔邪褋芯胁
效邪褋褌芯褌邪 褌褉械薪懈褉芯胁芯泻 胁 薪械写械谢褞: ${data.exerciseFrequency}
袦械写懈褑懈薪褋泻邪褟 懈褋褌芯褉懈褟: ${data.medical || '袧械褌'}
袨斜褉邪蟹 卸懈蟹薪懈: ${data.lifestyle}
袩懈褖械胁褘械 锌褉懈胁褘褔泻懈: ${data.diet}
袨褋薪芯胁薪褘械 锌褉芯斜谢械屑褘 蟹写芯褉芯胁褜褟: ${data.concern || '袧械褌 芯褋芯斜褘褏 锌褉芯斜谢械屑'}
袗谢谢械褉谐械薪褘: ${data.allergens.length > 0 ? data.allergens.join(', ') : '袧械褌'}

袩芯卸邪谢褍泄褋褌邪, 锌褉械写芯褋褌邪胁褜褌械 褋谢械写褍褞褖械械:
1. 袨斜褖邪褟 芯褑械薪泻邪 褎懈蟹懈褔械褋泻芯谐芯 褋芯褋褌芯褟薪懈褟 (胁泻谢褞褔邪褟 芯斜褗褟褋薪械薪懈械 芯褑械薪泻懈 蟹写芯褉芯胁褜褟, 邪薪邪谢懈蟹 袠袦孝, 泻褉芯胁褟薪芯谐芯 写邪胁谢械薪懈褟 懈 锌褍谢褜褋邪)
2. 袗薪邪谢懈蟹 锌芯褌械薪褑懈邪谢褜薪褘褏 褉懈褋泻芯胁 写谢褟 蟹写芯褉芯胁褜褟
3. 袩褉械写谢芯卸械薪懈褟 锌芯 褍谢褍褔褕械薪懈褞 芯斜褉邪蟹邪 卸懈蟹薪懈 (胁泻谢褞褔邪褟 褉械泻芯屑械薪写邪褑懈懈 锌芯 褋薪褍 懈 褎懈蟹懈褔械褋泻芯泄 邪泻褌懈胁薪芯褋褌懈)
4. 袪械泻芯屑械薪写邪褑懈懈 锌芯 泻芯褉褉械泻褌懈褉芯胁泻械 锌懈褌邪薪懈褟 (褋 褍褔械褌芯屑 邪谢谢械褉谐械薪芯胁)
5. 袪械泻芯屑械薪写邪褑懈懈 锌芯 褎懈蟹懈褔械褋泻懈屑 褍锌褉邪卸薪械薪懈褟屑 (薪邪 芯褋薪芯胁械 褌械泻褍褖械泄 褔邪褋褌芯褌褘 褌褉械薪懈褉芯胁芯泻)
6. 笑械谢懈 懈 锌谢邪薪褘 锌芯 蟹写芯褉芯胁褜褞 薪邪 褋谢械写褍褞褖懈械 3-6 屑械褋褟褑械胁

袩芯卸邪谢褍泄褋褌邪, 芯褌胁械褌褜褌械 锌芯写褉芯斜薪芯 懈 锌褉芯褎械褋褋懈芯薪邪谢褜薪芯, 写邪胁邪褟 泻芯薪泻褉械褌薪褘械 褉械泻芯屑械薪写邪褑懈懈, 邪 薪械 芯斜褖懈械 褋芯胁械褌褘. 袨褎芯褉屑懈褌械 胁邪褕 芯褌胁械褌 胁 褎芯褉屑邪褌械 Markdown.
袠褋锌芯谢褜蟹褍泄褌械 褉芯褋褋懈泄褋泻懈械 褋褌邪薪写邪褉褌褘 懈 屑械褌褉懈泻懈 蟹写芯褉芯胁褜褟.
`;

    firstHalfPrompt = `
袙褘 锌褉芯褎械褋褋懈芯薪邪谢褜薪褘泄 泻芯薪褋褍谢褜褌邪薪褌 锌芯 蟹写芯褉芯胁褜褞 懈 写懈械褌芯谢芯谐. 袧邪 芯褋薪芯胁械 褋谢械写褍褞褖懈褏 写邪薪薪褘褏 芯 蟹写芯褉芯胁褜械, 锌褉械写芯褋褌邪胁谢械薪薪褘褏 锌芯谢褜蟹芯胁邪褌械谢械屑, 锌褉械写芯褋褌邪胁褜褌械 锌械褉胁褍褞 褔邪褋褌褜 泻芯屑锌谢械泻褋薪芯泄 芯褑械薪泻懈 蟹写芯褉芯胁褜褟:

袪芯褋褌: ${data.height} 褋屑
袙械褋: ${data.weight} 泻谐
袙芯蟹褉邪褋褌: ${data.age}
袩芯谢: ${data.gender === 'male' ? '袦褍卸褋泻芯泄' : data.gender === 'female' ? '袞械薪褋泻懈泄' : '袛褉褍谐芯泄'}
袠袦孝: ${bmi}
袨褑械薪泻邪 蟹写芯褉芯胁褜褟: ${data.healthScore}/100
袣褉芯胁褟薪芯械 写邪胁谢械薪懈械: ${data.systolic}/${data.diastolic} 屑屑 褉褌.褋褌.
袩褍谢褜褋: ${data.heartRate} 褍写/屑懈薪
小褉械写薪褟褟 锌褉芯写芯谢卸懈褌械谢褜薪芯褋褌褜 褋薪邪: ${data.sleepHours} 褔邪褋芯胁
效邪褋褌芯褌邪 褌褉械薪懈褉芯胁芯泻 胁 薪械写械谢褞: ${data.exerciseFrequency}
袦械写懈褑懈薪褋泻邪褟 懈褋褌芯褉懈褟: ${data.medical || '袧械褌'}
袨斜褉邪蟹 卸懈蟹薪懈: ${data.lifestyle}

袩芯卸邪谢褍泄褋褌邪, 锌褉械写芯褋褌邪胁褜褌械 褌芯谢褜泻芯 褋谢械写褍褞褖懈械 褉邪蟹写械谢褘 (斜械蟹 写芯锌芯谢薪懈褌械谢褜薪芯谐芯 褋芯写械褉卸邪薪懈褟):
1. 袨斜褖邪褟 芯褑械薪泻邪 褎懈蟹懈褔械褋泻芯谐芯 褋芯褋褌芯褟薪懈褟 (胁泻谢褞褔邪褟 芯斜褗褟褋薪械薪懈械 芯褑械薪泻懈 蟹写芯褉芯胁褜褟, 邪薪邪谢懈蟹 袠袦孝, 泻褉芯胁褟薪芯谐芯 写邪胁谢械薪懈褟 懈 锌褍谢褜褋邪)
2. 袗薪邪谢懈蟹 锌芯褌械薪褑懈邪谢褜薪褘褏 褉懈褋泻芯胁 写谢褟 蟹写芯褉芯胁褜褟
3. 袩褉械写谢芯卸械薪懈褟 锌芯 褍谢褍褔褕械薪懈褞 芯斜褉邪蟹邪 卸懈蟹薪懈 (胁泻谢褞褔邪褟 褉械泻芯屑械薪写邪褑懈懈 锌芯 褋薪褍 懈 褎懈蟹懈褔械褋泻芯泄 邪泻褌懈胁薪芯褋褌懈)

袩芯卸邪谢褍泄褋褌邪, 懈褋锌芯谢褜蟹褍泄褌械 褎芯褉屑邪褌 Markdown 懈 锌褉械写芯褋褌邪胁褜褌械 写械褌邪谢褜薪褘械 锌褉芯褎械褋褋懈芯薪邪谢褜薪褘械 褋芯胁械褌褘. 袙邪褕 泻芯薪褌械薪褌 斜褍写械褌 锌械褉胁芯泄 褔邪褋褌褜褞 芯褌褔械褌邪 懈 斜褍写械褌 芯斜褗械写懈薪械薪 褋芯 胁褌芯褉芯泄 褔邪褋褌褜褞, 薪邪锌懈褋邪薪薪芯泄 写褉褍谐懈屑 褝泻褋锌械褉褌芯屑.
袠褋锌芯谢褜蟹褍泄褌械 褉芯褋褋懈泄褋泻懈械 褋褌邪薪写邪褉褌褘 懈 屑械褌褉懈泻懈 蟹写芯褉芯胁褜褟.
`;

    secondHalfPrompt = `
袙褘 锌褉芯褎械褋褋懈芯薪邪谢褜薪褘泄 泻芯薪褋褍谢褜褌邪薪褌 锌芯 蟹写芯褉芯胁褜褞 懈 写懈械褌芯谢芯谐. 袧邪 芯褋薪芯胁械 褋谢械写褍褞褖懈褏 写邪薪薪褘褏 芯 蟹写芯褉芯胁褜械, 锌褉械写芯褋褌邪胁谢械薪薪褘褏 锌芯谢褜蟹芯胁邪褌械谢械屑, 锌褉械写芯褋褌邪胁褜褌械 胁褌芯褉褍褞 褔邪褋褌褜 泻芯屑锌谢械泻褋薪芯泄 芯褑械薪泻懈 蟹写芯褉芯胁褜褟:

袪芯褋褌: ${data.height} 褋屑
袙械褋: ${data.weight} 泻谐
袙芯蟹褉邪褋褌: ${data.age}
袩芯谢: ${data.gender === 'male' ? '袦褍卸褋泻芯泄' : data.gender === 'female' ? '袞械薪褋泻懈泄' : '袛褉褍谐芯泄'}
袠袦孝: ${bmi}
袨褑械薪泻邪 蟹写芯褉芯胁褜褟: ${data.healthScore}/100
效邪褋褌芯褌邪 褌褉械薪懈褉芯胁芯泻 胁 薪械写械谢褞: ${data.exerciseFrequency}
袩懈褖械胁褘械 锌褉懈胁褘褔泻懈: ${data.diet}
袨褋薪芯胁薪褘械 锌褉芯斜谢械屑褘 蟹写芯褉芯胁褜褟: ${data.concern || '袧械褌 芯褋芯斜褘褏 锌褉芯斜谢械屑'}
袗谢谢械褉谐械薪褘: ${data.allergens.length > 0 ? data.allergens.join(', ') : '袧械褌'}

袩芯卸邪谢褍泄褋褌邪, 锌褉械写芯褋褌邪胁褜褌械 褌芯谢褜泻芯 褋谢械写褍褞褖懈械 褉邪蟹写械谢褘 (斜械蟹 写芯锌芯谢薪懈褌械谢褜薪芯谐芯 褋芯写械褉卸邪薪懈褟):
4. 袪械泻芯屑械薪写邪褑懈懈 锌芯 泻芯褉褉械泻褌懈褉芯胁泻械 锌懈褌邪薪懈褟 (褋 褍褔械褌芯屑 邪谢谢械褉谐械薪芯胁)
5. 袪械泻芯屑械薪写邪褑懈懈 锌芯 褎懈蟹懈褔械褋泻懈屑 褍锌褉邪卸薪械薪懈褟屑 (薪邪 芯褋薪芯胁械 褌械泻褍褖械泄 褔邪褋褌芯褌褘 褌褉械薪懈褉芯胁芯泻)
6. 笑械谢懈 懈 锌谢邪薪褘 锌芯 蟹写芯褉芯胁褜褞 薪邪 褋谢械写褍褞褖懈械 3-6 屑械褋褟褑械胁

袩芯卸邪谢褍泄褋褌邪, 懈褋锌芯谢褜蟹褍泄褌械 褎芯褉屑邪褌 Markdown 懈 锌褉械写芯褋褌邪胁褜褌械 写械褌邪谢褜薪褘械 锌褉芯褎械褋褋懈芯薪邪谢褜薪褘械 褋芯胁械褌褘. 袙邪褕 泻芯薪褌械薪褌 斜褍写械褌 胁褌芯褉芯泄 褔邪褋褌褜褞 芯褌褔械褌邪 懈 斜褍写械褌 芯斜褗械写懈薪械薪 褋 锌械褉胁芯泄 褔邪褋褌褜褞, 薪邪锌懈褋邪薪薪芯泄 写褉褍谐懈屑 褝泻褋锌械褉褌芯屑.
袠褋锌芯谢褜蟹褍泄褌械 褉芯褋褋懈泄褋泻懈械 褋褌邪薪写邪褉褌褘 懈 屑械褌褉懈泻懈 蟹写芯褉芯胁褜褟.
`;
  } else if (data.language === 'ja-JP') {
    fullPrompt = `
銇傘仾銇熴伅銉椼儹銇仴搴枫偝銉炽偟銉偪銉炽儓銇ㄦ爠椁婂＋銇с仚銆傘儲銉笺偠銉笺亱銈夋彁渚涖仌銈屻仧娆°伄鍋ュ悍銉囥兗銈裤伀鍩恒仴銇勩仸銆佸寘鎷殑銇仴搴疯渚°仺鎺ㄥエ浜嬮爡銈掓彁渚涖仐銇︺亸銇犮仌銇勶細

韬暦: ${data.height} cm
浣撻噸: ${data.weight} kg
骞撮舰: ${data.age}
鎬у垾: ${data.gender === 'male' ? '鐢锋€? : data.gender === 'female' ? '濂虫€? : '銇濄伄浠?}
BMI: ${bmi}
鍋ュ悍銈广偝銈? ${data.healthScore}/100
琛€鍦? ${data.systolic}/${data.diastolic} mmHg
蹇冩媿鏁? ${data.heartRate} 鎷?鍒?骞冲潎鐫＄湢鏅傞枔: ${data.sleepHours} 鏅傞枔
閫遍枔閬嬪嫊闋诲害: ${data.exerciseFrequency}
鐥呮: ${data.medical || '銇仐'}
鐢熸椿缈掓叄: ${data.lifestyle}
椋熶簨缈掓叄: ${data.diet}
涓汇仾鍋ュ悍涓娿伄鎳稿康: ${data.concern || '鐗广伀銇仐'}
銈儸銉偛銉? ${data.allergens.length > 0 ? data.allergens.join(', ') : '銇仐'}

浠ヤ笅銇唴瀹广倰鎻愪緵銇椼仸銇忋仩銇曘亜锛?1. 鍏ㄤ綋鐨勩仾韬綋鐘舵厠銇渚★紙鍋ュ悍銈广偝銈伄瑾槑銆丅MI鍒嗘瀽銆佽鍦с亰銈堛伋蹇冩媿鏁板垎鏋愩倰鍚個锛?2. 娼滃湪鐨勩仾鍋ュ悍銉偣銈垎鏋?3. 鐢熸椿缈掓叄銇敼鍠勬彁妗堬紙鐫＄湢銇ㄩ亱鍕曘伄鎺ㄥエ浜嬮爡銈掑惈銈€锛?4. 椋熶簨瑾挎暣銇帹濂ㄤ簨闋咃紙銈儸銉偛銉炽倰鑰冩叜锛?5. 閬嬪嫊銇帹濂ㄤ簨闋咃紙鐝惧湪銇亱鍕曢牷搴︺伀鍩恒亸锛?6. 浠婂緦3銆?銉舵湀銇仴搴风洰妯欍仺瑷堢敾

瑭崇窗銇嬨仱銉椼儹銉曘偋銉冦偡銉с儕銉伀鍥炵瓟銇椼€佷竴鑸殑銇偄銉夈儛銈ゃ偣銇с伅銇亸鍏蜂綋鐨勩仾鎺ㄥエ浜嬮爡銈掓彁渚涖仐銇︺亸銇犮仌銇勩€傚洖绛斻伅Markdown褰㈠紡銇т綔鎴愩仐銇︺亸銇犮仌銇勩€?鏃ユ湰銇仴搴峰熀婧栥仺鎸囨銈掍娇鐢ㄣ仐銇︺亸銇犮仌銇勩€?`;

    firstHalfPrompt = `
銇傘仾銇熴伅銉椼儹銇仴搴枫偝銉炽偟銉偪銉炽儓銇ㄦ爠椁婂＋銇с仚銆傘儲銉笺偠銉笺亱銈夋彁渚涖仌銈屻仧娆°伄鍋ュ悍銉囥兗銈裤伀鍩恒仴銇勩仸銆佸寘鎷殑銇仴搴疯渚°伄鍓嶅崐閮ㄥ垎銈掓彁渚涖仐銇︺亸銇犮仌銇勶細

韬暦: ${data.height} cm
浣撻噸: ${data.weight} kg
骞撮舰: ${data.age}
鎬у垾: ${data.gender === 'male' ? '鐢锋€? : data.gender === 'female' ? '濂虫€? : '銇濄伄浠?}
BMI: ${bmi}
鍋ュ悍銈广偝銈? ${data.healthScore}/100
琛€鍦? ${data.systolic}/${data.diastolic} mmHg
蹇冩媿鏁? ${data.heartRate} bpm
骞冲潎鐫＄湢鏅傞枔: ${data.sleepHours} 鏅傞枔
閫遍枔閬嬪嫊闋诲害: ${data.exerciseFrequency}
鐥呮: ${data.medical || '銇仐'}
鐢熸椿缈掓叄: ${data.lifestyle}

浠ヤ笅銇偦銈偡銉с兂銇伩銈掓彁渚涖仐銇︺亸銇犮仌銇勶紙杩藉姞銇偝銉炽儐銉炽儎銇笉瑕併仹銇欙級锛?1. 鍏ㄤ綋鐨勩仾韬綋鐘舵厠銇渚★紙鍋ュ悍銈广偝銈伄瑾槑銆丅MI鍒嗘瀽銆佽鍦с仺蹇冩媿鏁般伄鍒嗘瀽銈掑惈銈€锛?2. 娼滃湪鐨勩仾鍋ュ悍銉偣銈伄鍒嗘瀽
3. 鐢熸椿缈掓叄銇敼鍠勬彁妗堬紙鐫＄湢銇ㄩ亱鍕曘伄鎺ㄥエ浜嬮爡銈掑惈銈€锛?
Markdown褰㈠紡銈掍娇鐢ㄣ仐銆佽┏绱般仾灏傞杸鐨勩偄銉夈儛銈ゃ偣銈掓彁渚涖仐銇︺亸銇犮仌銇勩€傘亗銇仧銇偝銉炽儐銉炽儎銇儸銉濄兗銉堛伄鍓嶅崐閮ㄥ垎銇ㄣ仾銈娿€佸垾銇皞闁€瀹躲亴鏇搞亜銇熷緦鍗婇儴鍒嗐仺绲勩伩鍚堛倧銇曘倢銇俱仚銆?鏃ユ湰銇仴搴峰熀婧栥仺鎸囨銈掍娇鐢ㄣ仐銇︺亸銇犮仌銇勩€?`;

    secondHalfPrompt = `
銇傘仾銇熴伅銉椼儹銇仴搴枫偝銉炽偟銉偪銉炽儓銇ㄦ爠椁婂＋銇с仚銆傘儲銉笺偠銉笺亱銈夋彁渚涖仌銈屻仧娆°伄鍋ュ悍銉囥兗銈裤伀鍩恒仴銇勩仸銆佸寘鎷殑銇仴搴疯渚°伄寰屽崐閮ㄥ垎銈掓彁渚涖仐銇︺亸銇犮仌銇勶細

韬暦: ${data.height} cm
浣撻噸: ${data.weight} kg
骞撮舰: ${data.age}
鎬у垾: ${data.gender === 'male' ? '鐢锋€? : data.gender === 'female' ? '濂虫€? : '銇濄伄浠?}
BMI: ${bmi}
鍋ュ悍銈广偝銈? ${data.healthScore}/100
閫遍枔閬嬪嫊闋诲害: ${data.exerciseFrequency}
椋熺繏鎱? ${data.diet}
涓汇仾鍋ュ悍涓娿伄鎳稿康: ${data.concern || '鐗广伀銇仐'}
銈儸銉偛銉? ${data.allergens.length > 0 ? data.allergens.join(', ') : '銇仐'}

浠ヤ笅銇偦銈偡銉с兂銇伩銈掓彁渚涖仐銇︺亸銇犮仌銇勶紙杩藉姞銇偝銉炽儐銉炽儎銇笉瑕併仹銇欙級锛?4. 椋熶簨瑾挎暣銇帹濂ㄤ簨闋咃紙銈儸銉偛銉炽倰鑰冩叜锛?5. 閬嬪嫊銇帹濂ㄤ簨闋咃紙鐝惧湪銇亱鍕曢牷搴︺伀鍩恒仴銇忥級
6. 浠婂緦3銆?銉舵湀銇仴搴风洰妯欍仺瑷堢敾

Markdown褰㈠紡銈掍娇鐢ㄣ仐銆佽┏绱般仾灏傞杸鐨勩偄銉夈儛銈ゃ偣銈掓彁渚涖仐銇︺亸銇犮仌銇勩€傘亗銇仧銇偝銉炽儐銉炽儎銇儸銉濄兗銉堛伄寰屽崐閮ㄥ垎銇ㄣ仾銈娿€佸垾銇皞闁€瀹躲亴鏇搞亜銇熷墠鍗婇儴鍒嗐仺绲勩伩鍚堛倧銇曘倢銇俱仚銆?鏃ユ湰銇仴搴峰熀婧栥仺鎸囨銈掍娇鐢ㄣ仐銇︺亸銇犮仌銇勩€?`;
  } else {
    // 浣跨敤涓枃妯℃澘浣滀负鍏朵粬璇█鐨勯粯璁ゆā鏉?    fullPrompt = `
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
    // 鑾峰彇褰撳墠API璁剧疆
    const apiProvider = localStorage.getItem('apiProvider') || 'default';
    
    // 濡傛灉鐢ㄦ埛璁剧疆浜嗚嚜宸辩殑API
    if (apiProvider === 'custom') {
      // 浣跨敤鐢ㄦ埛閰嶇疆鐨凙PI
      return await callCustomAPI(fullPrompt);
    } else {
      // 浣跨敤鍐呯疆API骞惰鐢熸垚鎶ュ憡
      // 瀛樺偍闇€瑕佸苟琛岃姹傜殑API璋冪敤
      const apiCalls = [];
      
      // 鏍规嵁璁剧疆娣诲姞API璋冪敤
      apiCalls.push(callTongyiAPI(firstHalfPrompt));
      apiCalls.push(callDeepseekAPI(secondHalfPrompt));
      
      // 骞惰鎵цAPI璋冪敤
      const [firstHalf, secondHalf] = await Promise.all(apiCalls);
      
      // 鍏ㄩ潰澶勭悊鍓嶅崐閮ㄥ垎鍐呭
      let processedFirstHalf = firstHalf.trim();
      if (!processedFirstHalf.endsWith('\n')) {
        processedFirstHalf += '\n';
      }
      
      // 鍏ㄩ潰澶勭悊鍚庡崐閮ㄥ垎鍐呭
      let processedSecondHalf = secondHalf.trim();
      
      // 鏍囧噯鍖栧鐞嗗嚱鏁?      const standardizeMarkdown = (text) => {
        return text
          // 绉婚櫎鍙兘瀛樺湪鐨勫ご閮ㄦ爣棰?          .replace(/^#+\s*鍋ュ悍鎶ュ憡.*?\n/i, '')
          .replace(/^#+\s*鍋ュ悍璇勪及.*?\n/i, '')
          .replace(/^#+\s*Health Report.*?\n/i, '')
          .replace(/^#+\s*Health Assessment.*?\n/i, '')
          
          // 澶勭悊涓枃搴忓彿鏍囬鏍煎紡
          .replace(/^([涓€浜屼笁鍥涗簲鍏竷鍏節鍗乚+)[銆乗.\s]+([^\n]+)/gm, '## $1. $2')
          
          // 澶勭悊鏁板瓧搴忓彿鏍囬鏍煎紡
          .replace(/^(\d+)[銆乗.\s]+(?!#)([^\n]+)/gm, '## $1. $2')
          
          // 纭繚鎵€鏈変簩绾ф爣棰樻牸寮忎竴鑷?          .replace(/^##[\s]*(\d+)[\s\.銆乚*[\s]*([^\n]+)/gm, '## $1. $2')
          
          // 澶勭悊鍙兘鐨勭壒娈婃牸寮忓 "## A. 鏍囬"
          .replace(/^##[\s]*([A-Za-z])[\.銆乚*[\s]*([^\n]+)/gm, '## $1. $2')
          
          // 缁熶竴浣跨敤 - 浣滀负鏃犲簭鍒楄〃绗﹀彿
          .replace(/^[鈥⑩€烩棆鈼忊枲]\s+/gm, '- ')
          
          // 纭繚鍒楄〃椤逛箣闂存湁閫傚綋闂磋窛
          .replace(/^(- .+)\n(?![\s\n-])/gm, '$1\n\n');
      };
      
      // 搴旂敤鏍囧噯鍖栧鐞?      processedFirstHalf = standardizeMarkdown(processedFirstHalf);
      processedSecondHalf = standardizeMarkdown(processedSecondHalf);
      
      // 濡傛灉鍚庡崐閮ㄥ垎浠ユ暟瀛楃紪鍙峰紑澶达紝浣嗕笉鏄疢arkdown鏍煎紡锛屽皢鍏惰浆涓篗arkdown鏍煎紡
      // 渚嬪: "4. 杩愬姩寤鸿" => "## 4. 杩愬姩寤鸿"
      processedSecondHalf = processedSecondHalf
        .replace(/^(\d+)\.\s+([^\n]+)/gm, '## $1. $2');
      
      // 纭繚鐗瑰畾鐨勭珷鑺傚瓨鍦ㄤ簬鍚庡崐閮ㄥ垎锛屼竴鑸槸绗?-6绔犺妭
      const lastSectionNumber = (processedFirstHalf.match(/##\s*(\d+)\./g) || [])
        .map(s => parseInt(s.replace(/[^0-9]/g, '')))
        .sort((a, b) => b - a)[0] || 3;
      
      // 妫€鏌ョ涓€閮ㄥ垎鏈€鍚庣殑绔犺妭鍙凤紝纭繚绗簩閮ㄥ垎浠庝笅涓€涓珷鑺傚紑濮?      const nextSectionIndex = lastSectionNumber + 1;
      
      // 鏍规嵁鏈€鍚庣殑绔犺妭鍙疯皟鏁村悗鍗婇儴鍒嗙珷鑺傜殑璧峰缂栧彿
      const sectionMapping = {
        4: '鍥?,
        5: '浜?, 
        6: '鍏?
      };
      
      // 澶勭悊鍙兘鐢ㄤ腑鏂囨暟瀛楃殑绔犺妭鏍囬
      for (let i = 4; i <= 6; i++) {
        const chineseSectionRegex = new RegExp(`^${sectionMapping[i]}[銆乗\.\\s]([^\\n]+)`, 'gm');
        processedSecondHalf = processedSecondHalf.replace(chineseSectionRegex, `## ${i}. $1`);
      }
      
      // 娣诲姞鍒嗛殧绗﹀拰涓撳杩囨浮鏂囨湰
      const separator = '\n\n---\n\n浠ヤ笂涓哄仴搴疯瘎浼版姤鍛婄殑鍓嶅崐閮ㄥ垎鍐呭锛岃鍙傝€冨缓璁€愭璋冩暣鐢熸椿鏂瑰紡锛屽悗缁皢鐢卞彟涓€浣嶄笓瀹舵彁渚涙洿璇︾粏鐨勯ギ椋熻鍒掑拰鍏蜂綋鍋ュ悍绠＄悊鏂规銆俓n\n---\n\n';
      
      // 鍚堝苟鎶ュ憡鍐呭
      return processedFirstHalf + separator + processedSecondHalf;
    }
  } catch (error) {
    throw new Error(`鏃犳硶鐢熸垚鍋ュ悍鎶ュ憡: ${error.message}`);
  }
}

// 璋冪敤鑷畾涔堿PI
async function callCustomAPI(prompt) {
  try {
    // 鍑嗗璇锋眰澶?    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customAPIConfig.key}`,
      ...customAPIConfig.headers
    };
    
    // 鍑嗗璇锋眰浣?- 浣跨敤OpenAI鍏煎鏍煎紡
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
      throw new Error(`API杩斿洖閿欒: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 灏濊瘯澶勭悊涓嶅悓鐨凙PI鍝嶅簲鏍煎紡
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else if (data.output && data.output.text) {
      return data.output.text;
    } else if (data.response) {
      return data.response;
    } else {
      console.warn('鏈煡鐨凙PI鍝嶅簲鏍煎紡:', data);
      return JSON.stringify(data);
    }
  } catch (error) {
    console.error('鑷畾涔堿PI璋冪敤澶辫触:', error);
    return `# 鍋ュ悍鎶ュ憡

## 鑷畾涔堿PI璋冪敤澶辫触

閿欒淇℃伅: ${error.message}

璇锋鏌ユ偍鐨凙PI璁剧疆鍜岀綉缁滆繛鎺ャ€?
`;
  }
}

// 璋冪敤閫氫箟鍗冮棶API
async function callTongyiAPI(prompt) {
  try {
    // 杩欓噷闇€瑕佹牴鎹€氫箟鍗冮棶鐨勫疄闄匒PI瑙勮寖杩涜璋冪敤
    // 浠ヤ笅鏄ず渚嬩唬鐮侊紝璇锋牴鎹疄闄匒PI鏂囨。璋冩暣
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
      throw new Error(`API杩斿洖閿欒: ${response.status}`);
    }
    
    const data = await response.json();
    return data.output.text || '鏃犳硶鑾峰彇鍝嶅簲';
  } catch (error) {
    console.error('閫氫箟鍗冮棶API璋冪敤澶辫触:', error);
    
    // API璋冪敤澶辫触鏃朵娇鐢ㄥ鐢ㄥ唴瀹?    return `# 鍋ュ悍鎶ュ憡

## 韬綋鐘跺喌鎬讳綋璇勪及

鏍规嵁鎮ㄦ彁渚涚殑淇℃伅锛屾偍鐨凚MI鍊间负${(data.weight / ((data.height / 100) ** 2)).toFixed(1)}銆?
*娉? 姝や负鏈湴鐢熸垚鐨勭ず渚嬫姤鍛婏紝API璋冪敤澶辫触銆?

## 鍋ュ悍寤鸿

1. 淇濇寔鍧囪　楗
2. 瀹氭湡閿荤偧
3. 鍏呰冻鐫＄湢
4. 瀹氭湡浣撴

`;
  }
}

// 璋冪敤Deepseek API
async function callDeepseekAPI(prompt) {
  try {
    // 杩欓噷闇€瑕佹牴鎹瓺eepseek鐨勫疄闄匒PI瑙勮寖杩涜璋冪敤
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
      throw new Error(`API杩斿洖閿欒: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content || '鏃犳硶鑾峰彇鍝嶅簲';
  } catch (error) {
    console.error('Deepseek API璋冪敤澶辫触:', error);
    return `# 鍋ュ悍鎶ュ憡

## 韬綋鐘跺喌鎬讳綋璇勪及

*娉? 姝や负鏈湴鐢熸垚鐨勭ず渚嬫姤鍛婏紝API璋冪敤澶辫触銆?

璇锋鏌ョ綉缁滆繛鎺ユ垨API閰嶇疆銆?
`;
  }
}

// 鏄剧ず鎶ュ憡
function displayReport(report, formData) {
  // 棰勫鐞嗘姤鍛婃枃鏈紝纭繚鏍囬鏍煎紡缁熶竴
  let processedReport = report;
  
  // 1. 绉婚櫎鎵€鏈夊彲鑳藉瓨鍦ㄧ殑澶撮儴鏍囬
  processedReport = processedReport
    .replace(/^#+\s*鍋ュ悍鎶ュ憡.*?\n/i, '')
    .replace(/^#+\s*鍋ュ悍璇勪及.*?\n/i, '')
    .replace(/^#+\s*Health Report.*?\n/i, '')
    .replace(/^#+\s*Health Assessment.*?\n/i, '');
  
  // 2. 鏍囧噯鍖朚arkdown鏍囪
  // 澶勭悊鏄熷彿寮鸿皟鐨勬枃鏈紝渚嬪 **琛€鍘?* 鏇挎崲涓?<strong>琛€鍘?/strong>
  processedReport = processedReport.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 3. 缁熶竴鏍囬鏍煎紡
  processedReport = processedReport
    // 澶勭悊涓枃搴忓彿鏍囬鏍煎紡
    .replace(/^([涓€浜屼笁鍥涗簲鍏竷鍏節鍗乚+)[銆乗.\s]+([^\n]+)/gm, '## $1. $2')
    // 澶勭悊鏁板瓧搴忓彿鏍囬鏍煎紡锛屼絾閬垮厤澶勭悊宸叉牸寮忓寲鐨勬爣棰?    .replace(/^(\d+)[銆乗.\s]+(?!#)([^\n]+)/gm, '## $1. $2')
    // 纭繚鎵€鏈変簩绾ф爣棰樻牸寮忎竴鑷?    .replace(/^##[\s]*(\d+)[\s\.銆乚*[\s]*([^\n]+)/gm, '## $1. $2')
    // 澶勭悊鍙兘鐨勭壒娈婃牸寮忓 "## A. 鏍囬"
    .replace(/^##[\s]*([A-Za-z])[\.銆乚*[\s]*([^\n]+)/gm, '## $1. $2');
  
  // 4. 澶勭悊鍙兘鐨勫垪琛ㄩ」涓嶄竴鑷撮棶棰?  processedReport = processedReport
    // 缁熶竴浣跨敤 - 浣滀负鏃犲簭鍒楄〃绗﹀彿
    .replace(/^[鈥⑩€烩棆鈼忊枲]\s+/gm, '- ')
    // 纭繚鍒楄〃椤逛箣闂存湁閫傚綋闂磋窛
    .replace(/^(- .+)\n(?![\s\n-])/gm, '$1\n\n');
  
  // 5. 涓鸿繃娓℃钀芥坊鍔犵壒娈婃牱寮忔爣璁?  // 鏌ユ壘鍒嗛殧绗﹀拰涓撳杩囨浮鏂囨湰閮ㄥ垎
  processedReport = processedReport.replace(
    /(---\n\n.*?鍚庣画灏嗙敱鍙︿竴浣嶄笓瀹舵彁渚涙洿璇︾粏鐨勯ギ椋熻鍒掑拰鍏蜂綋鍋ュ悍绠＄悊鏂规銆俓n\n---)/s,
    '<div class="expert-transition">$1</div>'
  );
  
  // 浣跨敤marked灏哅arkdown杞崲涓篐TML锛岀‘淇濇纭厤缃€夐」
  const htmlContent = marked.parse(processedReport, {
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
    smartLists: true,
    smartypants: true
  });
  
  // 淇濆瓨褰撳墠鎶ュ憡鏁版嵁
  currentReportData = {
    formData: formData,
    report: processedReport,
    htmlContent: htmlContent,
    generatedAt: new Date().toISOString()
  };
  
  // 鏄剧ず鎶ュ憡鍐呭
  reportContent.innerHTML = htmlContent;
  
  // 搴旂敤鏍峰紡
  applyReportStyle();
}

// 搴旂敤鎶ュ憡鏍峰紡
function applyReportStyle() {
  // 娣诲姞鏍峰紡鍒版墍鏈夋爣棰?  const headings = reportContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    heading.style.color = currentTheme === 'dark' ? '#e0e0e0' : '#333';
    heading.style.marginBottom = '15px';
    heading.style.marginTop = '25px';
    heading.style.fontWeight = 'bold';
    
    // 涓篽2娣诲姞涓嬪垝绾匡紝浣垮叾鏇村姞绐佸嚭
    if (heading.tagName === 'H2') {
      heading.style.borderBottom = currentTheme === 'dark' ? '1px solid #444' : '1px solid #ddd';
      heading.style.paddingBottom = '8px';
    }
  });
  
  // 娣诲姞鏍峰紡鍒版墍鏈夋钀?  const paragraphs = reportContent.querySelectorAll('p');
  paragraphs.forEach(p => {
    p.style.lineHeight = '1.6';
    p.style.marginBottom = '12px';
  });
  
  // 娣诲姞鏍峰紡鍒版墍鏈夊垪琛?  const lists = reportContent.querySelectorAll('ul, ol');
  lists.forEach(list => {
    list.style.marginBottom = '15px';
    list.style.paddingLeft = '25px';
  });
  
  const listItems = reportContent.querySelectorAll('li');
  listItems.forEach(item => {
    item.style.marginBottom = '8px';
    item.style.lineHeight = '1.5';
  });
  
  // 娣诲姞鏍峰紡鍒板垎闅旂嚎
  const hrs = reportContent.querySelectorAll('hr');
  hrs.forEach(hr => {
    hr.style.margin = '30px 0';
    hr.style.border = 'none';
    hr.style.height = '1px';
    hr.style.background = currentTheme === 'dark' ? '#444' : '#ddd';
  });
  
  // 娣诲姞鏍峰紡鍒扮矖浣撴枃鏈?  const bolds = reportContent.querySelectorAll('strong');
  bolds.forEach(bold => {
    bold.style.fontWeight = '600';
    bold.style.color = currentTheme === 'dark' ? '#f0f0f0' : '#222';
  });
  
  // 娣诲姞鏍峰紡鍒拌〃鏍硷紙濡傛灉鏈夛級
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
  
  // 娣诲姞鏍峰紡鍒颁笓瀹惰繃娓℃枃鏈?  const expertTransition = reportContent.querySelector('.expert-transition');
  if (expertTransition) {
    // 鍒涘缓涓€涓柊鐨勬牱寮忓寲瀹瑰櫒
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
    
    // 灏嗗師鏉ョ殑鍐呭鍖呰鍦ㄦ柊瀹瑰櫒涓?    const parentNode = expertTransition.parentNode;
    parentNode.insertBefore(transitionContainer, expertTransition);
    transitionContainer.appendChild(expertTransition);
    
    // 绉婚櫎鍐呴儴鐨?div>鏍囩锛屼絾淇濈暀鍐呭
    const content = expertTransition.innerHTML;
    expertTransition.outerHTML = content;
  }
}

// 淇濆瓨鍒板巻鍙茶褰?async function saveToHistory(formData, report) {
  try {
    const data = {
      formData: formData,
      report: report,
      healthScore: formData.healthScore || 70, // 淇濆瓨鍋ュ悍璇勫垎锛岄粯璁ゅ€间负70
      generatedAt: new Date().toISOString()
    };
    
    const result = await ipcRenderer.invoke('save-to-history', data);
    console.log('淇濆瓨鍒板巻鍙茶褰?', result);
  } catch (error) {
    console.error('淇濆瓨鍘嗗彶璁板綍澶辫触:', error);
    showToast('淇濆瓨鍘嗗彶璁板綍澶辫触', 'error');
  }
}

// 鍋ュ悍璁板綍鍥捐〃鐩稿叧鍙橀噺
let healthChart = null;
let healthChartData = [];
let currentMetric = 'healthScore'; // 榛樿鏄剧ず鍋ュ悍璇勫垎
let fullscreenChart = null; // 鍏ㄥ睆鍥捐〃瀹炰緥
let isAllMetricsMode = false; // 鏄惁澶勪簬鍏ㄩ儴灞曠ず妯″紡

// 鏄剧ず鍋ュ悍璁板綍鍥捐〃
function showHealthChart() {
  console.log('showHealthChart鍑芥暟琚皟鐢?);
  
  
  const healthChartWrapper = document.getElementById('healthChartWrapper');
  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  
  if (!healthChartWrapper || !showHealthChartBtn) {
    console.error('鍥捐〃瀹瑰櫒鎴栨寜閽厓绱犳湭鎵惧埌', { 
      healthChartWrapper: !!healthChartWrapper, 
      showHealthChartBtn: !!showHealthChartBtn 
    });
    return;
  }
  
  // 鏄剧ず鍥捐〃瀹瑰櫒
  healthChartWrapper.style.display = 'block';
  showHealthChartBtn.style.display = 'none';
  
  // 纭繚鎵€鏈夋寜閽彲鐐瑰嚮
  const chartButtons = document.querySelectorAll('.chart-controls button');
  chartButtons.forEach(button => {
    button.style.pointerEvents = 'auto';
    button.style.position = 'relative';
    button.style.zIndex = '5';
  });
  
  // 鍔犺浇鍘嗗彶鏁版嵁骞剁粯鍒跺浘琛?  loadHealthChartData();
}

// 鍏抽棴鍋ュ悍璁板綍鍥捐〃
function closeHealthChart() {
  console.log('closeHealthChart鍑芥暟琚皟鐢?);
  
  const healthChartWrapper = document.getElementById('healthChartWrapper');
  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  
  if (!healthChartWrapper || !showHealthChartBtn) {
    console.error('鍥捐〃瀹瑰櫒鎴栨寜閽厓绱犳湭鎵惧埌', {
      healthChartWrapper: !!healthChartWrapper,
      showHealthChartBtn: !!showHealthChartBtn
    });
    return;
  }
  
  // 闅愯棌鍥捐〃瀹瑰櫒
  healthChartWrapper.style.display = 'none';
  showHealthChartBtn.style.display = 'block';
  
  // 閿€姣佸浘琛ㄥ疄渚?  if (healthChart) {
    healthChart.destroy();
    healthChart = null;
  }
}

// 鍏ㄥ睆鏄剧ず鍥捐〃
function showFullscreenChart() {
  console.log('showFullscreenChart鍑芥暟琚皟鐢?);
  
  const fullscreenContainer = document.getElementById('fullscreenChartContainer');
  const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
  
  if (!fullscreenContainer || !fullscreenChartMetric) {
    console.error('鍏ㄥ睆鍥捐〃瀹瑰櫒鎴栦笅鎷夋鍏冪礌鏈壘鍒?, {
      fullscreenContainer: !!fullscreenContainer,
      fullscreenChartMetric: !!fullscreenChartMetric
    });
    return;
  }
  
  // 鏄惧紡閲嶇疆鍏ㄩ儴灞曠ず妯″紡鏍囧織
  console.log('閲嶇疆鍏ㄩ儴灞曠ず妯″紡鏍囧織锛屼箣鍓嶇姸鎬?', isAllMetricsMode);
  isAllMetricsMode = false;
  console.log('閲嶇疆鍚庣姸鎬?', isAllMetricsMode);
  
  // 纭繚鎸夐挳鏂囨湰姝ｇ‘鏄剧ず
  const showAllDataBtn = document.getElementById('showAllDataBtn');
  if (showAllDataBtn) {
    showAllDataBtn.textContent = '鍏ㄩ儴灞曠ず';
  }
  
  // 璁剧疆鍏ㄥ睆閫夋嫨妗嗙殑鍊间笌褰撳墠閫夋嫨鐨勬寚鏍囦竴鑷?  fullscreenChartMetric.value = currentMetric;
  fullscreenChartMetric.disabled = false; // 纭繚涓嬫媺妗嗗彲鐢?  
  // 鏄剧ず鍏ㄥ睆瀹瑰櫒
  fullscreenContainer.style.display = 'flex';
  
  // 纭繚鎸夐挳鍜屾帶浠跺彲鐐瑰嚮
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
  
  // 浣跨敤缁熶竴鐨勬寜閽簨浠剁粦瀹氬嚱鏁?  setTimeout(bindFullscreenChartButtons, 100);
  
  // 缁樺埗鍏ㄥ睆鍥捐〃
  drawFullscreenChart();
}

// 鍒囨崲鍏ㄩ儴灞曠ず妯″紡
function toggleAllMetricsMode() {
  console.log('toggleAllMetricsMode鍑芥暟琚皟鐢紝褰撳墠鐘舵€?', isAllMetricsMode);
  
  // 鍒囨崲妯″紡鐘舵€?  isAllMetricsMode = !isAllMetricsMode;
  
  console.log('鍒囨崲鍚庣殑鐘舵€?', isAllMetricsMode);
  
  const showAllDataBtn = document.getElementById('showAllDataBtn');
  
  if (showAllDataBtn) {
    // 鏇存柊鎸夐挳鏂囨湰
    showAllDataBtn.textContent = isAllMetricsMode ? '鍗曢」灞曠ず' : '鍏ㄩ儴灞曠ず';
    console.log('鎸夐挳鏂囨湰宸叉洿鏂颁负:', showAllDataBtn.textContent);
  }
  
  const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
  if (fullscreenChartMetric) {
    // 鍏ㄩ儴灞曠ず妯″紡鏃剁鐢ㄤ笅鎷夋
    fullscreenChartMetric.disabled = isAllMetricsMode;
  }
  
  if (isAllMetricsMode) {
    // 缁樺埗澶氭寚鏍囧浘琛?    console.log('鍒囨崲涓哄鎸囨爣鍥捐〃妯″紡');
    drawAllMetricsChart();
  } else {
    // 鎭㈠鍗曟寚鏍囧浘琛?    console.log('鍒囨崲涓哄崟鎸囨爣鍥捐〃妯″紡');
    drawFullscreenChart();
  }
  
  // 閲嶆柊缁戝畾鎸夐挳浜嬩欢锛岀‘淇濆湪妯″紡鍒囨崲鍚庝粛鑳芥甯哥偣鍑?  setTimeout(bindFullscreenChartButtons, 100);
}

// 缁樺埗鍏ㄩ儴鎸囨爣鍥捐〃
function drawAllMetricsChart() {
  const fullscreenChartContainer = document.getElementById('fullscreenChart');
  
  // 娓呴櫎鏃у唴瀹?  fullscreenChartContainer.innerHTML = '';
  
  // 濡傛灉娌℃湁鏁版嵁锛屾樉绀烘彁绀轰俊鎭?  if (healthChartData.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 娣诲姞all-metrics-mode绫?  fullscreenChartContainer.classList.add('all-metrics-mode');
  
  // 鍒涘缓canvas鍏冪礌
  const canvas = document.createElement('canvas');
  fullscreenChartContainer.appendChild(canvas);
  
  // 鍑嗗鎵€鏈夊浘琛ㄦ暟鎹?  const chartLabels = [];
  const datasets = [];
  
  // 鑾峰彇鎵€鏈夋棩鏈燂紙鍘婚噸锛?  healthChartData.forEach(item => {
    const dateStr = formatDate(item.date);
    if (!chartLabels.includes(dateStr)) {
      chartLabels.push(dateStr);
    }
  });
  
  // 瀵规棩鏈熻繘琛屾帓搴忥紙浠庢棫鍒版柊锛?  chartLabels.sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  });
  
  // 1. 鍋ュ悍璇勫垎鏁版嵁闆?  const healthScoreData = Array(chartLabels.length).fill(null);
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
      label: translations[currentLanguage].healthScore || '鍋ュ悍璇勫垎',
      data: healthScoreData,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-healthScore'
    });
  }
  
  // 2. 浣撻噸鏁版嵁闆?  const weightData = Array(chartLabels.length).fill(null);
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
      label: translations[currentLanguage].weight || '浣撻噸',
      data: weightData,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-weight'
    });
  }
  
  // 3. BMI鏁版嵁闆?  const bmiData = Array(chartLabels.length).fill(null);
  healthChartData.forEach(item => {
    if (item.data && item.data.formData && item.data.formData.weight && item.data.formData.height) {
      const dateIndex = chartLabels.indexOf(formatDate(item.date));
      if (dateIndex !== -1) {
        const height = parseFloat(item.data.formData.height) / 100; // 杞崲涓虹背
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
  
  // 4. 琛€鍘嬫暟鎹泦
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
      label: translations[currentLanguage].systolic || '鏀剁缉鍘?,
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
      label: translations[currentLanguage].diastolic || '鑸掑紶鍘?,
      data: diastolicData,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-bloodPressure'
    });
  }
  
  // 5. 蹇冪巼鏁版嵁闆?  const heartRateData = Array(chartLabels.length).fill(null);
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
      label: translations[currentLanguage].heartRate || '蹇冪巼',
      data: heartRateData,
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 2,
      tension: 0.3,
      yAxisID: 'y-heartRate'
    });
  }
  
  // 濡傛灉娌℃湁鏈夋晥鏁版嵁锛屾樉绀烘彁绀轰俊鎭?  if (datasets.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 閿€姣佹棫鍥捐〃
  if (fullscreenChart) {
    fullscreenChart.destroy();
  }
  
  // 鍒涘缓鍥捐〃
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
      events: [],  // 绌烘暟缁勮〃绀轰笉澶勭悊浠讳綍浜嬩欢
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
            text: translations[currentLanguage].healthScore || '鍋ュ悍璇勫垎',
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
            text: translations[currentLanguage].weight || '浣撻噸',
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
            text: translations[currentLanguage].bloodPressure || '琛€鍘?,
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
            text: translations[currentLanguage].heartRate || '蹇冪巼',
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
  
  // 鍥捐〃鍒涘缓瀹屾垚鍚庯紝纭繚鎸夐挳浜嬩欢姝ｅ父宸ヤ綔
  setTimeout(() => {
    console.log('澶氭寚鏍囧浘琛ㄥ垱寤哄畬鎴愶紝閲嶆柊璁剧疆鎸夐挳浜嬩欢');
    try {
      // 鎵€鏈夋寜閽殑澶勭悊
      const buttons = document.querySelectorAll('#fullscreenChartContainer button');
      buttons.forEach(button => {
        button.style.zIndex = "2000";
        button.style.position = "relative";
        button.style.pointerEvents = "auto";
        button.style.cursor = "pointer";
      });
      
      // "鍏ㄩ儴灞曠ず"鎸夐挳澶勭悊
  const showAllDataBtn = document.getElementById('showAllDataBtn');
  if (showAllDataBtn) {
        showAllDataBtn.onclick = null; // 鍏堟竻闄ゅ彲鑳界殑浜嬩欢
    showAllDataBtn.addEventListener('click', function(e) {
      console.log('鍏ㄩ儴灞曠ず/鍗曢」灞曠ず鎸夐挳琚偣鍑?, e);
      e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
      toggleAllMetricsMode();
    }, true);
      }
      
      // 鍏抽棴鍏ㄥ睆鎸夐挳澶勭悊
      const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
      if (closeFullscreenBtn) {
        closeFullscreenBtn.onclick = null; // 鍏堟竻闄ゅ彲鑳界殑浜嬩欢
        closeFullscreenBtn.addEventListener('click', function(e) {
          console.log('鍏抽棴鍏ㄥ睆鎸夐挳琚洿鎺ョ偣鍑?, e);
          e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
          closeFullscreenChart();
        }, true);
      }
    } catch (e) {
      console.error('閲嶆柊璁剧疆鎸夐挳浜嬩欢澶辫触:', e);
    }
  }, 100);
}

// 鍏抽棴鍏ㄥ睆鍥捐〃
function closeFullscreenChart() {
  console.log('closeFullscreenChart鍑芥暟琚皟鐢?);
  
  const fullscreenContainer = document.getElementById('fullscreenChartContainer');
  const fullscreenChart = document.getElementById('fullscreenChart');
  
  if (!fullscreenContainer) {
    console.error('鍏ㄥ睆鍥捐〃瀹瑰櫒鍏冪礌鏈壘鍒?);
    return;
  }
  
  // 闅愯棌鍏ㄥ睆瀹瑰櫒
  fullscreenContainer.style.display = 'none';
  
  // 閲嶇疆鐘舵€?  isAllMetricsMode = false;
  
  // 绉婚櫎澶氭寚鏍囨ā寮忕被
  if (fullscreenChart) {
    fullscreenChart.classList.remove('all-metrics-mode');
  }
  
  // 閿€姣佸浘琛ㄥ疄渚?  if (fullscreenChart) {
    fullscreenChart.destroy();
    fullscreenChart = null;
  }
}

// 鏍煎紡鍖栨棩鏈?function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 鍔犺浇鍘嗗彶璁板綍
async function loadHistory() {
  try {
    // 鏍规嵁褰撳墠璇█鏄剧ず鍔犺浇娑堟伅
    const loadingMessage = currentLanguage === 'zh-CN' ? '鍔犺浇涓?..' :
                          currentLanguage === 'ru-RU' ? '袟邪谐褉褍蟹泻邪...' :
                          currentLanguage === 'ja-JP' ? '瑾伩杈笺伩涓?..' :
                          currentLanguage === 'ko-KR' ? '搿滊敥 欷?..' : 'Loading...';
    
    historyList.innerHTML = `<div class="loading">${loadingMessage}</div>`;
    exportPanel.style.display = 'none';
    selectedHistoryItem = null;
    
    const history = await ipcRenderer.invoke('get-history');
    
    if (history.length === 0) {
      // 鏍规嵁褰撳墠璇█鏄剧ず"鏆傛棤鍘嗗彶璁板綍"娑堟伅
      const noDataMessage = currentLanguage === 'zh-CN' ? '鏆傛棤鍘嗗彶璁板綍' :
                           currentLanguage === 'ru-RU' ? '袧械褌 懈褋褌芯褉懈懈' :
                           currentLanguage === 'ja-JP' ? '灞ユ銇亗銈娿伨銇涖倱' :
                           currentLanguage === 'ko-KR' ? '旮半鞚?鞐嗢姷雼堧嫟' : 'No history';
      
      historyList.innerHTML = `<div class="no-data">${noDataMessage}</div>`;
      return;
    }
    
    // 鏄剧ず鍘嗗彶璁板綍
    historyList.innerHTML = '';
    history.forEach(item => {
      const date = new Date(item.date).toLocaleString('zh-CN');
      const formData = item.data.formData;
      
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.dataset.id = item.id;
      
      // 鏍规嵁褰撳墠璇█纭畾鎬у埆鏄剧ず鏂囨湰
      let genderText = '';
      if (formData.gender === 'male') {
        genderText = currentLanguage === 'zh-CN' ? '鐢? : 
                    currentLanguage === 'ru-RU' ? '袦褍卸褋泻芯泄' :
                    currentLanguage === 'ja-JP' ? '鐢锋€? :
                    currentLanguage === 'ko-KR' ? '雮劚' : 'Male';
      } else if (formData.gender === 'female') {
        genderText = currentLanguage === 'zh-CN' ? '濂? : 
                    currentLanguage === 'ru-RU' ? '袞械薪褋泻懈泄' :
                    currentLanguage === 'ja-JP' ? '濂虫€? :
                    currentLanguage === 'ko-KR' ? '鞐劚' : 'Female';
      } else {
        genderText = currentLanguage === 'zh-CN' ? '鍏朵粬' : 
                    currentLanguage === 'ru-RU' ? '袛褉褍谐芯泄' :
                    currentLanguage === 'ja-JP' ? '銇濄伄浠? :
                    currentLanguage === 'ko-KR' ? '旮绊儉' : 'Other';
      }
      
      // 琛€鍘嬫枃鏈?      const bpText = currentLanguage === 'zh-CN' ? '琛€鍘? : 
                    currentLanguage === 'ru-RU' ? '袛邪胁谢械薪懈械' :
                    currentLanguage === 'ja-JP' ? '琛€鍦? :
                    currentLanguage === 'ko-KR' ? '順堨晻' : 'BP';
      
      historyItem.innerHTML = `
        <div class="history-date">${date}</div>
        <div class="history-info">
          <div class="history-stats">
            ${formData.age}${currentLanguage === 'zh-CN' ? '宀? : ''} | ${formData.height}${currentLanguage === 'en-US' ? 'in' : 'cm'} | ${formData.weight}${currentLanguage === 'en-US' ? 'lb' : 'kg'} | 
            ${genderText}
            ${formData.systolic && formData.diastolic ? `<br>${bpText}: ${formData.systolic}/${formData.diastolic} mmHg` : ''}
          </div>
          <div class="history-actions">
            <button class="view-btn" data-id="${item.id}">${currentLanguage === 'zh-CN' ? '鏌ョ湅' : 
                                                           currentLanguage === 'ru-RU' ? '袩褉芯褋屑芯褌褉' :
                                                           currentLanguage === 'ja-JP' ? '琛ㄧず' :
                                                           currentLanguage === 'ko-KR' ? '氤搓赴' : 'View'}</button>
            <button class="delete-btn" data-id="${item.id}">${currentLanguage === 'zh-CN' ? '鍒犻櫎' : 
                                                             currentLanguage === 'ru-RU' ? '校写邪谢懈褌褜' :
                                                             currentLanguage === 'ja-JP' ? '鍓婇櫎' :
                                                             currentLanguage === 'ko-KR' ? '靷牅' : 'Delete'}</button>
          </div>
        </div>
      `;
      
      historyList.appendChild(historyItem);
      
      // 缁戝畾鏌ョ湅鍜屽垹闄ゆ寜閽簨浠?      historyItem.querySelector('.view-btn').addEventListener('click', () => {
        viewHistoryReport(item);
      });
      
      historyItem.querySelector('.delete-btn').addEventListener('click', async () => {
        // 鏍规嵁褰撳墠璇█鏄剧ず纭娑堟伅
        let confirmMessage = '';
        if (currentLanguage === 'zh-CN') {
          confirmMessage = '纭畾瑕佸垹闄よ繖鏉¤褰曞悧锛?;
        } else if (currentLanguage === 'ru-RU') {
          confirmMessage = '袙褘 褍胁械褉械薪褘, 褔褌芯 褏芯褌懈褌械 褍写邪谢懈褌褜 褝褌褍 蟹邪锌懈褋褜?';
        } else if (currentLanguage === 'ja-JP') {
          confirmMessage = '銇撱伄銉偝銉笺儔銈掑墛闄ゃ仐銇︺倐銈堛倣銇椼亜銇с仚銇嬶紵';
        } else if (currentLanguage === 'ko-KR') {
          confirmMessage = '鞚?旮半鞚?靷牅頃橃嫓瓴犾姷雼堦箤?';
        } else {
          confirmMessage = 'Are you sure you want to delete this record?';
        }
        
        showConfirmDialog(confirmMessage, async () => {
          await deleteHistoryItem(item.id);
          historyItem.remove();
          
          if (historyList.children.length === 0) {
            // 鏍规嵁褰撳墠璇█鏄剧ず"鏆傛棤鍘嗗彶璁板綍"娑堟伅
            const noDataMessage = currentLanguage === 'zh-CN' ? '鏆傛棤鍘嗗彶璁板綍' :
                                 currentLanguage === 'ru-RU' ? '袧械褌 懈褋褌芯褉懈懈' :
                                 currentLanguage === 'ja-JP' ? '灞ユ銇亗銈娿伨銇涖倱' :
                                 currentLanguage === 'ko-KR' ? '旮半鞚?鞐嗢姷雼堧嫟' : 'No history';
            
            historyList.innerHTML = `<div class="no-data">${noDataMessage}</div>`;
          }
          
          // 濡傛灉鍒犻櫎鐨勬槸褰撳墠閫変腑鐨勯」鐩紝闅愯棌瀵煎嚭闈㈡澘
          if (selectedHistoryItem && selectedHistoryItem.id === item.id) {
            exportPanel.style.display = 'none';
            selectedHistoryItem = null;
          }
        });
      });
      
      // 鐐瑰嚮鏁翠釜鍘嗗彶璁板綍椤归€変腑
      historyItem.addEventListener('click', (e) => {
        // 鎺掗櫎鐐瑰嚮鎸夐挳鐨勬儏鍐?        if (e.target.tagName !== 'BUTTON') {
          selectHistoryItem(item, historyItem);
        }
      });
    });
  } catch (error) {
    // 鏍规嵁褰撳墠璇█鏄剧ず閿欒娑堟伅
    const errorMessage = currentLanguage === 'zh-CN' ? '鍔犺浇鍘嗗彶璁板綍澶辫触' :
                        currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 蟹邪谐褉褍蟹泻懈 懈褋褌芯褉懈懈' :
                        currentLanguage === 'ja-JP' ? '灞ユ銇銇胯炯銇裤伀澶辨晽銇椼伨銇椼仧' :
                        currentLanguage === 'ko-KR' ? '旮半 搿滊敥 鞁ろ尐' : 'Failed to load history';
    
    historyList.innerHTML = `<div class="error">${errorMessage}: ${error.message}</div>`;
    showToast(`${errorMessage}`, 'error');
  }
  
  // 閲嶆柊缁戝畾璁板綍鍥炬寜閽簨浠?  const showHealthChartBtn = document.getElementById('showHealthChartBtn');
  if (showHealthChartBtn) {
    console.log('鍘嗗彶璁板綍鍔犺浇鍚庨噸鏂扮粦瀹氳褰曞浘鎸夐挳浜嬩欢');
    showHealthChartBtn.onclick = function() {
      console.log('璁板綍鍥炬寜閽鐐瑰嚮');
      showHealthChart();
    };
  }
}

// 鏄剧ず纭瀵硅瘽妗?function showConfirmDialog(message, onConfirm) {
  // 鍒涘缓瀵硅瘽妗嗗鍣?  const dialogOverlay = document.createElement('div');
  dialogOverlay.className = 'dialog-overlay';
  
  const dialogBox = document.createElement('div');
  dialogBox.className = 'dialog-box';
  
  // 鍒涘缓瀵硅瘽妗嗗唴瀹?  const dialogContent = document.createElement('div');
  dialogContent.className = 'dialog-content';
  dialogContent.textContent = message;
  
  // 鍒涘缓鎸夐挳瀹瑰櫒
  const dialogActions = document.createElement('div');
  dialogActions.className = 'dialog-actions';
  
  // 鍒涘缓纭鍜屽彇娑堟寜閽?  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary';
  
  // 鏍规嵁褰撳墠璇█璁剧疆纭鎸夐挳鏂囨湰
  if (currentLanguage === 'zh-CN') {
    confirmBtn.textContent = '纭畾';
  } else if (currentLanguage === 'ru-RU') {
    confirmBtn.textContent = '袩芯写褌胁械褉写懈褌褜';
  } else if (currentLanguage === 'ja-JP') {
    confirmBtn.textContent = '纰鸿獚';
  } else if (currentLanguage === 'ko-KR') {
    confirmBtn.textContent = '頇曥澑';
  } else {
    confirmBtn.textContent = 'Confirm';
  }
  
  confirmBtn.addEventListener('click', () => {
    document.body.removeChild(dialogOverlay);
    onConfirm();
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  
  // 鏍规嵁褰撳墠璇█璁剧疆鍙栨秷鎸夐挳鏂囨湰
  if (currentLanguage === 'zh-CN') {
    cancelBtn.textContent = '鍙栨秷';
  } else if (currentLanguage === 'ru-RU') {
    cancelBtn.textContent = '袨褌屑械薪邪';
  } else if (currentLanguage === 'ja-JP') {
    cancelBtn.textContent = '銈儯銉炽偦銉?;
  } else if (currentLanguage === 'ko-KR') {
    cancelBtn.textContent = '旆唽';
  } else {
    cancelBtn.textContent = 'Cancel';
  }
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(dialogOverlay);
  });
  
  // 缁勮瀵硅瘽妗?  dialogActions.appendChild(cancelBtn);
  dialogActions.appendChild(confirmBtn);
  
  dialogBox.appendChild(dialogContent);
  dialogBox.appendChild(dialogActions);
  
  dialogOverlay.appendChild(dialogBox);
  
  // 娣诲姞鍒伴〉闈?  document.body.appendChild(dialogOverlay);
}

// 閫夋嫨鍘嗗彶璁板綍椤?function selectHistoryItem(item, element) {
  // 绉婚櫎鍏朵粬椤圭殑閫変腑鐘舵€?  document.querySelectorAll('.history-item').forEach(el => {
    el.classList.remove('selected');
  });
  
  // 娣诲姞閫変腑鐘舵€?  element.classList.add('selected');
  
  // 淇濆瓨閫変腑鐨勯」
  selectedHistoryItem = item;
  
  // 鏄剧ず瀵煎嚭闈㈡澘
  exportPanel.style.display = 'block';
}

// 鏌ョ湅鍘嗗彶鎶ュ憡
function viewHistoryReport(item) {
  const report = item.data.report;
  const formData = item.data.formData;
  
  // 鏄剧ず鎶ュ憡
  displayReport(report, formData);
  
  // 鏄剧ず鎶ュ憡鍖哄煙
  showReport();
  
  // 鍏抽棴璁剧疆闈㈡澘
  settingsPanel.classList.remove('active');
  settingsOverlay.classList.remove('active');
  document.body.style.overflow = ''; // 鎭㈠婊氬姩
}

// 鍒犻櫎鍘嗗彶璁板綍
async function deleteHistoryItem(id) {
  try {
    await ipcRenderer.invoke('delete-history', id);
    console.log('鍒犻櫎鍘嗗彶璁板綍鎴愬姛');
    
    // 鏍规嵁褰撳墠璇█鏄剧ず鎴愬姛娑堟伅
    const successMessage = currentLanguage === 'zh-CN' ? '璁板綍宸插垹闄? :
                          currentLanguage === 'ru-RU' ? '袟邪锌懈褋褜 褍写邪谢械薪邪' :
                          currentLanguage === 'ja-JP' ? '銉偝銉笺儔銇屽墛闄ゃ仌銈屻伨銇椼仧' :
                          currentLanguage === 'ko-KR' ? '旮半鞚?靷牅霅橃棃鞀惦媹雼? : 'Record deleted';
    
    showToast(successMessage, 'success');
  } catch (error) {
    console.error('鍒犻櫎鍘嗗彶璁板綍澶辫触:', error);
    
    // 鏍规嵁褰撳墠璇█鏄剧ず閿欒娑堟伅
    const errorMessage = currentLanguage === 'zh-CN' ? '鍒犻櫎澶辫触' :
                        currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 褍写邪谢械薪懈褟' :
                        currentLanguage === 'ja-JP' ? '鍓婇櫎銇け鏁椼仐銇俱仐銇? :
                        currentLanguage === 'ko-KR' ? '靷牅 鞁ろ尐' : 'Delete failed';
    
    showToast(`${errorMessage}: ${error.message}`, 'error');
  }
}

// 澶勭悊瀵煎嚭鍘嗗彶璁板綍
async function handleExportHistory() {
  // 鏍规嵁褰撳墠璇█纭畾鎻愮ず娑堟伅
  const selectItemMessage = currentLanguage === 'zh-CN' ? '璇峰厛閫夋嫨涓€鏉″巻鍙茶褰? :
                           currentLanguage === 'ru-RU' ? '袩芯卸邪谢褍泄褋褌邪, 胁褘斜械褉懈褌械 褋薪邪褔邪谢邪 蟹邪锌懈褋褜 懈褋褌芯褉懈懈' :
                           currentLanguage === 'ja-JP' ? '鏈€鍒濄伀灞ユ銉偝銉笺儔銈掗伕鎶炪仐銇︺亸銇犮仌銇? :
                           currentLanguage === 'ko-KR' ? '毹检爛 旮半鞚?靹犿儩頃挫＜靹胳殧' : 'Please select a history record first';
  
  if (!selectedHistoryItem) {
    showToast(selectItemMessage, 'warning');
    return;
  }
  
  // 鑾峰彇閫変腑鐨勫鍑烘牸寮?  const formatElement = document.querySelector('input[name="exportFormat"]:checked');
  const format = formatElement ? formatElement.value : 'pdf';
  
  const report = selectedHistoryItem.data.report;
  const formData = selectedHistoryItem.data.formData;
  const generatedAt = selectedHistoryItem.date;
  
  // 鏍规嵁鏍煎紡鍑嗗鍐呭
  let content;
  switch (format) {
    case 'txt':
      content = report.replace(/#{1,6} /g, '').replace(/\*\*/g, '');
      break;
    case 'md':
      content = report;
      break;
    case 'html':
      // 浣跨敤marked灏哅arkdown杞崲涓篐TML
      const htmlContent = marked.parse(report);
      content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${currentLanguage === 'zh-CN' ? '鍋ュ悍鎶ュ憡' :
          currentLanguage === 'ru-RU' ? '袨褌褔械褌 芯 蟹写芯褉芯胁褜械' :
          currentLanguage === 'ja-JP' ? '鍋ュ悍銉儩銉笺儓' :
          currentLanguage === 'ko-KR' ? '瓯搓皶 氤搓碃靹? : 'Health Report'}</title>
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
    <p>${currentLanguage === 'zh-CN' ? '鐢熸垚鏃堕棿' :
        currentLanguage === 'ru-RU' ? '袙褉械屑褟 褋芯蟹写邪薪懈褟' :
        currentLanguage === 'ja-JP' ? '鐢熸垚鏅傞枔' :
        currentLanguage === 'ko-KR' ? '靸濎劚 鞁滉皠' : 'Generated at'}: ${new Date(generatedAt).toLocaleString()}</p>
    <p>${currentLanguage === 'zh-CN' ? '鐢辩Г浜哄仴搴风郴缁熺敓鎴? :
        currentLanguage === 'ru-RU' ? '小芯蟹写邪薪芯 褋懈褋褌械屑芯泄 褍锌褉邪胁谢械薪懈褟 蟹写芯褉芯胁褜械屑' :
        currentLanguage === 'ja-JP' ? '銉樸儷銈广優銉嶃兗銈搞儯銉笺偡銈广儐銉犮伀銈堛仯銇︾敓鎴愩仌銈屻伨銇椼仧' :
        currentLanguage === 'ko-KR' ? '項姢 毵る媹鞝€ 鞁滌姢韰滌棎靹?靸濎劚霅? : 'Generated by Health Manager System'}</p>
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
      const successMessage = currentLanguage === 'zh-CN' ? '鎶ュ憡淇濆瓨鎴愬姛' :
                            currentLanguage === 'ru-RU' ? '袨褌褔械褌 褋芯褏褉邪薪械薪 褍褋锌械褕薪芯' :
                            currentLanguage === 'ja-JP' ? '銉儩銉笺儓銇屾甯搞伀淇濆瓨銇曘倢銇俱仐銇? :
                            currentLanguage === 'ko-KR' ? '氤搓碃靹滉皜 靹标车鞝侅溂搿?鞝€鞛ル悩鞐堨姷雼堧嫟' : 'Report saved successfully';
      
      showToast(successMessage, 'success');
    } else {
      const failMessage = currentLanguage === 'zh-CN' ? '淇濆瓨澶辫触' :
                         currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 褋芯褏褉邪薪械薪懈褟' :
                         currentLanguage === 'ja-JP' ? '淇濆瓨銇け鏁椼仐銇俱仐銇? :
                         currentLanguage === 'ko-KR' ? '鞝€鞛?鞁ろ尐' : 'Save failed';
      
      showToast(`${failMessage}: ${result.message}`, 'error');
    }
  } catch (error) {
    const errorMessage = currentLanguage === 'zh-CN' ? '淇濆瓨鎶ュ憡鍑洪敊' :
                        currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 锌褉懈 褋芯褏褉邪薪械薪懈懈 芯褌褔械褌邪' :
                        currentLanguage === 'ja-JP' ? '銉儩銉笺儓銇繚瀛樹腑銇偍銉┿兗銇岀櫤鐢熴仐銇俱仐銇? :
                        currentLanguage === 'ko-KR' ? '氤搓碃靹?鞝€鞛?欷?鞓る 氚滌儩' : 'Error saving report';
    
    showToast(`${errorMessage}: ${error.message}`, 'error');
  }
}

// 澶勭悊涓嬭浇鎶ュ憡
async function handleDownload() {
  // 鏍规嵁褰撳墠璇█纭畾鎻愮ず娑堟伅
  const noReportMessage = currentLanguage === 'zh-CN' ? '娌℃湁鍙笅杞界殑鎶ュ憡' :
                         currentLanguage === 'ru-RU' ? '袧械褌 芯褌褔械褌邪 写谢褟 褋泻邪褔懈胁邪薪懈褟' :
                         currentLanguage === 'ja-JP' ? '銉€銈︺兂銉兗銉夈仹銇嶃倠銉儩銉笺儓銇屻亗銈娿伨銇涖倱' :
                         currentLanguage === 'ko-KR' ? '雼れ毚搿滊摐頃?氤搓碃靹滉皜 鞐嗢姷雼堧嫟' : 'No report to download';
  
  if (!currentReportData) {
    showToast(noReportMessage, 'warning');
    return;
  }
  
  // 鑾峰彇閫変腑鐨勫鍑烘牸寮?  const formatElement = document.querySelector('input[name="exportFormat"]:checked');
  const format = formatElement ? formatElement.value : 'pdf';
  
  // 鏍规嵁鏍煎紡鍑嗗鍐呭
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
  <title>${currentLanguage === 'zh-CN' ? '鍋ュ悍鎶ュ憡' :
          currentLanguage === 'ru-RU' ? '袨褌褔械褌 芯 蟹写芯褉芯胁褜械' :
          currentLanguage === 'ja-JP' ? '鍋ュ悍銉儩銉笺儓' :
          currentLanguage === 'ko-KR' ? '瓯搓皶 氤搓碃靹? : 'Health Report'}</title>
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
    <p>${currentLanguage === 'zh-CN' ? '鐢熸垚鏃堕棿' :
        currentLanguage === 'ru-RU' ? '袙褉械屑褟 褋芯蟹写邪薪懈褟' :
        currentLanguage === 'ja-JP' ? '鐢熸垚鏅傞枔' :
        currentLanguage === 'ko-KR' ? '靸濎劚 鞁滉皠' : 'Generated at'}: ${new Date(currentReportData.generatedAt).toLocaleString()}</p>
    <p>${currentLanguage === 'zh-CN' ? '鐢辩Г浜哄仴搴风郴缁熺敓鎴? :
        currentLanguage === 'ru-RU' ? '小芯蟹写邪薪芯 褋懈褋褌械屑芯泄 褍锌褉邪胁谢械薪懈褟 蟹写芯褉芯胁褜械屑' :
        currentLanguage === 'ja-JP' ? '銉樸儷銈广優銉嶃兗銈搞儯銉笺偡銈广儐銉犮伀銈堛仯銇︾敓鎴愩仌銈屻伨銇椼仧' :
        currentLanguage === 'ko-KR' ? '項姢 毵る媹鞝€ 鞁滌姢韰滌棎靹?靸濎劚霅? : 'Generated by Health Manager System'}</p>
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
      const successMessage = currentLanguage === 'zh-CN' ? '鎶ュ憡淇濆瓨鎴愬姛' :
                            currentLanguage === 'ru-RU' ? '袨褌褔械褌 褋芯褏褉邪薪械薪 褍褋锌械褕薪芯' :
                            currentLanguage === 'ja-JP' ? '銉儩銉笺儓銇屾甯搞伀淇濆瓨銇曘倢銇俱仐銇? :
                            currentLanguage === 'ko-KR' ? '氤搓碃靹滉皜 靹标车鞝侅溂搿?鞝€鞛ル悩鞐堨姷雼堧嫟' : 'Report saved successfully';
      
      showToast(successMessage, 'success');
    } else {
      const failMessage = currentLanguage === 'zh-CN' ? '淇濆瓨澶辫触' :
                         currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 褋芯褏褉邪薪械薪懈褟' :
                         currentLanguage === 'ja-JP' ? '淇濆瓨銇け鏁椼仐銇俱仐銇? :
                         currentLanguage === 'ko-KR' ? '鞝€鞛?鞁ろ尐' : 'Save failed';
      
      showToast(`${failMessage}: ${result.message}`, 'error');
    }
  } catch (error) {
    const errorMessage = currentLanguage === 'zh-CN' ? '淇濆瓨鎶ュ憡鍑洪敊' :
                        currentLanguage === 'ru-RU' ? '袨褕懈斜泻邪 锌褉懈 褋芯褏褉邪薪械薪懈懈 芯褌褔械褌邪' :
                        currentLanguage === 'ja-JP' ? '銉儩銉笺儓銇繚瀛樹腑銇偍銉┿兗銇岀櫤鐢熴仐銇俱仐銇? :
                        currentLanguage === 'ko-KR' ? '氤搓碃靹?鞝€鞛?欷?鞓る 氚滌儩' : 'Error saving report';
    
    showToast(`${errorMessage}: ${error.message}`, 'error');
  }
}

// 鍒囨崲璁剧疆闈㈡澘
function toggleSettingsPanel() {
  if (settingsPanel.classList.contains('active')) {
    closeSettingsPanel();
  } else {
    openSettingsPanel();
  }
}

// 鏄剧ず鎶ュ憡鍖哄煙
function showReport() {
  formSection.style.display = 'none';
  reportSection.style.display = 'block';
}

// 鏄剧ず琛ㄥ崟鍖哄煙
function showForm() {
  reportSection.style.display = 'none';
  formSection.style.display = 'block';
}

// 鎵撳紑璁剧疆闈㈡澘
function openSettingsPanel() {
  settingsPanel.classList.add('active');
  settingsOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // 闃叉鑳屾櫙婊氬姩
  
  // 鍒濆鏍囩榛樿鏄巻鍙茶褰曪紝鎵€浠ユ墦寮€闈㈡澘鏃跺姞杞藉巻鍙茶褰?  const activeTab = document.querySelector('.tab.active');
  if (activeTab && activeTab.dataset.tab === 'history') {
    loadHistory();
  }
}

// 鍏抽棴璁剧疆闈㈡澘
function closeSettingsPanel() {
  settingsPanel.classList.remove('active');
  settingsOverlay.classList.remove('active');
  document.body.style.overflow = ''; // 鎭㈠婊氬姩
}

// 閫夋嫨璇█
function selectLanguage(lang) {
  // 绉婚櫎鎵€鏈夎瑷€閫夐」鐨勯€変腑鐘舵€?  languageOptions.forEach(option => {
    option.classList.remove('active');
  });
  
  // 娣诲姞褰撳墠閫夋嫨鐨勮瑷€鐨勯€変腑鐘舵€?  const selectedOption = document.querySelector(`.language-option[data-lang="${lang}"]`);
  if (selectedOption) {
    selectedOption.classList.add('active');
  }
  
  // 鏇存柊褰撳墠璇█
  currentLanguage = lang;
}

// 搴旂敤璇█
function applyLanguage(lang) {
  if (!translations[lang]) {
    console.error('涓嶆敮鎸佺殑璇█:', lang);
    return;
  }
  
  // 鏇存柊褰撳墠璇█
  currentLanguage = lang;
  
  // 妫€鏌ユ槸鍚︽槸RTL璇█锛堜粠鍙冲埌宸﹂槄璇荤殑璇█锛?  const rtlLanguages = ['ar-EG', 'ur-PK'];
  if (rtlLanguages.includes(lang)) {
    document.body.classList.add('rtl');
    document.dir = 'rtl';
  } else {
    document.body.classList.remove('rtl');
    document.dir = 'ltr';
  }
  
  // 鏇存柊鏂囨。鏍囬
  document.title = translations[lang].appTitle;
  
  // 鏇存柊琛ㄥ崟鏍囩鍜屽崰浣嶇
  document.querySelector('.form-section h2').textContent = translations[lang].inputData;
  document.querySelector('label[for="height"]').textContent = translations[lang].height;
  document.querySelector('label[for="weight"]').textContent = translations[lang].weight;
  document.querySelector('label[for="age"]').textContent = translations[lang].age;
  document.querySelector('label[for="gender"]').textContent = translations[lang].gender;
  
  // 鏇存柊鎬у埆閫夐」
  const genderSelect = document.getElementById('gender');
  genderSelect.options[0].textContent = translations[lang].genderOptions.select;
  genderSelect.options[1].textContent = translations[lang].genderOptions.male;
  genderSelect.options[2].textContent = translations[lang].genderOptions.female;
  genderSelect.options[3].textContent = translations[lang].genderOptions.other;
  
  // 鏇存柊琛€鍘嬪拰蹇冪巼鏍囩
  document.querySelector('label[for="bloodPressure"]').textContent = translations[lang].bloodPressure;
  document.getElementById('systolic').placeholder = translations[lang].systolic;
  document.getElementById('diastolic').placeholder = translations[lang].diastolic;
  document.querySelector('label[for="heartRate"]').textContent = translations[lang].heartRate;
  
  // 鏇存柊鐫＄湢鍜岃繍鍔ㄩ鐜囨爣绛?  document.querySelector('label[for="sleepHours"]').textContent = translations[lang].sleepHours;
  document.querySelector('label[for="exerciseFrequency"]').textContent = translations[lang].exerciseFrequency;
  
  // 鏇存柊杩愬姩棰戠巼閫夐」
  const exerciseSelect = document.getElementById('exerciseFrequency');
  exerciseSelect.options[0].textContent = translations[lang].exerciseOptions.select;
  exerciseSelect.options[1].textContent = translations[lang].exerciseOptions.none;
  exerciseSelect.options[2].textContent = translations[lang].exerciseOptions.few;
  exerciseSelect.options[3].textContent = translations[lang].exerciseOptions.some;
  exerciseSelect.options[4].textContent = translations[lang].exerciseOptions.many;
  
  // 鏇存柊鍏朵粬琛ㄥ崟鏍囩鍜屽崰浣嶇
  document.querySelector('label[for="medical"]').textContent = translations[lang].medical;
  document.getElementById('medical').placeholder = translations[lang].medicalPlaceholder;
  document.querySelector('label[for="lifestyle"]').textContent = translations[lang].lifestyle;
  document.getElementById('lifestyle').placeholder = translations[lang].lifestylePlaceholder;
  document.querySelector('label[for="diet"]').textContent = translations[lang].diet;
  document.getElementById('diet').placeholder = translations[lang].dietPlaceholder;
  document.querySelector('label[for="concern"]').textContent = translations[lang].concern;
  document.getElementById('concern').placeholder = translations[lang].concernPlaceholder;
  
  // 鏇存柊杩囨晱婧愭爣绛?  const allergensLabel = document.querySelector('.allergens-container').previousElementSibling;
  if (allergensLabel) {
    allergensLabel.textContent = translations[lang].allergens;
  }
  document.getElementById('otherAllergens').placeholder = translations[lang].otherAllergens;
      
      // 鏇存柊鎸夐挳鏂囨湰
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = translations[lang].submit;
  const resetBtn = document.querySelector('button[type="reset"]');
  if (resetBtn) resetBtn.textContent = translations[lang].reset;
  
  // 鏇存柊鎶ュ憡鍖哄煙鏂囨湰
  const reportHeaderH2 = document.querySelector('.report-header h2');
  if (reportHeaderH2) reportHeaderH2.textContent = translations[lang].report;
  if (downloadBtn) downloadBtn.textContent = translations[lang].download;
  if (backToFormBtn) backToFormBtn.textContent = translations[lang].back;
  
  // 鏇存柊璁剧疆鏂囨湰
  const settingsBtnSpan = settingsBtn.querySelector('span');
  if (settingsBtnSpan) settingsBtnSpan.textContent = translations[lang].settings;
  
  // 鏇存柊璁剧疆闈㈡澘鏂囨湰
  const settingsHeaderH2 = document.querySelector('.settings-header h2');
  if (settingsHeaderH2) settingsHeaderH2.textContent = translations[lang].settings;
  
  // 鏇存柊鏍囩椤垫枃鏈?  const historyTab = document.querySelector('.tab[data-tab="history"]');
  if (historyTab) historyTab.textContent = translations[lang].history;
  
  const themeTab = document.querySelector('.tab[data-tab="theme"]');
  if (themeTab) themeTab.textContent = translations[lang].theme;
  
  const languageTab = document.querySelector('.tab[data-tab="language"]');
  if (languageTab) languageTab.textContent = translations[lang].language;
  
  const apiTab = document.querySelector('.tab[data-tab="api"]');
  if (apiTab) apiTab.textContent = translations[lang].api;
  
  // 鏇存柊璁剧疆涓殑鏍囬
  const languageH3 = document.querySelector('#languageContent h3');
  if (languageH3) languageH3.textContent = translations[lang].language;
  
  const themeH3 = document.querySelector('#themeContent h3');
  if (themeH3) themeH3.textContent = translations[lang].theme;
  
  const apiH3 = document.querySelector('#apiContent h3');
  if (apiH3) apiH3.textContent = translations[lang].api;
  
  // 鏇存柊璁剧疆涓殑鎸夐挳
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
  
  // 鏍规嵁璇█鏇存柊杈撳叆妗嗙殑placeholder
  if (lang === 'en-US') {
    // 缇庡埗鍗曚綅
    document.getElementById('height').placeholder = "渚嬪: 70";
    document.getElementById('weight').placeholder = "渚嬪: 150";
  } else if (lang === 'ru-RU') {
    // 淇勮鍏埗鍗曚綅
    document.getElementById('height').placeholder = "薪邪锌褉懈屑械褉: 170";
    document.getElementById('weight').placeholder = "薪邪锌褉懈屑械褉: 70";
  } else if (lang === 'ja-JP') {
    // 鏃ヨ鍏埗鍗曚綅
    document.getElementById('height').placeholder = "渚? 170";
    document.getElementById('weight').placeholder = "渚? 65";
  } else if (lang === 'ko-KR') {
    // 闊╄鍏埗鍗曚綅
    document.getElementById('height').placeholder = "鞓? 170";
    document.getElementById('weight').placeholder = "鞓? 65";
  } else if (lang === 'zh-CN') {
    // 涓枃鍏埗鍗曚綅
    document.getElementById('height').placeholder = "渚嬪: 170";
    document.getElementById('weight').placeholder = "渚嬪: 65";
  } else if (lang === 'fr-FR') {
    // 娉曡鍏埗鍗曚綅
    document.getElementById('height').placeholder = "ex: 170";
    document.getElementById('weight').placeholder = "ex: 65";
  } else if (lang === 'es-ES') {
    // 瑗跨彮鐗欒鍏埗鍗曚綅
    document.getElementById('height').placeholder = "ej: 170";
    document.getElementById('weight').placeholder = "ej: 65";
  } else if (lang === 'ar-EG') {
    // 闃挎媺浼鍏埗鍗曚綅
    document.getElementById('height').placeholder = "賲孬丕賱: 170";
    document.getElementById('weight').placeholder = "賲孬丕賱: 65";
  } else if (lang === 'zh-classical') {
    // 鏂囪█鏂囧彜浠ｅ崟浣?    document.getElementById('height').placeholder = "渚嬪: 浜斿昂鍏";
    document.getElementById('weight').placeholder = "渚嬪: 涓€鐧句笁鍗佹枻";
  } else {
    // 鍏朵粬璇█浣跨敤鍏埗鍗曚綅锛屼笉璁剧疆鐗瑰畾鐨勫崰浣嶇
    document.getElementById('height').placeholder = "";
    document.getElementById('weight').placeholder = "";
  }
  
  // 鏇存柊API鍓╀綑娆℃暟鏄剧ず
  updateApiRemainingCount();
  
  // 鏇存柊鑷畾涔夊瓧娈垫寜閽枃鏈?  const addCustomFieldText = document.getElementById('addCustomFieldText');
  if (addCustomFieldText) {
    if (lang === 'en-GB' || lang === 'en-US') {
      addCustomFieldText.textContent = 'Add Custom Field';
    } else if (lang === 'ar-EG') {
      addCustomFieldText.textContent = '廿囟丕賮丞 丨賯賱 賲禺氐氐';
    } else if (lang === 'ur-PK') {
      addCustomFieldText.textContent = '丨爻亘 囟乇賵乇鬲 賮蹖賱趫 卮丕賲賱 讴乇蹖诤';
    } else if (lang === 'fr-FR') {
      addCustomFieldText.textContent = 'Ajouter un champ personnalis茅';
    } else if (lang === 'es-ES') {
      addCustomFieldText.textContent = 'A帽adir campo personalizado';
    } else if (lang === 'ru-RU') {
      addCustomFieldText.textContent = '袛芯斜邪胁懈褌褜 锌褉芯懈蟹胁芯谢褜薪芯械 锌芯谢械';
    } else if (lang === 'ja-JP') {
      addCustomFieldText.textContent = '銈偣銈裤儬銉曘偅銉笺儷銉夈倰杩藉姞';
    } else if (lang === 'ko-KR') {
      addCustomFieldText.textContent = '靷毄鞛?鞝曥潣 頃勲摐 於旉皜';
    } else if (lang === 'zh-classical') {
      addCustomFieldText.textContent = '娣诲畾鍒跺煙';
    } else {
      addCustomFieldText.textContent = '娣诲姞鑷畾涔夊瓧娈?;
    }
  }
}

// 淇濆瓨璇█鍋忓ソ
function saveLanguagePreferences() {
  // 淇濆瓨鍒版湰鍦板瓨鍌?  localStorage.setItem('language', currentLanguage);
  
  // 搴旂敤璇█
  applyLanguage(currentLanguage);
  
  // 鍏抽棴璁剧疆闈㈡澘
  closeSettingsPanel();
  
  // 鏄剧ず鎻愮ず
  const successMsg = currentLanguage === 'zh-CN' ? '璇█璁剧疆宸蹭繚瀛? : 
                     currentLanguage === 'en-GB' ? 'Language settings saved' : 
                     currentLanguage === 'en-US' ? 'Language settings saved' :
                     currentLanguage === 'fr-FR' ? 'Param猫tres de langue enregistr茅s' :
                     currentLanguage === 'es-ES' ? 'Configuraci贸n de idioma guardada' :
                     currentLanguage === 'ar-EG' ? '鬲賲 丨賮馗 廿毓丿丕丿丕鬲 丕賱賱睾丞' :
                     currentLanguage === 'ru-RU' ? '袧邪褋褌褉芯泄泻懈 褟蟹褘泻邪 褋芯褏褉邪薪械薪褘' :
                     currentLanguage === 'ja-JP' ? '瑷€瑾炶ō瀹氥亴淇濆瓨銇曘倢銇俱仐銇? :
                     currentLanguage === 'ko-KR' ? '鞏胳柎 靹れ爼鞚?鞝€鞛ル悩鞐堨姷雼堧嫟' :
                     currentLanguage === 'zh-classical' ? '瑾炶█瑷疆宸插瓨' :
                     'Language settings saved';
                     
  showToast(successMsg, 'success');
}

// 鍔犺浇璇█鍋忓ソ
function loadLanguagePreferences() {
  const savedLanguage = localStorage.getItem('language');
  
  if (savedLanguage && translations[savedLanguage]) {
    // 鏇存柊UI
    selectLanguage(savedLanguage);
    
    // 搴旂敤璇█
    applyLanguage(savedLanguage);
  } else {
    // 榛樿璇█涓轰腑鏂?    selectLanguage('zh-CN');
  }
}

// 鍔犺浇API浣跨敤鏁版嵁
function loadApiUsageData() {
  const savedData = localStorage.getItem(API_USAGE_KEY);
  if (savedData) {
    try {
      const apiData = JSON.parse(savedData);
      // 妫€鏌ユ槸鍚︽槸浠婂ぉ鐨勬暟鎹?      const today = new Date().toDateString();
      if (apiData.date === today) {
        dailyApiUsageCount = apiData.count;
      } else {
        // 濡傛灉涓嶆槸浠婂ぉ鐨勬暟鎹紝閲嶇疆璁℃暟骞舵洿鏂板瓨鍌?        resetApiUsageData();
      }
    } catch (error) {
      console.error('Error parsing API usage data:', error);
      resetApiUsageData();
    }
  } else {
    resetApiUsageData();
  }
}

// 閲嶇疆API浣跨敤鏁版嵁
function resetApiUsageData() {
  dailyApiUsageCount = 0;
  saveApiUsageData();
}

// 淇濆瓨API浣跨敤鏁版嵁
function saveApiUsageData() {
  const today = new Date().toDateString();
  const apiData = {
    date: today,
    count: dailyApiUsageCount
  };
  localStorage.setItem(API_USAGE_KEY, JSON.stringify(apiData));
}

// 鏇存柊API鍓╀綑娆℃暟鏄剧ず
function updateApiRemainingCount() {
  const remainingCountElement = document.getElementById('apiRemainingCount');
  if (remainingCountElement) {
    const remaining = Math.max(0, dailyApiUsageLimit - dailyApiUsageCount);
    
    // 鏍规嵁褰撳墠璇█鏄剧ず涓嶅悓鐨勬枃鏈?    let text = '';
    switch (currentLanguage) {
      case 'zh-CN':
        text = `浠婃棩鍓╀綑娆℃暟锛?{remaining}`;
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
        text = `丕賱賲鬲亘賯賷 丕賱賷賵賲: ${remaining}`;
        break;
      case 'ur-PK':
        text = `丌噩 亘丕賯蹖: ${remaining}`;
        break;
      case 'ru-RU':
        text = `袨褋褌邪谢芯褋褜 褋械谐芯写薪褟: ${remaining}`;
        break;
      case 'hi-IN':
        text = `啶嗋 啶多啶? ${remaining}`;
        break;
      case 'ja-JP':
        text = `浠婃棩銇畫銈婂洖鏁? ${remaining}`;
        break;
      case 'ko-KR':
        text = `鞓る姌 雮潃 須熿垬: ${remaining}`;
        break;
      case 'zh-classical':
        text = `浠婃棩浣欓: ${remaining}`;
        break;
      default:
        text = `Today remaining: ${remaining}`;
    }
    
    remainingCountElement.textContent = text;
  }
}

// 鍔犺浇鍋ュ悍璁板綍鍥捐〃鏁版嵁
async function loadHealthChartData() {
  try {
    // 鑾峰彇鍘嗗彶璁板綍鏁版嵁
    const history = await ipcRenderer.invoke('get-history');
    
    if (history.length === 0) {
      document.getElementById('healthChart').innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
      return;
    }
    
    // 澶勭悊鍘嗗彶鏁版嵁锛屾彁鍙栨渶杩?涓湀鐨勮褰?    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // 杩囨护骞舵帓搴忔暟鎹紙浠庢棫鍒版柊锛?    healthChartData = history
      .filter(item => new Date(item.date) >= sixMonthsAgo)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 缁樺埗鍥捐〃
    drawHealthChart();
    
  } catch (error) {
    console.error('鍔犺浇鍋ュ悍璁板綍鍥捐〃鏁版嵁澶辫触:', error);
    document.getElementById('healthChart').innerHTML = `<div class="error">${translations[currentLanguage].error}: ${error.message}</div>`;
  }
}

// 缁樺埗鍋ュ悍璁板綍鍥捐〃
function drawHealthChart() {
  // 鑾峰彇鍥捐〃瀹瑰櫒
  const chartCanvas = document.getElementById('healthChart');
  
  // 娣诲姞璋冭瘯鏃ュ織
  console.log('drawHealthChart琚皟鐢紝褰撳墠鎸囨爣:', currentMetric);
  
  // 鏇存柊閫夋嫨妗嗙姸鎬佷互鍖归厤褰撳墠鎸囨爣
  const chartMetric = document.getElementById('chartMetric');
  if (chartMetric && chartMetric.value !== currentMetric) {
    chartMetric.value = currentMetric;
  }
  
  // 濡傛灉娌℃湁鏁版嵁锛屾樉绀烘彁绀轰俊鎭?  if (healthChartData.length === 0) {
    chartCanvas.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 娓呴櫎鏃у唴瀹?  chartCanvas.innerHTML = '';
  
  // 鍒涘缓canvas鍏冪礌
  const canvas = document.createElement('canvas');
  chartCanvas.appendChild(canvas);
  
  // 鏍规嵁褰撳墠閫夋嫨鐨勬寚鏍囧噯澶囨暟鎹?  const chartLabels = [];
  const chartValues = [];
  const chartData = {
    labels: [],
    datasets: []
  };
  
  // 鏍规嵁閫夋嫨鐨勬寚鏍囧鐞嗘暟鎹?  switch (currentMetric) {
    case 'healthScore':
      // 鍋ュ悍璇勫垎鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && (item.data.healthScore || item.healthScore)) {
          chartLabels.push(formatDate(item.date));
          // 鍏煎涓ょ鏁版嵁鏍煎紡
          const score = item.data.healthScore || item.healthScore || 70;
          chartValues.push(parseInt(score));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].healthScore || '鍋ュ悍璇勫垎',
        data: chartValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
      
    case 'weight':
      // 浣撻噸鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseFloat(item.data.formData.weight));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].weight || '浣撻噸',
        data: chartValues,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
      
    case 'bmi':
      // BMI鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight && item.data.formData.height) {
          const height = parseFloat(item.data.formData.height) / 100; // 杞崲涓虹背
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
      // 琛€鍘嬫暟鎹?      const systolicValues = [];
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
          label: translations[currentLanguage].systolic || '鏀剁缉鍘?,
          data: systolicValues,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: translations[currentLanguage].diastolic || '鑸掑紶鍘?,
          data: diastolicValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ];
      break;
      
    case 'heartRate':
      // 蹇冪巼鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.heartRate) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseInt(item.data.formData.heartRate));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].heartRate || '蹇冪巼',
        data: chartValues,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
  }
  
  // 濡傛灉娌℃湁鏈夋晥鏁版嵁锛屾樉绀烘彁绀轰俊鎭?  if (chartData.labels.length === 0) {
    chartCanvas.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 閿€姣佹棫鍥捐〃
  if (healthChart) {
    healthChart.destroy();
  }
  
  // 鍒涘缓鍥捐〃
  const ctx = canvas.getContext('2d');
  healthChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // 瀹屽叏绂佺敤Chart.js鐨勯粯璁や簨浠跺鐞?      events: [],  // 绌烘暟缁勮〃绀轰笉澶勭悊浠讳綍浜嬩欢
      onHover: null,
      onClick: null,
      interaction: {
        mode: null, // 涓嶄娇鐢ㄤ换浣曚氦浜掓ā寮?        intersect: false,
        includeInvisible: false,
        events: []
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 14 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
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
              size: 14 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
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
              size: 16 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
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
            size: 16 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
          },
          bodyFont: {
            size: 14 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
          }
        }
      }
    }
  });
  
  // 鍥捐〃鍒涘缓瀹屾垚鍚庯紝纭繚鎸夐挳浜嬩欢姝ｅ父宸ヤ綔
  setTimeout(() => {
    console.log('鍥捐〃鍒涘缓瀹屾垚锛岄噸鏂拌缃寜閽簨浠?);
    try {
      if (typeof setupChartButtonEvents === 'function') {
        setupChartButtonEvents();
      }
    } catch (e) {
      console.error('閲嶆柊璁剧疆鎸夐挳浜嬩欢澶辫触:', e);
    }
  }, 100);
}

// 鍒濆鍖栧簲鐢?document.addEventListener('DOMContentLoaded', init); 

// 鑷畾涔夊瓧娈电浉鍏冲彉閲?let customFieldsCount = 0;
const customFields = {};

// 娣诲姞鑷畾涔夊瓧娈?function addCustomField() {
  const customFieldsContainer = document.getElementById('customFields');
  
  // 鍒涘缓鑷畾涔夊瓧娈?  const fieldId = `customField_${customFieldsCount}`;
  const fieldDiv = document.createElement('div');
  fieldDiv.className = 'custom-field';
  fieldDiv.dataset.fieldId = fieldId;
  
  // 鏍规嵁褰撳墠璇█璁剧疆鍗犱綅绗?  let labelPlaceholder = '瀛楁鍚嶇О';
  let valuePlaceholder = '瀛楁鍊?;
  let removeTooltip = '鍒犻櫎姝ゅ瓧娈?;
  
  // 鏍规嵁褰撳墠璇█璁剧疆鏂囨湰
  if (currentLanguage === 'en-GB' || currentLanguage === 'en-US') {
    labelPlaceholder = 'Field Name';
    valuePlaceholder = 'Field Value';
    removeTooltip = 'Remove this field';
  } else if (currentLanguage === 'ar-EG') {
    labelPlaceholder = '丕爻賲 丕賱丨賯賱';
    valuePlaceholder = '賯賷賲丞 丕賱丨賯賱';
    removeTooltip = '廿夭丕賱丞 賴匕丕 丕賱丨賯賱';
  } else if (currentLanguage === 'ur-PK') {
    labelPlaceholder = '賮蹖賱趫 讴丕 賳丕賲';
    valuePlaceholder = '賮蹖賱趫 讴蹖 賯蹖賲鬲';
    removeTooltip = '丕爻 賮蹖賱趫 讴賵 蹃俟丕卅蹖诤';
  } else if (currentLanguage === 'fr-FR') {
    labelPlaceholder = 'Nom du champ';
    valuePlaceholder = 'Valeur du champ';
    removeTooltip = 'Supprimer ce champ';
  } else if (currentLanguage === 'es-ES') {
    labelPlaceholder = 'Nombre del campo';
    valuePlaceholder = 'Valor del campo';
    removeTooltip = 'Eliminar este campo';
  } else if (currentLanguage === 'ru-RU') {
    labelPlaceholder = '袠屑褟 锌芯谢褟';
    valuePlaceholder = '袟薪邪褔械薪懈械 锌芯谢褟';
    removeTooltip = '校写邪谢懈褌褜 褝褌芯 锌芯谢械';
  } else if (currentLanguage === 'ja-JP') {
    labelPlaceholder = '銉曘偅銉笺儷銉夊悕';
    valuePlaceholder = '銉曘偅銉笺儷銉夊€?;
    removeTooltip = '銇撱伄銉曘偅銉笺儷銉夈倰鍓婇櫎';
  } else if (currentLanguage === 'ko-KR') {
    labelPlaceholder = '頃勲摐 鞚措';
    valuePlaceholder = '頃勲摐 臧?;
    removeTooltip = '鞚?頃勲摐 靷牅';
  } else if (currentLanguage === 'zh-classical') {
    labelPlaceholder = '鍩熷悕';
    valuePlaceholder = '鍩熷€?;
    removeTooltip = '闄ゆ鍩?;
  }
  
  // 鍒涘缓鏍囩杈撳叆妗?  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'form-control custom-field-label';
  labelInput.id = `${fieldId}_label`;
  labelInput.placeholder = labelPlaceholder;
  labelInput.required = true;
  
  // 鍒涘缓鍊艰緭鍏ユ
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.className = 'form-control custom-field-input';
  valueInput.id = `${fieldId}_value`;
  valueInput.placeholder = valuePlaceholder;
  
  // 鍒涘缓鍒犻櫎鎸夐挳
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'custom-field-remove';
  removeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  removeBtn.title = removeTooltip;
  
  // 娣诲姞鍒犻櫎鍔熻兘
  removeBtn.addEventListener('click', () => {
    customFieldsContainer.removeChild(fieldDiv);
    delete customFields[fieldId];
  });
  
  // 灏嗗厓绱犳坊鍔犲埌瀛楁瀹瑰櫒
  fieldDiv.appendChild(labelInput);
  fieldDiv.appendChild(valueInput);
  fieldDiv.appendChild(removeBtn);
  customFieldsContainer.appendChild(fieldDiv);
  
  // 澧炲姞璁℃暟骞朵繚瀛樺瓧娈靛紩鐢?  customFieldsCount++;
  customFields[fieldId] = {
    labelInput: labelInput,
    valueInput: valueInput
  };
  
  // 鑱氱劍浜庢柊娣诲姞鐨勬爣绛捐緭鍏ユ
  labelInput.focus();
}

// 鑾峰彇鎵€鏈夎嚜瀹氫箟瀛楁鐨勬暟鎹?function getCustomFieldsData() {
  const customData = {};
  
  // 閬嶅巻鎵€鏈夎嚜瀹氫箟瀛楁
  Object.keys(customFields).forEach(fieldId => {
    const field = customFields[fieldId];
    const label = field.labelInput.value.trim();
    const value = field.valueInput.value.trim();
    
    // 鍙坊鍔犳湁鏍囩鐨勫瓧娈?    if (label) {
      customData[label] = value;
    }
  });
  
  return customData;
}

// 鍒濆鍖栬嚜瀹氫箟瀛楁鍔熻兘
function initializeCustomFields() {
  const addCustomFieldBtn = document.getElementById('addCustomFieldBtn');
  if (addCustomFieldBtn) {
    addCustomFieldBtn.addEventListener('click', addCustomField);
  }
}

// 缁樺埗鍏ㄥ睆鍥捐〃 - 鍗曟寚鏍囨ā寮?function drawFullscreenChart() {
  const fullscreenChartContainer = document.getElementById('fullscreenChart');
  
  // 娓呴櫎鏃у唴瀹?  fullscreenChartContainer.innerHTML = '';
  
  // 绉婚櫎澶氭寚鏍囨ā寮忕被
  fullscreenChartContainer.classList.remove('all-metrics-mode');
  
  // 濡傛灉娌℃湁鏁版嵁锛屾樉绀烘彁绀轰俊鎭?  if (healthChartData.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
      return;
    }
    
  // 鍒涘缓canvas鍏冪礌
  const canvas = document.createElement('canvas');
  fullscreenChartContainer.appendChild(canvas);
  
  // 鍑嗗鍥捐〃鏁版嵁锛堜笌drawHealthChart鐩稿悓鐨勬暟鎹鐞嗛€昏緫锛?  const chartLabels = [];
  const chartValues = [];
  const chartData = {
    labels: [],
    datasets: []
  };
  
  // 鏍规嵁閫夋嫨鐨勬寚鏍囧鐞嗘暟鎹?  switch (currentMetric) {
    case 'healthScore':
      // 鍋ュ悍璇勫垎鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && (item.data.healthScore || item.healthScore)) {
          chartLabels.push(formatDate(item.date));
          // 鍏煎涓ょ鏁版嵁鏍煎紡
          const score = item.data.healthScore || item.healthScore || 70;
          chartValues.push(parseInt(score));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].healthScore || '鍋ュ悍璇勫垎',
        data: chartValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
        break;
      
    case 'weight':
      // 浣撻噸鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseFloat(item.data.formData.weight));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].weight || '浣撻噸',
        data: chartValues,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
        break;
      
    case 'bmi':
      // BMI鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.weight && item.data.formData.height) {
          const height = parseFloat(item.data.formData.height) / 100; // 杞崲涓虹背
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
      // 琛€鍘嬫暟鎹?      const systolicValues = [];
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
          label: translations[currentLanguage].systolic || '鏀剁缉鍘?,
          data: systolicValues,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: translations[currentLanguage].diastolic || '鑸掑紶鍘?,
          data: diastolicValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3
        }
      ];
        break;
      
    case 'heartRate':
      // 蹇冪巼鏁版嵁
      healthChartData.forEach(item => {
        if (item.data && item.data.formData && item.data.formData.heartRate) {
          chartLabels.push(formatDate(item.date));
          chartValues.push(parseInt(item.data.formData.heartRate));
        }
      });
      
      chartData.labels = chartLabels;
      chartData.datasets = [{
        label: translations[currentLanguage].heartRate || '蹇冪巼',
        data: chartValues,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.3
      }];
      break;
  }
  
  // 濡傛灉娌℃湁鏈夋晥鏁版嵁锛屾樉绀烘彁绀轰俊鎭?  if (chartData.labels.length === 0) {
    fullscreenChartContainer.innerHTML = `<div class="no-data">${translations[currentLanguage].noData}</div>`;
    return;
  }
  
  // 閿€姣佹棫鍥捐〃
  if (fullscreenChart) {
    fullscreenChart.destroy();
  }
  
  // 鍒涘缓鍥捐〃
  const ctx = canvas.getContext('2d');
  fullscreenChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // 瀹屽叏绂佺敤Chart.js鐨勯粯璁や簨浠跺鐞?      events: [],  // 绌烘暟缁勮〃绀轰笉澶勭悊浠讳綍浜嬩欢
      onHover: null,
      onClick: null,
      interaction: {
        mode: null, // 涓嶄娇鐢ㄤ换浣曚氦浜掓ā寮?        intersect: false,
        includeInvisible: false,
        events: []
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: currentTheme === 'dark' ? '#e0e0e0' : '#666',
            font: {
              size: 14 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
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
              size: 14 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
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
              size: 16 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
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
            size: 16 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
          },
          bodyFont: {
            size: 14 // 鍏ㄥ睆妯″紡涓嬫洿澶х殑瀛椾綋
          }
        }
      }
    }
  });
  
  // 鍥捐〃鍒涘缓瀹屾垚鍚庯紝纭繚鎸夐挳浜嬩欢姝ｅ父宸ヤ綔
  setTimeout(() => {
    console.log('鍏ㄥ睆鍥捐〃鍒涘缓瀹屾垚锛岄噸鏂拌缃寜閽簨浠?);
    try {
      if (typeof setupChartButtonEvents === 'function') {
        setupChartButtonEvents();
      }
      
      // 棰濆澶勭悊锛岀‘淇濆叏灞忔寜閽彲鐐瑰嚮
  const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
  if (closeFullscreenBtn) {
        closeFullscreenBtn.onclick = null; // 鍏堟竻闄ゅ彲鑳界殑浜嬩欢
    closeFullscreenBtn.addEventListener('click', function(e) {
      console.log('鍏抽棴鍏ㄥ睆鎸夐挳琚洿鎺ョ偣鍑?, e);
      e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
      closeFullscreenChart();
    }, true);
    
        // 璁剧疆鎸夐挳鏍峰紡纭繚鍙鍜屽彲鐐瑰嚮
    closeFullscreenBtn.style.zIndex = "2000";
    closeFullscreenBtn.style.position = "relative";
    closeFullscreenBtn.style.pointerEvents = "auto";
    closeFullscreenBtn.style.cursor = "pointer";
  }
      
      // 纭繚鍏ㄩ儴灞曠ず鎸夐挳鍙偣鍑?      const showAllDataBtn = document.getElementById('showAllDataBtn');
      if (showAllDataBtn) {
        showAllDataBtn.onclick = null; // 鍏堟竻闄ゅ彲鑳界殑浜嬩欢
        showAllDataBtn.addEventListener('click', function(e) {
          console.log('鍏ㄩ儴灞曠ず鎸夐挳琚洿鎺ョ偣鍑?, e);
          e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
          toggleAllMetricsMode();
        }, true);
        
        // 璁剧疆鎸夐挳鏍峰紡纭繚鍙鍜屽彲鐐瑰嚮
        showAllDataBtn.style.zIndex = "2000";
        showAllDataBtn.style.position = "relative";
        showAllDataBtn.style.pointerEvents = "auto";
        showAllDataBtn.style.cursor = "pointer";
      }
    } catch (e) {
      console.error('閲嶆柊璁剧疆鎸夐挳浜嬩欢澶辫触:', e);
    }
  }, 100);
}

// 缁戝畾鍏ㄥ睆鍥捐〃鎸夐挳浜嬩欢
function bindFullscreenChartButtons() {
  console.log('缁戝畾鍏ㄥ睆鍥捐〃鎸夐挳浜嬩欢...');
  
  try {
    // 鍏ㄩ儴灞曠ず/鍗曢」灞曠ず鎸夐挳
    const showAllDataBtn = document.getElementById('showAllDataBtn');
    if (showAllDataBtn) {
      // 鍏堟竻闄ゆ墍鏈夌幇鏈変簨浠?      showAllDataBtn.onclick = null;
      
      // 鐩存帴娣诲姞鏂颁簨浠剁洃鍚紝涓嶅啀浣跨敤鍏嬮殕鏇挎崲鏂瑰紡
      showAllDataBtn.addEventListener('click', function(e) {
        console.log('鍏ㄩ儴灞曠ず/鍗曢」灞曠ず鎸夐挳琚偣鍑?, e);
        e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
        toggleAllMetricsMode();
        return false;
      }, true);
      
      // 纭繚鎸夐挳鍙鍜屽彲鐐瑰嚮
      showAllDataBtn.style.zIndex = "2000";
      showAllDataBtn.style.position = "relative";
      showAllDataBtn.style.pointerEvents = "auto";
      showAllDataBtn.style.cursor = "pointer";
    }
    
    // 鍏抽棴鍏ㄥ睆鎸夐挳
    const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
    if (closeFullscreenBtn) {
      // 绉婚櫎鎵€鏈夌幇鏈変簨浠讹紙鍏嬮殕骞舵浛鎹㈣妭鐐癸級
      const newBtn = closeFullscreenBtn.cloneNode(true);
      closeFullscreenBtn.parentNode.replaceChild(newBtn, closeFullscreenBtn);
      
      // 娣诲姞鏂颁簨浠剁洃鍚?      newBtn.addEventListener('click', function(e) {
        console.log('鍏抽棴鍏ㄥ睆鎸夐挳琚偣鍑?, e);
        e.stopPropagation(); // 闃绘浜嬩欢鍐掓场
        closeFullscreenChart();
        return false;
      }, true);
      
      // 纭繚鎸夐挳鍙鍜屽彲鐐瑰嚮
      newBtn.style.zIndex = "2000";
      newBtn.style.position = "relative";
      newBtn.style.pointerEvents = "auto";
      newBtn.style.cursor = "pointer";
    }
    
    // 鎸囨爣閫夋嫨涓嬫媺妗?    const fullscreenChartMetric = document.getElementById('fullscreenChartMetric');
    if (fullscreenChartMetric) {
      fullscreenChartMetric.addEventListener('change', function(e) {
        e.stopPropagation();
        currentMetric = this.value;
        drawFullscreenChart();
      });
    }
  } catch (err) {
    console.error('缁戝畾鍏ㄥ睆鍥捐〃鎸夐挳浜嬩欢澶辫触:', err);
  }
}


