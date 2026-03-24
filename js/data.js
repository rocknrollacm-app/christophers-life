// ============================================================
// CHRISTOPHER'S LIFE — Core Data v3
// ============================================================
window.CL = window.CL || {};

CL.PROFILE = {
  name: "Christopher",
  age: 34,
  conditions: ["Bipolar Disorder (well controlled)", "Asthma (improving)", "High Cholesterol", "Reactive Hypoglycemia", "Sleep Apnea (pending study)"],
  medications: ["Advair (morning + bedtime)", "Lithium", "Lamictal", "Seroquel", "Topiramate (2x daily)", "Trazodone", "Magnesium Glycinate"],
  background: "B.S. Quantitative Economics, A.S. Applied Mathematics, Postgraduate Certificate Systems Analysis. Based in Clinton, UT. Interests: SLC/Utah history, classic literature, applied math, statistics, game theory, behavioral economics, systems thinking.",
  goals: ["Reduce visceral fat", "Improve asthma control", "Better sleep", "Manage cholesterol", "Reduce alcohol and nicotine"]
};

// ============================================================
// CHECKLIST CATEGORIES & TASKS
// ============================================================

CL.SECTIONS = {
  morning: {
    id: 'morning', label: 'Morning', labelEs: 'Mañana', icon: '🌅', alwaysShow: true,
    tasks: [
      { id: 'm1',  label: 'No nicotine — 60 min window after wake',     icon: '🚭', nicotineWindow: true, windowType: 'morning' },
      { id: 'm2',  label: 'Diaphragmatic breathing (5–10 cycles)',       icon: '🫁' },
      { id: 'm3',  label: 'Morning music on',                            icon: '🎵' },
      { id: 'm4',  label: 'Track sleep quality',                         icon: '😴', action: 'trackSleep' },
      { id: 'm5',  label: 'Track mood & energy',                         icon: '📊', action: 'trackMood' },
      { id: 'm6',  label: 'Read morning passage',                        icon: '📖', action: 'openInsights' },
      { id: 'm7',  label: 'No nicotine — 15 min before breakfast',       icon: '🚭', nicotineWindow: true, windowType: 'preMeal' },
      { id: 'm8',  label: 'Breakfast',                                   icon: '🥚', action: 'trackMeal' },
      { id: 'm9',  label: 'Medications & vitamins',                      icon: '💊' },
      { id: 'm10', label: 'No nicotine — 30 min after breakfast',        icon: '🚭', nicotineWindow: true, windowType: 'postMeal' },
      { id: 'm11', label: 'Morning snack',                               icon: '🥜', action: 'trackMeal' },
      { id: 'm12', label: 'Track meals',                                 icon: '🍽️', action: 'openNutrition' },
      { id: 'm13', label: 'Track mood & energy',                         icon: '📊', action: 'trackMood' },
    ]
  },

  afternoon: {
    id: 'afternoon', label: 'Afternoon', labelEs: 'Tarde', icon: '☀️', alwaysShow: true,
    tasks: [
      { id: 'a1', label: 'No nicotine — 15 min before lunch',           icon: '🚭', nicotineWindow: true, windowType: 'preMeal' },
      { id: 'a2', label: 'Lunch',                                        icon: '🍗', action: 'trackMeal' },
      { id: 'a3', label: 'Read afternoon passages',                      icon: '📚', action: 'openLearning' },
      { id: 'a4', label: 'No nicotine — 30 min after lunch',            icon: '🚭', nicotineWindow: true, windowType: 'postMeal' },
      { id: 'a5', label: 'No nicotine — 15 min before afternoon snack', icon: '🚭', nicotineWindow: true, windowType: 'preMeal' },
      { id: 'a6', label: 'Afternoon snack',                              icon: '🍵', action: 'trackMeal' },
      { id: 'a7', label: 'No nicotine — 30 min after afternoon snack',  icon: '🚭', nicotineWindow: true, windowType: 'postMeal' },
      { id: 'a8', label: 'Track meals',                                  icon: '🍽️', action: 'openNutrition' },
      { id: 'a9', label: 'Track mood & energy',                          icon: '📊', action: 'trackMood' },
    ]
  },

  evening: {
    id: 'evening', label: 'Evening', labelEs: 'Noche', icon: '🌆', alwaysShow: true,
    tasks: [
      { id: 'e1', label: 'No nicotine — 15 min before dinner',          icon: '🚭', nicotineWindow: true, windowType: 'preMeal' },
      { id: 'e2', label: 'Dinner',                                       icon: '🥦', action: 'trackMeal' },
      { id: 'e3', label: 'Kitchen closed',                               icon: '🔒' },
      { id: 'e4', label: 'No nicotine after 7:00 PM',                   icon: '🚭', nicotineWindow: true, windowType: 'evening' },
      { id: 'e5', label: 'No beer after 7:00 PM',                       icon: '🍺' },
      { id: 'e6', label: 'Track mood & energy',                          icon: '📊', action: 'trackMood' },
    ]
  },

  night: {
    id: 'night', label: 'Night', labelEs: 'Noche tardía', icon: '🌙', alwaysShow: true,
    tasks: [
      { id: 'n1', label: 'Magnesium glycinate',                          icon: '💊' },
      { id: 'n2', label: 'Medications',                                  icon: '💊' },
      { id: 'n3', label: 'Track mood & energy',                          icon: '📊', action: 'trackMood' },
      { id: 'n4', label: 'Prep tomorrow\'s schedule',                    icon: '📅', action: 'planTomorrow' },
      { id: 'n5', label: 'Diaphragmatic breathing (5–10 cycles)',        icon: '🫁' },
      { id: 'n6', label: 'Target bedtime — before 11:00 PM',            icon: '😴' },
    ]
  },

  bonus: {
    id: 'bonus', label: 'Bonus', labelEs: 'Bonificación', icon: '⭐', alwaysShow: true,
    countTowardTotal: 3,
    tasks: [
      { id: 'b1',  label: 'Date night',                icon: '❤️' },
      { id: 'b2',  label: 'Family outing',             icon: '👨‍👩‍👧‍👦' },
      { id: 'b3',  label: 'Games with Brittney',       icon: '🎮' },
      { id: 'b4',  label: 'Games with kids',           icon: '🎲' },
      { id: 'b5',  label: 'Language apps',             icon: '📱' },
      { id: 'b6',  label: 'Meal preparation',          icon: '👨‍🍳' },
      { id: 'b7',  label: 'Outdoor activity',          icon: '🌿' },
      { id: 'b8',  label: 'Play guitar',               icon: '🎸' },
      { id: 'b9',  label: 'Practice couples dance',    icon: '💃' },
      { id: 'b10', label: 'Read novel (20 min)',        icon: '📗' },
      { id: 'b11', label: 'Spanish textbook / audiobook', icon: '🇪🇸' },
      { id: 'b12', label: 'Stretching',                icon: '🧘' },
      { id: 'b13', label: 'Write / make art',          icon: '✍️' },
    ]
  },

  // ---- Day-type sections (shown between Afternoon and Evening) ----
  cardio: {
    id: 'cardio', label: 'Cardio', labelEs: 'Cardio', icon: '🚣', alwaysShow: false,
    tasks: [
      { id: 'c1', label: 'No nicotine — 30 min before cardio',   icon: '🚭', nicotineWindow: true, windowType: 'preExercise' },
      { id: 'c2', label: 'Diaphragmatic breathing (5 cycles)',   icon: '🫁' },
      { id: 'c3', label: 'Rowing (20–25 min moderate)',          icon: '🚣' },
      { id: 'c4', label: 'Cool-down (5 min easy)',               icon: '🌊' },
      { id: 'c5', label: 'No nicotine — 15 min after cardio',   icon: '🚭', nicotineWindow: true, windowType: 'postExercise' },
    ]
  },

  fitness: {
    id: 'fitness', label: 'Fitness', labelEs: 'Entrenamiento', icon: '💪', alwaysShow: false,
    tasks: [
      { id: 'f1', label: 'No nicotine — 30 min before workout',  icon: '🚭', nicotineWindow: true, windowType: 'preExercise' },
      { id: 'f2', label: 'Diaphragmatic breathing (5 cycles)',   icon: '🫁' },
      { id: 'f3', label: 'Workout (see Fitness tab)',            icon: '💪', action: 'openFitness' },
      { id: 'f4', label: 'Cool-down / stretching (5 min)',       icon: '🧘' },
      { id: 'f5', label: 'Protein shake',                        icon: '🥛' },
      { id: 'f6', label: 'No nicotine — 15 min after workout',  icon: '🚭', nicotineWindow: true, windowType: 'postExercise' },
    ]
  },

  travel: {
    id: 'travel', label: 'Travel Day', labelEs: 'Día de viaje', icon: '✈️', alwaysShow: false,
    tasks: [
      { id: 'tr1', label: 'Steps — 8,000+',        icon: '👣' },
      { id: 'tr2', label: 'Packed meals',           icon: '🎒' },
    ]
  },

  rest: {
    id: 'rest', label: 'Rest Day', labelEs: 'Día de descanso', icon: '😌', alwaysShow: false,
    tasks: [
      { id: 'r1', label: 'Meditate (15 min)',       icon: '🧘' },
    ]
  },

  alcoholfree: {
    id: 'alcoholfree', label: 'Alcohol Free', labelEs: 'Sin alcohol', icon: '🚫', alwaysShow: false,
    tasks: [
      { id: 'af1', label: 'No beer today',          icon: '🚫' },
    ]
  },

  flexible: {
    id: 'flexible', label: 'Flexible', labelEs: 'Flexible', icon: '⚡', alwaysShow: false,
    tasks: [
      { id: 'fl1', label: 'Extra sleep if needed',  icon: '😴' },
      { id: 'fl2', label: 'Home activities',        icon: '🏠' },
    ]
  }
};

