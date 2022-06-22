// @ts-ignore
import React from 'react';
import { Icon, Loader } from '@theme';
import cn from '@common/utils/classnames';
import styles from './GestureControl.css';
import HandposeComponent from './Handpose/HandposeComponent';

let pose = null;

const GestureControl = ({
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
  const [handPose, setHandpose] = React.useState<string>('stop');
  const [loading, setLoading] = React.useState<boolean>(true);

  const forward = () => {
    onCmdRight(70);
    onCmdLeft(70);
  };

  const backward = () => {
    onCmdRight(-50);
    onCmdLeft(-50);
  };

  const left = () => {
    onCmdLeft(1);
    onCmdRight(60);
  };

  const right = () => {
    onCmdLeft(60);
    onCmdRight(1);
  };

  const stop = () => {
    onCmdStop();
  };

  return (
    <div className={className}>
      <span
        className={cn(styles.indicator, styles[`indicator-${handPose}`], {
          [styles.indicatorLoading]: loading,
        })}
      >
        <Loader className={styles.loader} />
        <Icon
          icon={handPose === 'stop' ? `mdi/stop` : `mdi/arrow`}
          className={styles.icon}
        />
      </span>
      <HandposeComponent
        onPoseFound={(newPose) => {
          if (newPose !== pose) {
            setHandpose(newPose);
            if (newPose === 'stop') {
              stop();
            } else if (newPose === 'left') {
              left();
            } else if (newPose === 'right') {
              right();
            } else if (newPose === 'start') {
              forward();
            } else if (newPose === 'back') {
              backward();
            }
            pose = newPose;
          }
        }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default GestureControl;
