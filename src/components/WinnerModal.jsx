import React, { useEffect, useState } from 'react';

export default function WinnerModal({ winnerData, onClose, onRemoveWinner, removeWinner }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (winnerData) {
      const colors = ['#2563eb', '#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      const pieces = Array.from({ length: 70 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        isCircle: Math.random() > 0.5,
        size: 6 + Math.random() * 8,
        duration: 1.8 + Math.random() * 2,
        delay: Math.random() * 0.4,
      }));
      setConfetti(pieces);
    } else {
      setConfetti([]);
    }
  }, [winnerData]);

  if (!winnerData) return null;

  return (
    <>
      {/* Confetti Particles */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-dot"
          style={{
            left: `${c.left}vw`,
            top: '-10px',
            backgroundColor: c.color,
            borderRadius: c.isCircle ? '50%' : '2px',
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Modal Dialog */}
      <div className="modal-backdrop show" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-dialog">
          <div className="winner-dialog">
            <div className="celebrate-icon">🎉</div>
            <h2>Chúc mừng!</h2>
            <div className="winner-name">{winnerData.winner}</div>
            <div className="winner-actions">
              {removeWinner && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    onRemoveWinner(winnerData.winIndex);
                    onClose();
                  }}
                >
                  Loại bỏ mục này
                </button>
              )}
              <button
                className="btn-primary"
                style={{ padding: '10px 32px', fontSize: '1.05rem' }}
                onClick={onClose}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