// Default day-type sections per weekday
CL.DEFAULT_DAY_SECTIONS = {
  0: ['travel', 'alcoholfree'],   // Sunday
  1: ['fitness', 'alcoholfree'],  // Monday
  2: ['travel', 'alcoholfree'],   // Tuesday
  3: ['fitness', 'alcoholfree'],  // Wednesday
  4: ['cardio', 'alcoholfree'],   // Thursday
  5: ['fitness'],                 // Friday
  6: ['flexible', 'rest']         // Saturday
};

// All selectable day-type options
CL.DAY_TYPE_OPTIONS = [
  { key: 'cardio',     label: 'Cardio',       emoji: '🚣', color: '#10b981' },
  { key: 'fitness',    label: 'Fitness',      emoji: '💪', color: '#a855f7' },
  { key: 'travel',     label: 'Travel Day',   emoji: '✈️', color: '#0ea5e9' },
  { key: 'rest',       label: 'Rest Day',     emoji: '😌', color: '#64748b' },
  { key: 'alcoholfree',label: 'Alcohol Free', emoji: '🚫', color: '#34d399' },
  { key: 'flexible',   label: 'Flexible',     emoji: '⚡', color: '#8b5cf6' },
];

// ============================================================
// SCHEDULE DEFAULTS
// ============================================================
CL.DEFAULT_SCHEDULE = {
  wake:            { time: '05:45', label: 'Wake up' },
  breakfast:       { time: '06:00', label: 'Breakfast' },
  morningSnack:    { time: '09:15', label: 'Morning snack' },
  lunch:           { time: '12:15', label: 'Lunch' },
  afternoonSnack:  { time: '15:15', label: 'Afternoon snack' },
  exercise:        { time: '16:00', label: 'Exercise' },
  dinner:          { time: '18:30', label: 'Dinner' },
  bedtime:         { time: '22:45', label: 'Target bedtime' },
  // Fixed times
  eveningNicotineCutoff: { time: '19:00', label: 'No nicotine after' },
  noBeerCutoff:          { time: '19:00', label: 'No beer after' },
  // Derived offsets (minutes)
  nicotinePreMeal:       15,
  nicotinePostMeal:      30,
  nicotinePreExercise:   30,
  nicotinePostExercise:  15,
  morningNicotineWindow: 60,
  kitchenCloseOffset:    60,  // mins after dinner
  magnesiumOffset:       60,  // mins before bedtime
};

