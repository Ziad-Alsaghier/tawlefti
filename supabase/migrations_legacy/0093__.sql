UPDATE public.blends
SET
    preparation_notes_ar = CASE code
        WHEN 'T01' THEN 'لأفضل نتيجة، استخدم 10 جرامات من البن لكل 100 مل من الماء. لا تدع القهوة تغلي، ارفعها عن النار قبل أن تفور مباشرة. قدمها مع القليل من السكر حسب الرغبة.'
        WHEN 'T02' THEN 'استخدم ماءً مفلترًا للحصول على أفضل نكهة. اطحن البن طحنة ناعمة جدًا. حرك القهوة ببطء حتى تذوب تمامًا قبل وضعها على نار هادئة.'
        WHEN 'T03' THEN 'للحصول على وش غني، استخدم ملعقة صغيرة لجمع الرغوة وتوزيعها على الفناجين قبل صب القهوة. درجة حرارة الماء المثالية هي حوالي 90 درجة مئوية.'
        WHEN 'E01' THEN 'للحصول على جرعة مثالية، استخلص 30 مل في 25-30 ثانية. استخدم 18-20 جرامًا من البن المطحون. تأكد من أن ضغط الماكينة ثابت عند 9 بار.'
        WHEN 'E02' THEN 'قبل الاستخلاص، قم بتشغيل الماكينة لتنظيف رأس المجموعة وتسخين الكوب. وزع البن بشكل متساوٍ في البورتافلتر واكبسه بقوة متساوية.'
        WHEN 'V01' THEN 'استخدم نسبة 1:16 (1 جرام بن لكل 16 مل ماء). درجة حرارة الماء المثالية 94 درجة مئوية. قم بالترطيب لمدة 30 ثانية ثم صب الماء ببطء في دوائر متساوية.'
        WHEN 'V02' THEN 'لإبراز النكهات الفاكهية، جرب طحنة أخشن قليلاً ودرجة حرارة ماء أقل (حوالي 90 درجة مئوية). وقت الاستخلاص الكلي يجب أن يكون بين 2:30 و 3:00 دقائق.'
        WHEN 'C01' THEN 'استخدم فلتر كيمكس المخصص واشطفه جيدًا بالماء الساخن قبل الاستخدام. نسبة التحضير الموصى بها هي 1:15. صب الماء على دفعات للحفاظ على مستوى الماء ثابتًا.'
        WHEN 'K01' THEN 'استخدم 20 جرامًا من البن و 300 مل من الماء. قم بالترطيب بـ 50 مل من الماء لمدة 45 ثانية. أكمل الصب حتى تصل إلى 300 مل في دقيقتين.'
        WHEN 'FP01' THEN 'استخدم طحنة خشنة لتجنب الرواسب في الكوب. انقع البن لمدة 4 دقائق قبل الضغط ببطء وثبات. لا تضغط حتى النهاية لتجنب المرارة الزائدة.'
        WHEN 'AP01' THEN 'جرب الطريقة المقلوبة لتجنب التسريب. استخدم 15 جرامًا من البن و 220 مل من الماء عند 85 درجة مئوية. انقع لمدة دقيقة ثم اضغط لمدة 30 ثانية.'
        WHEN 'CB01' THEN 'استخدم نسبة 1:8 (1 جزء بن لكل 8 أجزاء ماء بارد). انقع لمدة 12-18 ساعة في الثلاجة. قم بتصفية المركز مرتين للحصول على مشروب نقي.'
        WHEN 'GCI01' THEN 'انقع 15 جرامًا من حبوب البن الخضراء الكاملة في 250 مل من الماء البارد لمدة 8-12 ساعة في الثلاجة. صفي المشروب جيدًا قبل الشرب.'
        WHEN 'GB01' THEN 'اغلِ 20 جرامًا من البن الأخضر في 500 مل من الماء لمدة 10-15 دقيقة. اتركه ليبرد قليلاً ثم صفه. يمكن إضافة نكهات مثل الزنجبيل أو النعناع.'
        WHEN 'GHI01' THEN 'انقع 10 جرامات من البن الأخضر المطحون خشنًا في 200 مل من الماء الساخن (حوالي 80 درجة مئوية) لمدة 5-7 دقائق، مثل الشاي.'
        ELSE preparation_notes_ar
    END,
    preparation_notes_en = CASE code
        WHEN 'T01' THEN 'For best results, use 10 grams of coffee per 100 ml of water. Do not let the coffee boil; remove it from the heat just before it froths over. Serve with a little sugar to taste.'
        WHEN 'T02' THEN 'Use filtered water for the best flavor. Grind the beans very finely. Stir the coffee slowly until it dissolves completely before placing it on low heat.'
        WHEN 'T03' THEN 'To get a rich foam, use a small spoon to collect the froth and distribute it into the cups before pouring the coffee. The ideal water temperature is around 90°C.'
        WHEN 'E01' THEN 'For a perfect shot, extract 30 ml in 25-30 seconds. Use 18-20 grams of ground coffee. Ensure the machine pressure is stable at 9 bars.'
        WHEN 'E02' THEN 'Before extraction, run the machine to clean the group head and heat the cup. Distribute the coffee evenly in the portafilter and tamp with consistent pressure.'
        WHEN 'V01' THEN 'Use a 1:16 ratio (1g coffee to 16ml water). Ideal water temperature is 94°C. Bloom for 30 seconds, then pour slowly in even circles.'
        WHEN 'V02' THEN 'To highlight fruity notes, try a slightly coarser grind and lower water temperature (around 90°C). Total extraction time should be between 2:30 and 3:00 minutes.'
        WHEN 'C01' THEN 'Use a dedicated Chemex filter and rinse it well with hot water before use. The recommended brew ratio is 1:15. Pour in stages to maintain a consistent water level.'
        WHEN 'K01' THEN 'Use 20g of coffee and 300ml of water. Bloom with 50ml of water for 45 seconds. Complete the pour to 300ml by the 2-minute mark.'
        WHEN 'FP01' THEN 'Use a coarse grind to avoid sediment in the cup. Steep for 4 minutes before pressing slowly and steadily. Don''t press all the way to avoid excess bitterness.'
        WHEN 'AP01' THEN 'Try the inverted method to prevent dripping. Use 15g of coffee and 220ml of water at 85°C. Steep for 1 minute, then press for 30 seconds.'
        WHEN 'CB01' THEN 'Use a 1:8 ratio (1 part coffee to 8 parts cold water). Steep for 12-18 hours in the refrigerator. Filter the concentrate twice for a clean drink.'
        WHEN 'GCI01' THEN 'Steep 15g of whole green coffee beans in 250ml of cold water for 8-12 hours in the refrigerator. Strain well before drinking.'
        WHEN 'GB01' THEN 'Boil 20g of green coffee in 500ml of water for 10-15 minutes. Let it cool slightly, then strain. Flavorings like ginger or mint can be added.'
        WHEN 'GHI01' THEN 'Steep 10g of coarsely ground green coffee in 200ml of hot water (around 80°C) for 5-7 minutes, like tea.'
        ELSE preparation_notes_en
    END
WHERE code IN ('T01', 'T02', 'T03', 'E01', 'E02', 'V01', 'V02', 'C01', 'K01', 'FP01', 'AP01', 'CB01', 'GCI01', 'GB01', 'GHI01');