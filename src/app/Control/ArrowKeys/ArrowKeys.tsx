import React from 'react';
import { Icon } from '@theme';
import cn from '@common/utils/classnames';
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
  const forward = () => {
    onCmdRight(70);
    onCmdLeft(70);
  };

  const backward = () => {
    onCmdRight(-50);
    onCmdLeft(-50);
  };

  const left = () => {
    //onCmdLeft(20);
    onCmdRight(50);
  };

  const right = () => {
    onCmdLeft(50);
    //onCmdRight(20);
  };

  const stop = () => onCmdStop();

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.buttons}>
        <button
          className={cn(styles.button, styles.arrowUp)}
          onMouseDown={forward}
          onMouseUp={stop}
          onTouchStart={forward}
          onTouchEnd={stop}
        >
          <Icon className={styles.icon} icon="mdi/arrow" />
        </button>
        <button
          className={cn(styles.button, styles.arrowLeft)}
          onMouseDown={left}
          onMouseUp={stop}
          onTouchStart={left}
          onTouchEnd={stop}
        >
          <Icon className={styles.icon} icon="mdi/arrow" />
        </button>
        <button
          className={cn(styles.button, styles.arrowRight)}
          onMouseDown={right}
          onMouseUp={stop}
          onTouchStart={right}
          onTouchEnd={stop}
        >
          <Icon className={styles.icon} icon="mdi/arrow" />
        </button>
        <button
          className={cn(styles.button, styles.arrowDown)}
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
