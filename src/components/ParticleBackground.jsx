import React, { useMemo } from 'react';
export function ParticleBackground() {
  const particles = useMemo(() => {
    return Array.from({
      length: 25
    }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${8 + Math.random() * 7}s`,
      animationDelay: `${Math.random() * 8}s`,
      size: `${2 + Math.random() * 3}px`,
      opacity: 0.2 + Math.random() * 0.4
    }));
  }, []);
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p) =>
      <div
        key={p.id}
        className="absolute bottom-0 rounded-full bg-accent-warm"
        style={{
          left: p.left,
          width: p.size,
          height: p.size,
          opacity: p.opacity,
          boxShadow: '0 0 10px #fbbf24, 0 0 20px #f59e0b',
          animation: `particle-rise ${p.animationDuration} linear infinite`,
          animationDelay: p.animationDelay
        }} />

      )}
    </div>);

}