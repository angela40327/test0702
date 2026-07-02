import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface WheelProps {
  items: string[];
  isSpinning: boolean;
  onSpinEnd: (winner: string) => void;
}

export interface WheelHandle {
  spin: () => void;
}

const Wheel = forwardRef<WheelHandle, WheelProps>(({ items, isSpinning, onSpinEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  useImperativeHandle(ref, () => ({
    spin: () => {
      const duration = 5000;
      const startVelocity = 0.5 + Math.random() * 0.5;
      const startTime = performance.now();
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const velocity = startVelocity * (1 - easeOut);
        
        setRotation((prev) => (prev + velocity) % (Math.PI * 2));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Final position check
          const sectorAngle = (Math.PI * 2) / items.length;
          const normalizedRotation = rotation % (Math.PI * 2);
          const index = Math.floor((Math.PI * 2 - normalizedRotation + Math.PI / 2) % (Math.PI * 2) / sectorAngle);
          onSpinEnd(items[index]);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;

    ctx.clearRect(0, 0, size, size);

    items.forEach((item, i) => {
      const angle = (Math.PI * 2 / items.length) * i + rotation;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + (Math.PI * 2 / items.length));
      ctx.closePath();
      
      ctx.fillStyle = `hsl(${(i * 360) / items.length}, 70%, 70%)`;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + Math.PI / items.length);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(item, radius / 2, 5);
      ctx.restore();
    });
  }, [items, rotation]);

  return <canvas ref={canvasRef} width={400} height={400} className="rounded-full shadow-lg" />;
});

export default Wheel;
