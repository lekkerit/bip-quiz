'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { LEVELS, QUESTIONS } from './lib/data';
import { calculateLevel, AnswerRange } from './lib/scoring';
import { color, font, type as typ, space } from './lib/theme';
import RetroAnimation, { PacManIntro } from './components/RetroAnimation';

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
    'linear-gradient(rgba(232,117,58,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,117,58,0.025) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
  pointerEvents: 'none',
  zIndex: 0,
};

const card: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 520,
  background: color.cardBg,
  border: `1px solid ${color.cardBorder}`,
  borderRadius: 12,
  overflow: 'hidden',
};

const cardInner: React.CSSProperties = {
  padding: space['2xl'],
};

const topHighlight: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '10%',
  right: '10%',
  height: 1,
  background: `linear-gradient(90deg, transparent, ${color.highlightGlow}, transparent)`,
};

const centered: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: space.lg,
};

// ── Component ──────────────────────────────────────────────────

export default function Home() {
  const [state, setState] = useState<QuizState>(initialState);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
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
        setHoveredOption(null);
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
    setHoveredOption(null);
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PacManIntro />
        </div>
        <p
          style={{
            fontFamily: font.mono,
            fontSize: typ.counter.fontSize,
            color: color.accent,
            margin: `0 0 ${space.xl}px 0`,
            opacity: 0.7,
          }}
        >
          $ bots-in-public --quiz
          <span style={{ animation: 'blink 1s step-end infinite', marginLeft: 2 }}>█</span>
        </p>
        <h1
          style={{
            fontFamily: font.heading,
            fontSize: typ.headline.fontSize,
            fontWeight: typ.headline.fontWeight,
            letterSpacing: typ.headline.letterSpacing,
            color: color.textHigh,
            margin: `0 0 ${space.sm}px 0`,
            lineHeight: 1.3,
          }}
        >
          What level Claude user are you?
        </h1>
        <p
          style={{
            fontFamily: font.mono,
            fontSize: typ.label.fontSize,
            lineHeight: 1.6,
            margin: `0 0 ${space.xl}px 0`,
          }}
        >
          <span style={{ color: color.textMid }}>
            Most AI power users are stuck at Level 2.
          </span>
          <br />
          <span style={{ color: color.textLow }}>
            Six questions. Find out where you actually are.
          </span>
        </p>
        <button
          onClick={startQuiz}
          style={{
            fontFamily: font.mono,
            fontSize: typ.code.fontSize,
            letterSpacing: typ.code.letterSpacing,
            color: color.accent,
            background: color.ctaBg,
            border: `1px solid ${color.ctaBorder}`,
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
            fontFamily: font.mono,
            fontSize: typ.counter.fontSize,
            letterSpacing: typ.counter.letterSpacing,
            color: color.textGhost,
            textAlign: 'right',
            marginBottom: space.sm,
          }}
        >
          [{questionIndex + 1} / 6]
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <RetroAnimation questionIndex={questionIndex} />
        </div>
        <p
          style={{
            fontFamily: font.heading,
            fontSize: typ.question.fontSize,
            fontWeight: typ.question.fontWeight,
            letterSpacing: typ.question.letterSpacing,
            color: color.textHigh,
            margin: `0 0 ${space.xl}px 0`,
            lineHeight: 1.45,
          }}
        >
          {q.text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isHovered = hoveredOption === i && selectedOption === null;

            let optBg: string = 'transparent';
            let optBorder: string = '1px solid transparent';
            let optColor: string = color.textLow;
            let promptColor: string = color.textGhost;

            if (isSelected) {
              optBg = color.selectedBg;
              optBorder = `1px solid ${color.selectedBorder}`;
              optColor = color.textHigh;
              promptColor = color.accent;
            } else if (isHovered) {
              optBg = color.hoverBg;
              optBorder = `1px solid ${color.hoverBorder}`;
              optColor = color.textMid;
              promptColor = color.accent;
            }

            return (
              <button
                key={i}
                onClick={() => selectedOption === null && selectAnswer(i, opt.range)}
                onMouseEnter={() => setHoveredOption(i)}
                onMouseLeave={() => setHoveredOption(null)}
                style={{
                  fontFamily: font.mono,
                  fontSize: typ.label.fontSize,
                  color: optColor,
                  background: optBg,
                  border: optBorder,
                  borderRadius: 8,
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: selectedOption !== null ? 'default' : 'pointer',
                  transition: 'all 0.1s',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span style={{ color: promptColor, flexShrink: 0 }}>&gt;</span>
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
        <style>{`input[type=email]::placeholder { color: ${color.textGhost}; } input[type=email]:focus { border-color: ${color.selectedBorder} !important; }`}</style>

        {/* Blurred fake result preview */}
        <div
          style={{
            filter: 'blur(5px)',
            opacity: 0.5,
            pointerEvents: 'none',
            userSelect: 'none',
            marginBottom: space.lg,
            padding: 14,
            background: color.blurBg,
            border: `1px solid ${color.blurBorder}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontFamily: font.mono,
              fontSize: typ.counter.fontSize,
              color: color.accent,
              marginBottom: space.sm,
            }}
          >
            ◉ LEVEL UNLOCKED
          </div>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: 14,
              color: color.textHigh,
            }}
          >
            LEVEL {level} — {currentLevel.name}
          </div>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: typ.counter.fontSize,
              color: color.textLow,
              marginTop: space.xs,
            }}
          >
            &ldquo;{currentLevel.tagline.slice(0, 30)}...&rdquo;
          </div>
        </div>

        <h2
          style={{
            fontFamily: font.heading,
            fontSize: 15,
            fontWeight: 600,
            color: color.textHigh,
            margin: `0 0 ${space.xs}px 0`,
          }}
        >
          Your result is ready.
        </h2>
        <p
          style={{
            fontFamily: font.mono,
            fontSize: typ.counter.fontSize,
            color: color.textMuted,
            lineHeight: 1.6,
            margin: `0 0 14px 0`,
          }}
        >
          Enter your email to unlock your level — and be first to know when the course drops.
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
            fontFamily: font.mono,
            fontSize: typ.code.fontSize,
            color: color.textHigh,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid rgba(232,117,58,0.15)`,
            borderRadius: 6,
            padding: '10px 14px',
            outline: 'none',
            marginBottom: 10,
          }}
        />
        <button
          onClick={submitEmail}
          style={{
            width: '100%',
            fontFamily: font.mono,
            fontSize: typ.code.fontSize,
            letterSpacing: typ.code.letterSpacing,
            color: color.accent,
            background: color.ctaBg,
            border: `1px solid ${color.ctaBorder}`,
            borderRadius: 6,
            padding: '12px 24px',
            cursor: 'pointer',
            marginBottom: space.md,
            textAlign: 'center',
          }}
        >
          [ unlock my level → ]
        </button>
        <p
          style={{
            fontFamily: font.mono,
            fontSize: typ.finePrint.fontSize,
            color: color.textGhost,
            margin: 0,
          }}
        >
          No spam. 3 emails over 3 days. Unsubscribe anytime.
        </p>
      </>
    );
  }

  // ── SCREEN: Result Reveal ──

  const taglineComplete = typedTagline.length >= currentLevel.tagline.length;

  return (
    <>
      <div style={gridBg} />
      <div style={centered}>
        <div style={{ ...card, maxWidth: 560 }}>
          <div style={topHighlight} />

          {/* Hero image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 260,
              overflow: 'hidden',
              opacity: revealStep >= 1 ? 1 : 0,
              transition: 'opacity 0.5s',
            }}
          >
            <Image
              src={currentLevel.image}
              alt={currentLevel.name}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(10,12,16,0.85) 100%)',
              }}
            />
          </div>

          {/* Result header */}
          <div
            style={{
              background: 'rgba(232,117,58,0.06)',
              borderBottom: `1px solid ${color.cardBorder}`,
              padding: `${space.xl}px ${space['2xl']}px 18px`,
            }}
          >
            {/* Step 1: Level badge */}
            <div
              style={{
                fontFamily: font.mono,
                fontSize: typ.finePrint.fontSize,
                color: color.accent,
                letterSpacing: '3px',
                marginBottom: space.md,
                opacity: revealStep >= 1 ? 0.8 : 0,
                transition: 'opacity 0.3s',
              }}
            >
              ◉ LEVEL UNLOCKED
            </div>

            {/* Step 3: Horizontal rule */}
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid rgba(232,117,58,0.2)',
                margin: `${space.sm}px 0`,
                opacity: revealStep >= 3 ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            />

            {/* Step 2: Level number + name (side by side) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                margin: `6px 0 ${space.xs}px`,
              }}
            >
              <div
                style={{
                  fontFamily: font.mono,
                  fontSize: 36,
                  fontWeight: 500,
                  color: color.accent,
                  letterSpacing: '-1px',
                  lineHeight: 1,
                  opacity: revealStep >= 1 ? 1 : 0,
                  transition: 'opacity 0.3s',
                }}
              >
                {level}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: 16,
                    color: color.textHigh,
                    fontWeight: 500,
                    letterSpacing: '1px',
                    opacity: revealStep >= 2 ? 1 : 0,
                    transition: 'opacity 0.4s',
                  }}
                >
                  {currentLevel.name}
                </div>
                <hr
                  style={{
                    border: 'none',
                    borderTop: '1px solid rgba(232,117,58,0.15)',
                    margin: `${space.xs}px 0`,
                    opacity: revealStep >= 3 ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }}
                />
                {/* Step 4: Tagline typing */}
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: typ.counter.fontSize,
                    color: color.textLow,
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    minHeight: 18,
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
                </div>
              </div>
            </div>
          </div>

          {/* Result body */}
          <div
            style={{
              padding: `${space.xl}px ${space['2xl']}px`,
              opacity: revealStep >= 5 ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          >
            <p
              style={{
                fontFamily: font.mono,
                fontSize: typ.code.fontSize,
                color: color.textMuted,
                lineHeight: 1.7,
                margin: `0 0 ${space.xl}px 0`,
              }}
            >
              {currentLevel.description}
            </p>

            {/* Step 6: QR + CTAs */}
            <div
              style={{
                opacity: revealStep >= 6 ? 1 : 0,
                transform: revealStep >= 6 ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.4s, transform 0.4s',
              }}
            >
              {/* Waitlist confirmation */}
              <div
                style={{
                  background: 'rgba(232,117,58,0.05)',
                  border: `1px solid rgba(232,117,58,0.25)`,
                  borderRadius: 10,
                  padding: space.xl,
                  textAlign: 'center',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: typ.microLabel.fontSize,
                    letterSpacing: typ.microLabel.letterSpacing,
                    color: color.accent,
                    opacity: 0.8,
                    marginBottom: 14,
                    textTransform: 'uppercase',
                  }}
                >
                  [ YOU&apos;RE ON THE LIST ]
                </div>
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: typ.code.fontSize,
                    color: color.textMuted,
                    lineHeight: 1.7,
                  }}
                >
                  We&apos;re building a 10-day course to take you
                  <br />
                  from Level {level} to Level 7.
                </div>
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: typ.finePrint.fontSize,
                    color: color.textGhost,
                    marginTop: space.md,
                  }}
                >
                  We&apos;ll email you when it&apos;s ready.
                </div>
              </div>

              {/* Share + retake row */}
              <div style={{ display: 'flex', gap: space.sm }}>
                <button
                  onClick={shareResult}
                  style={{
                    flex: 1,
                    fontFamily: font.mono,
                    fontSize: typ.counter.fontSize,
                    color: color.accent,
                    background: color.ctaBg,
                    border: `1px solid ${color.ctaBorder}`,
                    borderRadius: 6,
                    padding: 10,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  ↗ share my level
                </button>
                <button
                  onClick={resetQuiz}
                  style={{
                    flex: 1,
                    fontFamily: font.mono,
                    fontSize: typ.counter.fontSize,
                    color: color.textGhost,
                    background: 'transparent',
                    border: `1px solid ${color.subtleBorder}`,
                    borderRadius: 6,
                    padding: 10,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  ↻ retake quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </>
  );
}