// ============================================================
// MACROS
// ============================================================
CL.DEFAULT_MACRO_TARGETS = {
  calories: 1950, protein: 173, carbs: 161, fat: 72, fiber: 30,
  waterBottles: 8, waterOz: 20
};

// ============================================================
// MOOD / ENERGY / SLEEP SCALES
// ============================================================
CL.MOOD_SCALE = [
  { value:1,  label:'Crisis',        desc:'Unable to function' },
  { value:2,  label:'Very Low',      desc:'Significant distress' },
  { value:3,  label:'Low',           desc:'Noticeably off' },
  { value:4,  label:'Below Average', desc:'Flat, manageable' },
  { value:5,  label:'Neutral',       desc:'Neither good nor bad' },
  { value:6,  label:'Decent',        desc:'Slightly positive' },
  { value:7,  label:'Good',          desc:'Engaged, stable' },
  { value:8,  label:'Really Good',   desc:'Energized, motivated' },
  { value:9,  label:'Excellent',     desc:'Thriving' },
  { value:10, label:'Best Day',      desc:'Peak mood' }
];

CL.ENERGY_SCALE = [
  { value:1,  label:'Depleted',      desc:'Barely functional' },
  { value:2,  label:'Very Low',      desc:'Dragging' },
  { value:3,  label:'Low',           desc:'Getting through it' },
  { value:4,  label:'Below Average', desc:'Sluggish' },
  { value:5,  label:'Neutral',       desc:'Neither tired nor energized' },
  { value:6,  label:'Okay',          desc:'Functional' },
  { value:7,  label:'Good',          desc:'Alert, capable' },
  { value:8,  label:'Energized',     desc:'Strong, motivated' },
  { value:9,  label:'Very High',     desc:'Firing on all cylinders' },
  { value:10, label:'Peak',          desc:'Maximum energy' }
];

