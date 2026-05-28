import React, { useState, useEffect } from 'react';
import { Brain, Eye, Ear, Hand, Zap, Clock, Focus, Sparkles, ChevronRight, Check, BookOpen, Trophy, Lightbulb, FileText, Plus, X, Star, Film, GraduationCap, Upload, Globe, Home, Settings, Flame, ArrowLeft, Type, Volume2, ScrollText, Wand2, Sliders, TrendingUp, Bookmark, Highlighter, Heart, Target, Coffee, Smile, Loader2, Layers, Lock, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { generateLesson, explainText, summarizeText } from './api';

// ============== MAIN APP ==============
export default function MaximizeApp() {
  const [phase, setPhase] = useState('splash');
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [tab, setTab] = useState('home');
  const [course, setCourse] = useState(null);     // the multi-unit course currently open
  const [topic, setTopic] = useState(null);       // the individual lesson currently open
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [customLessons, setCustomLessons] = useState([]);
  const [savedDocs, setSavedDocs] = useState([]);
  const [openDoc, setOpenDoc] = useState(null);
  const [prefs, setPrefs] = useState({ fontSize: 'normal', showImages: true, showProgress: true, sounds: false });

  // Expanded survey - 9 questions across 3 sections
  const questions = [
    // SECTION 1: HOW YOU LEARN
    { id: 'modality', section: 'How You Learn', q: 'When learning something new, what helps you most?', icon: Brain, opts: [
      { v: 'visual', l: 'Seeing diagrams, charts, or videos', icon: Eye },
      { v: 'auditory', l: 'Listening to explanations or talking it through', icon: Ear },
      { v: 'kinesthetic', l: 'Hands-on practice and doing', icon: Hand },
      { v: 'reading', l: 'Reading carefully and taking my own notes', icon: BookOpen },
    ]},
    { id: 'attention', section: 'How You Learn', q: 'How long can you really focus before your mind drifts?', icon: Clock, opts: [
      { v: 'short', l: 'Less than 10 minutes — I need frequent breaks' },
      { v: 'medium', l: '10–25 minutes feels right' },
      { v: 'long', l: '30+ minutes when the topic grabs me' },
      { v: 'variable', l: 'It swings wildly — depends on the day and topic' },
    ]},
    { id: 'pace', section: 'How You Learn', q: 'What pace fits how your brain works best?', icon: Zap, opts: [
      { v: 'fast', l: 'Quick bursts with lots of variety' },
      { v: 'steady', l: 'Steady and methodical, one step at a time' },
      { v: 'slow', l: 'Slow with time to fully reflect' },
      { v: 'mixed', l: 'Mix it up — variety keeps me engaged' },
    ]},

    // SECTION 2: WHO YOU ARE
    { id: 'level', section: 'Who You Are', q: 'Which best describes you right now?', icon: GraduationCap, opts: [
      { v: 'middle-school', l: 'Middle school student' },
      { v: 'high-school', l: 'High school student' },
      { v: 'college', l: 'College student' },
      { v: 'professional', l: 'Working professional or adult learner' },
      { v: 'other', l: 'Something else / prefer not to say' },
    ]},
    { id: 'time', section: 'Who You Are', q: 'How much time can you usually give to studying in a sitting?', icon: Coffee, opts: [
      { v: 'micro', l: 'Just a few minutes here and there' },
      { v: 'short', l: '15–30 minute sessions' },
      { v: 'medium', l: '30–60 minutes when I sit down' },
      { v: 'long', l: 'An hour or more when I really focus' },
    ]},
    { id: 'challenges', section: 'Who You Are', q: 'Do any of these describe you? (Select all that apply — we use this to support you better)', icon: Focus, multi: true, opts: [
      { v: 'adhd', l: 'I have ADHD or trouble focusing' },
      { v: 'dyslexia', l: 'I have dyslexia or read more slowly' },
      { v: 'anxiety', l: 'I get anxious with tests or pressure' },
      { v: 'sensory', l: 'I am sensitive to busy visuals or sound' },
      { v: 'language', l: 'English isn\'t my first language' },
      { v: 'none', l: 'None of these apply' },
    ]},

    // SECTION 3: WHAT YOU WANT
    { id: 'goal', section: 'What You Want', q: 'What are you really hoping to get out of Maximize?', icon: Target, opts: [
      { v: 'grades', l: 'Better grades on tests and assignments' },
      { v: 'understanding', l: 'Actually understand things, not just memorize' },
      { v: 'confidence', l: 'Feel more confident in class and discussions' },
      { v: 'efficiency', l: 'Study smarter so I have more free time' },
      { v: 'curiosity', l: 'Learn things I\'m genuinely curious about' },
    ]},
    { id: 'feeling', section: 'What You Want', q: 'When you think about studying right now, how do you usually feel?', icon: Heart, opts: [
      { v: 'overwhelmed', l: 'Overwhelmed — there\'s too much to keep up with' },
      { v: 'behind', l: 'Behind — I\'m playing catch-up' },
      { v: 'frustrated', l: 'Frustrated — I work hard but don\'t see results' },
      { v: 'okay', l: 'Mostly okay — could be better' },
      { v: 'curious', l: 'Curious and excited' },
    ]},
    { id: 'motivation', section: 'What You Want', q: 'What keeps you going when learning gets hard?', icon: Sparkles, opts: [
      { v: 'progress', l: 'Seeing visible progress and streaks' },
      { v: 'curiosity', l: 'My own curiosity about the topic' },
      { v: 'goals', l: 'A clear goal I\'m working toward' },
      { v: 'support', l: 'Encouragement and feeling supported' },
      { v: 'social', l: 'Friendly competition or sharing wins' },
    ]},
  ];

  const onAns = (id, v, multi) => {
    if (multi) {
      const cur = answers[id] || [];
      const next = v === 'none' ? (cur.includes('none') ? [] : ['none']) :
        cur.includes(v) ? cur.filter(x => x !== v) : [...cur.filter(x => x !== 'none'), v];
      setAnswers({ ...answers, [id]: next });
    } else {
      setAnswers({ ...answers, [id]: v });
      setTimeout(() => qIdx < questions.length - 1 ? setQIdx(qIdx + 1) : build({ ...answers, [id]: v }), 350);
    }
  };

  const build = (a) => {
    const c = a.challenges || [];
    const p = {
      // Core learning style
      modality: a.modality, attention: a.attention, pace: a.pace,
      // Personal context
      level: a.level, time: a.time,
      // Goals and emotional state
      goal: a.goal, feeling: a.feeling, motivation: a.motivation,
      // Accommodations
      hasADHD: c.includes('adhd'), hasDyslexia: c.includes('dyslexia'),
      hasAnxiety: c.includes('anxiety'), hasSensory: c.includes('sensory'),
      hasLanguage: c.includes('language'),
      // Derived settings
      chunkSize: c.includes('adhd') || a.attention === 'short' || a.time === 'micro' ? 'small' : 'normal',
      breakReminders: c.includes('adhd') || a.attention === 'short',
      reducedMotion: c.includes('sensory'),
      largerText: c.includes('dyslexia'),
      gentleFeedback: c.includes('anxiety') || a.feeling === 'overwhelmed' || a.feeling === 'frustrated',
      simpleLanguage: c.includes('language') || c.includes('dyslexia') || a.level === 'middle-school',
      encouragingTone: a.feeling === 'overwhelmed' || a.feeling === 'behind' || a.feeling === 'frustrated' || a.motivation === 'support',
      depthLevel: a.goal === 'understanding' || a.goal === 'curiosity' ? 'deep' : a.goal === 'grades' ? 'exam-focused' : 'balanced',
    };
    setProfile(p);
    if (c.includes('dyslexia')) setPrefs(pr => ({ ...pr, fontSize: 'large' }));
    setPhase('profile');
  };

  const reset = () => { setPhase('splash'); setQIdx(0); setAnswers({}); setProfile(null); setClasses([]);
    setTab('home'); setCourse(null); setTopic(null); setProgress(0); setCompleted([]); setCustomLessons([]); setSavedDocs([]); };

  const complete = (id) => { if (!completed.includes(id)) setCompleted([...completed, id]); };

  const bg = { background: `radial-gradient(ellipse at 20% 10%, rgba(255,107,107,0.25) 0%, transparent 50%), radial-gradient(ellipse at 85% 80%, rgba(255,199,95,0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(78,168,222,0.15) 0%, transparent 70%), linear-gradient(180deg, #fef4d8 0%, #fde0a8 100%)` };

  if (phase === 'splash') return <Splash onGo={() => setPhase('founder')} bg={bg} />;
  if (phase === 'founder') return <Founder onGo={() => setPhase('survey')} bg={bg} />;
  if (phase === 'survey') return <Survey q={questions[qIdx]} idx={qIdx} total={questions.length} questions={questions} ans={answers} onAns={onAns} onNext={() => qIdx < questions.length - 1 ? setQIdx(qIdx + 1) : build(answers)} onBack={() => qIdx > 0 && setQIdx(qIdx - 1)} bg={bg} />;
  if (phase === 'profile') return <ProfileScreen profile={profile} onGo={() => setPhase('classroom')} onReset={reset} bg={bg} />;
  if (phase === 'classroom') return <Classroom classes={classes} setClasses={setClasses} profile={profile} onGo={() => setPhase('app')} bg={bg} />;

  return (
    <Shell tab={tab} setTab={setTab} bg={bg} prefs={prefs}>
      {topic ? <Lesson topic={topic} profile={profile} progress={progress} setProgress={setProgress}
        onExit={() => { setTopic(null); setProgress(0); }} onDone={() => complete(topic.id)} prefs={prefs} />
      : course ? <CourseOverview course={course} profile={profile} completed={completed}
        onPickLesson={(lessonTopic) => { setTopic(lessonTopic); setProgress(0); }}
        onExit={() => setCourse(null)} prefs={prefs} />
      : openDoc ? <Reader doc={openDoc} onExit={() => setOpenDoc(null)} prefs={prefs} profile={profile} />
      : tab === 'home' ? <HomeTab classes={classes} customLessons={customLessons} setCustomLessons={setCustomLessons} onPick={setCourse} completed={completed} profile={profile} />
      : tab === 'progress' ? <ProgressTab completed={completed} classes={classes} profile={profile} />
      : tab === 'library' ? <LibraryTab classes={classes} setClasses={setClasses} />
      : tab === 'reader' ? <ReaderHub savedDocs={savedDocs} setSavedDocs={setSavedDocs} onOpen={setOpenDoc} />
      : <SettingsTab profile={profile} prefs={prefs} setPrefs={setPrefs} onReset={reset} />}
    </Shell>
  );
}

// ============== APP SHELL ==============
function Shell({ tab, setTab, children, bg, prefs }) {
  const tabs = [
    { id: 'home', l: 'Lessons', icon: Home },
    { id: 'progress', l: 'Progress', icon: TrendingUp },
    { id: 'library', l: 'Library', icon: BookOpen },
    { id: 'reader', l: 'Reader', icon: ScrollText },
    { id: 'settings', l: 'Settings', icon: Settings },
  ];
  return (
    <div className="min-h-screen w-full relative pb-24" style={{ ...bg, fontFamily: prefs.fontSize === 'large' ? 'Verdana, sans-serif' : '"Bodoni Moda", Georgia, serif' }}>
      <div className="sticky top-0 z-40 bg-stone-900 text-amber-50 px-6 py-3 border-b-4 border-red-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-300" />
          <div className="text-xl font-black">MAXI<em className="italic font-normal text-amber-300">mize</em></div>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-amber-300" style={{ fontFamily: '"Futura", sans-serif' }}>
          {tabs.find(t => t.id === tab)?.l}
        </div>
      </div>
      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto">{children}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t-4 border-red-700 z-50">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map(t => {
            const I = t.icon, on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all relative ${on ? 'text-amber-300' : 'text-stone-400 hover:text-amber-100'}`}
                style={{ fontFamily: '"Futura", sans-serif' }}>
                {on && <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-red-700" />}
                <I className="w-5 h-5" strokeWidth={on ? 2.5 : 1.5} />
                <div className="text-[10px] tracking-widest uppercase font-bold">{t.l}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============== HOME TAB ==============
function HomeTab({ classes, customLessons, setCustomLessons, onPick, completed, profile }) {
  const [show, setShow] = useState(false);
  const [t, setT] = useState(''), [d, setD] = useState(''), [s, setS] = useState('balanced');

  // Each linked class becomes ONE multi-unit course, scaled to its uploaded material.
  const classTopics = classes.map(c => ({
    id: `class-${c.id}`,
    title: c.name,
    emoji: '📘',
    source: c.name,
    fromClass: true,
    // Estimate word count from uploaded files (rough: 500 words/file) so the plan scales.
    wordCount: (c.files?.length || 1) * 600 + 900,
  }));

  const add = () => {
    if (t.trim()) {
      setCustomLessons([...customLessons, { id: `c-${Date.now()}`, title: t, description: d, style: s, emoji: '✨', source: 'Custom', isCustom: true }]);
      setT(''); setD(''); setS('balanced'); setShow(false);
    }
  };

  // Personalized greeting based on feeling
  const greeting = profile?.feeling === 'overwhelmed' ? 'No rush — pick what feels manageable.'
    : profile?.feeling === 'behind' ? "Let's catch you up, one step at a time."
    : profile?.feeling === 'frustrated' ? "Today's the day things click. Let's go."
    : profile?.feeling === 'curious' ? "Where should that curiosity take you?"
    : 'Ready when you are.';

  return (
    <div>
      <div className="bg-amber-50/80 border-4 border-stone-900 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-red-800 font-bold mb-1" style={{ fontFamily: '"Futura", sans-serif' }}>Welcome Back</div>
          <h2 className="text-3xl font-black text-stone-900">Ready to <em className="italic text-red-800">learn?</em></h2>
          <p className="text-sm text-stone-700 mt-2 italic">{greeting}</p>
        </div>
        <div className="flex items-center gap-2 bg-red-700 text-amber-50 px-4 py-2" style={{ fontFamily: '"Futura", sans-serif' }}>
          <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
          <div className="text-sm uppercase tracking-widest">3 Day Streak</div>
        </div>
      </div>

      {show ? (
        <div className="bg-stone-900 text-amber-50 border-4 border-red-700 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-amber-300" /><div className="font-bold text-xl">Create a Custom Lesson</div></div>
            <button onClick={() => setShow(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <input value={t} onChange={e => setT(e.target.value)} placeholder="What do you want to learn?"
              className="w-full p-3 bg-stone-800 border-2 border-stone-700 text-amber-50 focus:outline-none focus:border-amber-300" />
            <textarea value={d} onChange={e => setD(e.target.value)} rows={3} placeholder="What should it cover? (optional)"
              className="w-full p-3 bg-stone-800 border-2 border-stone-700 text-amber-50 focus:outline-none focus:border-amber-300 resize-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'visual-heavy', l: 'Visual-Heavy', d: 'Lots of diagrams' },
                { id: 'story', l: 'Story-Based', d: 'Narrative flow' },
                { id: 'balanced', l: 'Balanced', d: 'A bit of everything' },
                { id: 'practical', l: 'Practical', d: 'Examples first' },
              ].map(o => (
                <button key={o.id} onClick={() => setS(o.id)}
                  className={`p-3 border-2 text-left transition-all ${s === o.id ? 'border-amber-300 bg-red-700' : 'border-stone-700 hover:border-amber-300'}`}>
                  <div className="text-sm font-bold">{o.l}</div>
                  <div className="text-xs text-stone-300">{o.d}</div>
                </button>
              ))}
            </div>
            <button onClick={add} disabled={!t.trim()}
              className={`w-full p-3 tracking-widest uppercase text-sm ${t.trim() ? 'bg-amber-300 text-stone-900 hover:bg-amber-400' : 'bg-stone-700 text-stone-500'}`}
              style={{ fontFamily: '"Futura", sans-serif' }}>Generate Lesson</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)}
          className="w-full p-5 mb-6 bg-stone-900 text-amber-50 border-4 border-red-700 hover:bg-red-800 transition-all flex items-center justify-between shadow-[6px_6px_0_rgba(180,83,9,0.6)] hover:shadow-[3px_3px_0_rgba(180,83,9,0.6)] hover:translate-x-[3px] hover:translate-y-[3px]">
          <div className="flex items-center gap-3">
            <Wand2 className="w-6 h-6 text-amber-300" />
            <div className="text-left">
              <div className="font-bold text-lg">Create Custom Lesson</div>
              <div className="text-xs text-stone-300 tracking-widest uppercase" style={{ fontFamily: '"Futura", sans-serif' }}>Tell us what to teach</div>
            </div>
          </div>
          <Plus className="w-6 h-6" />
        </button>
      )}

      {customLessons.length > 0 && <>
        <Section title="Your Custom Lessons" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {customLessons.map(t => <LessonCard key={t.id} topic={t} onClick={() => onPick(t)} done={completed.includes(t.id)} hi />)}
        </div>
      </>}

      {classTopics.length > 0 && <>
        <Section title="From Your Classes" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {classTopics.map(t => <LessonCard key={t.id} topic={t} onClick={() => onPick(t)} done={completed.includes(t.id)} />)}
        </div>
      </>}

      <Section title="Featured Lessons" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTopics.map(t => <LessonCard key={t.id} topic={t} onClick={() => onPick(t)} done={completed.includes(t.id)} />)}
      </div>
    </div>
  );
}

function Section({ title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="text-xs uppercase tracking-[0.3em] text-stone-700 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>{title}</div>
      <div className="flex-1 h-[2px] bg-stone-700/30" />
    </div>
  );
}

function LessonCard({ topic, onClick, done, hi }) {
  return (
    <button onClick={onClick}
      className={`text-left p-5 border-2 transition-all relative ${
        hi ? 'bg-amber-300 border-stone-900 hover:bg-amber-400 shadow-[4px_4px_0_rgba(180,83,9,0.6)] hover:shadow-[2px_2px_0_rgba(180,83,9,0.6)] hover:translate-x-[2px] hover:translate-y-[2px]'
        : 'bg-amber-50/80 border-stone-700 hover:border-stone-900 hover:bg-amber-50 shadow-[3px_3px_0_rgba(180,83,9,0.4)]'}`}>
      {done && <div className="absolute top-3 right-3 w-7 h-7 bg-green-700 text-amber-50 flex items-center justify-center"><Check className="w-4 h-4" strokeWidth={3} /></div>}
      <div className="text-3xl mb-3">{topic.emoji}</div>
      <div className="text-base font-bold text-stone-900 mb-2 pr-8 leading-tight">{topic.title}</div>
      <div className="text-xs uppercase tracking-widest text-stone-600" style={{ fontFamily: '"Futura", sans-serif' }}>{topic.source}</div>
    </button>
  );
}

// ============== PROGRESS TAB ==============
function ProgressTab({ completed, classes, profile }) {
  const mins = completed.length * 12 + 35;
  const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const wd = [25, 18, 32, 0, 15, 28, 12];
  const goals = [
    { l: 'First Lesson', n: 1, icon: BookOpen, cur: completed.length },
    { l: '5 Lessons', n: 5, icon: Star, cur: completed.length },
    { l: '10 Lessons', n: 10, icon: Trophy, cur: completed.length },
    { l: 'Week Warrior', n: 7, icon: Flame, cur: 3 },
  ];

  const goalLabels = {
    grades: 'Better grades', understanding: 'Deeper understanding',
    confidence: 'More confidence', efficiency: 'Smarter studying', curiosity: 'Following curiosity'
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat l="Lessons" v={completed.length} icon={BookOpen} c="bg-red-700" />
        <Stat l="Streak" v={3} icon={Flame} c="bg-amber-500" />
        <Stat l="Minutes" v={mins} icon={Clock} c="bg-stone-900" />
        <Stat l="Classes" v={classes.length} icon={GraduationCap} c="bg-blue-700" />
      </div>

      {profile?.goal && (
        <div className="bg-stone-900 text-amber-50 border-4 border-amber-300 p-5 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
          <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold mb-2" style={{ fontFamily: '"Futura", sans-serif' }}>Your North Star</div>
          <div className="text-2xl font-bold flex items-center gap-3">
            <Target className="w-6 h-6 text-amber-300" />
            {goalLabels[profile.goal]}
          </div>
          <div className="text-sm text-stone-300 mt-2 italic">Every lesson is shaped toward this.</div>
        </div>
      )}

      <div className="bg-amber-50/80 border-4 border-stone-900 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-black text-stone-900">This Week</h3>
          <div className="text-xs uppercase tracking-widest text-stone-600" style={{ fontFamily: '"Futura", sans-serif' }}>Daily Focus</div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {week.map((d, i) => {
            const h = Math.max((wd[i] / 35) * 100, 4);
            const today = i === 2;
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-stone-700">{wd[i]}m</div>
                <div className="w-full bg-amber-200/60 border-2 border-stone-700 relative" style={{ height: '120px' }}>
                  <div className={`absolute bottom-0 left-0 right-0 ${today ? 'bg-red-700' : 'bg-stone-900'}`} style={{ height: `${h}%` }} />
                </div>
                <div className={`text-xs uppercase font-bold ${today ? 'text-red-800' : 'text-stone-700'}`} style={{ fontFamily: '"Futura", sans-serif' }}>{d}</div>
              </div>
            );
          })}
        </div>
      </div>

      <Section title="Milestones" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {goals.map((g, i) => {
          const I = g.icon, earned = g.cur >= g.n;
          return (
            <div key={i} className={`p-4 border-2 text-center ${earned ? 'bg-red-700 text-amber-50 border-stone-900 shadow-[3px_3px_0_rgba(180,83,9,0.6)]' : 'bg-amber-50/50 border-stone-400 text-stone-500'}`}>
              <I className={`w-8 h-8 mx-auto mb-2 ${earned ? 'fill-amber-300 text-amber-300' : ''}`} strokeWidth={1.5} />
              <div className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>{g.l}</div>
              {!earned && <div className="text-[10px] mt-1 opacity-70">{g.cur}/{g.n}</div>}
            </div>
          );
        })}
      </div>

      <Section title="Your Learning Profile" />
      <div className="bg-amber-50/80 border-2 border-stone-700 p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Fact l="Style" v={profile?.modality} />
          <Fact l="Pace" v={profile?.pace} />
          <Fact l="Focus" v={profile?.attention} />
          <Fact l="Level" v={profile?.level} />
          <Fact l="Session Time" v={profile?.time} />
          <Fact l="Motivation" v={profile?.motivation} />
        </div>
      </div>
    </div>
  );
}

function Stat({ l, v, icon: I, c }) {
  return (
    <div className={`${c} text-amber-50 p-4 border-2 border-stone-900 shadow-[3px_3px_0_rgba(180,83,9,0.6)]`}>
      <I className="w-5 h-5 mb-2" strokeWidth={1.5} />
      <div className="text-3xl font-black">{v}</div>
      <div className="text-xs uppercase tracking-widest mt-1" style={{ fontFamily: '"Futura", sans-serif' }}>{l}</div>
    </div>
  );
}

function Fact({ l, v }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-stone-600 mb-1" style={{ fontFamily: '"Futura", sans-serif' }}>{l}</div>
      <div className="text-stone-900 font-bold capitalize">{v || '—'}</div>
    </div>
  );
}

// ============== LIBRARY TAB ==============
function LibraryTab({ classes, setClasses }) {
  const [show, setShow] = useState(false);
  const [nc, setNc] = useState({ name: '', platform: '', url: '', files: [] });
  const platforms = [
    { id: 'canvas', n: 'Canvas', c: '#dc2626' },
    { id: 'blackboard', n: 'Blackboard', c: '#1f2937' },
    { id: 'google', n: 'Google Classroom', c: '#0369a1' },
    { id: 'moodle', n: 'Moodle', c: '#ea580c' },
    { id: 'schoology', n: 'Schoology', c: '#0891b2' },
    { id: 'other', n: 'Other', c: '#78350f' },
  ];
  const upload = (e) => setNc({ ...nc, files: [...nc.files, ...Array.from(e.target.files || []).map(f => ({ name: f.name }))] });
  const add = () => { if (nc.name && nc.platform) { setClasses([...classes, { ...nc, id: Date.now() }]); setNc({ name: '', platform: '', url: '', files: [] }); setShow(false); } };

  return (
    <div>
      <div className="bg-amber-50/80 border-4 border-stone-900 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
        <h2 className="text-3xl font-black text-stone-900 mb-2">Your <em className="italic text-red-800">Library.</em></h2>
        <p className="text-stone-700">Linked classes and uploaded materials. The more you add, the better Maximize personalizes.</p>
      </div>

      {classes.length > 0 && <>
        <Section title={`Linked Classes (${classes.length})`} />
        <div className="space-y-3 mb-6">
          {classes.map(cls => {
            const p = platforms.find(x => x.id === cls.platform);
            return (
              <div key={cls.id} className="bg-amber-50/80 border-2 border-stone-900 p-5 shadow-[3px_3px_0_rgba(180,83,9,0.5)] flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 flex items-center justify-center text-amber-50 font-bold shrink-0" style={{ backgroundColor: p?.c }}>
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-stone-900 text-lg">{cls.name}</div>
                    <div className="text-sm text-stone-600 flex items-center gap-2 mt-1"><Globe className="w-3 h-3" /> {p?.n}</div>
                    {cls.files.length > 0 && <div className="text-xs text-stone-600 mt-2 flex items-center gap-1"><FileText className="w-3 h-3" /> {cls.files.length} file{cls.files.length !== 1 ? 's' : ''}</div>}
                  </div>
                </div>
                <button onClick={() => setClasses(classes.filter(c => c.id !== cls.id))} className="text-stone-500 hover:text-red-700"><X className="w-5 h-5" /></button>
              </div>
            );
          })}
        </div>
      </>}

      {show ? (
        <div className="bg-stone-900 text-amber-50 border-4 border-red-700 p-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-xl flex items-center gap-2"><Plus className="w-5 h-5 text-amber-300" /> New Class</div>
            <button onClick={() => setShow(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <input value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} placeholder="Class name"
              className="w-full p-3 bg-stone-800 border-2 border-stone-700 text-amber-50 focus:outline-none focus:border-amber-300" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {platforms.map(p => (
                <button key={p.id} onClick={() => setNc({ ...nc, platform: p.id })}
                  className={`p-2 border-2 text-sm ${nc.platform === p.id ? 'border-amber-300 bg-red-700' : 'border-stone-700 hover:border-amber-300'}`}>{p.n}</button>
              ))}
            </div>
            <input value={nc.url} onChange={e => setNc({ ...nc, url: e.target.value })} placeholder="Class URL (optional)"
              className="w-full p-3 bg-stone-800 border-2 border-stone-700 text-amber-50 focus:outline-none focus:border-amber-300" />
            <label className="block w-full p-5 border-2 border-dashed border-stone-700 text-center cursor-pointer hover:border-amber-300">
              <Upload className="w-6 h-6 mx-auto mb-2 text-amber-300" strokeWidth={1.5} />
              <div className="text-sm">Upload syllabi, slides, notes</div>
              <input type="file" multiple onChange={upload} className="hidden" />
            </label>
            {nc.files.length > 0 && nc.files.map((f, i) => <div key={i} className="text-xs flex items-center gap-2"><FileText className="w-3 h-3" /> {f.name}</div>)}
            <button onClick={add} disabled={!nc.name || !nc.platform}
              className={`w-full p-3 tracking-widest uppercase text-sm ${nc.name && nc.platform ? 'bg-amber-300 text-stone-900 hover:bg-amber-400' : 'bg-stone-700 text-stone-500'}`}
              style={{ fontFamily: '"Futura", sans-serif' }}>Save Class</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="w-full p-6 border-4 border-dashed border-stone-700 bg-amber-50/40 hover:bg-amber-100/60 transition-all">
          <Plus className="w-8 h-8 mx-auto mb-2 text-stone-700" strokeWidth={2} />
          <div className="text-stone-800 font-bold tracking-widest uppercase text-sm" style={{ fontFamily: '"Futura", sans-serif' }}>Add a Class</div>
        </button>
      )}
    </div>
  );
}

// ============== READER HUB ==============
function ReaderHub({ savedDocs, setSavedDocs, onOpen }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(''), [text, setText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [error, setError] = useState('');
  const fileRef = React.useRef(null);

  const sample = {
    id: 's1', title: 'The Endosymbiotic Theory', type: 'Biology · Sample', wordCount: 320,
    content: `The endosymbiotic theory explains the origin of eukaryotic cells — the kind that have nuclei, like every cell in your body. First proposed in 1905 and popularized by Lynn Margulis in 1967, the theory says that mitochondria and chloroplasts started out as free-living bacteria that were swallowed by larger cells, but never digested.

Mitochondria, the powerhouses that make ATP for energy, came from ancient alphaproteobacteria. Roughly 1.5 to 2 billion years ago, one of these bacteria was engulfed by a host cell. Instead of being destroyed, it stayed alive and provided energy in exchange for shelter. Over time, the relationship became permanent — neither could live without the other.

Chloroplasts, found in plants and algae, came from a similar event. A eukaryotic cell engulfed a cyanobacterium, which already knew how to do photosynthesis. That partnership gave rise to every plant on Earth.

Several pieces of evidence support the theory. Both mitochondria and chloroplasts have their own DNA, separate from the nucleus, and it looks more bacterial than eukaryotic. They have their own ribosomes — and those ribosomes match bacterial ribosomes, not eukaryotic ones. They reproduce by splitting in two, just like bacteria. And they're surrounded by two membranes: the inner one from the original bacterium, the outer one from the host cell's engulfing pouch.

The implications go far beyond biology class. The theory shows that major evolutionary leaps can happen through merger — not just gradual mutation. Cooperation between organisms, not just competition, has shaped life on Earth.`,
  };

  const docs = [sample, ...savedDocs];

  // Load PDF.js from CDN on demand
  const loadPdfJs = () => new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error('Could not load PDF reader'));
    document.body.appendChild(script);
  });

  const extractPdf = async (file) => {
    const pdfjs = await loadPdfJs();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let full = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      setLoadMsg(`Reading page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(it => it.str).join(' ');
      full += pageText + '\n\n';
    }
    return full.trim();
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setLoading(true);
    setLoadMsg('Opening file...');
    try {
      let content = '';
      const name = file.name.replace(/\.[^.]+$/, '');
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        content = await extractPdf(file);
        if (!content || content.length < 20) {
          throw new Error('This PDF has no selectable text — it may be a scanned image. Try a text-based PDF, or paste the text manually.');
        }
      } else if (file.type.startsWith('text/') || /\.(txt|md|csv)$/i.test(file.name)) {
        content = await file.text();
      } else {
        throw new Error('Unsupported file type. Use PDF, TXT, or MD — or paste your text below.');
      }
      const wc = content.trim().split(/\s+/).length;
      const d = { id: `d-${Date.now()}`, title: name, type: 'Uploaded Document', wordCount: wc, content };
      setSavedDocs(prev => [...prev, d]);
      setLoading(false);
      setShow(false);
      onOpen(d);
    } catch (e) {
      setLoading(false);
      setError(e.message || 'Something went wrong reading that file.');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const addPasted = () => {
    if (title.trim() && text.trim()) {
      const wc = text.trim().split(/\s+/).length;
      const d = { id: `d-${Date.now()}`, title, type: 'Pasted Reading', wordCount: wc, content: text };
      setSavedDocs([...savedDocs, d]);
      setTitle(''); setText(''); setShow(false); onOpen(d);
    }
  };

  return (
    <div>
      <div className="bg-amber-50/80 border-4 border-stone-900 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
        <div className="flex items-center gap-3 mb-2">
          <ScrollText className="w-7 h-7 text-red-800" strokeWidth={1.5} />
          <h2 className="text-3xl font-black text-stone-900">Reading <em className="italic text-red-800">Mode.</em></h2>
        </div>
        <p className="text-stone-700 mb-3">Upload a PDF or paste text. Get a quick summary, or highlight any passage for a plain-English explanation, simpler version, or real-world example.</p>
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Highlighter className="w-4 h-4" /><span className="italic">Tip: Select any text in a document to open the helper panel.</span>
        </div>
      </div>

      {/* Drag-and-drop upload zone — always visible */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && fileRef.current?.click()}
        className={`w-full p-8 mb-4 border-4 border-dashed cursor-pointer transition-all text-center ${
          dragging ? 'border-red-700 bg-red-100/60 scale-[1.01]' : 'border-stone-700 bg-amber-50/40 hover:bg-amber-100/60'
        }`}>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,application/pdf,text/plain" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="w-10 h-10 text-red-700 animate-spin" />
            <div className="font-bold text-stone-900 tracking-widest uppercase text-sm" style={{ fontFamily: '"Futura", sans-serif' }}>{loadMsg}</div>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto mb-3 text-red-800" strokeWidth={1.5} />
            <div className="text-xl font-bold text-stone-900 mb-1">Drop a PDF here</div>
            <div className="text-sm text-stone-600">or tap to browse · PDF, TXT, MD supported</div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-700 p-4 mb-4 text-sm text-red-900 flex items-start gap-3">
          <X className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Paste text fallback */}
      {show ? (
        <div className="bg-stone-900 text-amber-50 border-4 border-red-700 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-xl flex items-center gap-2"><Type className="w-5 h-5 text-amber-300" /> Paste Text Instead</div>
            <button onClick={() => setShow(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (e.g. Chapter 3)"
              className="w-full p-3 bg-stone-800 border-2 border-stone-700 text-amber-50 focus:outline-none focus:border-amber-300" />
            <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Paste your reading material..."
              className="w-full p-3 bg-stone-800 border-2 border-stone-700 text-amber-50 focus:outline-none focus:border-amber-300 resize-none" />
            <button onClick={addPasted} disabled={!title.trim() || !text.trim()}
              className={`w-full p-3 tracking-widest uppercase text-sm ${title.trim() && text.trim() ? 'bg-amber-300 text-stone-900 hover:bg-amber-400' : 'bg-stone-700 text-stone-500'}`}
              style={{ fontFamily: '"Futura", sans-serif' }}>Open in Reader</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="text-sm text-stone-700 hover:text-stone-900 underline italic mb-6 block">
          Or paste text manually instead →
        </button>
      )}

      <Section title={`Your Readings (${docs.length})`} />
      <div className="space-y-3">
        {docs.map(d => (
          <button key={d.id} onClick={() => onOpen(d)}
            className="w-full text-left bg-amber-50/80 border-2 border-stone-700 p-5 hover:border-stone-900 hover:bg-amber-50 flex items-center gap-4">
            <ScrollText className="w-8 h-8 text-red-800 shrink-0" strokeWidth={1.5} />
            <div className="flex-1">
              <div className="font-bold text-stone-900 text-lg">{d.title}</div>
              <div className="text-xs uppercase tracking-widest text-stone-600 mt-1" style={{ fontFamily: '"Futura", sans-serif' }}>
                {d.type} · {d.wordCount} words · ~{Math.ceil(d.wordCount / 200)} min read
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============== READER MODE ==============
function Reader({ doc, onExit, prefs, profile }) {
  const [showSummary, setShowSummary] = useState(false);
  const [selected, setSelected] = useState('');
  const [panel, setPanel] = useState(false);
  const [view, setView] = useState('explain');
  const [highlights, setHighlights] = useState([]);

  // AI-driven summary state
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // AI-driven explanation state (cache per text+mode so we don't refetch)
  const [explainCache, setExplainCache] = useState({});
  const [explainLoading, setExplainLoading] = useState(false);

  const onSelect = () => {
    const sel = window.getSelection();
    const t = sel.toString().trim();
    if (t.length > 3) { setSelected(t); setPanel(true); }
  };

  const save = () => {
    if (selected && !highlights.includes(selected)) setHighlights([...highlights, selected]);
    setPanel(false); window.getSelection()?.removeAllRanges();
  };

  // Built-in fallback summary (used if API unavailable)
  const fallbackSummary = "This reading covers its topic in several connected parts. Use the highlight tool on any sentence to get a plain-English explanation, a simpler rewrite, or a real-world example.";
  const fallbackPoints = ['Highlight any sentence to dig deeper', 'Use "Simpler" if the wording is dense', 'Use "Example" to make it concrete'];

  // Fetch summary from API when the user opens it (once)
  const toggleSummary = () => {
    const next = !showSummary;
    setShowSummary(next);
    if (next && !summaryData && !summaryLoading) {
      setSummaryLoading(true);
      summarizeText(doc.content, profile)
        .then(d => setSummaryData({ summary: d.summary, points: d.points || [] }))
        .catch(() => setSummaryData({ summary: fallbackSummary, points: fallbackPoints }))
        .finally(() => setSummaryLoading(false));
    }
  };

  // Built-in fallback explanation
  const fallbackExplain = (text, mode) => {
    const t = text.length > 80 ? text.slice(0, 80) + '...' : text;
    if (mode === 'simpler') return `Plain version: "${t}"\n\nThis is describing something step by step. The technical words are just labels for ideas you can grasp without them.`;
    if (mode === 'example') return `Example: "${t}"\n\nThink of a familiar situation that follows the same pattern — that's usually the fastest way to make an abstract idea click.`;
    return `Explained: "${t}"\n\nThis passage introduces an idea and supports it. The takeaway is the relationship it describes — how one thing connects to or causes another.`;
  };

  // Fetch explanation for current selection+view
  const cacheKey = `${view}::${selected}`;
  useEffect(() => {
    if (!panel || !selected) return;
    if (explainCache[cacheKey]) return; // already have it
    setExplainLoading(true);
    explainText(view, selected, profile)
      .then(txt => setExplainCache(prev => ({ ...prev, [cacheKey]: txt })))
      .catch(() => setExplainCache(prev => ({ ...prev, [cacheKey]: fallbackExplain(selected, view) })))
      .finally(() => setExplainLoading(false));
  }, [panel, view, selected]);

  const explanationText = explainCache[cacheKey];

  const fs = prefs.fontSize === 'large' ? 'text-xl leading-loose' : 'text-lg leading-loose';

  return (
    <div className="relative" style={{ display: 'flex', gap: '1.5rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button onClick={onExit} className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 font-bold tracking-widest uppercase" style={{ fontFamily: '"Futura", sans-serif' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={toggleSummary}
            className={`flex items-center gap-2 px-4 py-2 border-2 transition-all text-sm tracking-widest uppercase ${
              showSummary ? 'bg-red-700 text-amber-50 border-stone-900' : 'bg-amber-50 text-stone-900 border-stone-900 hover:bg-amber-100'}`}
            style={{ fontFamily: '"Futura", sans-serif' }}>
            <Sparkles className="w-4 h-4" /> {showSummary ? 'Hide Summary' : 'Quick Summary'}
          </button>
        </div>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-red-800 font-bold mb-2" style={{ fontFamily: '"Futura", sans-serif' }}>
            {doc.type} · {doc.wordCount} words · ~{Math.ceil(doc.wordCount / 200)} min read
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight" style={{ textShadow: '2px 2px 0 #d97706' }}>{doc.title}</h1>
        </div>

        {showSummary && (
          <div className="bg-stone-900 text-amber-50 border-4 border-amber-300 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>The Short Version</div>
            </div>
            {summaryLoading || !summaryData ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
                <span className="text-amber-100 text-sm italic">Reading and summarizing...</span>
              </div>
            ) : (
              <>
                <p className="text-amber-50 leading-relaxed mb-5 text-lg">{summaryData.summary}</p>
                {summaryData.points?.length > 0 && <>
                  <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold mb-3" style={{ fontFamily: '"Futura", sans-serif' }}>Key Points</div>
                  <ul className="space-y-2">
                    {summaryData.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Star className="w-4 h-4 text-amber-300 mt-1 shrink-0 fill-amber-300" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </>}
              </>
            )}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="bg-amber-100/60 border-2 border-amber-700 p-4 mb-6">
            <div className="text-xs uppercase tracking-widest text-amber-900 font-bold mb-2 flex items-center gap-2" style={{ fontFamily: '"Futura", sans-serif' }}>
              <Bookmark className="w-4 h-4" /> Saved Highlights ({highlights.length})
            </div>
            <div className="space-y-1">
              {highlights.map((h, i) => <div key={i} className="text-sm text-stone-800 italic">"{h.slice(0, 80)}{h.length > 80 ? '...' : ''}"</div>)}
            </div>
          </div>
        )}

        <div className={`bg-amber-50/90 border-4 border-stone-900 p-8 md:p-10 shadow-[8px_8px_0_rgba(180,83,9,0.6)] ${fs}`}
          style={{ fontFamily: prefs.fontSize === 'large' ? 'Verdana, sans-serif' : 'Georgia, serif' }}
          onMouseUp={onSelect} onTouchEnd={onSelect}>
          <div className="text-stone-900 whitespace-pre-line">{doc.content}</div>
          <div className="mt-8 pt-6 border-t-2 border-stone-300 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-stone-600 italic" style={{ fontFamily: '"Futura", sans-serif' }}>★ End of reading ★</div>
            <div className="text-sm text-stone-700 mt-2 italic">Highlight any sentence for an explanation</div>
          </div>
        </div>
      </div>

      {panel && (
        <>
          <div className="fixed inset-0 bg-stone-900/40 z-40 lg:hidden" onClick={() => setPanel(false)} />
          <div className="fixed lg:sticky lg:top-20 inset-x-0 bottom-0 lg:inset-auto lg:self-start z-50 lg:z-auto lg:w-[360px] lg:shrink-0 bg-stone-900 text-amber-50 border-4 border-amber-300 shadow-[8px_8px_0_rgba(180,83,9,0.8)] max-h-[80vh] lg:max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-amber-300">
              <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>Maximize Helper</div>
              <button onClick={() => setPanel(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex border-b-2 border-amber-300">
              {[
                { id: 'explain', l: 'Explain', icon: Lightbulb },
                { id: 'simpler', l: 'Simpler', icon: Type },
                { id: 'example', l: 'Example', icon: Sparkles },
              ].map(t => {
                const I = t.icon, on = view === t.id;
                return (
                  <button key={t.id} onClick={() => setView(t.id)}
                    className={`flex-1 px-3 py-3 flex items-center justify-center gap-2 text-xs tracking-widest uppercase ${on ? 'bg-amber-300 text-stone-900 font-bold' : 'text-amber-300 hover:bg-stone-800'}`}
                    style={{ fontFamily: '"Futura", sans-serif' }}>
                    <I className="w-4 h-4" /> {t.l}
                  </button>
                );
              })}
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold mb-3" style={{ fontFamily: '"Futura", sans-serif' }}>
                {view === 'explain' ? 'What this means' : view === 'simpler' ? 'In simpler words' : 'A real-world example'}
              </div>
              {explainLoading && !explanationText ? (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
                  <span className="text-amber-100 text-sm italic">Thinking...</span>
                </div>
              ) : (
                <p className="leading-relaxed whitespace-pre-line text-sm">{explanationText}</p>
              )}
            </div>
            <div className="flex border-t-2 border-stone-700">
              <button onClick={save} className="flex-1 px-4 py-3 text-xs tracking-widest uppercase text-amber-300 hover:bg-stone-800 flex items-center justify-center gap-2" style={{ fontFamily: '"Futura", sans-serif' }}>
                <Bookmark className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setPanel(false)} className="flex-1 px-4 py-3 text-xs tracking-widest uppercase text-stone-400 hover:bg-stone-800 border-l-2 border-stone-700" style={{ fontFamily: '"Futura", sans-serif' }}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============== SETTINGS TAB ==============
function SettingsTab({ profile, prefs, setPrefs, onReset }) {
  return (
    <div>
      <div className="bg-amber-50/80 border-4 border-stone-900 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
        <h2 className="text-3xl font-black text-stone-900 mb-2">Settings.</h2>
        <p className="text-stone-700 text-sm">Customize how Maximize looks and behaves. Changes apply across the app.</p>
      </div>

      <Section title="Reading & Text" />
      <div className="bg-amber-50/80 border-2 border-stone-700 p-5 mb-6 space-y-5">
        <Row l="Font Size" icon={Type}>
          <div className="flex gap-2">
            {['small', 'normal', 'large'].map(s => (
              <button key={s} onClick={() => setPrefs({ ...prefs, fontSize: s })}
                className={`px-4 py-2 border-2 text-xs tracking-widest uppercase ${prefs.fontSize === s ? 'bg-stone-900 text-amber-50 border-stone-900' : 'bg-amber-100/60 text-stone-700 border-stone-400 hover:border-stone-700'}`}
                style={{ fontFamily: '"Futura", sans-serif' }}>{s}</button>
            ))}
          </div>
        </Row>
      </div>

      <Section title="Visual" />
      <div className="bg-amber-50/80 border-2 border-stone-700 p-5 mb-6 space-y-5">
        <Row l="Show Diagrams" icon={Eye}><Toggle v={prefs.showImages} onChange={x => setPrefs({ ...prefs, showImages: x })} /></Row>
        <Row l="Show Progress Bars" icon={Sliders}><Toggle v={prefs.showProgress} onChange={x => setPrefs({ ...prefs, showProgress: x })} /></Row>
        <Row l="Sound Effects" icon={Volume2}><Toggle v={prefs.sounds} onChange={x => setPrefs({ ...prefs, sounds: x })} /></Row>
      </div>

      <Section title="Your Profile" />
      <div className="bg-amber-50/80 border-2 border-stone-700 p-5">
        <div className="text-sm text-stone-700 mb-4">Based on your survey, these accommodations are active. Retake the survey to update.</div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {profile?.hasADHD && <Tag>ADHD-friendly</Tag>}
          {profile?.hasDyslexia && <Tag>Dyslexia support</Tag>}
          {profile?.hasAnxiety && <Tag>Low-pressure</Tag>}
          {profile?.hasSensory && <Tag>Reduced motion</Tag>}
          {profile?.hasLanguage && <Tag>Simpler language</Tag>}
          {profile?.encouragingTone && <Tag>Encouraging tone</Tag>}
          {!profile?.hasADHD && !profile?.hasDyslexia && !profile?.hasAnxiety && !profile?.hasSensory && !profile?.hasLanguage && !profile?.encouragingTone && (
            <div className="col-span-2 text-stone-600 italic text-sm">No accommodations active.</div>
          )}
        </div>
        <button onClick={onReset} className="text-sm text-red-800 hover:text-red-900 underline italic">Retake the survey</button>
      </div>
    </div>
  );
}

function Row({ l, icon: I, children }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <I className="w-5 h-5 text-stone-700" strokeWidth={1.5} />
        <div className="font-bold text-stone-900">{l}</div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ v, onChange }) {
  return (
    <button onClick={() => onChange(!v)} className={`w-14 h-7 border-2 border-stone-900 relative ${v ? 'bg-red-700' : 'bg-amber-100'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-amber-50 border border-stone-900 transition-all ${v ? 'left-7' : 'left-0.5'}`} />
    </button>
  );
}

function Tag({ children }) {
  return <div className="px-3 py-2 bg-red-700 text-amber-50 text-xs tracking-widest uppercase font-bold text-center" style={{ fontFamily: '"Futura", sans-serif' }}>✓ {children}</div>;
}

// ============== COURSE OVERVIEW (multi-unit study plan) ==============
function CourseOverview({ course, profile, completed, onPickLesson, onExit, prefs }) {
  const plan = getCourse(course, profile);

  // Flatten all lessons to compute progress
  const allLessons = plan.units.flatMap(u => u.lessons);
  const doneCount = allLessons.filter(l => completed.includes(l.id)).length;
  const pct = Math.round((doneCount / allLessons.length) * 100);
  const totalMin = allLessons.reduce((s, l) => s + (l.minutes || 10), 0);

  // Find the next uncompleted lesson (for "continue" / unlocking)
  let nextIdx = allLessons.findIndex(l => !completed.includes(l.id));
  if (nextIdx === -1) nextIdx = allLessons.length; // all done

  return (
    <div>
      <button onClick={onExit} className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 font-bold tracking-widest uppercase mb-6" style={{ fontFamily: '"Futura", sans-serif' }}>
        <ArrowLeft className="w-4 h-4" /> All Lessons
      </button>

      {/* Course header */}
      <div className="bg-stone-900 text-amber-50 border-4 border-red-700 p-6 md:p-8 mb-6 shadow-[8px_8px_0_rgba(180,83,9,0.6)]">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl">{course.emoji}</div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold mb-1" style={{ fontFamily: '"Futura", sans-serif' }}>
              {plan.units.length}-Unit Study Plan
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">{course.title}</h1>
          </div>
        </div>
        <p className="text-stone-300 leading-relaxed mb-5">{plan.intro}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-5 text-sm">
          <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-amber-300" /> {plan.units.length} units</div>
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-300" /> {allLessons.length} lessons</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-300" /> ~{Math.round(totalMin / 60 * 10) / 10} hrs total</div>
        </div>

        {/* Progress bar */}
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest" style={{ fontFamily: '"Futura", sans-serif' }}>
          <span className="text-amber-300 font-bold">Your Progress</span>
          <span>{doneCount} / {allLessons.length} done · {pct}%</span>
        </div>
        <div className="h-3 bg-stone-800 border-2 border-amber-300 overflow-hidden">
          <div className="h-full bg-amber-300 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Units */}
      <div className="space-y-6">
        {plan.units.map((unit, uIdx) => {
          // Compute the running global index for each lesson to handle lock state
          const lessonsBefore = plan.units.slice(0, uIdx).reduce((s, u) => s + u.lessons.length, 0);
          const unitDone = unit.lessons.every(l => completed.includes(l.id));
          return (
            <div key={uIdx} className="bg-amber-50/80 border-4 border-stone-900 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
              {/* Unit header */}
              <div className="p-5 border-b-2 border-stone-300 flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center font-black text-xl shrink-0 ${unitDone ? 'bg-green-700 text-amber-50' : 'bg-red-700 text-amber-50'}`} style={{ fontFamily: '"Bodoni Moda", Georgia, serif' }}>
                  {unitDone ? <Check className="w-6 h-6" strokeWidth={3} /> : uIdx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-[0.3em] text-red-800 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>Unit {uIdx + 1}</div>
                  <h3 className="text-xl font-bold text-stone-900 leading-tight">{unit.title}</h3>
                </div>
              </div>
              {/* Unit description */}
              {unit.description && <div className="px-5 pt-4 text-sm text-stone-700 italic">{unit.description}</div>}
              {/* Lessons in unit */}
              <div className="p-5 space-y-2">
                {unit.lessons.map((lesson, lIdx) => {
                  const globalIdx = lessonsBefore + lIdx;
                  const isDone = completed.includes(lesson.id);
                  const isLocked = globalIdx > nextIdx; // can't skip ahead
                  const isNext = globalIdx === nextIdx;
                  return (
                    <button key={lesson.id}
                      onClick={() => !isLocked && onPickLesson(lesson)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 border-2 transition-all flex items-center gap-3 ${
                        isDone ? 'border-green-700 bg-green-50' :
                        isNext ? 'border-stone-900 bg-amber-100 hover:bg-amber-200 shadow-[3px_3px_0_rgba(180,83,9,0.4)]' :
                        isLocked ? 'border-stone-300 bg-stone-100/50 cursor-not-allowed opacity-60' :
                        'border-stone-400 bg-amber-50/60 hover:border-stone-700'
                      }`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6 text-green-700 shrink-0" />
                        : isLocked ? <Lock className="w-5 h-5 text-stone-400 shrink-0" />
                        : isNext ? <PlayCircle className="w-6 h-6 text-red-700 shrink-0" />
                        : <Circle className="w-6 h-6 text-stone-400 shrink-0" />}
                      <div className="flex-1">
                        <div className="font-bold text-stone-900">{lesson.title}</div>
                        <div className="text-xs text-stone-600 flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3" /> ~{lesson.minutes || 10} min
                          {lesson.kind && <span className="uppercase tracking-wider">· {lesson.kind}</span>}
                        </div>
                      </div>
                      {isNext && <span className="text-xs uppercase tracking-widest text-red-700 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>Start</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {pct === 100 && (
        <div className="mt-6 bg-stone-900 text-amber-50 border-4 border-amber-300 p-6 text-center shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
          <Trophy className="w-12 h-12 mx-auto text-amber-300 mb-3 fill-amber-300" />
          <div className="text-2xl font-black mb-1">Course Complete!</div>
          <div className="text-stone-300">You finished all {allLessons.length} lessons. That's real work — well done.</div>
        </div>
      )}
    </div>
  );
}

// ============== LESSON ==============
function Lesson({ topic, profile, progress, setProgress, onExit, onDone, prefs }) {
  // Course lessons carry _src (the content key) and a unique id for tracking.
  const contentKey = topic._src || topic.id;

  // chunks come from the AI API; if it fails, we fall back to built-in content.
  const [chunks, setChunks] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setChunks(null);
    setUsedFallback(false);
    generateLesson(
      { title: topic.title, description: topic.description, kind: topic.kind },
      profile,
      topic._sourceText // uploaded class material, if present
    )
      .then(lesson => {
        if (cancelled) return;
        if (lesson?.chunks?.length) setChunks(lesson.chunks);
        else throw new Error('empty');
      })
      .catch(() => {
        if (cancelled) return;
        // Graceful fallback so the app always works, even with no API/network.
        setChunks(getLessonContent(contentKey, profile, topic).chunks);
        setUsedFallback(true);
      });
    return () => { cancelled = true; };
  }, [topic.id]);

  const total = chunks ? chunks.length : 0;
  const done = chunks ? progress >= total : false;

  // Fire completion when finished (hook must run every render, before any return)
  useEffect(() => { if (done) onDone(); }, [done]);

  const fs = prefs.fontSize === 'large' ? 'text-xl leading-loose' : 'text-lg leading-relaxed';

  // Loading state while the AI writes the lesson
  if (!chunks) {
    return (
      <div className="max-w-xl mx-auto text-center mt-20">
        <Loader2 className="w-12 h-12 text-red-700 animate-spin mx-auto mb-4" />
        <div className="text-stone-800 font-bold tracking-widest uppercase text-sm" style={{ fontFamily: '"Futura", sans-serif' }}>
          Your tutor is writing this lesson...
        </div>
        <div className="text-stone-600 text-sm mt-2 italic">Tailoring it to how you learn.</div>
      </div>
    );
  }

  const cur = chunks[progress];

  if (done) {
    // Personalized completion message
    const finishMsg = profile?.feeling === 'overwhelmed' ? "You showed up. That's the hardest part. Be proud."
      : profile?.feeling === 'frustrated' ? "See? You CAN do this. Remember this feeling."
      : profile?.feeling === 'behind' ? "One more lesson down. You're catching up."
      : profile?.encouragingTone ? "Nicely done. Real progress."
      : profile?.hasAnxiety ? "Nicely done. You moved at your own pace — that's what matters."
      : "You worked through every section. Great focus.";

    return (
      <div className="max-w-xl mx-auto text-center mt-12">
        <div className="inline-block mb-6"><Burst /></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-700 text-amber-50 text-xs tracking-[0.3em] uppercase mb-6" style={{ fontFamily: '"Futura", sans-serif' }}>
          <Star className="w-3 h-3 fill-amber-50" /> The End
        </div>
        <h3 className="text-5xl font-black text-stone-900 mb-4" style={{ textShadow: '3px 3px 0 #d97706' }}>That's a <em className="italic text-red-800">wrap.</em></h3>
        <p className="text-stone-700 mb-8 text-lg">{finishMsg}</p>
        <button onClick={onExit} className="bg-stone-900 text-amber-50 px-7 py-4 hover:bg-red-800 inline-flex items-center gap-2 tracking-widest uppercase text-sm shadow-[6px_6px_0_rgba(180,83,9,0.8)]" style={{ fontFamily: '"Futura", sans-serif' }}>
          Back to Lessons <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onExit} className="text-sm text-stone-700 hover:text-stone-900 font-bold tracking-widest uppercase flex items-center gap-2" style={{ fontFamily: '"Futura", sans-serif' }}>
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="text-xs tracking-[0.3em] uppercase text-stone-700 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>{progress + 1} / {total}</div>
      </div>

      {prefs.showProgress && (
        <div className="mb-8">
          <div className="h-2 bg-amber-100 border-2 border-stone-900 overflow-hidden">
            <div className="h-full bg-red-700 transition-all duration-500" style={{ width: `${((progress + 1) / total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-3xl mb-2">{topic.emoji}</div>
        <h3 className="text-sm uppercase tracking-widest text-red-800 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>{topic.title}</h3>
      </div>

      <div className="bg-amber-50/80 border-4 border-stone-900 p-6 md:p-8 mb-6 shadow-[8px_8px_0_rgba(180,83,9,0.6)]" key={progress}>
        {cur.heading && <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-5 leading-tight">{cur.heading}</h2>}
        {cur.type === 'text' && <p className={`text-stone-800 ${fs}`}>{cur.body}</p>}
        {cur.type === 'interactive' && <Interactive c={cur} fs={fs} profile={profile} />}
        {cur.type === 'check' && <CheckQ c={cur} profile={profile} fs={fs} />}
      </div>

      <button onClick={() => setProgress(progress + 1)}
        className="inline-flex items-center gap-3 bg-stone-900 text-amber-50 px-8 py-4 hover:bg-red-800 tracking-widest uppercase text-sm shadow-[6px_6px_0_rgba(180,83,9,0.8)] hover:shadow-[3px_3px_0_rgba(180,83,9,0.8)] hover:translate-x-[3px] hover:translate-y-[3px]"
        style={{ fontFamily: '"Futura", sans-serif' }}>
        {progress === total - 1 ? 'Finish Lesson' : 'Continue'} <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function Interactive({ c, fs, profile }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <p className={`text-stone-800 mb-6 ${fs}`}>{c.body}</p>
      <div className="p-6 bg-stone-900 text-amber-50 border-2 border-red-700">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-300 mb-3 flex items-center gap-2 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>
          <Lightbulb className="w-4 h-4" /> Your Turn
        </div>
        <div className="text-lg mb-5">{c.prompt}</div>
        {!show ? (
          <button onClick={() => setShow(true)} className="border-2 border-amber-300 text-amber-300 px-5 py-2 hover:bg-amber-300 hover:text-stone-900 tracking-widest uppercase text-sm" style={{ fontFamily: '"Futura", sans-serif' }}>
            Reveal Answer
          </button>
        ) : <div className="border-t-2 border-amber-900 pt-4">{c.answer}</div>}
      </div>
    </div>
  );
}

function CheckQ({ c, profile, fs }) {
  const [sel, setSel] = useState(null);
  // Encouraging message before quiz for users who feel overwhelmed/frustrated
  const showEncouragement = profile?.gentleFeedback || profile?.encouragingTone;

  return (
    <div>
      <h3 className="text-2xl font-bold text-stone-900 mb-5">{c.question}</h3>
      {showEncouragement && <p className="text-sm text-stone-600 italic mb-5">No pressure — wrong guesses are how we learn. Trust your gut.</p>}
      <div className="space-y-3">
        {c.options.map((o, i) => {
          const on = sel === i, right = i === c.correct, showR = sel !== null;
          let cls = 'border-stone-700 bg-amber-100/60 hover:bg-amber-200/80';
          if (showR && right) cls = 'border-green-700 bg-green-100';
          else if (showR && on && !right) cls = 'border-red-700 bg-red-100';
          return (
            <button key={i} onClick={() => sel === null && setSel(i)} disabled={sel !== null}
              className={`w-full text-left p-4 border-2 ${cls}`}>
              <div className="flex items-center justify-between">
                <span className="text-stone-800">{o}</span>
                {showR && right && <Check className="w-5 h-5 text-green-700" strokeWidth={2.5} />}
              </div>
            </button>
          );
        })}
      </div>
      {sel !== null && <div className="mt-5 p-4 bg-stone-900 text-amber-50 text-sm leading-relaxed border-2 border-red-700">{sel === c.correct ? '★ ' : (profile?.encouragingTone ? 'Good guess — here\'s the answer: ' : '')}{c.explanation}</div>}
    </div>
  );
}

// ============== ONBOARDING SCREENS ==============
function Splash({ onGo, bg }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden" style={{ ...bg, fontFamily: '"Bodoni Moda", Georgia, serif' }}>
      <div className="absolute top-12 left-12 text-orange-500 opacity-60"><Burst /></div>
      <div className="absolute bottom-16 right-12 text-red-500 opacity-60"><Burst /></div>
      <div className="absolute top-1/3 right-20"><Star className="w-4 h-4 text-amber-700 fill-amber-700" /></div>
      <div className="absolute bottom-1/3 left-16"><Star className="w-3 h-3 text-red-600 fill-red-600" /></div>

      <div className="max-w-3xl w-full text-center relative z-10">
        <div className="inline-flex items-center gap-3 mb-8 px-5 py-2 bg-red-700 text-amber-50 tracking-[0.4em] text-xs uppercase shadow-lg" style={{ fontFamily: '"Futura", sans-serif' }}>
          <Film className="w-3 h-3" /> Now Presenting <Film className="w-3 h-3" />
        </div>

        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 flex items-center justify-center -z-0"><BigBurst /></div>
          <h1 className="relative text-7xl md:text-9xl font-black text-stone-900 tracking-tight leading-none px-8" style={{ textShadow: '4px 4px 0 #d97706, 8px 8px 0 #b91c1c', letterSpacing: '-0.04em' }}>
            MAXI<em className="italic">mize</em>
          </h1>
        </div>

        <div className="my-8 flex items-center justify-center gap-4">
          <div className="h-[2px] w-16 bg-stone-900" />
          <div className="text-stone-900 tracking-[0.5em] text-sm uppercase font-semibold" style={{ fontFamily: '"Futura", sans-serif' }}>A Learning Picture</div>
          <div className="h-[2px] w-16 bg-stone-900" />
        </div>

        <p className="text-xl md:text-2xl text-stone-800 max-w-xl mx-auto leading-relaxed mb-10 italic">
          "The personal learning companion built for minds that move differently."
        </p>

        <button onClick={onGo}
          className="group inline-flex items-center gap-3 bg-stone-900 text-amber-50 px-8 py-4 hover:bg-red-800 text-base tracking-widest uppercase shadow-[6px_6px_0_rgba(180,83,9,0.8)] hover:shadow-[3px_3px_0_rgba(180,83,9,0.8)] hover:translate-x-[3px] hover:translate-y-[3px]"
          style={{ fontFamily: '"Futura", sans-serif' }}>
          Begin the Show <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-16 text-xs tracking-[0.3em] uppercase text-stone-700" style={{ fontFamily: '"Futura", sans-serif' }}>
          ★ Adaptive Lessons ★ Smart Reader ★ Classroom Integration ★
        </div>
      </div>
    </div>
  );
}

function Founder({ onGo, bg }) {
  return (
    <div className="min-h-screen w-full p-6 relative overflow-hidden" style={{ ...bg, fontFamily: '"Bodoni Moda", Georgia, serif' }}>
      <div className="absolute top-8 right-8 opacity-40"><Burst /></div>
      <div className="max-w-3xl mx-auto pt-8 pb-12 relative z-10">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1 bg-stone-900 text-amber-100 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: '"Futura", sans-serif' }}>
          <Star className="w-3 h-3 fill-amber-100" /> The Co-Founders
        </div>

        <h2 className="text-6xl md:text-7xl font-black text-stone-900 mb-3 leading-none" style={{ textShadow: '3px 3px 0 #d97706' }}>
          Meet <em className="italic text-red-800">Ben & Tyler.</em>
        </h2>

        <div className="text-sm tracking-[0.3em] uppercase text-stone-700 mb-10" style={{ fontFamily: '"Futura", sans-serif' }}>
          Co-Founders · Wake Forest, Class of '28
        </div>

        {/* Ben's card */}
        <div className="bg-amber-50/80 border-4 border-stone-900 p-8 mb-6 shadow-[8px_8px_0_rgba(180,83,9,0.6)]">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-red-700 text-amber-50 flex items-center justify-center text-3xl font-black shrink-0">BV</div>
            <div>
              <div className="text-2xl font-bold text-stone-900">Ben Valentino</div>
              <div className="text-stone-700 italic">Co-Founder · The idea, the spark</div>
            </div>
          </div>

          <div className="space-y-5 text-stone-800 text-lg leading-relaxed">
            <p>Hi — I'm Ben. I'm a junior at Wake Forest, and like a lot of students, I have <strong className="text-red-800">ADHD</strong>. Staying on task has never been my strong suit. I'd open a textbook, read the same paragraph four times, and still walk away with nothing.</p>
            <p>I kept asking myself: <em>why is every class taught the exact same way, when no two students learn the same?</em></p>
            <p>That question turned into <strong className="text-red-800">Maximize.</strong></p>
          </div>
        </div>

        {/* Tyler's card */}
        <div className="bg-amber-50/80 border-4 border-stone-900 p-8 mb-8 shadow-[8px_8px_0_rgba(180,83,9,0.6)]">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-stone-900 text-amber-50 flex items-center justify-center text-3xl font-black shrink-0">TG</div>
            <div>
              <div className="text-2xl font-bold text-stone-900">Tyler Granelli</div>
              <div className="text-stone-700 italic">Co-Founder · The builder, the partner</div>
            </div>
          </div>

          <div className="space-y-5 text-stone-800 text-lg leading-relaxed">
            <p>I'm Tyler, also a junior at Wake Forest. Ben pitched me the idea late one night and I couldn't stop thinking about it.</p>
            <p>I've watched friends grind through college using study tools that treat everyone the same. <em>It was obviously broken.</em> Maximize is the version of those tools that actually pays attention to who's using it.</p>
            <p>We built this together because <strong className="text-red-800">learning is too important to leave one-size-fits-all.</strong></p>
          </div>
        </div>

        <div className="text-center italic text-stone-700 text-lg mb-8">
          "Learning shouldn't be one-size-fits-all. Let's fix that."
          <div className="text-sm not-italic mt-2 tracking-wider uppercase">— Ben Valentino & Tyler Granelli</div>
        </div>

        <button onClick={onGo}
          className="group inline-flex items-center gap-3 bg-stone-900 text-amber-50 px-8 py-4 hover:bg-red-800 tracking-widest uppercase shadow-[6px_6px_0_rgba(180,83,9,0.8)] hover:shadow-[3px_3px_0_rgba(180,83,9,0.8)] hover:translate-x-[3px] hover:translate-y-[3px]"
          style={{ fontFamily: '"Futura", sans-serif' }}>
          Start My Survey <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Survey({ q, idx, total, questions, ans, onAns, onNext, onBack, bg }) {
  const I = q.icon;
  const cur = ans[q.id];
  const can = q.multi && cur && cur.length > 0;

  // Section info
  const sections = [...new Set(questions.map(qq => qq.section))];
  const currentSection = q.section;
  const sectionIdx = sections.indexOf(currentSection);

  // Section subtitles to show care
  const sectionDesc = {
    'How You Learn': 'First, let\'s understand how your brain takes in information.',
    'Who You Are': 'Now let\'s learn a little about you — your context and what shapes your day.',
    'What You Want': 'Last, the most important part: what are you really hoping for?',
  };

  return (
    <div className="min-h-screen w-full p-6 relative" style={{ ...bg, fontFamily: '"Bodoni Moda", Georgia, serif' }}>
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-red-700 text-amber-50 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: '"Futura", sans-serif' }}>
            <Star className="w-3 h-3 fill-amber-50" /> Act {['One', 'Two', 'Three'][sectionIdx]}: {currentSection} <Star className="w-3 h-3 fill-amber-50" />
          </div>
          <p className="text-sm text-stone-700 italic mt-3 max-w-md mx-auto">{sectionDesc[currentSection]}</p>
        </div>

        <div className="flex items-center gap-1 mb-10 justify-center flex-wrap">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`w-8 h-6 border-2 border-stone-900 flex items-center justify-center text-[10px] font-bold ${
              i < idx ? 'bg-red-700 text-amber-50' : i === idx ? 'bg-amber-400 text-stone-900' : 'bg-amber-50/50 text-stone-400'
            }`} style={{ fontFamily: '"Futura", sans-serif' }}>{i + 1}</div>
          ))}
        </div>

        <div className="bg-amber-50/80 border-4 border-stone-900 p-6 md:p-8 shadow-[8px_8px_0_rgba(180,83,9,0.6)]">
          <div className="mb-2 text-xs tracking-[0.3em] uppercase text-red-800 font-bold" style={{ fontFamily: '"Futura", sans-serif' }}>
            Question {idx + 1} of {total}
          </div>
          <div className="flex items-start gap-4 mb-8">
            <I className="w-10 h-10 text-red-800 mt-1 shrink-0" strokeWidth={1.5} />
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight">{q.q}</h2>
          </div>

          <div className="space-y-3">
            {q.opts.map(o => {
              const OI = o.icon;
              const on = q.multi ? (cur || []).includes(o.v) : cur === o.v;
              return (
                <button key={o.v} onClick={() => onAns(q.id, o.v, q.multi)}
                  className={`w-full text-left p-4 md:p-5 border-[2.5px] transition-all flex items-center gap-4 ${
                    on ? 'border-stone-900 bg-red-700 text-amber-50 shadow-[4px_4px_0_rgba(0,0,0,0.4)]'
                    : 'border-stone-700 bg-amber-100/60 text-stone-800 hover:bg-amber-200/80 hover:translate-x-1'}`}>
                  {OI && <OI className="w-5 h-5 shrink-0" strokeWidth={1.5} />}
                  <span className="text-base flex-1">{o.l}</span>
                  {on && <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            {idx > 0 ? (
              <button onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-stone-700 text-stone-700 hover:bg-stone-900 hover:text-amber-50 tracking-widest uppercase text-xs"
                style={{ fontFamily: '"Futura", sans-serif' }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            ) : <div />}

            {q.multi && (
              <button onClick={onNext} disabled={!can}
                className={`inline-flex items-center gap-2 px-6 py-3 tracking-widest uppercase text-sm ${
                  can ? 'bg-stone-900 text-amber-50 hover:bg-red-800 shadow-[4px_4px_0_rgba(180,83,9,0.6)]' : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
                style={{ fontFamily: '"Futura", sans-serif' }}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-stone-600 italic mt-6 max-w-md mx-auto">
          Your answers shape every lesson. We mean that — there are no wrong answers.
        </p>
      </div>
    </div>
  );
}

function ProfileScreen({ profile, onGo, onReset, bg }) {
  const acc = [];
  if (profile.hasADHD) acc.push({ l: 'Shorter lesson chunks', d: 'Bite-sized to match your focus rhythm', icon: Brain });
  if (profile.breakReminders) acc.push({ l: 'Built-in break reminders', d: 'Gentle nudges before fatigue', icon: Coffee });
  if (profile.hasDyslexia) acc.push({ l: 'Dyslexia-friendly text', d: 'Larger spacing, readable font', icon: Type });
  if (profile.hasAnxiety) acc.push({ l: 'No high-pressure quizzes', d: 'Practice without grades', icon: Heart });
  if (profile.hasSensory) acc.push({ l: 'Calmer visuals', d: 'Reduced motion throughout', icon: Eye });
  if (profile.hasLanguage) acc.push({ l: 'Simpler language', d: 'Clear words, no unnecessary jargon', icon: Globe });
  if (profile.encouragingTone) acc.push({ l: 'Encouraging tone', d: 'Lessons that remind you you\'re capable', icon: Smile });
  if (profile.depthLevel === 'deep') acc.push({ l: 'Deeper explanations', d: 'You wanted real understanding — we go deep', icon: Brain });
  if (profile.depthLevel === 'exam-focused') acc.push({ l: 'Exam-focused content', d: 'Practice questions and what\'s likely to be tested', icon: Target });

  const ml = { visual: 'Visual learner', auditory: 'Auditory learner', kinesthetic: 'Hands-on learner', reading: 'Reading/writing learner' }[profile.modality];

  // Personalized feeling response
  const feelingResponse = {
    overwhelmed: "You said you're feeling overwhelmed. We hear you — small steps, no rush.",
    behind: "You said you feel behind. That's okay. Every lesson is a step forward.",
    frustrated: "You said you're frustrated. We'll change that.",
    okay: "You said you're doing okay. Let's make it better.",
    curious: "You said you're curious. That's the best place to start."
  }[profile.feeling];

  return (
    <div className="min-h-screen w-full p-6 relative" style={{ ...bg, fontFamily: '"Bodoni Moda", Georgia, serif' }}>
      <div className="max-w-3xl mx-auto pt-10 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-red-700 text-amber-50 text-xs tracking-[0.3em] uppercase mb-6" style={{ fontFamily: '"Futura", sans-serif' }}>
          <Star className="w-3 h-3 fill-amber-50" /> Your Starring Role
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-stone-900 mb-3 leading-none" style={{ textShadow: '3px 3px 0 #d97706' }}>
          Here's the <em className="italic text-red-800">script.</em>
        </h2>
        <p className="text-stone-800 mb-3 text-lg">
          You're a <strong className="text-red-800">{ml}</strong> at a <strong className="text-red-800">{profile.pace}</strong> pace.
        </p>
        {feelingResponse && (
          <div className="bg-stone-900 text-amber-50 border-2 border-amber-300 p-4 mb-8 flex items-start gap-3">
            <Heart className="w-5 h-5 text-amber-300 mt-0.5 shrink-0 fill-amber-300" />
            <p className="text-sm italic leading-relaxed">{feelingResponse}</p>
          </div>
        )}

        <div className="text-xs uppercase tracking-[0.3em] text-stone-700 font-bold mb-3" style={{ fontFamily: '"Futura", sans-serif' }}>
          What we're doing differently for you:
        </div>

        <div className="space-y-3 mb-10">
          {acc.length > 0 ? acc.map((a, i) => {
            const AI = a.icon || Check;
            return (
              <div key={i} className="flex items-start gap-4 p-5 bg-amber-50/80 border-2 border-stone-900 shadow-[4px_4px_0_rgba(180,83,9,0.5)]">
                <div className="w-10 h-10 bg-red-700 text-amber-50 flex items-center justify-center shrink-0">
                  <AI className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-lg">{a.l}</div>
                  <div className="text-sm text-stone-700 mt-1">{a.d}</div>
                </div>
              </div>
            );
          }) : <div className="p-5 bg-amber-50/80 border-2 border-stone-900"><div className="text-stone-700">A steady, well-paced experience tuned to how you learn.</div></div>}
        </div>

        <button onClick={onGo}
          className="group inline-flex items-center gap-3 bg-stone-900 text-amber-50 px-8 py-4 hover:bg-red-800 tracking-widest uppercase shadow-[6px_6px_0_rgba(180,83,9,0.8)] hover:shadow-[3px_3px_0_rgba(180,83,9,0.8)] hover:translate-x-[3px] hover:translate-y-[3px]"
          style={{ fontFamily: '"Futura", sans-serif' }}>
          Connect My Classes <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={onReset} className="ml-4 text-sm text-stone-600 hover:text-stone-900 underline italic">Retake survey</button>
      </div>
    </div>
  );
}

function Classroom({ classes, setClasses, profile, onGo, bg }) {
  const [show, setShow] = useState(false);
  const [nc, setNc] = useState({ name: '', platform: '', url: '', files: [] });
  const ps = [
    { id: 'canvas', n: 'Canvas', c: '#dc2626' },
    { id: 'blackboard', n: 'Blackboard', c: '#1f2937' },
    { id: 'google', n: 'Google Classroom', c: '#0369a1' },
    { id: 'moodle', n: 'Moodle', c: '#ea580c' },
    { id: 'schoology', n: 'Schoology', c: '#0891b2' },
    { id: 'other', n: 'Other', c: '#78350f' },
  ];
  const upload = (e) => setNc({ ...nc, files: [...nc.files, ...Array.from(e.target.files || []).map(f => ({ name: f.name }))] });
  const add = () => { if (nc.name && nc.platform) { setClasses([...classes, { ...nc, id: Date.now() }]); setNc({ name: '', platform: '', url: '', files: [] }); setShow(false); } };

  return (
    <div className="min-h-screen w-full p-6 relative" style={{ ...bg, fontFamily: '"Bodoni Moda", Georgia, serif' }}>
      <div className="max-w-3xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-red-700 text-amber-50 text-xs tracking-[0.3em] uppercase mb-6" style={{ fontFamily: '"Futura", sans-serif' }}>
          <GraduationCap className="w-3 h-3" /> The Production Materials
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-stone-900 mb-3 leading-none" style={{ textShadow: '3px 3px 0 #d97706' }}>
          Bring in your <em className="italic text-red-800">classes.</em>
        </h2>
        <p className="text-stone-800 mb-10 text-lg max-w-2xl">Link portals and upload syllabi. Add more anytime from the Library tab.</p>

        {classes.length > 0 && (
          <div className="space-y-3 mb-6">
            {classes.map(c => {
              const p = ps.find(x => x.id === c.platform);
              return (
                <div key={c.id} className="bg-amber-50/80 border-2 border-stone-900 p-5 shadow-[4px_4px_0_rgba(180,83,9,0.5)] flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center text-amber-50 font-bold" style={{ backgroundColor: p?.c }}>{c.name.charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="font-bold text-stone-900 text-lg">{c.name}</div>
                    <div className="text-sm text-stone-600">{p?.n}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {show ? (
          <div className="bg-amber-50/80 border-4 border-stone-900 p-6 mb-6 shadow-[6px_6px_0_rgba(180,83,9,0.6)]">
            <div className="flex items-center justify-between mb-5">
              <div className="font-bold text-stone-900 text-xl">New Class</div>
              <button onClick={() => setShow(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} placeholder="Class name"
                className="w-full p-3 border-2 border-stone-700 bg-amber-100/60 focus:outline-none focus:border-red-700" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ps.map(p => (
                  <button key={p.id} onClick={() => setNc({ ...nc, platform: p.id })}
                    className={`p-3 border-2 text-sm ${nc.platform === p.id ? 'border-stone-900 bg-stone-900 text-amber-50' : 'border-stone-400 bg-amber-100/40 hover:border-stone-700'}`}>{p.n}</button>
                ))}
              </div>
              <label className="block w-full p-5 border-2 border-dashed border-stone-700 bg-amber-100/40 text-center cursor-pointer">
                <Upload className="w-6 h-6 mx-auto mb-2 text-stone-700" strokeWidth={1.5} />
                <div className="text-sm text-stone-700">Upload syllabi or notes</div>
                <input type="file" multiple onChange={upload} className="hidden" />
              </label>
              {nc.files.length > 0 && nc.files.map((f, i) => <div key={i} className="text-xs text-stone-700 flex items-center gap-2"><FileText className="w-3 h-3" /> {f.name}</div>)}
              <button onClick={add} disabled={!nc.name || !nc.platform}
                className={`w-full p-3 tracking-widest uppercase text-sm ${nc.name && nc.platform ? 'bg-stone-900 text-amber-50 hover:bg-red-800' : 'bg-stone-300 text-stone-500'}`}
                style={{ fontFamily: '"Futura", sans-serif' }}>Save Class</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShow(true)} className="w-full p-6 border-4 border-dashed border-stone-700 bg-amber-50/40 hover:bg-amber-100/60 mb-6">
            <Plus className="w-8 h-8 mx-auto mb-2 text-stone-700" strokeWidth={2} />
            <div className="text-stone-800 font-bold tracking-widest uppercase text-sm" style={{ fontFamily: '"Futura", sans-serif' }}>
              {classes.length === 0 ? 'Add Your First Class' : 'Add Another'}
            </div>
          </button>
        )}

        <div className="mt-8">
          <button onClick={onGo}
            className="inline-flex items-center gap-3 bg-stone-900 text-amber-50 px-8 py-4 hover:bg-red-800 tracking-widest uppercase shadow-[6px_6px_0_rgba(180,83,9,0.8)] hover:shadow-[3px_3px_0_rgba(180,83,9,0.8)] hover:translate-x-[3px] hover:translate-y-[3px]"
            style={{ fontFamily: '"Futura", sans-serif' }}>
            {classes.length > 0 ? "Let's Go" : 'Skip for Now'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== SVG DECORATIONS ==============
function BigBurst() {
  return (
    <svg width="500" height="500" viewBox="0 0 500 500" className="opacity-25">
      {[...Array(24)].map((_, i) => {
        const a = (i * 15) * Math.PI / 180;
        return <line key={i} x1={250 + Math.cos(a) * 80} y1={250 + Math.sin(a) * 80} x2={250 + Math.cos(a) * 230} y2={250 + Math.sin(a) * 230} stroke={i % 2 === 0 ? '#d97706' : '#b91c1c'} strokeWidth={i % 2 === 0 ? 6 : 4} />;
      })}
      <circle cx="250" cy="250" r="75" fill="#fbbf24" opacity="0.4" />
    </svg>
  );
}

function Burst() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      {[...Array(12)].map((_, i) => {
        const a = (i * 30) * Math.PI / 180;
        return <line key={i} x1={40 + Math.cos(a) * 15} y1={40 + Math.sin(a) * 15} x2={40 + Math.cos(a) * 35} y2={40 + Math.sin(a) * 35} stroke="currentColor" strokeWidth="2.5" />;
      })}
      <circle cx="40" cy="40" r="12" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// ============== LESSON CONTENT ==============
const allTopics = [
  { id: 'photosynthesis', title: 'How Photosynthesis Works', emoji: '🌿', source: 'Biology' },
  { id: 'cell-division', title: 'How Cells Divide (Mitosis)', emoji: '🧬', source: 'Biology' },
  { id: 'electricity', title: 'How Electricity Flows', emoji: '⚡', source: 'Physics' },
  { id: 'newtons-laws', title: "Newton's Three Laws of Motion", emoji: '🍎', source: 'Physics' },
  { id: 'fractions', title: 'Understanding Fractions', emoji: '½', source: 'Math' },
  { id: 'algebra-intro', title: 'Intro to Algebraic Thinking', emoji: '𝑥', source: 'Math' },
  { id: 'storytelling', title: 'The Art of Storytelling', emoji: '📖', source: 'Writing' },
  { id: 'wwii-causes', title: 'Causes of World War II', emoji: '🗺️', source: 'History' },
  { id: 'french-revolution', title: 'The French Revolution', emoji: '⚔️', source: 'History' },
  { id: 'supply-demand', title: 'Supply & Demand Basics', emoji: '📊', source: 'Economics' },
];

// Adapts lesson content based on profile signals
function adapt(text, profile, opts = {}) {
  if (!profile) return text;
  // Simpler language replaces big words
  if (profile.simpleLanguage && opts.simple) return opts.simple;
  return text;
}

function getLessonContent(topicId, profile, topic) {
  const encouraging = profile?.encouragingTone;
  const deep = profile?.depthLevel === 'deep';
  const exam = profile?.depthLevel === 'exam-focused';
  const simple = profile?.simpleLanguage;

  // Build a personalized intro line based on profile
  const introNote = encouraging ? "Take your time with this one. There's no rush." :
    deep ? "We'll go beyond the surface here — you said you wanted to really understand." :
    exam ? "Focus on the highlighted concepts — these tend to show up on tests." :
    null;

  // Course lessons from uploaded class material — content varies by lesson kind & title
  if (topic?._fromClass) {
    const src = topic._source || 'your class';
    const kind = topic.kind || 'concept';
    const title = topic.title || 'Lesson';
    if (kind === 'intro') {
      return { chunks: [
        { type: 'text', heading: title, body: `This unit kicks off your study of ${src}. Maximize built this plan by analyzing the material you uploaded.${introNote ? '\n\n' + introNote : ''}` },
        { type: 'text', heading: 'What you\'ll cover', body: `Over the next few lessons, we'll move from the foundational ideas in ${src} through to the details, then check your understanding. Each lesson is sized to fit your focus.` },
        { type: 'interactive', body: 'The best learning starts with knowing your goal.',
          prompt: `What's the one thing you most want to walk away understanding from ${src}?`,
          answer: 'Hold onto that. The lessons ahead are built to get you there. (When connected to live AI, Maximize generates the actual content from your specific uploaded material.)' },
        { type: 'check', question: 'How does Maximize build a study plan from your upload?',
          options: ['Randomly', 'By analyzing the material and scaling units to its length', 'It doesn\'t', 'Copies the textbook'],
          correct: 1, explanation: 'Maximize scales the number of units and lessons to the length and depth of what you upload.' },
      ]};
    }
    if (kind === 'practice') {
      return { chunks: [
        { type: 'text', heading: title, body: `Time to apply what you've learned from ${src}. Practice is where understanding becomes permanent.${introNote ? '\n\n' + introNote : ''}` },
        { type: 'interactive', body: 'Active recall beats re-reading every time.',
          prompt: `Without looking back, what are the 2-3 most important ideas from ${src} so far?`,
          answer: 'If you could name them, they\'re sticking. If not, that\'s a signal to revisit — and totally normal. (Live AI version pulls real practice problems from your material.)' },
        { type: 'check', question: 'Why is active practice more effective than re-reading?',
          options: ['It\'s faster', 'It forces your brain to retrieve, which strengthens memory', 'It\'s easier', 'It isn\'t'],
          correct: 1, explanation: 'Retrieval practice — pulling information out of memory — builds far stronger recall than passively re-reading.' },
      ]};
    }
    if (kind === 'quiz') {
      return { chunks: [
        { type: 'text', heading: title, body: `Let's check what stuck from ${src}. ${profile?.gentleFeedback ? 'No pressure — this is just to help things settle.' : ''}` },
        { type: 'check', question: `Self-check: how confident do you feel about ${src} right now?`,
          options: ['Still shaky', 'Getting there', 'Pretty solid', 'I could teach it'],
          correct: 2, explanation: 'Wherever you are is fine — knowing your own level is half the battle. (Live AI version generates real quiz questions from your uploaded content.)' },
        { type: 'text', heading: 'Keep going', body: 'Finishing this lesson moves you forward in the plan. Every completed lesson is real progress toward mastering this material.' },
      ]};
    }
    // default: concept lesson
    return { chunks: [
      { type: 'text', heading: title, body: `A core concept lesson from your ${src} material.${introNote ? '\n\n' + introNote : ''}` },
      { type: 'text', heading: 'The key idea', body: `This lesson focuses on one important concept from ${src}. When Maximize is connected to live AI, this section contains the actual explanation generated from your uploaded document — tailored to your ${profile?.modality || 'preferred'} learning style.` },
      { type: 'interactive', body: 'Connecting new ideas to what you already know makes them stick.',
        prompt: 'How might this concept connect to something you already understand?',
        answer: 'Those connections are exactly what turn isolated facts into real understanding. Keep making them.' },
      { type: 'check', question: 'What\'s the most effective way to learn a new concept?',
        options: ['Memorize it word-for-word', 'Connect it to things you already know', 'Read it once', 'Highlight it'],
        correct: 1, explanation: 'Connecting new concepts to existing knowledge (called elaboration) is one of the most powerful learning techniques there is.' },
    ]};
  }

  if (topic?.isCustom) {
    return { chunks: [
      { type: 'text', heading: `Welcome: ${topic.title}`, body: `Maximize generated this lesson for you based on your request. We've shaped it around your ${profile?.modality || 'preferred'} learning style at a ${profile?.pace || 'steady'} pace.${introNote ? '\n\n' + introNote : ''}` },
      { type: 'text', heading: 'Your spec', body: topic.description || 'A personalized lesson on this topic.' },
      { type: 'interactive', body: `You chose a "${topic.style}" style.`, prompt: 'What\'s the first thing you want to understand?',
        answer: 'Whatever you said — that\'s where Maximize would begin. Custom lessons follow your curiosity.' },
      { type: 'check', question: 'What\'s the value of custom lessons?',
        options: ['Less data', 'Fits exactly what you need', 'Pre-made', 'Replaces a teacher'],
        correct: 1, explanation: 'Exactly. Custom lessons match your needs in real time.' },
    ]};
  }
  if (topic?.fromClass) {
    return { chunks: [
      { type: 'text', heading: `Welcome to ${topic.source}`, body: `Maximize pulled in materials from your ${topic.source} class.${introNote ? '\n\n' + introNote : ''}` },
      { type: 'text', heading: 'Today\'s focus', body: 'In production, Maximize would scan your syllabus to pinpoint what to review.' },
      { type: 'interactive', body: 'Personalized lessons combine your style with your coursework.',
        prompt: 'What would help you most right now?',
        answer: 'Whatever you said — that\'s the input Maximize uses.' },
      { type: 'check', question: 'What makes Maximize different?',
        options: ['Only videos', 'Adapts to how AND what you learn', 'Replaces professor', 'Grades work'],
        correct: 1, explanation: 'Both pieces matter.' },
    ]};
  }

  // Sample lesson: Photosynthesis - shows real adaptation
  if (topicId === 'photosynthesis') {
    return { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: simple ? 'Plants eat light.' : 'Plants eat sunlight.',
        body: simple ? "Plants don't eat food like we do. They make their own food using light, water, and air."
          : "Plants don't eat food like we do. They make their own — directly from light, water, and air. This single process is the foundation of nearly every food chain on Earth." },
      { type: 'text', heading: 'The three ingredients', body: simple
          ? 'A leaf needs three things: sunlight, water (from the roots), and air. Inside the leaf, tiny green parts catch the light.'
          : 'A leaf takes in sunlight from above, water through its roots, and carbon dioxide from the air. Tiny green factories called chloroplasts catch the sunlight using chlorophyll — the molecule that gives leaves their green color.' },
      ...(deep ? [{ type: 'text', heading: 'How it actually works (deeper)', body: 'Photosynthesis happens in two stages. First, the "light reactions" capture energy from photons and split water molecules, releasing oxygen and producing energy-carrying molecules (ATP and NADPH). Second, the "Calvin cycle" uses that energy to convert CO₂ into glucose. The whole thing is one of the most studied biochemical processes in nature.' }] : []),
      { type: 'interactive', body: simple
          ? "The plant uses water and air to make food. Two things come out."
          : "The plant combines water and carbon dioxide using light's energy. Two products come out: one feeds the plant, one feeds us.",
        prompt: simple ? 'What gas does a plant give off?' : 'What does a plant release as a "waste product"?',
        answer: simple ? 'Oxygen! It is the air we breathe. The plant also makes sugar for itself to eat.'
          : 'Oxygen! Plants release the oxygen we breathe. The other output is sugar (glucose) — the plant\'s food. So plants quite literally feed us oxygen as a byproduct.' },
      { type: 'check', question: simple ? 'Which one does a plant NOT need to make food?' : 'Which is NOT needed for photosynthesis?',
        options: ['Sunlight', 'Water', 'Soil minerals', 'Carbon dioxide (CO₂)'], correct: 2,
        explanation: simple ? 'Plants use minerals to grow strong, but to make food they only need light, water, and air.'
          : 'Plants need soil minerals to grow, but photosynthesis itself only requires light, water, and CO₂. Minerals support other plant processes.' },
      ...(exam ? [{ type: 'check', question: 'In photosynthesis, where does the oxygen released come from?',
        options: ['From CO₂', 'From water (H₂O)', 'From soil', 'From sunlight'], correct: 1,
        explanation: 'The oxygen comes from water molecules being split — not from CO₂, which is a common misconception. This often appears on exams.' }] : []),
      { type: 'text', heading: 'Why this matters', body: simple
          ? "Almost everything alive on Earth depends on plants. The air you breathe came from a plant doing this."
          : "Photosynthesis built our atmosphere. Before plants and photosynthetic bacteria, Earth had almost no free oxygen. Today, every breath you take, and most of the food you eat, traces back to this one process." },
    ]};
  }

  const lessons = {
    fractions: { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'A fraction is a part of a whole.', body: simple ? 'Cut a pizza into 4 equal slices. Take 1. You have ¼ of the pizza.' : 'Cut a pizza into 4 equal slices and take 1. You have one-fourth — written ¼. A fraction tells you how many equal pieces something has been split into, and how many of those pieces you have.' },
      { type: 'text', heading: 'Top and bottom', body: 'The bottom number (denominator) is how many equal pieces the whole was cut into. The top number (numerator) is how many of those pieces you have. ¼ means 1 piece out of 4 equal pieces.' },
      { type: 'interactive', body: 'A chocolate bar has 8 equal squares.', prompt: 'If you eat 3, what fraction did you eat?',
        answer: '3/8 — three out of eight equal parts. The 3 is on top (what you ate), 8 is on the bottom (total pieces).' },
      ...(deep ? [{ type: 'text', heading: 'Equivalent fractions', body: '½ of a pizza is the same amount of pizza as 2/4 or 4/8 — they\'re just slicing the same amount differently. Multiply or divide the top and bottom by the same number, and you get an equivalent fraction.' }] : []),
      { type: 'check', question: 'Which equals ½?',
        options: ['2/3', '3/6', '4/5', '1/4'], correct: 1,
        explanation: '3/6 is exactly half. Multiply top and bottom of ½ by 3 to get 3/6 — same amount, different slicing.' },
    ]},
    storytelling: { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'Every story has a shape.', body: 'A character wants something. Something gets in the way. They struggle. Something changes. That\'s the simplest shape of every story ever told.' },
      { type: 'text', heading: 'Begin with want.', body: simple ? 'Without a goal, there is no story. A character must want something for us to care.' : 'Without desire, there is no story. A character who wants nothing has nothing to lose, nothing to chase, nothing for us to care about. Stories live or die on the strength of what the main character wants.' },
      { type: 'interactive', body: 'Think of your favorite movie or book.',
        prompt: 'What did the main character want? What got in their way?',
        answer: "If you can name both, you've found the engine of the story. Almost every memorable story works this way." },
      ...(deep ? [{ type: 'text', heading: 'The arc, in detail', body: 'Most stories rise — building tension as obstacles mount — until reaching a climax, then resolve. This shape feels right because it mirrors how meaningful struggle works in real life. Even short stories follow this; even single scenes do.' }] : []),
      { type: 'check', question: 'What makes a character compelling?',
        options: ['A cool name', 'Specific desires and obstacles', 'Detailed backstory', 'Magical powers'],
        correct: 1, explanation: 'Specific desires create stakes; obstacles create struggle. Together they make us care. Everything else supports this core engine.' },
    ]},
    electricity: { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'Electricity is moving charge.', body: 'Tiny particles called electrons move through certain materials like copper wire. When many of them flow in the same direction, we call that flow electricity.' },
      { type: 'text', heading: 'A circuit', body: 'Electrons need a complete loop to flow: from a power source like a battery, through wires, through something useful (like a bulb), and back to the source. Break the loop anywhere and the flow stops.' },
      ...(deep ? [{ type: 'text', heading: 'Voltage vs. current vs. resistance', body: 'Voltage (volts) is the "push" — the electrical pressure. Current (amps) is the actual flow rate of electrons. Resistance (ohms) is how much the material resists the flow. They\'re related by Ohm\'s Law: V = I × R. This is the foundation of all electrical engineering.' }] : [{ type: 'text', heading: 'Voltage vs. current', body: 'Voltage is the push. Current is the flow. Think of water in a pipe — voltage is the pressure, current is how much water moves through.' }]),
      { type: 'interactive', body: 'A flashlight uses a battery, wires, and a bulb.', prompt: 'What happens if you remove the battery?',
        answer: 'The loop breaks — no push, no flow. The bulb goes dark immediately.' },
      { type: 'check', question: 'What does a switch actually do?',
        options: ['Adds more energy', 'Opens or closes the circuit loop', 'Changes voltage', 'Cools the wires'],
        correct: 1, explanation: 'A switch is just a controlled break in the wire. Closed = current flows. Open = no flow. That\'s all.' },
    ]},
    'supply-demand': { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'Two forces set prices.', body: 'In any market, prices come from two opposing forces: how much people want something (demand) and how much exists (supply). The interaction sets the price.' },
      { type: 'text', heading: 'How it works', body: 'High demand + low supply = prices rise. Low demand + high supply = prices fall. Concert tickets, sneakers, gas — all follow this rule.' },
      { type: 'interactive', body: 'Imagine only 10 pizzas will be made tomorrow at your school.',
        prompt: 'What happens to the price?',
        answer: 'It goes up. Limited supply + steady demand = higher price. This is exactly why concert tickets spike and gaming consoles can resell for hundreds over retail.' },
      ...(deep ? [{ type: 'text', heading: 'Equilibrium', body: 'The price where supply exactly meets demand is called the equilibrium price. Markets constantly fluctuate around this point — when prices go too high, demand drops or new sellers enter; when too low, demand rises or sellers leave.' }] : []),
      { type: 'check', question: 'A new console sells out instantly. What\'s likely?',
        options: ['Prices drop', 'Resellers charge more than retail', 'Store stops selling them', 'Nothing changes'],
        correct: 1, explanation: 'High demand + low supply pushes prices up — even on the resale market. Supply and demand in action.' },
    ]},
    'cell-division': { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'One cell becomes two.', body: 'Mitosis is how your body grows, heals cuts, and replaces dead cells. One parent cell divides into two identical daughter cells, each with a full copy of your DNA.' },
      { type: 'text', heading: 'Why we need it', body: 'You started as one cell. You\'re now made of trillions. Every one of them came from mitosis. You replace about 330 billion cells every day just to stay alive.' },
      { type: 'text', heading: 'Four phases', body: 'Prophase (chromosomes condense), metaphase (chromosomes line up), anaphase (chromosomes split apart), telophase (two new cells form). Easy to remember: PMAT.' },
      { type: 'interactive', body: 'Each daughter cell needs a complete copy of the DNA.',
        prompt: 'What happens if the DNA doesn\'t split evenly?',
        answer: 'One cell ends up with extra chromosomes, the other with too few. This is exactly what causes some genetic disorders (like Down syndrome) and underlies many cancers.' },
      ...(exam ? [{ type: 'check', question: 'In which phase do chromosomes line up at the center?',
        options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], correct: 1,
        explanation: 'Metaphase — "meta" means middle. Memorize PMAT in order and this gets easy.' }] : []),
      { type: 'check', question: 'What\'s the main purpose of mitosis?',
        options: ['Making sperm/eggs', 'Growth and repair', 'Digesting food', 'Sensing the world'],
        correct: 1, explanation: 'Mitosis = growth and repair. Meiosis is the different process that makes sperm and eggs.' },
    ]},
    'wwii-causes': { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'Wars don\'t come from nowhere.', body: 'WWII officially started in 1939, but the seeds were planted decades earlier. Understanding what led to it means looking at what came before.' },
      { type: 'text', heading: 'Treaty of Versailles (1919)', body: 'After WWI, Germany was forced to accept harsh terms — massive reparation payments, lost territory, a tiny military, and full blame for the war. This humiliation created deep resentment that lasted a generation.' },
      { type: 'text', heading: 'The Great Depression (1929)', body: 'The stock market crash sparked a global economic collapse. Unemployment hit 25%+ in some countries. Desperate, hungry populations were drawn to leaders promising radical change.' },
      { type: 'text', heading: 'The rise of dictators', body: 'Hitler in Germany, Mussolini in Italy, militarists in Japan — all rose to power by exploiting economic suffering and wounded national pride. Each promised national rebirth through force.' },
      { type: 'interactive', body: 'European powers tried appeasing Hitler in the 1930s, hoping to avoid another war.',
        prompt: 'Why might appeasement have made things worse?',
        answer: 'Each concession convinced Hitler the major powers wouldn\'t fight back. By the time Britain and France finally drew a line at Poland in 1939, Hitler had already absorbed Austria and Czechoslovakia.' },
      { type: 'check', question: 'Which was NOT a major cause of WWII?',
        options: ['Treaty of Versailles', 'The Great Depression', 'The Fall of Rome', 'Rise of fascism'],
        correct: 2, explanation: 'The Fall of Rome was 1,500 years before WWII — completely unrelated. Versailles, the Depression, and fascism are the standard "big three" causes.' },
    ]},
    'algebra-intro': { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'Algebra is about unknowns.', body: simple ? 'Regular math: 2 + 3 = 5. Algebra: 2 + x = 5. The letter x stands for a number we don\'t know — and we figure it out.' : 'Regular math gives you all the numbers and asks for the answer. Algebra gives you the answer and one missing number, and asks you to find the missing one. The letter x is just a placeholder for "the number we\'re solving for."' },
      { type: 'text', heading: 'Why letters?', body: 'Because letters let us describe patterns without specific numbers. "Your age in 5 years" works for everyone — we just write it as x + 5.' },
      { type: 'interactive', body: 'You have some apples. You buy 4 more. Now you have 11.',
        prompt: 'How many did you start with? Try to write it as an equation.',
        answer: 'You started with 7. The equation is x + 4 = 11. To solve, subtract 4 from both sides: x = 7.' },
      { type: 'text', heading: 'The golden rule', body: 'Whatever you do to one side of an equation, you must do to the other. Add 3? To both sides. Divide by 2? Both sides. This keeps the equation balanced.' },
      { type: 'check', question: 'Solve: x + 7 = 15',
        options: ['7', '8', '15', '22'], correct: 1,
        explanation: 'Subtract 7 from both sides: x = 15 - 7 = 8. The golden rule in action.' },
      { type: 'text', heading: 'Why this matters', body: 'Algebra is the language of almost every science, engineering field, and computer program. Once you can solve for unknowns, you can model the real world.' },
    ]},
    'french-revolution': { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'A nation explodes.', body: 'In 1789, France\'s rigid social order collapsed in just months. Within five years, the king was executed and most of Europe was at war. It changed the modern world.' },
      { type: 'text', heading: 'The three estates', body: 'France was legally divided into three classes: clergy (1st), nobility (2nd), and everyone else (3rd) — 97% of the population who paid almost all the taxes while the top 3% paid almost none.' },
      { type: 'text', heading: 'The spark', body: 'A bankrupt government, failed harvests causing bread shortages, and Enlightenment ideas about equality and rights combined into something explosive. When the king called a meeting of all three estates, the Third Estate revolted.' },
      { type: 'interactive', body: 'The storming of the Bastille on July 14, 1789, became the symbol of the revolution.',
        prompt: 'Why did a prison become THE symbol of an entire revolution?',
        answer: 'The Bastille held political prisoners and stored weapons. Taking it meant ordinary people now had power over the king\'s authority — and could literally arm themselves. France still celebrates July 14 as its national holiday.' },
      { type: 'check', question: 'Which "estate" paid the most taxes?',
        options: ['1st (clergy)', '2nd (nobility)', '3rd (everyone else)', 'They paid equally'],
        correct: 2, explanation: 'The Third Estate — 97% of France — paid almost everything while the top two estates were largely tax-exempt. This raw inequality was the kindling that lit the revolution.' },
    ]},
    'newtons-laws': { chunks: [
      ...(introNote ? [{ type: 'text', heading: 'Before we begin', body: introNote }] : []),
      { type: 'text', heading: 'Three rules that govern motion.', body: 'In 1687, Isaac Newton published three simple laws that explain how everything moves — from baseballs to planets to rockets. They\'re still used today to land things on Mars.' },
      { type: 'text', heading: 'First law: inertia', body: 'Objects keep doing what they\'re doing unless a force pushes them. A still ball stays still. A moving ball keeps moving — until friction or another force stops it. This is why you slide forward when a car brakes hard.' },
      { type: 'text', heading: 'Second law: F = ma', body: 'The force needed to move something equals its mass times its acceleration. Pushing a shopping cart is easy. Pushing a car is hard. Same idea, very different mass.' },
      { type: 'text', heading: 'Third law: action and reaction', body: 'Every action has an equal and opposite reaction. You push the ground — the ground pushes you back. That\'s how walking works. It\'s also how rockets work: they push gas down, the gas pushes them up.' },
      { type: 'interactive', body: 'Imagine you\'re standing on a skateboard and throw a heavy ball forward.',
        prompt: 'What happens to you?',
        answer: 'You roll backward. Third law in action: you pushed the ball forward, so the ball pushed you back with equal force. The lighter you are, the more you\'ll move.' },
      ...(exam ? [{ type: 'check', question: 'What equation represents Newton\'s second law?',
        options: ['E = mc²', 'F = ma', 'V = IR', 'a² + b² = c²'], correct: 1,
        explanation: 'F = ma. E = mc² is Einstein\'s. V = IR is Ohm\'s law for circuits. The Pythagorean theorem is geometry.' }] : []),
      { type: 'check', question: 'Which is Newton\'s third law?',
        options: ['Objects in motion stay in motion', 'F = ma', 'Equal and opposite reactions', 'Gravity attracts everything'],
        correct: 2, explanation: 'Equal and opposite reactions. The first option is the first law (inertia); F=ma is the second law.' },
    ]},
  };

  return lessons[topicId] || { chunks: [
    { type: 'text', heading: 'Lesson coming soon', body: 'This lesson is being prepared. In the meantime, try one of the featured lessons or create a custom one.' }
  ]};
}

// ============== COURSE BUILDER (multi-unit study plans) ==============
// Each course = multiple units, each unit = multiple lessons. Lessons reference
// content via their id. Time estimates scale to depth. This is the structure that,
// once an AI backend is connected, fills with fully generated content per lesson.
function getCourse(course, profile) {
  const deep = profile?.depthLevel === 'deep';
  const exam = profile?.depthLevel === 'exam-focused';
  const paceNote = profile?.chunkSize === 'small'
    ? 'Lessons are kept short to match your focus rhythm — take them one at a time.'
    : 'Work through the units in order. Each builds on the last.';

  // ---- Custom lessons the user typed in ----
  if (course?.isCustom) {
    return {
      intro: `A study plan built around your request: "${course.title}". Shaped for a ${profile?.modality || 'mixed'} learner. ${paceNote}`,
      units: [
        { title: 'Getting Oriented', description: 'Build the foundation before going deep.', lessons: [
          { id: `${course.id}-l1`, title: 'What this topic is really about', minutes: 8, kind: 'intro', _src: course.id },
          { id: `${course.id}-l2`, title: 'The core ideas you need first', minutes: 12, kind: 'concept', _src: course.id },
        ]},
        { title: 'Going Deeper', description: 'The substance — where real understanding forms.', lessons: [
          { id: `${course.id}-l3`, title: 'How the pieces fit together', minutes: 15, kind: 'concept', _src: course.id },
          { id: `${course.id}-l4`, title: 'Working through examples', minutes: 15, kind: 'practice', _src: course.id },
        ]},
        { title: 'Mastery', description: 'Lock it in and prove you\'ve got it.', lessons: [
          { id: `${course.id}-l5`, title: 'Common mistakes and how to avoid them', minutes: 10, kind: 'review', _src: course.id },
          { id: `${course.id}-l6`, title: 'Final check: test yourself', minutes: 10, kind: 'quiz', _src: course.id },
        ]},
      ],
    };
  }

  // ---- Uploaded class material → scaffold a plan scaled to document length ----
  if (course?.fromClass || course?.fromDoc) {
    const wc = course?.wordCount || 1500;
    // Scale number of units/lessons to the size of the material
    const lessonCount = Math.max(4, Math.min(18, Math.round(wc / 350)));
    const unitsCount = Math.max(2, Math.min(5, Math.ceil(lessonCount / 3)));
    const perUnit = Math.ceil(lessonCount / unitsCount);
    const unitTitles = ['Foundations', 'Core Concepts', 'Deeper Analysis', 'Application & Practice', 'Review & Mastery'];
    const lessonKinds = ['intro', 'concept', 'concept', 'practice', 'review', 'quiz'];

    const units = [];
    let made = 0;
    for (let u = 0; u < unitsCount && made < lessonCount; u++) {
      const lessons = [];
      for (let l = 0; l < perUnit && made < lessonCount; l++) {
        const kind = lessonKinds[Math.min(made, lessonKinds.length - 1)];
        lessons.push({
          id: `${course.id}-u${u}-l${l}`,
          title: `${unitTitles[u]} — Part ${l + 1}`,
          minutes: kind === 'quiz' ? 8 : kind === 'practice' ? 15 : 12,
          kind,
          _src: course.id, _fromClass: true, _source: course.source || course.title,
        });
        made++;
      }
      units.push({
        title: unitTitles[u] || `Unit ${u + 1}`,
        description: u === 0 ? 'Start here — the groundwork for everything else.' : undefined,
        lessons,
      });
    }
    const hrs = Math.round(lessonCount * 12 / 60 * 10) / 10;
    return {
      intro: `Maximize analyzed your material (~${wc.toLocaleString()} words) and built a ${unitsCount}-unit plan with ${lessonCount} lessons — roughly ${hrs} hours of focused study, scaled to the length of what you uploaded. ${paceNote}`,
      units,
    };
  }

  // ---- Featured topics: real hand-built multi-unit courses ----
  const courses = {
    photosynthesis: {
      intro: `A complete study plan on photosynthesis, from the basics to the biochemistry. ${deep ? "Since you wanted real understanding, we've included the deeper molecular detail." : exam ? "Structured around what's most likely to appear on your exams." : ''} ${paceNote}`,
      units: [
        { title: 'The Big Picture', description: 'Why photosynthesis matters and what it does.', lessons: [
          { id: 'photosynthesis', title: 'How Photosynthesis Works', minutes: 12, kind: 'core' },
          { id: 'cell-division', title: 'Where it happens: cells & organelles', minutes: 10, kind: 'concept' },
        ]},
        { title: 'The Chemistry', description: 'The reactions that turn light into food.', lessons: [
          { id: 'photosynthesis', title: 'Light reactions vs. the Calvin cycle', minutes: 15, kind: 'concept' },
          { id: 'photosynthesis', title: 'Inputs, outputs, and energy flow', minutes: 12, kind: 'concept' },
        ]},
        { title: 'Test Yourself', description: 'Make sure it stuck.', lessons: [
          { id: 'photosynthesis', title: 'Practice questions & common traps', minutes: 10, kind: 'quiz' },
        ]},
      ],
    },
    'cell-division': {
      intro: `Everything you need on how cells divide. ${paceNote}`,
      units: [
        { title: 'Why Cells Divide', lessons: [
          { id: 'cell-division', title: 'The purpose of mitosis', minutes: 10, kind: 'core' },
        ]},
        { title: 'The Process', description: 'Step by step through the phases.', lessons: [
          { id: 'cell-division', title: 'The four phases (PMAT)', minutes: 14, kind: 'concept' },
          { id: 'cell-division', title: 'What can go wrong', minutes: 10, kind: 'concept' },
        ]},
        { title: 'Mastery', lessons: [
          { id: 'cell-division', title: 'Quiz: phases & purpose', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    electricity: {
      intro: `From electrons to circuits — a full study plan on how electricity works. ${paceNote}`,
      units: [
        { title: 'What Electricity Is', lessons: [
          { id: 'electricity', title: 'Moving charge & current', minutes: 10, kind: 'core' },
          { id: 'electricity', title: 'Circuits and the complete loop', minutes: 12, kind: 'concept' },
        ]},
        { title: 'The Key Quantities', description: 'Voltage, current, resistance.', lessons: [
          { id: 'electricity', title: 'Voltage vs. current vs. resistance', minutes: 14, kind: 'concept' },
          { id: 'electricity', title: 'Ohm\'s Law in practice', minutes: 12, kind: 'practice' },
        ]},
        { title: 'Check Your Understanding', lessons: [
          { id: 'electricity', title: 'Circuit quiz', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    'newtons-laws': {
      intro: `Master all three of Newton's laws and how they connect. ${paceNote}`,
      units: [
        { title: 'The Three Laws', description: 'One lesson per law.', lessons: [
          { id: 'newtons-laws', title: 'First Law: Inertia', minutes: 10, kind: 'concept' },
          { id: 'newtons-laws', title: 'Second Law: F = ma', minutes: 12, kind: 'concept' },
          { id: 'newtons-laws', title: 'Third Law: Action & Reaction', minutes: 12, kind: 'concept' },
        ]},
        { title: 'Putting It Together', lessons: [
          { id: 'newtons-laws', title: 'Real-world applications', minutes: 14, kind: 'practice' },
          { id: 'newtons-laws', title: 'Quiz: all three laws', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    fractions: {
      intro: `Build real confidence with fractions, step by step. ${paceNote}`,
      units: [
        { title: 'What Fractions Are', lessons: [
          { id: 'fractions', title: 'Parts of a whole', minutes: 10, kind: 'core' },
          { id: 'fractions', title: 'Numerator & denominator', minutes: 10, kind: 'concept' },
        ]},
        { title: 'Working With Fractions', lessons: [
          { id: 'fractions', title: 'Equivalent fractions', minutes: 12, kind: 'concept' },
          { id: 'fractions', title: 'Practice problems', minutes: 14, kind: 'practice' },
        ]},
        { title: 'Mastery', lessons: [
          { id: 'fractions', title: 'Quiz yourself', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    'algebra-intro': {
      intro: `A gentle but thorough introduction to algebraic thinking. ${paceNote}`,
      units: [
        { title: 'The Idea of Unknowns', lessons: [
          { id: 'algebra-intro', title: 'What algebra actually is', minutes: 10, kind: 'core' },
          { id: 'algebra-intro', title: 'Why we use letters', minutes: 8, kind: 'concept' },
        ]},
        { title: 'Solving Equations', lessons: [
          { id: 'algebra-intro', title: 'The golden rule of balance', minutes: 12, kind: 'concept' },
          { id: 'algebra-intro', title: 'Solving step by step', minutes: 15, kind: 'practice' },
        ]},
        { title: 'Mastery', lessons: [
          { id: 'algebra-intro', title: 'Quiz: solve for x', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    storytelling: {
      intro: `Learn the craft of storytelling from structure to character. ${paceNote}`,
      units: [
        { title: 'The Shape of Stories', lessons: [
          { id: 'storytelling', title: 'The universal story structure', minutes: 10, kind: 'core' },
          { id: 'storytelling', title: 'The story arc in detail', minutes: 12, kind: 'concept' },
        ]},
        { title: 'Character & Desire', lessons: [
          { id: 'storytelling', title: 'Why desire drives every story', minutes: 12, kind: 'concept' },
          { id: 'storytelling', title: 'Analyze a story you love', minutes: 12, kind: 'practice' },
        ]},
        { title: 'Mastery', lessons: [
          { id: 'storytelling', title: 'Quiz: story fundamentals', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    'wwii-causes': {
      intro: `A thorough look at what really caused the Second World War. ${paceNote}`,
      units: [
        { title: 'The Aftermath of WWI', lessons: [
          { id: 'wwii-causes', title: 'The Treaty of Versailles', minutes: 12, kind: 'concept' },
          { id: 'wwii-causes', title: 'A humiliated, resentful Germany', minutes: 10, kind: 'concept' },
        ]},
        { title: 'Economic Collapse', lessons: [
          { id: 'wwii-causes', title: 'The Great Depression\'s role', minutes: 12, kind: 'concept' },
          { id: 'wwii-causes', title: 'The rise of dictators', minutes: 12, kind: 'concept' },
        ]},
        { title: 'The Road to War', lessons: [
          { id: 'wwii-causes', title: 'Appeasement and its failure', minutes: 12, kind: 'concept' },
          { id: 'wwii-causes', title: 'Quiz: causes of WWII', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    'french-revolution': {
      intro: `Understand how and why France erupted in 1789. ${paceNote}`,
      units: [
        { title: 'A Society Divided', lessons: [
          { id: 'french-revolution', title: 'The three estates', minutes: 12, kind: 'concept' },
          { id: 'french-revolution', title: 'Inequality and taxes', minutes: 10, kind: 'concept' },
        ]},
        { title: 'The Explosion', lessons: [
          { id: 'french-revolution', title: 'The spark that lit it', minutes: 12, kind: 'concept' },
          { id: 'french-revolution', title: 'Storming the Bastille', minutes: 12, kind: 'concept' },
        ]},
        { title: 'Mastery', lessons: [
          { id: 'french-revolution', title: 'Quiz: the revolution', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
    'supply-demand': {
      intro: `A complete intro to the forces that set every price. ${paceNote}`,
      units: [
        { title: 'The Two Forces', lessons: [
          { id: 'supply-demand', title: 'Demand explained', minutes: 10, kind: 'concept' },
          { id: 'supply-demand', title: 'Supply explained', minutes: 10, kind: 'concept' },
        ]},
        { title: 'How They Interact', lessons: [
          { id: 'supply-demand', title: 'Finding equilibrium', minutes: 12, kind: 'concept' },
          { id: 'supply-demand', title: 'Real-world price examples', minutes: 12, kind: 'practice' },
        ]},
        { title: 'Mastery', lessons: [
          { id: 'supply-demand', title: 'Quiz: supply & demand', minutes: 8, kind: 'quiz' },
        ]},
      ],
    },
  };

  return courses[course.id] || {
    intro: `A study plan for ${course.title}. ${paceNote}`,
    units: [
      { title: 'Unit 1', lessons: [{ id: course.id, title: course.title, minutes: 12, kind: 'core' }] },
    ],
  };
}
