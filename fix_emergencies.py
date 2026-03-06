filepath = r'components\PatientDashboard.tsx'

new_block = r"""                            {/* EMERGENCIES TAB - Interactive Search */}
                            {activeTab === 'emergencies' && (() => {
                                const FIRST_AID_DATA = [
                                    {
                                        title: 'Cardiac Arrest / CPR', color: 'red',
                                        keywords: ['cardiac', 'heart', 'cpr', 'arrest', 'chest', 'resuscitation', 'heartbeat'],
                                        steps: [
                                            'Call 112 immediately.',
                                            'Lay the person on their back on a firm, flat surface.',
                                            'Place the heel of your hand on the centre of their chest.',
                                            'Push hard and fast - 100 to 120 compressions per minute (2 per second).',
                                            'If trained, give 2 rescue breaths after every 30 compressions.',
                                            'Continue until emergency services arrive or the person regains consciousness.',
                                        ],
                                    },
                                    {
                                        title: 'Choking (Adult)', color: 'orange',
                                        keywords: ['choke', 'choking', 'heimlich', 'airway', 'stuck', 'throat', 'food'],
                                        steps: [
                                            'Ask if they are choking - if they cannot speak or cough, act immediately.',
                                            'Give 5 sharp back blows between the shoulder blades with the heel of your hand.',
                                            'Give 5 abdominal thrusts (Heimlich manoeuvre): stand behind them, make a fist above the navel, pull sharply inward and upward.',
                                            'Alternate back blows and thrusts until the object is expelled or they lose consciousness.',
                                            'If unconscious, begin CPR and call 112.',
                                        ],
                                    },
                                    {
                                        title: 'Burns', color: 'amber',
                                        keywords: ['burn', 'fire', 'scald', 'hot', 'flame', 'chemical', 'skin'],
                                        steps: [
                                            'Remove the person from the source of the burn safely.',
                                            'Cool the burn under cool (not cold) running water for at least 20 minutes.',
                                            'Do NOT use ice, butter, or toothpaste.',
                                            'Remove jewellery or clothing near the burn (unless stuck to the skin).',
                                            'Cover loosely with a clean, dry bandage or cling film.',
                                            'Seek medical help for burns on the face, hands, joints, or chemical/electrical burns.',
                                        ],
                                    },
                                    {
                                        title: 'Fractures (Broken Bones)', color: 'blue',
                                        keywords: ['fracture', 'broken', 'bone', 'break', 'crack', 'limb', 'arm', 'leg'],
                                        steps: [
                                            'Do NOT try to straighten the bone.',
                                            'Immobilise the injured area using a splint or improvised support.',
                                            'Apply ice wrapped in a cloth to reduce swelling. Do not apply ice directly.',
                                            'Elevate the limb if possible.',
                                            'For an open fracture, cover the wound with a clean cloth and seek emergency help.',
                                        ],
                                    },
                                    {
                                        title: 'Severe Bleeding', color: 'rose',
                                        keywords: ['bleeding', 'blood', 'wound', 'cut', 'haemorrhage', 'hemorrhage', 'laceration'],
                                        steps: [
                                            'Apply firm, direct pressure on the wound using a clean cloth or bandage.',
                                            'Do not remove the cloth if it soaks through - add more on top.',
                                            'Elevate the injured limb above heart level if possible.',
                                            'Keep pressure for at least 15 minutes.',
                                            'Call 112 if bleeding is severe or does not stop.',
                                            'For amputations, apply a tourniquet 5 to 7 cm above the wound.',
                                        ],
                                    },
                                    {
                                        title: 'Seizure / Epilepsy', color: 'violet',
                                        keywords: ['seizure', 'epilepsy', 'fit', 'convulsion', 'shaking', 'twitch', 'epileptic'],
                                        steps: [
                                            'Stay calm. Time the seizure with your phone.',
                                            'Clear the area of sharp or hard objects.',
                                            'Cushion the person head with something soft.',
                                            'Turn them gently onto their side (recovery position) after jerking stops.',
                                            'Do NOT restrain them or put anything in their mouth.',
                                            'Call 112 if the seizure lasts more than 5 minutes or it is their first seizure.',
                                        ],
                                    },
                                    {
                                        title: 'Fainting', color: 'teal',
                                        keywords: ['faint', 'fainting', 'unconscious', 'collapse', 'dizzy', 'passed out', 'syncope'],
                                        steps: [
                                            'Help the person lie down safely - prevent them from falling.',
                                            'Raise their legs about 30 cm above heart level.',
                                            'Loosen tight clothing around the neck and waist.',
                                            'Ensure fresh air - open windows or move to an open area.',
                                            'If they do not regain consciousness within 1 to 2 minutes, call 112.',
                                        ],
                                    },
                                    {
                                        title: 'Snake Bite', color: 'green',
                                        keywords: ['snake', 'bite', 'venom', 'poison', 'reptile', 'sting'],
                                        steps: [
                                            'Keep the person calm and still - movement spreads venom faster.',
                                            'Immobilise the bitten limb and keep it below heart level.',
                                            'Remove watches, rings, and tight clothing near the bite.',
                                            'Do NOT cut the wound, suck out venom, or apply a tourniquet.',
                                            'Note the time of the bite and the appearance of the snake.',
                                            'Reach a hospital with anti-venom as quickly as possible.',
                                        ],
                                    },
                                    {
                                        title: 'Stroke', color: 'pink',
                                        keywords: ['stroke', 'brain', 'droop', 'speech', 'paralysis', 'face', 'arm weakness', 'slurred'],
                                        steps: [
                                            'Use the FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call 112.',
                                            'Do NOT give food, water, or medication.',
                                            'Lay the person down with head and shoulders slightly raised.',
                                            'Do NOT leave them alone.',
                                            'Note the time symptoms started - critical for treatment.',
                                            'Call 112 immediately.',
                                        ],
                                    },
                                    {
                                        title: 'Heat Stroke', color: 'orange',
                                        keywords: ['heat', 'heatstroke', 'sunstroke', 'hot', 'temperature', 'dehydration', 'sun'],
                                        steps: [
                                            'Move the person to a cool, shaded area immediately.',
                                            'Remove excess clothing.',
                                            'Apply cool water to the skin or wrap in a cool wet cloth.',
                                            'Fan them to promote evaporation.',
                                            'Place ice packs under armpits, neck, and groin if available.',
                                            'Call 112 - heat stroke is life-threatening.',
                                        ],
                                    },
                                    {
                                        title: 'Drowning', color: 'blue',
                                        keywords: ['drown', 'drowning', 'water', 'submerge', 'swim', 'lake', 'river', 'pool'],
                                        steps: [
                                            'Call 112 immediately.',
                                            'Do NOT jump in unless trained - use a rope, pole, or floating object.',
                                            'Once safe on land, check for breathing.',
                                            'If not breathing, begin CPR immediately (30 compressions : 2 breaths).',
                                            'Turn them onto their side if they vomit during CPR.',
                                            'Keep them warm with a blanket and do not leave alone.',
                                        ],
                                    },
                                    {
                                        title: 'Electric Shock', color: 'yellow',
                                        keywords: ['electric', 'shock', 'electricity', 'electrocution', 'wire', 'current', 'voltage'],
                                        steps: [
                                            'Do NOT touch the person until the power source is switched off.',
                                            'Turn off the power at the main switch or breaker.',
                                            'If you cannot turn off power, use a dry wooden stick to push them away from the source.',
                                            'Call 112.',
                                            'Check for breathing and start CPR if needed.',
                                            'Cover burns with a clean, dry dressing.',
                                        ],
                                    },
                                ];

                                const colorMap: Record<string, { bg: string; border: string; text: string; step: string; tag: string }> = {
                                    red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    step: 'bg-red-500',    tag: 'bg-red-100 text-red-700' },
                                    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', step: 'bg-orange-500', tag: 'bg-orange-100 text-orange-700' },
                                    amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-900', step: 'bg-amber-500',  tag: 'bg-amber-100 text-amber-700' },
                                    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800',  step: 'bg-blue-500',   tag: 'bg-blue-100 text-blue-700' },
                                    rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-800',  step: 'bg-rose-500',   tag: 'bg-rose-100 text-rose-700' },
                                    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800',step: 'bg-violet-500', tag: 'bg-violet-100 text-violet-700' },
                                    teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   text: 'text-teal-800',  step: 'bg-teal-500',   tag: 'bg-teal-100 text-teal-700' },
                                    green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800', step: 'bg-green-500',  tag: 'bg-green-100 text-green-700' },
                                    pink:   { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-800',  step: 'bg-pink-500',   tag: 'bg-pink-100 text-pink-700' },
                                    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900',step: 'bg-yellow-500', tag: 'bg-yellow-100 text-yellow-700' },
                                };

                                const EmergencyTab = () => {
                                    const [query, setQuery] = React.useState('');
                                    const q = query.toLowerCase().trim();
                                    const filtered = q
                                        ? FIRST_AID_DATA.filter(item =>
                                            item.title.toLowerCase().includes(q) ||
                                            item.keywords.some(k => k.includes(q) || q.includes(k))
                                          )
                                        : [];

                                    return (
                                        <div className="space-y-6">
                                            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                                                <h2 className="text-xl font-bold text-red-700">Emergency First Aid Guide</h2>
                                                <p className="text-sm text-red-600 mt-1">Type a condition below to get instant first aid steps. In a life-threatening emergency, <strong>call 112 immediately</strong>.</p>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={query}
                                                    onChange={e => setQuery(e.target.value)}
                                                    placeholder="Type a condition (burn, heart attack, choking, snake bite...)"
                                                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-base bg-white shadow-sm transition-all"
                                                    autoFocus
                                                />
                                                {query && (
                                                    <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700 font-semibold border border-slate-200 rounded-lg px-2 py-1">Clear</button>
                                                )}
                                            </div>

                                            {!query && (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Pick</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Heart Attack', 'Burn', 'Choking', 'Bleeding', 'Seizure', 'Stroke', 'Snake Bite', 'Drowning', 'Fainting', 'Heat Stroke'].map(label => (
                                                            <button
                                                                key={label}
                                                                onClick={() => setQuery(label)}
                                                                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all shadow-sm"
                                                            >
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {query && filtered.length === 0 && (
                                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                                                    <p className="text-slate-600 font-semibold text-lg mb-1">No results for <strong>{query}</strong></p>
                                                    <p className="text-slate-400 text-sm">Try: burn, choke, heart, seizure, or bleeding</p>
                                                </div>
                                            )}

                                            {filtered.map(item => {
                                                const c = colorMap[item.color] || colorMap['blue'];
                                                return (
                                                    <div key={item.title} className={`${c.bg} border-2 ${c.border} rounded-2xl p-6`}>
                                                        <div className="mb-4">
                                                            <h3 className={`text-xl font-bold ${c.text}`}>{item.title}</h3>
                                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.tag} mt-2 inline-block`}>First Aid Steps</span>
                                                        </div>
                                                        <ol className="space-y-3">
                                                            {item.steps.map((step, i) => (
                                                                <li key={i} className="flex items-start gap-4 bg-white/60 rounded-xl p-3">
                                                                    <span className={`${c.step} text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>{i + 1}</span>
                                                                    <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{step}</p>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                );
                                            })}

                                            <div className="p-5 bg-slate-800 text-white rounded-2xl">
                                                <h4 className="font-bold text-lg mb-3">Emergency Numbers (India)</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {[
                                                        { label: 'National Emergency', number: '112' },
                                                        { label: 'Ambulance', number: '108' },
                                                        { label: 'Police', number: '100' },
                                                        { label: 'Fire Brigade', number: '101' },
                                                        { label: 'Women Helpline', number: '1091' },
                                                        { label: 'Poison Control', number: '1800-11-6117' },
                                                    ].map(n => (
                                                        <div key={n.label} className="bg-white/10 rounded-xl p-3 text-center">
                                                            <p className="text-xs text-slate-300 mb-1">{n.label}</p>
                                                            <a href={`tel:${n.number}`} className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors">{n.number}</a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                };
                                return <EmergencyTab />;"""

with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# Lines are 0-indexed; block is lines 776..1044 inclusive
before = lines[:776]
after = lines[1045:]

new_content = ''.join(before) + new_block + '\n' + ''.join(after)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done. Total lines:', new_content.count('\n'))
