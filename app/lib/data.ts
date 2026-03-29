import { AnswerRange } from './scoring';

export interface Level {
  level: number;
  name: string;
  tagline: string;
  description: string;
  image: string;
  prefix: string;
}

export interface Question {
  text: string;
  options: { label: string; range: AnswerRange }[];
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: 'THE TOURIST',
    tagline: 'Used ChatGPT once. Thinks Claude is basically the same thing.',
    description: "You've heard the hype and dipped a toe in. Claude felt clever but disposable. You're not wrong that it's impressive — you just haven't found the version that works for you yet. Level 2 is one habit change away.",
    image: '/tourist.jpg',
    prefix: 'TO',
  },
  {
    level: 2,
    name: 'THE SUBSCRIBER',
    tagline: 'Uses Claude regularly. Mostly to rewrite emails.',
    description: "You're using Claude regularly but for surface-level tasks — rewriting emails, summarising articles, answering questions you could Google. The capability is sitting idle. You haven't discovered what happens when you give it real context. Level 3 shows you.",
    image: '/subscriber.jpg',
    prefix: 'SU',
  },
  {
    level: 3,
    name: 'THE PROMPTER',
    tagline: 'Has learned to give Claude context. Loses everything when they close the tab.',
    description: "You've figured out that context matters. You give Claude a solid brief and you get solid output. But every session resets — and you feel it. The amnesia isn't Claude's fault. It's a missing layer you haven't built yet. Level 4 is one 90-minute setup away.",
    image: '/prompter.jpg',
    prefix: 'PR',
  },
  {
    level: 4,
    name: 'THE FRUSTRATED ONE',
    tagline: 'Has had a genuinely impressive Claude conversation. Has never been able to recreate it.',
    description: "You've seen what Claude can do when everything clicks. That conversation was real. But you can't get back there reliably — it feels random. It's not. There's a structure behind those breakthroughs. Level 5 makes it repeatable.",
    image: '/frustrated.jpg',
    prefix: 'FR',
  },
  {
    level: 5,
    name: 'THE UNLOCKED',
    tagline: 'Claude Code installed. CLAUDE.md created. Claude knows their business.',
    description: "You broke through. Claude has context on your work and you're not re-explaining yourself every session. This is the transition most people never make — you made it. Level 6 is about building something real with the foundation you've laid.",
    image: '/unlocked.jpg',
    prefix: 'UN',
  },
  {
    level: 6,
    name: 'THE BUILDER',
    tagline: 'Has shipped one real project with Claude. Understands memory architecture.',
    description: "You've shipped something you couldn't have built alone. You understand how Claude's memory layers work and you've stopped fighting the context window. The next move: connect Claude to your live systems. Level 7 is MCP territory.",
    image: '/builder.jpg',
    prefix: 'BU',
  },
  {
    level: 7,
    name: 'THE STATEFUL OPERATOR',
    tagline: 'Claude carries full context. MCP connected. Never re-explains themselves.',
    description: "Claude knows your business, your tools, and your preferences. You've stopped managing the AI and started building with it. This is the compounding return: every project adds context, every context makes the next project faster. You're running ahead.",
    image: '/operator.jpg',
    prefix: 'SO',
  },
];

export const QUESTIONS: Question[] = [
  {
    text: 'How do you start a new Claude conversation?',
    options: [
      { label: '🔄 I paste the same context I always paste. Every time.', range: [1, 2] },
      { label: '💬 I just type what I need and figure it out as I go', range: [2, 3] },
      { label: '📋 I have a saved system prompt — copy, paste, go', range: [3, 4] },
      { label: '⚡ Nothing. Claude already knows my project.', range: [6, 7] },
    ],
  },
  {
    text: 'What happens to your best Claude conversations?',
    options: [
      { label: '😬 They disappear when I close the tab', range: [1, 2] },
      { label: '📸 I screenshot the good bits', range: [2, 3] },
      { label: '📄 I copy key outputs into a doc somewhere', range: [3, 4] },
      { label: "🧠 They're committed to the project's memory", range: [6, 7] },
    ],
  },
  {
    text: 'Have you ever heard of CLAUDE.md?',
    options: [
      { label: '❓ No idea what that is', range: [1, 2] },
      { label: "🤔 I've seen it mentioned but never used one", range: [3, 4] },
      { label: "📝 I have one but I don't really maintain it", range: [4, 5] },
      { label: "✅ Yes — it's how Claude knows everything about my project", range: [6, 7] },
    ],
  },
  {
    text: 'How would you describe your relationship with Claude right now?',
    options: [
      { label: '🎲 Hit and miss — sometimes brilliant, often frustrating', range: [1, 3] },
      { label: "🔧 Useful for tasks but I'm basically its memory", range: [3, 4] },
      { label: '🤝 We have a workflow. It mostly works.', range: [4, 5] },
      { label: "🏗️ It's infrastructure. I build with it.", range: [6, 7] },
    ],
  },
  {
    text: 'What\'s a "terminal" to you?',
    options: [
      { label: "😅 Something I've heard of but never opened", range: [1, 2] },
      { label: "👀 I've opened it once. It was scary. I closed it.", range: [2, 3] },
      { label: '🛠️ I use it occasionally — npm installs, git, that kind of thing', range: [4, 5] },
      { label: "🖥️ It's where I work. Claude Code runs there.", range: [6, 7] },
    ],
  },
  {
    text: 'What would it mean for you to "level up" with Claude?',
    options: [
      { label: '📚 Actually understanding what it can do', range: [1, 2] },
      { label: '💡 Stopping the copy-paste context loop', range: [2, 4] },
      { label: '🚀 Having Claude remember my business without being told', range: [4, 5] },
      { label: '🌐 Shipping something real. A project others can see.', range: [6, 7] },
    ],
  },
];
