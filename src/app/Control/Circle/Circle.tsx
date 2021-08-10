import React from 'react';
import { CloseButton, Icon } from '@theme';
import cn from '@common/utils/classnames';
import styles from './Circle.css';
import useElementBounds from './useElementBounds';

const Circle = ({
  onCmdLeft,
  onCmdRight,
  onCmdStop,
  className = '',
}: {
  onCmdLeft: (speed: number) => void;
  onCmdRight: (speed: number) => void;
  onCmdStop: () => void;
  className?: string;
}) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState<boolean>(false);
  const [pointerPosition, setPointerPosition] = React.useState<{
    x: number;
    y: number;
  }>({ y: 0, x: 0 });
  const [showInfo, setShowInfo] = React.useState<boolean>(false);

  const circle = useElementBounds(rootRef);
  const bubblePosition = React.useMemo<{ x: number; y: number }>(
    () => ({
      x: (circle.width / 2 - pointerPosition.x) * -1,
      y: (circle.height / 2 - pointerPosition.y) * -1,
    }),
    [pointerPosition]
  );

  const wheelSpeed = React.useMemo<{ left: number; right: number }>(() => {
    const relativeX =
      Math.round((100 / (circle.width / 2)) * bubblePosition.x) || 0;
    const relativeY =
      Math.round((100 / (circle.height / 2)) * bubblePosition.y) * -1 || 0;

    const adjustment = (relativeY / 100) * relativeX;
    const slowdown = 40;

    return {
      left:
        Math.round(
          (relativeX <= 0 ? relativeY + adjustment : relativeY) / slowdown
        ) * slowdown || 0,
      right:
        Math.round(
          (relativeX >= 0 ? relativeY - adjustment : relativeY) / slowdown
        ) * slowdown || 0,
    };
  }, [bubblePosition]);

  React.useEffect(() => {
    if (wheelSpeed.left === 0 && wheelSpeed.right === 0) {
      onCmdStop();
    } else {
      onCmdLeft(
        wheelSpeed.left <= -100
          ? -100
          : wheelSpeed.left >= 100
          ? 100
          : wheelSpeed.left
      );
      onCmdRight(
        wheelSpeed.right <= -100
          ? -100
          : wheelSpeed.right >= 100
          ? 100
          : wheelSpeed.right
      );
    }
  }, [wheelSpeed]);

  const start = () => {
    setDragging(true);
  };

  const end = () => {
    setDragging(false);
    setPointerPosition({
      x: circle.width / 2,
      y: circle.height / 2,
    });
  };

  const move = (x: number, y: number) => {
    if (!dragging) {
      return;
    }
    const pointerX = x - circle.left;
    const pointerY = y - circle.top;
    setPointerPosition({
      x: pointerX <= 0 ? 0 : pointerX >= circle.width ? circle.width : pointerX,
      y:
        pointerY <= 0
          ? 0
          : pointerY >= circle.height
          ? circle.height
          : pointerY,
    });
  };
  return (
    <div
      className={cn(styles.root, className)}
      ref={rootRef}
      onTouchStart={start}
      onMouseDown={start}
      onTouchEnd={end}
      onMouseUp={end}
      onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
      onMouseMove={(e) => move(e.clientX, e.clientY)}
    >
      <span
        className={styles.bubble}
        style={{
          transform: `translateX(${bubblePosition.x}px) translateY(${bubblePosition.y}px)`,
        }}
      />
    </div>
  );
};
export default Circle;
