import React from 'react';
import { Icon } from '@theme';
import cn from '@common/utils/classnames';
import {
  interpolateWheelSpeed,
  clearInterpolate,
} from '@common/utils/interpolateWheelSpeed';
import styles from './ArrowKeys.css';

const ArrowKeys = ({
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
  const [activeKey, setActiveKey] = React.useState<'F' | 'B' | 'L' | 'R'>(null);
  const forward = () => {
    setActiveKey('F');
    interpolateWheelSpeed(
      'forward',
      [50, 100],
      [50, 100],
      12,
      4000,
      (left, right) => {
        onCmdLeft(left);
        onCmdRight(right);
      }
    );
  };

  const backward = () => {
    setActiveKey('B');
    interpolateWheelSpeed(
      'backward',
      [-50, -100],
      [-50, -100],
      12,
      4000,
      (left, right) => {
        onCmdLeft(left);
        onCmdRight(right);
      }
    );
  };

  const left = () => {
    setActiveKey('L');
    interpolateWheelSpeed('left', [0, 0], [5, 60], 6, 4000, (left, right) => {
      onCmdLeft(left);
      onCmdRight(right);
    });
  };

  const right = () => {
    setActiveKey('R');
    interpolateWheelSpeed('right', [5, 60], [0, 0], 6, 4000, (left, right) => {
      onCmdLeft(left);
      onCmdRight(right);
    });
  };

  const stop = () => {
    clearInterpolate('all');
    setActiveKey(null);
    onCmdStop();
  };

  const keydown = (e) => {
    if (e.keyCode == '38') {
      forward();
    } else if (e.keyCode == '40') {
      backward();
    } else if (e.keyCode == '37') {
      left();
    } else if (e.keyCode == '39') {
      right();
    }
  };

  const keyup = () => stop();

  React.useEffect(() => {
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
    };
  });

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.buttons}>
        <button
          className={cn(styles.button, styles.arrowUp, {
            [styles.buttonActive]: activeKey === 'F',
          })}
          onMouseDown={forward}
          onMouseUp={stop}
          onTouchStart={forward}
          onTouchEnd={stop}
        >
          <Icon className={styles.icon} icon="mdi/arrow" />
        </button>
        <button
          className={cn(styles.button, styles.arrowLeft, {
            [styles.buttonActive]: activeKey === 'L',
          })}
          onMouseDown={left}
          onMouseUp={stop}
          onTouchStart={left}
          onTouchEnd={stop}
        >
          <Icon className={styles.icon} icon="mdi/arrow" />
        </button>
        <button
          className={cn(styles.button, styles.arrowRight, {
            [styles.buttonActive]: activeKey === 'R',
          })}
          onMouseDown={right}
          onMouseUp={stop}
          onTouchStart={right}
          onTouchEnd={stop}
        >
          <Icon className={styles.icon} icon="mdi/arrow" />
        </button>
        <button
          className={cn(styles.button, styles.arrowDown, {
            [styles.buttonActive]: activeKey === 'B',
          })}
          onMouseDown={backward}
          onMouseUp={stop}
          onTouchStart={backward}
          onTouchEnd={stop}
        >
          <Icon className={styles.icon} icon="mdi/arrow" />
        </button>
      </div>
    </div>
  );
};

export default ArrowKeys;
