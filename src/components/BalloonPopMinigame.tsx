import React, { useEffect, useRef } from 'react';

interface Balloon {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
}

interface BalloonPopMinigameProps {
  onEarnTickets: (count: number) => void;
  onClose: () => void;
}

export const BalloonPopMinigame: React.FC<BalloonPopMinigameProps> = ({
  onEarnTickets,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const balloons: Balloon[] = [];
    const colors = ['#e60039', '#00d9ff', '#ffe600', '#00ff66', '#aa00ff'];

    const spawnBalloon = () => {
      balloons.push({
        x: Math.random() * (canvas.width - 200) + 100,
        y: canvas.height + 40,
        radius: Math.random() * 15 + 20,
        speed: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    for (let i = 0; i < 8; i++) {
      spawnBalloon();
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        b.y -= b.speed * 60 * delta;

        // Draw balloon
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Balloon tie
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y + b.radius + 3, 3, 0, Math.PI * 2);
        ctx.fill();

        if (b.y < -40) {
          balloons.splice(i, 1);
          spawnBalloon();
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎈 Click balloons to pop them! Press ESC to return.', canvas.width / 2, 50);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        const dist = Math.hypot(clickX - b.x, clickY - b.y);
        if (dist < b.radius) {
          balloons.splice(i, 1);
          onEarnTickets(2);
          spawnBalloon();
          break;
        }
      }
    };

    canvas.addEventListener('click', handleClick);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [onEarnTickets]);

  return (
    <div className="absolute inset-0 z-9 bg-black/85 cursor-crosshair">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <button
        onClick={onClose}
        className="absolute top-5 right-5 bg-[#e60039] text-white px-5 py-2 font-bold rounded-lg cursor-pointer hover:bg-[#ff3366]"
      >
        Close [ESC]
      </button>
    </div>
  );
};
