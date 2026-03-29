'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LEVELS, QUESTIONS } from './lib/data';
import { calculateLevel, AnswerRange } from './lib/scoring';

type Screen = 'intro' | 'question' | 'email' | 'result';

interface QuizState {
  screen: Screen;
  questionIndex: number;
  answers: AnswerRange[];
  email: string;
  level: number;
  revealStep: number;
  typedTagline: string;
}

const initialState: QuizState = {
  screen: 'intro',
  questionIndex: 0,
  answers: [],
  email: '',
  level: 1,
  revealStep: 0,
  typedTagline: '',
};

// ── Shared styles ──────────────────────────────────────────────

const gridBg: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundImage:
    'linear-gradient(rgba(0,200,220,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,220,0.025) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
  pointerEvents: 'none',
  zIndex: 0,
};

const card: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 480,
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(0,200,220,0.12)',
  borderRadius: 12,
  overflow: 'hidden',
};

const cardInner: React.CSSProperties = {
  padding: 32,
};

const topHighlight: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(0,200,220,0.3), transparent)',
};

const centered: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: 16,
};

// ── Component ──────────────────────────────────────────────────

export default function Home() {
  const [state, setState] = useState<QuizState>(initialState);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const { screen, questionIndex, answers, email, level, revealStep, typedTagline } = state;

  const currentLevel = level > 0 && level <= LEVELS.length ? LEVELS[level - 1] : LEVELS[0];

  // ── Email auto-focus ──
  useEffect(() => {
    if (screen === 'email') {
      emailRef.current?.focus();
    }
  }, [screen]);

  // ── Result reveal chain ──
  useEffect(() => {
    if (screen !== 'result') return;

    const delays = [300, 400, 200, 0, 300, 400];
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let step = 1; step <= 6; step++) {
      cumulative += delays[step - 1];
      const s = step;
      timers.push(
        setTimeout(() => {
          setState((prev) => ({ ...prev, revealStep: s }));
        }, cumulative)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [screen]);

  // ── Tagline typing effect (step 4) ──
  useEffect(() => {
    if (revealStep < 4) return;
    const tagline = currentLevel.tagline;
    if (typedTagline.length >= tagline.length) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const next = prev.typedTagline.length + 1;
        if (next > tagline.length) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, typedTagline: tagline.slice(0, next) };
      });
    }, 40);

    return () => clearInterval(interval);
  }, [revealStep, currentLevel.tagline, typedTagline.length]);

  // ── Handlers ──

  const startQuiz = useCallback(() => {
    setState((prev) => ({ ...prev, screen: 'question', questionIndex: 0 }));
  }, []);

  const selectAnswer = useCallback(
    (optionIndex: number, range: AnswerRange) => {
      setSelectedOption(optionIndex);
      setTimeout(() => {
        setSelectedOption(null);
        setState((prev) => {
          const newAnswers = [...prev.answers, range];
          if (prev.questionIndex < QUESTIONS.length - 1) {
            return { ...prev, answers: newAnswers, questionIndex: prev.questionIndex + 1 };
          }
          const computedLevel = calculateLevel(newAnswers);
          return { ...prev, answers: newAnswers, level: computedLevel, screen: 'email' };
        });
      }, 150);
    },
    []
  );

  const submitEmail = useCallback(() => {
    if (!state.email.trim()) return;

    // Non-blocking POST
    const substackUrl = process.env.NEXT_PUBLIC_SUBSTACK_URL;
    if (substackUrl) {
      fetch(`${substackUrl}/api/v1/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          first_url: 'https://quiz.botsinpublic.com',
          referral_code: `level-${state.level}`,
        }),
      }).catch(() => {});
    }

    setState((prev) => ({ ...prev, screen: 'result', revealStep: 0, typedTagline: '' }));
  }, [state.email, state.level]);

  const resetQuiz = useCallback(() => {
    setState(initialState);
    setSelectedOption(null);
  }, []);

  const shareResult = useCallback(async () => {
    const text = `I'm a Level ${level} Claude user: ${currentLevel.name}. Take the quiz: https://quiz.botsinpublic.com`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [level, currentLevel.name]);

  // ── Render helpers ──

  const shell = (children: React.ReactNode) => (
    <>
      <div style={gridBg} />
      <div style={centered}>
        <div style={card}>
          <div style={topHighlight} />
          <div style={cardInner}>{children}</div>
        </div>
      </div>
    </>
  );

  // ── SCREEN: Intro ──

  if (screen === 'intro') {
    return shell(
      <>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 13,
            color: '#00c8dc',
            margin: '0 0 24px 0',
          }}
        >
          $ bots-in-public --quiz
          <span style={{ animation: 'blink 1s step-end infinite', marginLeft: 2 }}>█</span>
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: 26,
            fontWeight: 600,
            color: '#e8f4f8',
            margin: '0 0 12px 0',
            lineHeight: 1.2,
          }}
        >
          What level Claude user are you?
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: '#8aa8b8',
            margin: '0 0 28px 0',
          }}
        >
          <span style={{ color: '#8aa8b8' }}>
            Most Claude Pro subscribers are stuck at Level 2.
          </span>{' '}
          <span style={{ color: '#5a7a8a' }}>
            Six questions. Find out where you actually are.
          </span>
        </p>
        <button
          onClick={startQuiz}
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 13,
            color: '#00c8dc',
            background: 'rgba(0,200,220,0.08)',
            border: '1px solid rgba(0,200,220,0.3)',
            borderRadius: 6,
            padding: '10px 24px',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          [ find my level → ]
        </button>
      </>
    );
  }

  // ── SCREEN: Question ──

  if (screen === 'question') {
    const q = QUESTIONS[questionIndex];
    return shell(
      <>
        <div
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 12,
            color: '#2a4a5a',
            textAlign: 'right',
            marginBottom: 20,
          }}
        >
          [{questionIndex + 1} / 6]
        </div>
        <p
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: 17,
            color: '#e8f4f8',
            margin: '0 0 24px 0',
            lineHeight: 1.4,
          }}
        >
          {q.text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i, opt.range)}
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 12,
                  color: isSelected ? '#00c8dc' : '#8aa8b8',
                  background: isSelected ? 'rgba(0,200,220,0.12)' : 'transparent',
                  border: isSelected
                    ? '1px solid rgba(0,200,220,0.4)'
                    : '1px solid rgba(0,200,220,0.08)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: '#00c8dc', marginRight: 8 }}>&gt;</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // ── SCREEN: Email Gate ──

  if (screen === 'email') {
    return shell(
      <>
        <style>{`input[type=email]::placeholder { color: #2a4a5a; } input[type=email]:focus { border-color: rgba(0,200,220,0.4) !important; }`}</style>

        {/* Blurred fake result preview */}
        <div
          style={{
            filter: 'blur(5px)',
            opacity: 0.5,
            pointerEvents: 'none',
            marginBottom: 24,
            padding: 16,
            background: 'rgba(0,200,220,0.04)',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 11,
              color: '#00c8dc',
              marginBottom: 8,
            }}
          >
            ◉ LEVEL UNLOCKED
          </div>
          <div
            style={{
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontSize: 22,
              fontWeight: 600,
              color: '#e8f4f8',
            }}
          >
            Level {level} — {currentLevel.name}
          </div>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: '#e8f4f8',
            margin: '0 0 8px 0',
          }}
        >
          Your result is ready.
        </h2>
        <p
          style={{
            fontSize: 14,
            color: '#8aa8b8',
            lineHeight: 1.6,
            margin: '0 0 20px 0',
          }}
        >
          Enter your email to unlock your level — and find out exactly what&apos;s keeping you stuck.
        </p>
        <input
          ref={emailRef}
          type="email"
          placeholder="> _"
          value={email}
          onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitEmail();
          }}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 14,
            color: '#e8f4f8',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,200,220,0.15)',
            borderRadius: 6,
            padding: '10px 14px',
            outline: 'none',
            marginBottom: 12,
          }}
        />
        <button
          onClick={submitEmail}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 13,
            color: '#00c8dc',
            background: 'rgba(0,200,220,0.08)',
            border: '1px solid rgba(0,200,220,0.3)',
            borderRadius: 6,
            padding: '10px 24px',
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          [ unlock my level → ]
        </button>
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            color: '#2a4a5a',
            margin: 0,
            textAlign: 'center',
          }}
        >
          No spam. 3 emails over 3 days. Unsubscribe anytime.
        </p>
      </>
    );
  }

  // ── SCREEN: Result Reveal ──

  const taglineComplete = typedTagline.length >= currentLevel.tagline.length;

  return shell(
    <>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      {/* Step 1: Level badge */}
      <div
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 11,
          color: '#00c8dc',
          marginBottom: 12,
          opacity: revealStep >= 1 ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      >
        ◉ LEVEL UNLOCKED
      </div>

      {/* Step 2: Level number + name */}
      <h2
        style={{
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          fontSize: 26,
          fontWeight: 600,
          color: '#e8f4f8',
          margin: '0 0 16px 0',
          opacity: revealStep >= 2 ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      >
        Level {level} — {currentLevel.name}
      </h2>

      {/* Step 3: Horizontal rule */}
      <div
        style={{
          height: 1,
          background: 'rgba(0,200,220,0.2)',
          marginBottom: 16,
          transform: revealStep >= 3 ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.5s',
        }}
      />

      {/* Step 4: Tagline typing */}
      <p
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 13,
          color: '#00c8dc',
          lineHeight: 1.6,
          margin: '0 0 16px 0',
          minHeight: 24,
          opacity: revealStep >= 4 ? 1 : 0,
        }}
      >
        {revealStep >= 4 && (
          <>
            &ldquo;{typedTagline}
            {!taglineComplete && (
              <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
            )}
            {taglineComplete && <>&rdquo;</>}
          </>
        )}
      </p>

      {/* Step 5: Description */}
      <p
        style={{
          fontSize: 14,
          color: '#8aa8b8',
          lineHeight: 1.7,
          margin: '0 0 24px 0',
          opacity: revealStep >= 5 ? 1 : 0,
          transition: 'opacity 0.5s',
        }}
      >
        {currentLevel.description}
      </p>

      {/* Step 6: QR + CTAs */}
      <div
        style={{
          opacity: revealStep >= 6 ? 1 : 0,
          transform: revealStep >= 6 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s, transform 0.5s',
        }}
      >
        {/* QR Code block */}
        <div
          style={{
            background: 'rgba(0,200,220,0.04)',
            border: '1px solid rgba(0,200,220,0.12)',
            borderRadius: 8,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 10,
              color: '#00c8dc',
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            [ RECOMMENDED ]
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                background: '#e8f4f8',
                borderRadius: 6,
                padding: 8,
                flexShrink: 0,
              }}
            >
              <QRCodeSVG
                value="https://botsinpublic.substack.com/subscribe"
                size={96}
                fgColor="#0a0f1a"
                bgColor="#e8f4f8"
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#e8f4f8',
                  marginBottom: 4,
                }}
              >
                €99 once
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#5a7a8a',
                  lineHeight: 1.5,
                }}
              >
                Course + Claude Pro 1 month / Guided from your level to Level 7
              </div>
            </div>
          </div>
        </div>

        {/* Share row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <button
            onClick={shareResult}
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 12,
              color: '#00c8dc',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ↗ share my level
          </button>
          <button
            onClick={resetQuiz}
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: 12,
              color: '#5a7a8a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            → start at level 1 free
          </button>
        </div>
      </div>
    </>
  );
}