CL.SLEEP_SCALE = [
  { value:1, label:'Terrible',  desc:'Barely slept' },
  { value:2, label:'Poor',      desc:'Restless, groggy' },
  { value:3, label:'Fair',      desc:'Partially restored' },
  { value:4, label:'Good',      desc:'Mostly restored' },
  { value:5, label:'Excellent', desc:'Deep, uninterrupted' }
];

// ============================================================
// MORNING READINGS
// ============================================================
CL.READINGS = [
  { id:'r1', source:'Marcus Aurelius — Meditations', sourceEs:'Marco Aurelio — Meditaciones', text:'You have power over your mind, not outside events. Realize this, and you will find strength.', textEs:'Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto y encontrarás la fortaleza.', theme:'resilience', isSpanishOriginal: false },
  { id:'r2', source:'Epictetus — Enchiridion', sourceEs:'Epicteto — Enquiridión', text:'Make the best use of what is in your power, and take the rest as it happens.', textEs:'Aprovecha al máximo lo que está en tu poder y acepta el resto tal como sucede.', theme:'acceptance', isSpanishOriginal: false },
  { id:'r3', source:'Seneca — Letters', sourceEs:'Séneca — Cartas', text:'It is not that I am brave, but that I know what is not worth fearing.', textEs:'No es que sea valiente, sino que sé lo que no vale la pena temer.', theme:'courage', isSpanishOriginal: false },
  { id:'r4', source:'Pablo Neruda — Ode to My Socks', sourceEs:'Pablo Neruda — Oda a mis calcetines', text:'Beauty is twice beauty and what is good is doubly good when it is a matter of two socks made of wool in winter.', textEs:'Dos veces es belleza la belleza y lo que es bueno es doblemente bueno cuando se trata de dos calcetines de lana en invierno.', theme:'gratitude', isSpanishOriginal: true },
  { id:'r5', source:'Jorge Luis Borges', sourceEs:'Jorge Luis Borges', text:'Time forks perpetually toward innumerable futures.', textEs:'El tiempo se bifurca perpetuamente hacia innumerables futuros.', theme:'possibility', isSpanishOriginal: true },
  { id:'r6', source:'Marcus Aurelius — Meditations', sourceEs:'Marco Aurelio — Meditaciones', text:'Waste no more time arguing what a good man should be. Be one.', textEs:'No pierdas más tiempo discutiendo cómo debe ser un hombre bueno. Sé uno.', theme:'action', isSpanishOriginal: false },
  { id:'r7', source:'Seneca — On the Shortness of Life', sourceEs:'Séneca — Sobre la brevedad de la vida', text:'All things are foreign; time alone is ours.', textEs:'Todo lo demás es ajeno; solo el tiempo es nuestro.', theme:'time', isSpanishOriginal: false },
  { id:'r8', source:'Octavio Paz', sourceEs:'Octavio Paz', text:'To read a poem is to hear it with our eyes; to hear it is to see it with our ears.', textEs:'Leer un poema es escucharlo con los ojos; escucharlo es verlo con los oídos.', theme:'presence', isSpanishOriginal: true },
  { id:'r9', source:'Viktor Frankl — Man\'s Search for Meaning', sourceEs:'Viktor Frankl — El hombre en busca de sentido', text:'When we are no longer able to change a situation, we are challenged to change ourselves.', textEs:'Cuando ya no podemos cambiar una situación, nos enfrentamos al desafío de cambiarnos a nosotros mismos.', theme:'growth', isSpanishOriginal: false },
  { id:'r10', source:'Gabriel García Márquez', sourceEs:'Gabriel García Márquez', text:'A person doesn\'t die when he should but when he can.', textEs:'Una persona no muere cuando debe sino cuando puede.', theme:'life', isSpanishOriginal: true },
  { id:'r11', source:'Epictetus — Discourses', sourceEs:'Epicteto — Discursos', text:'First say to yourself what you would be; and then do what you have to do.', textEs:'Primero dite a ti mismo lo que quieres ser; y luego haz lo que tienes que hacer.', theme:'intention', isSpanishOriginal: false },
  { id:'r12', source:'Marcus Aurelius — Meditations', sourceEs:'Marco Aurelio — Meditaciones', text:'The impediment to action advances action. What stands in the way becomes the way.', textEs:'El impedimento para actuar impulsa la acción. Lo que se interpone en el camino se convierte en el camino.', theme:'obstacles', isSpanishOriginal: false },
  { id:'r13', source:'Cervantes — Don Quixote', sourceEs:'Cervantes — Don Quijote', text:'Too much sanity may be madness — and the maddest of all is to see life as it is and not as it should be.', textEs:'Demasiada cordura puede ser locura — y la mayor locura de todas es ver la vida tal como es y no como debería ser.', theme:'vision', isSpanishOriginal: true },
  { id:'r14', source:'Seneca — Letters to Lucilius', sourceEs:'Séneca — Cartas a Lucilio', text:'Every new beginning comes from some other beginning\'s end.', textEs:'Todo nuevo comienzo proviene del final de otro comienzo.', theme:'change', isSpanishOriginal: false },
  { id:'r15', source:'Rumi', sourceEs:'Rumi', text:'Out beyond ideas of wrongdoing and rightdoing, there is a field. I\'ll meet you there.', textEs:'Más allá de las ideas de hacer el bien o el mal, hay un campo. Allí nos encontraremos.', theme:'acceptance', isSpanishOriginal: false }
];

