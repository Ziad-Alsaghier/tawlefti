interface LocalizedText {
  ar: string;
  en: string;
}

// NEW: Specific notes for each blend, based on the user's file. This is the highest priority.
export const blendSpecificNotes: Record<string, LocalizedText> = {
  // V60
  'V01': { ar: 'ماء 93°م، وقت 2:30 د', en: 'water 93°C; 2:30 min' },
  'V02': { ar: 'صب متقطع، ماء 92°م، 3 دقائق', en: 'Pulse pour; water 92°C; 3 min' },
  'V03': { ar: 'صب دائري بطيء، ماء 90°م', en: 'Circular pour (slow); water 90°C' },
  'V04': { ar: 'صب مركز، ماء 94°م، 2:45 د', en: 'Center pour; water 94°C; 2:45 min' },
  'V05': { ar: 'صب طبقات، ماء 88°م، تضاف رشة زعفران', en: 'Layered pour; water 88°C; add saffron' },
  // Chemex
  'C01': { ar: 'طحنة متوسطة الخشونة، ماء 94°م', en: 'Medium-coarse grind; water 94°C' },
  'C02': { ar: 'نسبة 1:17، صب على 4 مراحل', en: '1:17 ratio; 4-stage pour' },
  // Kalita
  'K01': { ar: 'طحنة متوسطة، ترطيب 45 ثانية', en: 'Medium grind; 45s bloom' },
  'K02': { ar: 'وقت الاستخلاص 3:30 د', en: '3:30 min extraction time' },
  // Turkish
  'T01': { ar: 'نار هادئة، لا تدعها تغلي', en: 'Low heat; do not boil' },
  'T02': { ar: 'طحنة ناعمة جداً (بودرة)', en: 'Very fine grind (powder)' },
  'T03': { ar: 'استخدم ماء بارد، حرك مرة واحدة', en: 'Use cold water; stir once' },
  'T04': { ar: 'وش مزدوج، يقدم مع راحة الحلقوم', en: 'Double foam; serve with Turkish delight' },
  'T05': { ar: 'إضافة حبهان مطحون طازج', en: 'Add freshly ground cardamom' },
  // Espresso
  'E01': { ar: '18 جرام بن، استخلاص 28 ثانية', en: '18g dose; 28s extraction' },
  'E02': { ar: 'حرارة 92°م، ضغط 9 بار', en: '92°C temp; 9 bar pressure' },
  'E03': { ar: 'طحنة ناعمة، توزيع متساوٍ', en: 'Fine grind; even distribution' },
  'E04': { ar: 'نسبة 1:2 (18 جرام بن لـ 36 جرام سائل)', en: '1:2 ratio (18g in, 36g out)' },
  'E05': { ar: 'تسخين مسبق للبورتافلتر والكوب', en: 'Preheat portafilter and cup' },
  // French Press
  'FP01': { ar: 'طحنة خشنة، نقع 4 دقائق', en: 'Coarse grind; 4 min steep' },
  'FP02': { ar: 'كسر القشرة بعد دقيقة واحدة', en: 'Break crust after 1 min' },
  // Aeropress
  'AP01': { ar: 'طريقة مقلوبة، حرارة 85°م', en: 'Inverted method; 85°C temp' },
  'AP02': { ar: 'نقع دقيقتين، ضغط 30 ثانية', en: '2 min steep; 30s press' },
  // Cold Brew
  'CB01': { ar: 'نقع 16 ساعة في الثلاجة', en: '16hr steep in fridge' },
  'CB02': { ar: 'نسبة 1:8، تصفية مزدوجة', en: '1:8 ratio; double filter' },
  // Green Coffee
  'GCI01': { ar: 'نقع بارد 12 ساعة', en: '12hr cold steep' },
  'GB01': { ar: 'غلي لمدة 10 دقائق', en: 'Boil for 10 minutes' },
  'GHI01': { ar: 'نقع ساخن 7 دقائق (80°م)', en: '7 min hot steep (80°C)' },
};


