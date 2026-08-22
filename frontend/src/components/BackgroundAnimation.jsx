import React from 'react';

export default function BackgroundAnimation() {
  // Pre-configured retro 8-bit star and pixel particle coordinates & animations
  const stars = [
    { top: '8%', left: '12%', size: '14px', delay: '0s', char: '✦', color: '#ffd803' },
    { top: '15%', left: '85%', size: '18px', delay: '1.2s', char: '✧', color: '#00ebc7' },
    { top: '28%', left: '4%', size: '12px', delay: '2.5s', char: '✦', color: '#ff5470' },
    { top: '35%', left: '92%', size: '16px', delay: '0.7s', char: '★', color: '#ffd803' },
    { top: '48%', left: '18%', size: '10px', delay: '3.1s', char: '✦', color: '#8c52ff' },
    { top: '55%', left: '80%', size: '14px', delay: '1.8s', char: '✧', color: '#00ebc7' },
    { top: '68%', left: '8%', size: '16px', delay: '2.2s', char: '✦', color: '#ffd803' },
    { top: '75%', left: '94%', size: '12px', delay: '0.4s', char: '✦', color: '#ff5470' },
    { top: '88%', left: '22%', size: '18px', delay: '1.5s', char: '✧', color: '#8c52ff' },
    { top: '92%', left: '72%', size: '14px', delay: '2.8s', char: '✦', color: '#00ebc7' },
    { top: '22%', left: '45%', size: '10px', delay: '3.5s', char: '★', color: '#ffd803' },
    { top: '62%', left: '50%', size: '12px', delay: '1.1s', char: '✧', color: '#ff5470' },
  ];

  // Floating pixel squares / orbs
  const pixels = [
    { top: '12%', left: '28%', size: '6px', delay: '0s', dur: '18s', color: '#ffd803' },
    { top: '25%', left: '75%', size: '8px', delay: '4s', dur: '22s', color: '#00ebc7' },
    { top: '45%', left: '15%', size: '5px', delay: '2s', dur: '16s', color: '#ff5470' },
    { top: '65%', left: '88%', size: '7px', delay: '6s', dur: '20s', color: '#8c52ff' },
    { top: '82%', left: '38%', size: '6px', delay: '1s', dur: '19s', color: '#00ebc7' },
    { top: '90%', left: '60%', size: '5px', delay: '5s', dur: '24s', color: '#ffd803' },
  ];

  return (
    <div className="codedex-bg-canvas" aria-hidden="true">
      {/* Aurora Ambient Glow Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* Retro Pixel Grid Scanlines */}
      <div className="retro-grid-overlay" />

      {/* Twinkling 8-Bit Stars */}
      {stars.map((star, idx) => (
        <span
          key={`star-${idx}`}
          className="retro-twinkle-star"
          style={{
            top: star.top,
            left: star.left,
            fontSize: star.size,
            animationDelay: star.delay,
            color: star.color,
            textShadow: `0 0 10px ${star.color}`
          }}
        >
          {star.char}
        </span>
      ))}

      {/* Drifting Pixel Particle Cubes */}
      {pixels.map((pix, idx) => (
        <div
          key={`pix-${idx}`}
          className="retro-drifting-pixel"
          style={{
            top: pix.top,
            left: pix.left,
            width: pix.size,
            height: pix.size,
            backgroundColor: pix.color,
            boxShadow: `0 0 8px ${pix.color}`,
            animationDelay: pix.delay,
            animationDuration: pix.dur
          }}
        />
      ))}
    </div>
  );
}
