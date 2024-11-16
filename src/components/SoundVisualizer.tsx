import React, { useEffect, useRef } from 'react';

interface SoundVisualizerProps {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  isActive: boolean;
}

const SoundVisualizer: React.FC<SoundVisualizerProps> = ({ audioContext, analyser, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioContext || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qualityFactor = 10;
    const canvasSize = 24;
    const resolution = canvasSize * qualityFactor;

    canvas.width = resolution;
    canvas.height = resolution;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    ctx.scale(qualityFactor, qualityFactor);
    ctx.imageSmoothingEnabled = false;

    const ease = (current: number, target: number, factor: number = 0.2) =>
      current + (target - current) * factor;

    let smoothedHeights = [0, 0, 0];

    const draw = () => {
      if (!analyser || !isActive) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const averageVolume =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      const canvasWidth = canvasSize;
      const canvasHeight = canvasSize;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const centerY = canvasHeight / 2;
      const barWidth = 4;
      const barGap = 2;

      const targetHeights = [
        Math.max(5, (averageVolume / 255) * 20),
        Math.max(5, (averageVolume / 255) * 35),
        Math.max(5, (averageVolume / 255) * 25),
      ];

      smoothedHeights = smoothedHeights.map((height, i) =>
        ease(height, targetHeights[i])
      );

      const totalBarsWidth =
        smoothedHeights.length * barWidth + (smoothedHeights.length - 1) * barGap;
      const startX = (canvasWidth - totalBarsWidth) / 2;

      smoothedHeights.forEach((height, index) => {
        const x = startX + index * (barWidth + barGap);
        const radius = barWidth / 2;

        ctx.fillStyle = `rgba(0, 0, 0)`;
        ctx.beginPath();

        ctx.moveTo(x + radius, centerY - height / 2);
        ctx.arcTo(x + barWidth, centerY - height / 2, x + barWidth, centerY + height / 2, radius);
        ctx.arcTo(x + barWidth, centerY + height / 2, x, centerY + height / 2, radius);
        ctx.arcTo(x, centerY + height / 2, x, centerY - height / 2, radius);
        ctx.arcTo(x, centerY - height / 2, x + barWidth, centerY - height / 2, radius);
        ctx.closePath();
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [audioContext, analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        background: 'transparent',
      }}
    />
  );
};

export default SoundVisualizer;