// ============================================================
// EVENING AFFIRMATIONS
// ============================================================
CL.AFFIRMATIONS = [
  { text:'Estoy construyendo una vida mejor cada día.', translation:'I am building a better life every day.' },
  { text:'La disciplina de hoy es la libertad de mañana.', translation:'Today\'s discipline is tomorrow\'s freedom.' },
  { text:'Cada pequeño paso me acerca a mis metas.', translation:'Every small step brings me closer to my goals.' },
  { text:'Soy capaz de cambiar y merezco ese cambio.', translation:'I am capable of change and I deserve that change.' },
  { text:'El descanso es parte del progreso.', translation:'Rest is part of progress.' },
  { text:'Confío en el proceso y en mi capacidad de seguir adelante.', translation:'I trust the process and my ability to keep going.' },
  { text:'Mi cuerpo se fortalece con cada decisión saludable.', translation:'My body grows stronger with every healthy choice.' }
];

// ============================================================
// QUICK REFERENCE CARDS
// ============================================================
CL.REFERENCE_CARDS = [
  {
    id:'meds', title:'Medications & Timing', icon:'💊',
    content:[
      { label:'Morning', items:['Advair (inhaler)'] },
      { label:'Afternoon', items:['Topiramate'] },
      { label:'Evening', items:['Magnesium Glycinate 300–400mg'] },
      { label:'Bedtime', items:['Advair (inhaler)', 'Lithium', 'Lamictal', 'Seroquel', 'Topiramate (2nd dose)', 'Trazodone'] }
    ]
  },
  {
    id:'hypo', title:'Low Blood Sugar Protocol', icon:'🩸',
    content:[
      { label:'Symptoms', items:['Shakiness', 'Sweating', 'Confusion', 'Irritability', 'Rapid heartbeat'] },
      { label:'Immediate', items:['15g fast carbs: 4 glucose tablets OR small juice OR 3–4 glucose gummies'] },
      { label:'After 15 min', items:['Still symptomatic: repeat 15g carbs', 'Better: follow with protein + complex carb'] },
      { label:'Prevention', items:['Never skip meals', 'Eat every 3–4 hours', 'Always pair carbs with protein or fat'] }
    ]
  },
  {
    id:'asthma', title:'Asthma Protocol', icon:'💨',
    content:[
      { label:'Before exercise', items:['Zero nicotine 30 min before', '5 diaphragmatic breath cycles', 'Rescue inhaler within reach'] },
      { label:'During symptoms', items:['Reduce intensity immediately', 'Use rescue inhaler', 'Stop if no improvement'] },
      { label:'Emergency', items:['No improvement after inhaler → Call 911', 'Lips/fingertips turning blue → 911', 'Extreme difficulty speaking → 911'] }
    ]
  },
  {
    id:'restaurant', title:'Restaurant Ordering Guide', icon:'🍽️',
    content:[
      { label:'Always ask for', items:['Grilled or baked protein', 'Vegetables steamed or roasted', 'Sauces on the side'] },
      { label:'Best choices', items:['Grilled chicken/fish + vegetables', 'Salad with protein (dressing aside)', 'Egg-based dishes'] },
      { label:'Avoid', items:['Fried anything', 'Cream-based sauces', 'Sugary drinks'] }
    ]
  },
  {
    id:'doctorprep', title:'Doctor Appointment Prep', icon:'🩺',
    content:[
      { label:'Always bring', items:['Medication list', 'Rescue inhaler use log', 'Body scan history', 'Mood/energy trends'] },
      { label:'Request tests', items:['Lipid panel', 'HbA1c + fasting glucose', 'TSH + free T4 (lithium)', 'B12 + folate (omeprazole)', 'Vitamin D', 'Electrolytes'] },
      { label:'Key topics', items:['Asthma control', 'Seroquel metabolic monitoring', 'Sleep study follow-up', 'GLP-1 (Zepbound) decision', 'Topiramate taper timeline'] }
    ]
  }
];

