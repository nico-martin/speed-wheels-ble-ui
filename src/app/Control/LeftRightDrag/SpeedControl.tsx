import React from 'react';
import cn from '@common/utils/classnames';
import useWindowSize from '../../useWindowSize';
import styles from './SpeedControl.css';

let stopPolling = 0;

const SpeedControl = ({
  className,
  onSpeedUpdate,
}: {
  className?: string;
  onSpeedUpdate: (speed: number) => void;
}) => {
  const [dragging, setDragging] = React.useState<boolean>(false);
  const [startY, setStartY] = React.useState<number>(0);
  const [transformY, setTransformY] = React.useState<number>(0);
  const { height: windowHeight } = useWindowSize();

  React.useEffect(() => {
    if (!dragging && !stopPolling) {
      stopPolling = window.setInterval(() => {
        console.log('interval');
        onSpeedUpdate(0);
      }, 500);
    } else {
      stopPolling && window.clearInterval(stopPolling);
      stopPolling = 0;
    }
  }, [dragging]);

  React.useEffect(
    () => () => {
      setStartY(0);
      setTransformY(0);
      setDragging(false);
    },
    []
  );

  const start = () => {
    setDragging(true);
  };

  const end = () => {
    setDragging(false);
    setStartY(0);
    setTransformY(0);
    onSpeedUpdate(0);
  };

  const move = (y: number) => {
    if (dragging) {
      if (startY === 0) {
        setStartY(y);
      } else {
        const newY = (startY - y) * -1;
        const halfWindowHeight = windowHeight / 2;
        if (newY <= 0) {
          // forward
          onSpeedUpdate(Math.round((100 / halfWindowHeight) * newY) * -1);
        } else {
          //backward
          onSpeedUpdate(Math.round((100 / halfWindowHeight) * newY) * -1);
        }

        setTransformY(newY);
      }
    }
  };

  return (
    <div className={cn(styles.root, className)}>
      <span
        className={cn(styles.bubble)}
        onTouchStart={start}
        onMouseDown={start}
        onTouchEnd={end}
        onMouseUp={end}
        onTouchMove={(e) => {
          move(e.touches[0].clientY);
        }}
        onMouseMove={(e) => {
          move(e.clientY);
        }}
        style={{
          cursor: dragging ? 'grabbing' : 'default',
          ...(dragging
            ? {
                transitionDuration: '0ms',
                transform: `translate(0, ${transformY}px)`,
              }
            : {}),
        }}
      />
    </div>
  );
};

export default SpeedControl;
