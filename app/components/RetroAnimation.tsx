'use client';

import { useEffect, useRef, useState } from 'react';

interface RetroAnimationProps {
  questionIndex: number;
}

// Color palette matching the terminal theme
const ACCENT = '#e8753a';
const ACCENT_DIM = 'rgba(232,117,58,0.3)';
const ACCENT_GLOW = 'rgba(232,117,58,0.15)';
const BG = '#0a0f1a';

const ASPECT_RATIO = 140 / 480; // height / width
const PACMAN_ASPECT = 160 / 480;

function useResponsiveCanvas(aspectRatio: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const w = container.clientWidth;
      const h = Math.round(w * aspectRatio);
      setDims({ w, h });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [aspectRatio]);

  // Scale canvas buffer for HiDPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [dims]);

  return { containerRef, canvasRef, w: dims.w, h: dims.h };
}

export default function RetroAnimation({ questionIndex }: RetroAnimationProps) {
  const { containerRef, canvasRef, w, h } = useResponsiveCanvas(ASPECT_RATIO);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animations: Record<number, (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void> = {
      0: drawPong,
      1: drawInvaders,
      2: drawTerminal,
      3: drawSignal,
      4: drawBootScreen,
      5: drawTetris,
    };

    const draw = animations[questionIndex] || animations[0];
    let t = 0;

    function loop() {
      const dpr = window.devicePixelRatio || 1;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      draw(ctx!, t, w, h);
      t += 0.016;
      frameRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(frameRef.current);
  }, [questionIndex, w, h, canvasRef]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {w > 0 && (
        <canvas
          ref={canvasRef}
          style={{
            width: w,
            height: h,
            borderRadius: 8,
            marginBottom: 16,
            background: BG,
            border: `1px solid rgba(232,117,58,0.1)`,
          }}
        />
      )}
    </div>
  );
}

// ── Pac-Man intro animation ──
export function PacManIntro() {
  const { containerRef, canvasRef, w, h } = useResponsiveCanvas(PACMAN_ASPECT);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;

    function loop() {
      const dpr = window.devicePixelRatio || 1;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      drawPacMan(ctx!, t, w, h);
      t += 0.016;
      frameRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(frameRef.current);
  }, [w, h, canvasRef]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {w > 0 && (
        <canvas
          ref={canvasRef}
          style={{
            width: w,
            height: h,
            borderRadius: 8,
            marginBottom: 20,
            background: BG,
            border: `1px solid rgba(232,117,58,0.1)`,
          }}
        />
      )}
    </div>
  );
}

