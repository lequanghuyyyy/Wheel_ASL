import React, { useRef, useEffect, useCallback } from 'react';
import { PALETTE, PRESETS } from '../constants';

export default function Wheel({
  items,
  bgSettings,
  onOpenBgModal,
  onSpinFinish,
  isSpinning,
  setIsSpinning,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef(null);
  const curveTopRef = useRef(null);
  const curveBottomRef = useRef(null);
  const arcOverlayRef = useRef(null);

  // Sound generator (Resumes suspended context properly on user gesture)
  const playTickSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750 + Math.random() * 250, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }, []);

  // Vẽ Canvas (Tách rời hoàn toàn khỏi logic resize để không giật màn hình khi gõ phím)
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 12;

    ctx.clearRect(0, 0, w, h);

    const count = items.length;
    if (count === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#222436';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.font = '700 18px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Nhập mục vào bảng bên phải', cx, cy);
      return;
    }

    const arc = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const startAngle = rotationRef.current + i * arc;
      const endAngle = startAngle + arc;

      // Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();

      // Divider
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text inside segment
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const label = items[i];
      let fontSize;
      if (count <= 2) fontSize = 54;
      else if (count <= 4) fontSize = 36;
      else if (count <= 8) fontSize = 26;
      else if (count <= 16) fontSize = 18;
      else if (count <= 32) fontSize = 14;
      else fontSize = 11;

      ctx.font = `800 ${fontSize}px "Segoe UI", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const maxChars = count > 10 ? 15 : 22;
      const displayText = label.length > maxChars ? label.slice(0, maxChars) + '…' : label;
      ctx.fillText(displayText, radius - 24, 0);

      ctx.restore();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [items]);

  // Chỉ tính lại kích thước khi window resize hoặc component mount
  const handleResize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const area = containerRef.current;
    const availableSize = Math.min(area.clientWidth - 80, area.clientHeight - 60, 560);
    const size = Math.max(availableSize, 280);

    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;

    if (arcOverlayRef.current) {
      arcOverlayRef.current.setAttribute('viewBox', `0 0 ${size} ${size}`);
    }

    const r = size * 0.35;
    const cx = size / 2;
    const cy = size / 2;
    if (curveTopRef.current && curveBottomRef.current) {
      curveTopRef.current.setAttribute('d', `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`);
      curveBottomRef.current.setAttribute('d', `M ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx - r} ${cy}`);
    }

    drawWheel();
  }, [drawWheel]);

  // Vòng quay với hủy animation khi unmount
  const spin = useCallback(() => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const count = items.length;
    const arc = (Math.PI * 2) / count;
    const extraRotations = (6 + Math.random() * 4) * Math.PI * 2;
    const randomStopAngle = Math.random() * Math.PI * 2;
    const totalSpinAngle = extraRotations + randomStopAngle;
    const startAngle = rotationRef.current;
    const duration = 5000 + Math.random() * 1000;
    const startTime = performance.now();

    let lastTickSegment = -1;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      rotationRef.current = startAngle + totalSpinAngle * eased;
      drawWheel();

      // Tick sound
      const normalizedAngle = ((rotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const activeSeg = Math.floor(normalizedAngle / arc) % count;
      if (activeSeg !== lastTickSegment) {
        playTickSound();
        lastTickSegment = activeSeg;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalNormalized = ((rotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const winningIndex = Math.floor(((Math.PI * 2 - finalNormalized) % (Math.PI * 2)) / arc) % count;
        const winner = items[winningIndex];
        onSpinFinish(winner, winningIndex);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, items, setIsSpinning, drawWheel, playTickSound, onSpinFinish]);

  // Vẽ lại khi items thay đổi (không chạy lại resize canvas)
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Resize listener chỉ gắn 1 lần khi mount
  useEffect(() => {
    handleResize();
    const onResize = () => handleResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [handleResize]);

  // Phím tắt Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spin]);

  // Background style từ constants
  const getBackgroundStyle = () => {
    if (!bgSettings) return {};
    if (bgSettings.type === 'preset') {
      const preset = PRESETS.find((p) => p.id === bgSettings.value) || PRESETS[0];
      return preset.isGradient ? { background: preset.url } : { backgroundImage: `url('${preset.url}')` };
    }
    if (bgSettings.type === 'url' || bgSettings.type === 'data') {
      return { backgroundImage: `url('${bgSettings.value}')` };
    }
    return {};
  };

  const dimAlpha = ((bgSettings?.dim ?? 50) / 100).toFixed(2);

  return (
    <div className="wheel-area" ref={containerRef} style={getBackgroundStyle()}>
      {/* Background Dimming Overlay */}
      <div
        className="wheel-backdrop-overlay"
        style={{ background: `rgba(10, 11, 15, ${dimAlpha})` }}
      />

      {/* Floating Quick Tool: Đổi hình nền */}
      <div className="wheel-float-tools">
        <button className="float-btn" onClick={onOpenBgModal} title="Thay đổi hình nền">
          🖼️
        </button>
      </div>

      {/* Stage */}
      <div className="wheel-stage">
        <canvas id="wheelCanvas" ref={canvasRef} onClick={spin} />
        <div className="wheel-center-cap" />
        <div className="wheel-pointer" />

        {/* Curved Overlay Text */}
        <svg
          className="wheel-arc-overlay"
          ref={arcOverlayRef}
          viewBox="0 0 500 500"
          style={{ opacity: isSpinning ? 0 : 1 }}
        >
          <defs>
            <path id="curveTop" ref={curveTopRef} d="M 80 250 A 170 170 0 0 1 420 250" />
            <path id="curveBottom" ref={curveBottomRef} d="M 420 250 A 170 170 0 0 1 80 250" />
          </defs>
          <text font-size="34">
            <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
              Nhấp để quay
            </textPath>
          </text>
          <text font-size="24">
            <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
              hoặc nhấn Ctrl+Enter
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}
