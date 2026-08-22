import { useMemo } from 'react'

function AnimatedGameBackground() {
  // Generate a fixed set of subtle particles with staggered positions and delays
  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${((i * 7.3 + 12) % 94).toFixed(1)}%`,
      bottom: `${((i * 13.7 + 5) % 85).toFixed(1)}%`,
      size: `${(i % 3) * 1.5 + 3}px`,
      duration: `${14 + (i % 6) * 4}s`,
      delay: `-${(i * 2.3).toFixed(1)}s`,
      opacity: (0.25 + (i % 4) * 0.12).toFixed(2),
    }))
  }, [])

  return (
    <div className="game-ambient-background-root" aria-hidden="true">
      {/* 1. DEEP DARK GREEN / NEAR-BLACK BASE CANVAS */}
      <div className="game-bg-canvas" />

      {/* 2. SUBTLE GAMING GRID MESH */}
      <div className="game-bg-grid-mesh" />

      {/* 3. SLOW-DRIFTING LIGHT GREEN NEON AMBIENT BLOBS */}
      <div className="game-neon-blob blob-1" />
      <div className="game-neon-blob blob-2" />
      <div className="game-neon-blob blob-3" />
      <div className="game-neon-blob blob-4" />

      {/* 4. GENTLE FLOATING NEON PARTICLES */}
      <div className="game-particles-container">
        {particles.map((p) => (
          <span
            key={p.id}
            className="game-neon-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* 5. SOFT VIGNETTE TO PRESERVE MAXIMUM FOREGROUND READABILITY */}
      <div className="game-bg-vignette" />
    </div>
  )
}

export default AnimatedGameBackground
