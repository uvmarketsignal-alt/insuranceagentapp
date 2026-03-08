import { useEffect, useRef } from 'react';
import { useStore } from '../store';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showText?: boolean;
}

export function Logo({ size = 'medium', showText = false }: LogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { appName, appLogo } = useStore();

  const sizes = { small: 40, medium: 56, large: 80, xlarge: 120 };
  const baseSize = sizes[size];

  useEffect(() => {
    if (appLogo) return; // Use custom logo image if set
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = baseSize * dpr;
    canvas.height = baseSize * dpr;
    canvas.style.width = `${baseSize}px`;
    canvas.style.height = `${baseSize}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, baseSize, baseSize);

    const cx = baseSize / 2;
    const cy = baseSize / 2;
    const r = baseSize * 0.42;

    // ── Outer glow ring ──────────────────────────────────────────────────────
    const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.5);
    glowGrad.addColorStop(0, 'rgba(99,102,241,0.4)');
    glowGrad.addColorStop(0.5, 'rgba(59,130,246,0.2)');
    glowGrad.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── Outer circle ring ────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.08, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, '#818cf8');
    ringGrad.addColorStop(0.5, '#3b82f6');
    ringGrad.addColorStop(1, '#7c3aed');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = baseSize * 0.04;
    ctx.stroke();

    // ── Shield body ──────────────────────────────────────────────────────────
    const shield = (scale: number, fill: CanvasGradient | string) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * scale);
      ctx.bezierCurveTo(cx + r * 0.9 * scale, cy - r * 0.6 * scale, cx + r * 0.9 * scale, cy + r * 0.1 * scale, cx, cy + r * scale);
      ctx.bezierCurveTo(cx - r * 0.9 * scale, cy + r * 0.1 * scale, cx - r * 0.9 * scale, cy - r * 0.6 * scale, cx, cy - r * scale);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };

    // Shadow shield
    ctx.shadowColor = 'rgba(79,70,229,0.5)';
    ctx.shadowBlur = baseSize * 0.15;
    const shieldGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    shieldGrad.addColorStop(0, '#1d4ed8');
    shieldGrad.addColorStop(0.4, '#2563eb');
    shieldGrad.addColorStop(0.7, '#4f46e5');
    shieldGrad.addColorStop(1, '#7c3aed');
    shield(0.88, shieldGrad);
    ctx.shadowBlur = 0;

    // ── Inner glass highlight ─────────────────────────────────────────────────
    const glassGrad = ctx.createLinearGradient(cx - r * 0.5, cy - r * 0.8, cx + r * 0.5, cy);
    glassGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    glassGrad.addColorStop(1, 'rgba(255,255,255,0.02)');
    shield(0.72, glassGrad);

    // ── UV Monogram ───────────────────────────────────────────────────────────
    const lw = baseSize * 0.075;
    const textScale = r * 0.55;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur = baseSize * 0.08;

    // U letter
    const uLeft = cx - textScale * 0.52;
    const uRight = cx - textScale * 0.05;
    const uTop = cy - textScale * 0.48;
    const uBot = cy + textScale * 0.1;
    ctx.beginPath();
    ctx.moveTo(uLeft, uTop);
    ctx.lineTo(uLeft, uBot);
    ctx.bezierCurveTo(uLeft, uBot + textScale * 0.32, uRight, uBot + textScale * 0.32, uRight, uBot);
    ctx.lineTo(uRight, uTop);
    ctx.stroke();

    // V letter
    const vLeft = cx + textScale * 0.05;
    const vRight = cx + textScale * 0.58;
    const vMid = cx + textScale * 0.31;
    const vTop2 = cy - textScale * 0.48;
    const vBot2 = cy + textScale * 0.38;
    ctx.beginPath();
    ctx.moveTo(vLeft, vTop2);
    ctx.lineTo(vMid, vBot2);
    ctx.lineTo(vRight, vTop2);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // ── Star sparkles ─────────────────────────────────────────────────────────
    const drawStar = (x: number, y: number, sr: number, color: string) => {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = sr * 3;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const xi = x + sr * Math.cos(angle);
        const yi = y + sr * Math.sin(angle);
        if (i === 0) ctx.moveTo(xi, yi);
        else ctx.lineTo(xi, yi);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    drawStar(cx - r * 0.55, cy - r * 0.72, baseSize * 0.045, '#fbbf24');
    drawStar(cx + r * 0.6, cy - r * 0.55, baseSize * 0.035, '#60a5fa');
    drawStar(cx + r * 0.3, cy + r * 0.78, baseSize * 0.028, '#a78bfa');

    // ── Bottom label ──────────────────────────────────────────────────────────
    if (size === 'xlarge' || size === 'large') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `bold ${Math.max(8, baseSize * 0.13)}px ui-sans-serif, system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';
      ctx.fillText('INSURANCE', cx, cy + r * 1.32);
    }
  }, [baseSize, appLogo, size]);

  if (appLogo) {
    return (
      <div className="inline-flex items-center gap-3">
        <img
          src={appLogo}
          alt={appName}
          style={{ width: baseSize, height: baseSize }}
          className="object-contain rounded-xl"
        />
        {showText && (
          <div>
            <div className="font-black text-lg text-slate-900 leading-tight">{appName}</div>
            <div className="text-xs text-blue-600 font-medium">Management Portal</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{
            filter: 'drop-shadow(0 8px 16px rgba(59,130,246,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        />
      </div>
      {showText && (
        <div>
          <div className="font-black text-xl text-slate-900 leading-tight tracking-tight">{appName}</div>
          <div className="text-xs text-blue-600 font-semibold tracking-wide uppercase">Management Portal</div>
        </div>
      )}
    </div>
  );
}