// ============================================================
// OTC TAPER
// ============================================================
CL.TAPER = {
  benadryl: {
    name:'Benadryl', icon:'💊',
    phases:[
      { phase:1, instruction:'2 per night (current)' },
      { phase:2, instruction:'1 per night' },
      { phase:3, instruction:'As needed only' }
    ]
  },
  zyrtec: {
    name:'Zyrtec', icon:'💊',
    note:'Expect rebound itching 1–3 weeks when reducing.',
    phases:[
      { phase:1, instruction:'2 per day (current)' },
      { phase:2, instruction:'1 per day' }
    ]
  },
  omeprazole: {
    name:'Omeprazole', icon:'💊',
    note:'Begin after alcohol reduction and dietary changes established.',
    phases:[
      { phase:1, instruction:'2 per day (current)' },
      { phase:2, instruction:'1 per day' },
      { phase:3, instruction:'As needed only' }
    ]
  }
};

// ============================================================
// LEARNING — Built-in fallback content
// ============================================================
CL.LEARNING_FALLBACK = {
  // STEM
  science: [
    { fact:'The human body replaces roughly 330 billion cells per day — about 3.8 million per second. Most of your body is younger than you think.', source:'Cell Biology' },
    { fact:'Entropy isn\'t just about disorder — it\'s about the number of possible microscopic states a system can occupy. A shuffled deck has higher entropy because there are vastly more shuffled arrangements than ordered ones.', source:'Thermodynamics' },
    { fact:'The placebo effect works even when patients know they\'re taking a placebo. This suggests expectation and ritual have genuine physiological effects independent of deception.', source:'Neuroscience' },
  ],
  technology: [
    { fact:'The first computer bug was a literal moth found in the Harvard Mark II in 1947. Grace Hopper\'s team taped it to the logbook with the note "First actual case of bug being found."', source:'Computing History' },
    { fact:'Lithium-ion batteries degrade partly because lithium ions physically expand the electrode material when they enter, causing microscopic cracks over thousands of charge cycles.', source:'Materials Science' },
  ],
  engineering: [
    { fact:'The Tacoma Narrows Bridge collapse in 1940 wasn\'t caused by resonance matching wind frequency — it was aeroelastic flutter, a self-reinforcing oscillation. The distinction matters enormously for modern bridge design.', source:'Structural Engineering' },
    { fact:'The Hoover Dam was built with interlocking concrete columns rather than one monolithic pour because the heat from curing would have taken 125 years to dissipate and likely cracked the structure.', source:'Civil Engineering' },
  ],
  mathematics: [
    { fact:'Simpson\'s Paradox: a trend can appear in several groups of data but disappear or reverse when the groups are combined. UC Berkeley\'s 1973 admissions data is the classic example — departments appeared to favor women, but aggregate data showed apparent bias against them.', source:'Statistics' },
    { fact:'The Monty Hall problem remains counterintuitive even after the proof: switching doors wins 2/3 of the time. The key insight is that the host\'s action conveys information — he never opens the winning door, so his choice updates the probabilities asymmetrically.', source:'Probability Theory' },
    { fact:'In a room of 23 people, there\'s a 50% chance two share a birthday. In a room of 70, it\'s 99.9%. This is counterintuitive because we compare against our own birthday rather than all pairs — with 23 people there are 253 possible pairs.', source:'Combinatorics' },
  ],
  // CIVICS
  usGov: [
    { fact:'The filibuster is not in the Constitution. It emerged accidentally in 1806 when the Senate removed a rule allowing a simple majority to call a vote, creating an unintended loophole that wasn\'t exploited until 1837.', source:'U.S. Senate History' },
    { fact:'The 14th Amendment\'s Equal Protection Clause has been the legal basis for more Supreme Court decisions than any other constitutional provision — from desegregation to same-sex marriage.', source:'Constitutional Law' },
  ],
  usHistory: [
    { fact:'The Louisiana Purchase doubled the size of the United States for approximately 3 cents per acre. Jefferson was unsure it was constitutional but proceeded anyway, arguing the opportunity was too significant to pass up.', source:'U.S. History' },
    { fact:'During the 1918 influenza pandemic, Philadelphia held a Liberty Loan parade despite warnings, resulting in 12,000 deaths in six weeks. St. Louis cancelled its parade and had a fraction of the casualties — one of the clearest natural experiments in public health history.', source:'Public Health History' },
  ],
  utahHistory: [
    { fact:'Salt Lake City was founded in 1847 by Brigham Young\'s party, who chose the site specifically because it was outside U.S. jurisdiction at the time — in Mexican territory. The Mexican-American War cession changed that just months later.', source:'Utah History' },
    { fact:'The driving of the Golden Spike at Promontory Summit in 1869 completing the transcontinental railroad was celebrated in Salt Lake City with such enthusiasm that Brigham Young, who had been excluded from the ceremony due to disputes with Union Pacific, later negotiated his own branch line.', source:'Utah Railroad History' },
    { fact:'The Great Salt Lake is a terminal lake — it has no outlet. Everything that flows in stays until it evaporates, which is why it\'s saltier than the ocean and why its level fluctuates dramatically with precipitation cycles.', source:'Utah Geography' },
  ],
  // LANGUAGE
  englishWord: [
    { word:'Sonder', definition:'The realization that each passerby has a life as vivid and complex as your own.', usage:'Walking through an airport induces a particular sonder — each face carries an entire world.' },
    { word:'Apophenia', definition:'The tendency to perceive meaningful connections between unrelated things.', usage:'Conspiracy theories thrive on apophenia — the brain finding patterns where none exist.' },
    { word:'Liminal', definition:'Occupying a threshold or transitional position between two states.', usage:'The hour before dawn is liminal — neither night nor morning.' },
    { word:'Verisimilitude', definition:'The appearance of being true or real.', usage:'Good historical fiction achieves verisimilitude through period-accurate detail.' },
  ],
  literature: [
    { fact:'Cervantes wrote Don Quixote while imprisoned for accounting irregularities as a tax collector. The book is often cited as the first modern novel — remarkable given it was written as a parody of chivalric romances.', source:'Spanish Literature' },
    { fact:'Borges never wrote a novel. He believed the summary of a book was more interesting than the book itself, and that the short story was the superior form precisely because of its constraints.', source:'Latin American Literature' },
    { fact:'Shakespeare invented over 1,700 words still in common use today: bedroom, generous, obscene, lonely, gloomy, majestic, countless. He needed words that didn\'t exist yet to express what he was trying to say.', source:'English Literature' },
  ],
  etymology: [
    { word:'Salary', origin:'Latin salarium — payment in salt', explanation:'Roman soldiers were sometimes paid in salt or given an allowance to buy it. Salt was a preservation technology before refrigeration — genuinely precious.' },
    { word:'Quarantine', origin:'Italian quarantina — forty days', explanation:'Venice in 1127 required ships from plague-affected areas to anchor for 40 days before passengers could disembark. The number 40 had biblical resonance and turned out to be roughly correct for many incubation periods.' },
    { word:'Algorithm', origin:'Latinization of al-Khwarizmi', explanation:'9th-century Persian mathematician Muhammad ibn Musa al-Khwarizmi wrote a treatise on Hindu-Arabic numerals. His name, Latinized as Algoritmi, became the word for systematic calculation procedures.' },
  ],
  // SYSTEMS & SOCIETY
  gameTheory: [
    { fact:'The Prisoner\'s Dilemma shows that individually rational decisions can produce collectively irrational outcomes. What makes it powerful isn\'t the prison scenario — it\'s that it describes arms races, climate negotiations, and pricing wars with equal accuracy.', source:'Game Theory' },
    { fact:'In repeated Prisoner\'s Dilemma tournaments, the winning strategy was Robert Axelrod\'s "Tit for Tat" — cooperate first, then mirror what the other player did. It wins not by being clever but by being simple, forgiving, and retaliatory in equal measure.', source:'Evolutionary Game Theory' },
  ],
  systemsThinking: [
    { fact:'Goodhart\'s Law: when a measure becomes a target, it ceases to be a good measure. GDP, test scores, and social media engagement metrics all illustrate this — optimizing for the proxy corrupts the original signal.', source:'Systems Theory' },
    { fact:'Feedback loops explain most complex system behavior. Reinforcing loops amplify change (compound interest, viral spread, arms races). Balancing loops resist change (thermostats, predator-prey cycles, inflation control). Most policy failures involve misidentifying which type is dominant.', source:'Systems Dynamics' },
  ],
  historicalDecisions: [
    { fact:'The Bay of Pigs failure is a textbook case of groupthink — qualified dissenters self-censored to preserve group harmony, the illusion of unanimity was mistaken for genuine consensus, and the plan\'s obvious flaws went unchallenged. Kennedy restructured his advisory process directly as a result.', source:'Decision Theory' },
    { fact:'Napoleon\'s 1812 Russian campaign illustrates the difference between winning battles and winning wars. He won almost every engagement but the strategic objective — forcing Russia to the negotiating table — required a decisive defeat he never achieved. The campaign cost 400,000 lives for zero strategic gain.', source:'Military History / Strategy' },
  ],
  behavioralEcon: [
    { fact:'Loss aversion: losses feel roughly twice as painful as equivalent gains feel good. This isn\'t irrational — in an evolutionary context where resources were scarce, losing was more dangerous than failing to gain. But it systematically distorts financial and medical decision-making.', source:'Behavioral Economics' },
    { fact:'The endowment effect: people value objects more once they own them. In experiments, people demand roughly twice as much to sell a mug as they\'d pay to buy the same mug. Ownership creates psychological attachment that inflates perceived value beyond market price.', source:'Behavioral Economics' },
    { fact:'Default effects are among the most powerful interventions in behavioral economics. Organ donation rates are dramatically higher in opt-out countries than opt-in countries — not because people changed their minds, but because the default choice does most of the deciding.', source:'Choice Architecture' },
  ]
};

