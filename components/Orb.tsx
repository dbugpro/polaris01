import React, { useEffect, useState } from 'react';
import { OrbState } from '../types';

interface OrbProps {
  state: OrbState;
}

const Orb: React.FC<OrbProps> = ({ state }) => {
  // CSS gradient to match the glossy blue sphere image
  // The image has a highlight top-left, deep blue body, and shadow bottom-right.
  const orbStyle: React.CSSProperties = {
    background: 'radial-gradient(circle at 35% 35%, rgba(200, 230, 255, 1) 0%, rgba(59, 130, 246, 1) 15%, rgba(29, 78, 216, 1) 50%, rgba(15, 23, 42, 1) 100%)',
    boxShadow: '0 0 50px -10px rgba(37, 99, 235, 0.5), inset 0 0 20px rgba(0,0,0,0.5)',
  };

  const [scale, setScale] = useState(1);

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.05;
      let baseScale = 1;

      switch (state) {
        case OrbState.Idle:
          // Gentle breathing
          baseScale = 1 + Math.sin(time * 0.5) * 0.02;
          break;
        case OrbState.Thinking:
          // Rapid pulsing
          baseScale = 1 + Math.sin(time * 5) * 0.05;
          break;
        case OrbState.Speaking:
          // Moderate modulation
          baseScale = 1 + Math.sin(time * 2) * 0.08;
          break;
        case OrbState.Listening:
          // Expand slightly
          baseScale = 1.1 + Math.sin(time * 1) * 0.01;
          break;
      }

      setScale(baseScale);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [state]);

  return (
    <div className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64 transition-all duration-500 ease-in-out">
      {/* Outer Glow Halo */}
      <div 
        className={`absolute rounded-full transition-opacity duration-500 ${state === OrbState.Thinking ? 'opacity-80' : 'opacity-30'}`}
        style={{
          width: '120%',
          height: '120%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          transform: `scale(${scale * 1.1})`
        }}
      />
      
      {/* The Sphere */}
      <div
        className="w-full h-full rounded-full relative z-10 transition-transform duration-100 will-change-transform"
        style={{
          ...orbStyle,
          transform: `scale(${scale})`,
        }}
      >
        {/* Shine reflection for extra glossiness */}
        <div 
          className="absolute top-[15%] left-[15%] w-[25%] h-[20%] rounded-[50%] bg-white opacity-40 blur-xl pointer-events-none"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </div>
    </div>
  );
};

export default Orb;