import React from 'react';
import cn from '@common/utils/classnames';
import styles from './HandposeCanvas.css';

const COLORS = [
  '#d6ff40',
  '#4dff40',
  '#40f9ff',
  '#4043ff',
  '#cf40ff',
  '#ff4056',
];

const HandposeCanvas = ({
  className = '',
  previewPoints,
  size,
}: {
  className?: string;
  previewPoints: Record<string, Array<[number, number, number]>>;
  size: { width: number; height: number };
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current && previewPoints) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      Object.entries(previewPoints).map(([finger, points], i) => {
        const color = COLORS[i - Math.floor(i / COLORS.length) * COLORS.length];

        points.map((point, pointI) => {
          drawPoint(ctx, point[0], point[1], 5, color);
          pointI !== 0 &&
            drawLine(
              ctx,
              points[pointI - 1][0],
              points[pointI - 1][1],
              points[pointI][0],
              points[pointI][1],
              color
            );
        });
      });
    }
  }, [previewPoints]);

  const drawPoint = (ctx, x, y, r, color) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawLine = (ctx, startX, startY, endX, endY, color) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn(className, styles.root)}
      width={size.width}
      height={size.height}
    />
  );
};

export default HandposeCanvas;
