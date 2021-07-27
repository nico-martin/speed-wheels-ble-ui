import React from 'react';
import cn from '@common/utils/classnames';
import styles from './LeftRightDrag.css';
import SpeedControl from './SpeedControl';

const LeftRightDrag = ({
  onCmdLeft,
  onCmdRight,
  onCmdStop,
  className = 'className',
}: {
  onCmdLeft: (speed: number) => void;
  onCmdRight: (speed: number) => void;
  onCmdStop: () => void;
  className?: string;
}) => {
  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.left}>
        <SpeedControl onSpeedUpdate={onCmdLeft} />
      </div>
      <div className={styles.right}>
        <SpeedControl onSpeedUpdate={onCmdRight} />
      </div>
      <button className={styles.stop} onClick={onCmdStop}>
        stop
      </button>
    </div>
  );
};

export default LeftRightDrag;