// Fallback: Generic notes for a method if no specific note is found.
export const defaultMethodNotes: Record<string, LocalizedText> = {
  'T01': {
    ar: 'لأفضل نتيجة، استخدم 10 جرامات من البن لكل 100 مل من الماء. لا تدع القهوة تغلي، ارفعها عن النار قبل أن تفور مباشرة. قدمها مع القليل من السكر حسب الرغبة.',
    en: 'For best results, use 10 grams of coffee per 100 ml of water. Do not let the coffee boil; remove it from the heat just before it froths over. Serve with a little sugar to taste.'
  },
  'E01': {
    ar: 'للحصول على جرعة مثالية، استخلص 30 مل في 25-30 ثانية. استخدم 18-20 جرامًا من البن المطحون. تأكد من أن ضغط الماكينة ثابت عند 9 بار.',
    en: 'For a perfect shot, extract 30 ml in 25-30 seconds. Use 18-20 grams of ground coffee. Ensure the machine pressure is stable at 9 bars.'
  },
  'V01': {
    ar: 'استخدم نسبة 1:16 (1 جرام بن لكل 16 مل ماء). درجة حرارة الماء المثالية 94 درجة مئوية. قم بالترطيب لمدة 30 ثانية ثم صب الماء ببطء في دوائر متساوية.',
    en: 'Use a 1:16 ratio (1g coffee to 16ml water). Ideal water temperature is 94°C. Bloom for 30 seconds, then pour slowly in even circles.'
  },
  'C01': {
    ar: 'استخدم فلتر كيمكس المخصص واشطفه جيدًا بالماء الساخن قبل الاستخدام. نسبة التحضير الموصى بها هي 1:15. صب الماء على دفعات للحفاظ على مستوى الماء ثابتًا.',
    en: 'Use a dedicated Chemex filter and rinse it well with hot water before use. The recommended brew ratio is 1:15. Pour in stages to maintain a consistent water level.'
  },
  'K01': {
    ar: 'استخدم 20 جرامًا من البن و 300 مل من الماء. قم بالترطيب بـ 50 مل من الماء لمدة 45 ثانية. أكمل الصب حتى تصل إلى 300 مل في دقيقتين.',
    en: 'Use 20g of coffee and 300ml of water. Bloom with 50ml of water for 45 seconds. Complete the pour to 300ml by the 2-minute mark.'
  },
  'FP01': {
    ar: 'استخدم طحنة خشنة لتجنب الرواسب في الكوب. انقع البن لمدة 4 دقائق قبل الضغط ببطء وثبات. لا تضغط حتى النهاية لتجنب المرارة الزائدة.',
    en: 'Use a coarse grind to avoid sediment in the cup. Steep for 4 minutes before pressing slowly and steadily. Don\'t press all the way to avoid excess bitterness.'
  },
  'AP01': {
    ar: 'جرب الطريقة المقلوبة لتجنب التسريب. استخدم 15 جرامًا من البن و 220 مل من الماء عند 85 درجة مئوية. انقع لمدة دقيقة ثم اضغط لمدة 30 ثانية.',
    en: 'Try the inverted method to prevent dripping. Use 15g of coffee and 220ml of water at 85°C. Steep for 1 minute, then press for 30 seconds.'
  },
  'CB01': {
    ar: 'استخدم نسبة 1:8 (1 جزء بن لكل 8 أجزاء ماء بارد). انقع لمدة 12-18 ساعة في الثلاجة. قم بتصفية المركز مرتين للحصول على مشروب نقي.',
    en: 'Use a 1:8 ratio (1 part coffee to 8 parts cold water). Steep for 12-18 hours in the refrigerator. Filter the concentrate twice for a clean drink.'
  },
  'GCI01': {
    ar: 'انقع 15 جرامًا من حبوب البن الخضراء الكاملة في 250 مل من الماء البارد لمدة 8-12 ساعة في الثلاجة. صفي المشروب جيدًا قبل الشرب.',
    en: 'Steep 15g of whole green coffee beans in 250ml of cold water for 8-12 hours in the refrigerator. Strain well before drinking.'
  },
  'GB01': {
    ar: 'اغلِ 20 جرامًا من البن الأخضر في 500 مل من الماء لمدة 10-15 دقيقة. اتركه ليبرد قليلاً ثم صفه. يمكن إضافة نكهات مثل الزنجبيل أو النعناع.',
    en: 'Boil 20g of green coffee in 500ml of water for 10-15 minutes. Let it cool slightly, then strain. Flavorings like ginger or mint can be added.'
  },
  'GHI01': {
    ar: 'انقع 10 جرامات من البن الأخضر المطحون خشنًا في 200 مل من الماء الساخن (حوالي 80 درجة مئوية) لمدة 5-7 دقائق، مثل الشاي.',
    en: 'Steep 10g of coarsely ground green coffee in 200ml of hot water (around 80°C) for 5-7 minutes, like tea.'
  },
};

// Fallback: Map a method ID to a default note code.
export const methodToDefaultNoteMap: Record<string, string> = {
  'turkish': 'T01',
  'espresso': 'E01',
  'v60': 'V01',
  'chemex': 'C01',
  'kalita': 'K01',
  'french-press': 'FP01',
  'aeropress': 'AP01',
  'cold-brew': 'CB01',
  'cold-infusion': 'GCI01',
  'boiling': 'GB01',
  'hot-infusion': 'GHI01',
};