// AI SYSTEM PROMPT for Learning content generation
CL.LEARNING_SYSTEM_PROMPT = `You are generating daily learning content for Christopher Martinez, 34, Clinton UT. 

Background: B.S. Quantitative Economics, A.S. Applied Mathematics, Postgraduate Certificate Systems Analysis. Interests include SLC/Utah history, classic literature (Cervantes, Borges, Neruda, García Márquez), applied mathematics, statistics, probability, econometrics, game theory, behavioral economics, systems thinking, complexity theory, historical decision-making.

Generate content that matches his level — he can handle technical depth, statistical nuance, and mathematical rigor. Don't oversimplify. Utah/SLC history should lean toward lesser-known facts and genuinely interesting stories rather than textbook content.

Return ONLY a valid JSON object with no preamble, no markdown fences. Structure:
{
  "science": {"fact": "...", "source": "..."},
  "technology": {"fact": "...", "source": "..."},
  "engineering": {"fact": "...", "source": "..."},
  "mathematics": {"fact": "...", "source": "..."},
  "usGov": {"fact": "...", "source": "..."},
  "usHistory": {"fact": "...", "source": "..."},
  "utahHistory": {"fact": "...", "source": "..."},
  "englishWord": {"word": "...", "definition": "...", "usage": "..."},
  "spanishWord": {"word": "...", "translation": "...", "example": "...", "exampleEn": "..."},
  "literature": {"fact": "...", "source": "..."},
  "etymology": {"word": "...", "origin": "...", "explanation": "..."},
  "gameTheory": {"fact": "...", "source": "..."},
  "systemsThinking": {"fact": "...", "source": "..."},
  "historicalDecision": {"fact": "...", "source": "..."},
  "behavioralEcon": {"fact": "...", "source": "..."},
  "quizQuestions": [
    {"q": "question text", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "why A is correct"},
    {"q": "...", "options": [...], "answer": 1, "explanation": "..."},
    {"q": "...", "options": [...], "answer": 2, "explanation": "..."},
    {"q": "...", "options": [...], "answer": 0, "explanation": "..."},
    {"q": "...", "options": [...], "answer": 3, "explanation": "..."}
  ],
  "spanishQuizQuestions": [
    {"q": "¿Qué significa '...'?", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..."}
  ]
}

Make all content fresh and non-obvious. Avoid the most commonly cited examples of each concept unless there's a genuinely interesting angle not usually covered.`;

console.log('✅ CL Data v3 loaded');