function drawPacMan(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  const midY = h / 2;

  // Scanlines
  ctx.fillStyle = 'rgba(232,117,58,0.015)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  // Maze walls (top and bottom)
  ctx.strokeStyle = 'rgba(232,117,58,0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(20, 20);
  ctx.lineTo(w - 20, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, h - 20);
  ctx.lineTo(w - 20, h - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dots trail
  const dotSpacing = 28;
  const dotCount = Math.floor((w - 80) / dotSpacing);
  const pacX = 40 + ((t * 80) % (w - 40));

  for (let i = 0; i < dotCount; i++) {
    const dx = 60 + i * dotSpacing;
    // Only draw dots ahead of pac-man (or already looped)
    if (dx > pacX + 5 || pacX > w - 60) {
      ctx.fillStyle = 'rgba(232,117,58,0.35)';
      ctx.beginPath();
      ctx.arc(dx, midY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Power pellets at corners
  const pelletAlpha = 0.3 + Math.sin(t * 4) * 0.2;
  ctx.fillStyle = `rgba(232,117,58,${pelletAlpha})`;
  ctx.beginPath();
  ctx.arc(40, midY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w - 40, midY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Pac-Man
  const mouthAngle = Math.abs(Math.sin(t * 8)) * 0.4;
  const pacRadius = 16;
  const direction = 0; // facing right

  // Glow
  const grad = ctx.createRadialGradient(pacX, midY, 0, pacX, midY, pacRadius * 2);
  grad.addColorStop(0, 'rgba(232,117,58,0.2)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(pacX - pacRadius * 2, midY - pacRadius * 2, pacRadius * 4, pacRadius * 4);

  // Body
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(pacX, midY, pacRadius, direction + mouthAngle, direction + Math.PI * 2 - mouthAngle);
  ctx.lineTo(pacX, midY);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.arc(pacX + 3, midY - 7, 3, 0, Math.PI * 2);
  ctx.fill();

  // Ghosts chasing (3 ghosts behind pac-man)
  const ghostColors = ['rgba(232,117,58,0.5)', 'rgba(232,117,58,0.35)', 'rgba(232,117,58,0.2)'];
  for (let g = 0; g < 3; g++) {
    let gx = pacX - 40 - g * 30;
    if (gx < 20) gx += w - 40;
    const gy = midY + Math.sin(t * 5 + g * 2) * 3;
    const gSize = 12;

    ctx.fillStyle = ghostColors[g];
    // Ghost body (rounded top, wavy bottom)
    ctx.beginPath();
    ctx.arc(gx, gy - 2, gSize, Math.PI, 0);
    ctx.lineTo(gx + gSize, gy + gSize);
    // Wavy bottom
    for (let w2 = 0; w2 < 4; w2++) {
      const wx = gx + gSize - (w2 * gSize * 2) / 4;
      const wy = gy + gSize + (w2 % 2 === 0 ? -3 : 3);
      ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.fill();

    // Ghost eyes
    ctx.fillStyle = '#f0e8e0';
    ctx.beginPath();
    ctx.arc(gx - 3, gy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(gx + 4, gy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BG;
    ctx.beginPath();
    ctx.arc(gx - 2, gy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(gx + 5, gy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Score text
  ctx.font = '10px monospace';
  ctx.fillStyle = ACCENT_DIM;
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE: ${String(Math.floor(t * 50) % 10000).padStart(5, '0')}`, w - 24, 14);
  ctx.textAlign = 'left';
  ctx.fillText('1UP', 24, 14);
}

// ── Q1: Pong — conversation back and forth ──
function drawPong(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {

  // Scanlines
  ctx.fillStyle = 'rgba(232,117,58,0.015)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  // Center dashed line
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = ACCENT_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ball
  const ballX = w / 2 + Math.sin(t * 2.5) * (w / 2 - 40);
  const ballY = h / 2 + Math.sin(t * 3.7) * (h / 2 - 20);

  // Glow
  const grad = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, 20);
  grad.addColorStop(0, ACCENT_GLOW);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(ballX - 20, ballY - 20, 40, 40);

  // Ball pixel
  ctx.fillStyle = ACCENT;
  ctx.fillRect(ballX - 3, ballY - 3, 6, 6);

  // Left paddle
  const lPadY = h / 2 + Math.sin(t * 3.7 + 0.3) * (h / 2 - 30);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(16, lPadY - 18, 6, 36);

  // Right paddle
  const rPadY = h / 2 + Math.sin(t * 3.7 - 0.3) * (h / 2 - 30);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(w - 22, rPadY - 18, 6, 36);

  // Score
  ctx.font = '16px monospace';
  ctx.fillStyle = ACCENT_DIM;
  ctx.textAlign = 'center';
  ctx.fillText('03', w / 2 - 30, 24);
  ctx.fillText('05', w / 2 + 30, 24);
}

// ── Q2: Space Invaders — data falling/being lost ──
function drawInvaders(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {

  // Scanlines
  ctx.fillStyle = 'rgba(232,117,58,0.015)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  // Draw invader shape (5x5 pixel art)
  const drawInvader = (x: number, y: number, size: number) => {
    const pattern = [
      [0,1,0,1,0],
      [0,1,1,1,0],
      [1,1,0,1,1],
      [1,1,1,1,1],
      [0,1,0,1,0],
    ];
    const px = size / 5;
    pattern.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell) {
          ctx.fillRect(x + rx * px, y + ry * px, px - 0.5, px - 0.5);
        }
      });
    });
  };

  // Grid of invaders
  const rows = 2;
  const cols = 8;
  const offsetX = Math.sin(t * 0.8) * 30;
  const invSize = 28;
  const spacing = 48;
  const startX = (w - cols * spacing) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * spacing + offsetX;
      const y = 16 + r * 40 + Math.sin(t * 2 + c * 0.5) * 3;
      const alpha = 0.4 + Math.sin(t * 3 + c + r) * 0.2;
      ctx.fillStyle = `rgba(232,117,58,${alpha})`;
      drawInvader(x, y, invSize);
    }
  }

  // Player cannon at bottom
  ctx.fillStyle = ACCENT;
  const px = w / 2 + Math.sin(t * 1.5) * 60;
  ctx.fillRect(px - 8, h - 18, 16, 6);
  ctx.fillRect(px - 2, h - 24, 4, 8);

  // Bullets
  const bulletY = h - 28 - ((t * 120) % 100);
  if (bulletY > 0) {
    ctx.fillStyle = ACCENT;
    ctx.fillRect(px, bulletY, 2, 8);
  }
}

// ── Q3: Terminal typing — CLAUDE.md ──
function drawTerminal(ctx: CanvasRenderingContext2D, t: number, w: number, _h: number) {

  // Terminal chrome
  ctx.fillStyle = 'rgba(232,117,58,0.05)';
  ctx.fillRect(12, 8, w - 24, 20);
  ctx.fillStyle = ACCENT_DIM;
  ctx.fillRect(12, 28, w - 24, 1);

  // Window dots
  const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
  dotColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(26 + i * 16, 18, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Title
  ctx.font = '10px monospace';
  ctx.fillStyle = ACCENT_DIM;
  ctx.textAlign = 'center';
  ctx.fillText('CLAUDE.md', w / 2, 21);
  ctx.textAlign = 'left';

  // Terminal lines
  const lines = [
    '$ cat CLAUDE.md',
    '# Project: my-business',
    'context: full-stack SaaS, Stripe billing',
    'tone: direct, no fluff',
    'stack: Next.js, Postgres, Tailwind',
  ];

  ctx.font = '12px monospace';
  const charsTyped = Math.floor(t * 18);
  let totalChars = 0;

  lines.forEach((line, i) => {
    const y = 50 + i * 20;
    const lineStart = totalChars;
    totalChars += line.length;

    if (charsTyped > lineStart) {
      const visible = Math.min(line.length, charsTyped - lineStart);
      const text = line.slice(0, visible);

      if (line.startsWith('$')) {
        ctx.fillStyle = ACCENT;
      } else if (line.startsWith('#')) {
        ctx.fillStyle = 'rgba(232,117,58,0.7)';
      } else {
        ctx.fillStyle = 'rgba(232,117,58,0.4)';
      }
      ctx.fillText(text, 24, y);

      // Cursor on current line
      if (charsTyped >= lineStart && charsTyped < lineStart + line.length) {
        const cursorX = 24 + ctx.measureText(text).width;
        if (Math.floor(t * 2) % 2 === 0) {
          ctx.fillStyle = ACCENT;
          ctx.fillRect(cursorX, y - 11, 7, 14);
        }
      }
    }
  });
}

// ── Q4: Signal/connection waves ──
function drawSignal(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {

  // Two nodes
  const nodeL = { x: 60, y: h / 2 };
  const nodeR = { x: w - 60, y: h / 2 };

  // Connection line with travelling pulse
  ctx.strokeStyle = ACCENT_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(nodeL.x, nodeL.y);
  ctx.lineTo(nodeR.x, nodeR.y);
  ctx.stroke();

  // Travelling pulses
  for (let i = 0; i < 3; i++) {
    const progress = ((t * 0.4 + i * 0.33) % 1);
    const px = nodeL.x + (nodeR.x - nodeL.x) * progress;
    const py = nodeL.y + (nodeR.y - nodeL.y) * progress;

    const grad = ctx.createRadialGradient(px, py, 0, px, py, 16);
    grad.addColorStop(0, ACCENT);
    grad.addColorStop(0.5, ACCENT_GLOW);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(px - 16, py - 16, 32, 32);

    ctx.fillStyle = ACCENT;
    ctx.fillRect(px - 2, py - 2, 4, 4);
  }

  // Radio waves from left node
  for (let i = 0; i < 3; i++) {
    const radius = 10 + ((t * 40 + i * 20) % 60);
    const alpha = 1 - radius / 70;
    if (alpha > 0) {
      ctx.strokeStyle = `rgba(232,117,58,${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(nodeL.x, nodeL.y, radius, -0.4, 0.4);
      ctx.stroke();
    }
  }

  // Radio waves from right node
  for (let i = 0; i < 3; i++) {
    const radius = 10 + ((t * 40 + i * 20 + 10) % 60);
    const alpha = 1 - radius / 70;
    if (alpha > 0) {
      ctx.strokeStyle = `rgba(232,117,58,${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(nodeR.x, nodeR.y, radius, Math.PI - 0.4, Math.PI + 0.4);
      ctx.stroke();
    }
  }

  // Node labels
  ctx.font = '10px monospace';
  ctx.fillStyle = ACCENT_DIM;
  ctx.textAlign = 'center';
  ctx.fillText('YOU', nodeL.x, nodeL.y + 30);
  ctx.fillText('CLAUDE', nodeR.x, nodeR.y + 30);

  // Nodes
  ctx.fillStyle = ACCENT;
  ctx.fillRect(nodeL.x - 5, nodeL.y - 5, 10, 10);
  ctx.fillRect(nodeR.x - 5, nodeR.y - 5, 10, 10);

  // Status text
  ctx.font = '9px monospace';
  ctx.fillStyle = ACCENT_DIM;
  const statusDots = '.'.repeat(Math.floor(t * 3) % 4);
  ctx.fillText(`syncing${statusDots}`, w / 2, 20);
}

// ── Q5: Boot screen — terminal startup ──
function drawBootScreen(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {

  // Scanlines
  ctx.fillStyle = 'rgba(232,117,58,0.02)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }

  const lines = [
    { text: 'BIOS v3.14 ... OK', delay: 0 },
    { text: 'Loading terminal environment ████████ 100%', delay: 0.5 },
    { text: 'claude-code --version 1.0.47', delay: 1.0 },
    { text: 'Checking API key ............. VALID', delay: 1.5 },
    { text: '> Ready. Type your first prompt.', delay: 2.0 },
  ];

  ctx.font = '11px monospace';
  const loopT = t % 4; // Loop every 4 seconds

  lines.forEach((line, i) => {
    if (loopT < line.delay) return;
    const y = 18 + i * 22;
    const elapsed = loopT - line.delay;
    const visible = Math.min(line.text.length, Math.floor(elapsed * 40));
    const text = line.text.slice(0, visible);

    if (line.text.startsWith('>')) {
      ctx.fillStyle = ACCENT;
    } else if (line.text.includes('OK') || line.text.includes('VALID') || line.text.includes('100%')) {
      ctx.fillStyle = 'rgba(232,117,58,0.6)';
    } else {
      ctx.fillStyle = 'rgba(232,117,58,0.35)';
    }

    ctx.textAlign = 'left';
    ctx.fillText(text, 20, y);

    // Cursor on last visible line
    if (i === lines.length - 1 || (i < lines.length - 1 && loopT < lines[i + 1].delay)) {
      if (visible < line.text.length || (visible >= line.text.length && Math.floor(t * 2) % 2 === 0)) {
        const cursorX = 20 + ctx.measureText(text).width;
        if (visible < line.text.length) {
          ctx.fillStyle = ACCENT;
          ctx.fillRect(cursorX, y - 10, 7, 13);
        }
      }
    }
  });
}

// ── Q6: Tetris — blocks stacking/leveling up ──
function drawTetris(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  const blockSize = 12;
  const gridW = 10;
  const gridH = 10;
  const offsetX = (w - gridW * blockSize) / 2;
  const offsetY = (h - gridH * blockSize) / 2;

  // Grid outline
  ctx.strokeStyle = 'rgba(232,117,58,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= gridW; x++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + x * blockSize, offsetY);
    ctx.lineTo(offsetX + x * blockSize, offsetY + gridH * blockSize);
    ctx.stroke();
  }
  for (let y = 0; y <= gridH; y++) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + y * blockSize);
    ctx.lineTo(offsetX + gridW * blockSize, offsetY + y * blockSize);
    ctx.stroke();
  }

  // Static blocks at bottom (pre-placed)
  const staticRows = [
    [1,0,1,1,0,1,1,0,1,1],
    [1,1,1,1,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
  ];

  staticRows.forEach((row, ry) => {
    row.forEach((cell, rx) => {
      if (cell) {
        const x = offsetX + rx * blockSize;
        const y = offsetY + (gridH - 3 + ry) * blockSize;
        ctx.fillStyle = `rgba(232,117,58,${0.15 + ry * 0.08})`;
        ctx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
      }
    });
  });

  // Falling piece (T-shape)
  const fallY = ((t * 1.5) % 3) * (gridH / 3);
  const fallX = 3 + Math.floor(Math.sin(t * 0.7) * 2);
  const tPiece = [[0,1,0],[1,1,1]];

  tPiece.forEach((row, ry) => {
    row.forEach((cell, rx) => {
      if (cell) {
        const x = offsetX + (fallX + rx) * blockSize;
        const y = offsetY + (Math.floor(fallY) + ry) * blockSize;
        if (y < offsetY + gridH * blockSize - 3 * blockSize) {
          ctx.fillStyle = ACCENT;
          ctx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
          // Glow
          ctx.fillStyle = ACCENT_GLOW;
          ctx.fillRect(x - 2, y - 2, blockSize + 4, blockSize + 4);
        }
      }
    });
  });

  // Level counter on right
  ctx.font = '10px monospace';
  ctx.fillStyle = ACCENT_DIM;
  ctx.textAlign = 'left';
  ctx.fillText('LEVEL', offsetX + gridW * blockSize + 20, offsetY + 14);
  ctx.font = '24px monospace';
  ctx.fillStyle = ACCENT;
  ctx.fillText(String(Math.floor(t * 0.5) % 7 + 1), offsetX + gridW * blockSize + 20, offsetY + 42);

  // Lines counter
  ctx.font = '10px monospace';
  ctx.fillStyle = ACCENT_DIM;
  ctx.fillText('LINES', offsetX + gridW * blockSize + 20, offsetY + 66);
  ctx.font = '16px monospace';
  ctx.fillStyle = 'rgba(232,117,58,0.5)';
  ctx.fillText(String(Math.floor(t * 2) % 100).padStart(3, '0'), offsetX + gridW * blockSize + 20, offsetY + 86);
}
