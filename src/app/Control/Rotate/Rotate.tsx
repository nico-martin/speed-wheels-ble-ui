import { number } from 'prop-types';
import React from 'react';
import { CloseButton, Icon } from '@theme';
import cn from '@common/utils/classnames';
import styles from './Rotate.css';
import useDeviceOrientation from './useDeviceOrientation';
import useElementBounds from './useElementBounds';

interface CoordinatesI {
  x: number;
  y: number;
}

let interval;

const Rotate = ({
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
  const { requestAccess, orientation, revokeAccess } = useDeviceOrientation();
  const [waited, setWaited] = React.useState<number>(5);

  React.useEffect(() => {
    interval = window.setInterval(() => {
      setWaited((waited) => waited - 1);
    }, 1000);
  }, []);

  React.useEffect(() => {
    waited === 0 && interval && clearInterval(interval);
  }, [waited]);

  const circle = useElementBounds(rootRef);

  const relativeBubblePosition = React.useMemo<CoordinatesI>(() => {
    if (!orientation) {
      return { x: 0, y: 0 };
    }

    const gammaRange = [-20, -40, -80];
    const betaRange = [-30, 0, 30];

    const calc = (value, range) => {
      const maxRange = range[2] - range[0];
      const relativeValue = (200 / maxRange) * (value - range[0]);
      const v = relativeValue - 100;
      return v >= 100 ? 100 : v <= -100 ? -100 : v;
    };

    return {
      x: calc(orientation.beta, betaRange),
      y: calc(orientation.gamma, gammaRange) * -1,
    };
  }, [orientation]);

  const bubblePosition = React.useMemo<CoordinatesI>(
    () => ({
      x:
        (circle.width / 2) * (relativeBubblePosition.x / 100) +
        circle.width / 2,
      y:
        (circle.height / 2) * (relativeBubblePosition.y / 100) * -1 -
        circle.height / 2,
    }),
    [relativeBubblePosition, circle]
  );

  const wheelSpeed = React.useMemo<{ left: number; right: number }>(() => {
    const relativeX = Math.round(relativeBubblePosition.x) || 0;
    const relativeY = Math.round(relativeBubblePosition.y) || 0;

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
  }, [relativeBubblePosition]);

  React.useEffect(() => {
    if ((wheelSpeed.left === 0 && wheelSpeed.right === 0) || waited > 0) {
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

  React.useEffect(() => {
    requestAccess();
    return () => revokeAccess();
  }, []);

  return (
    <div className={cn(styles.root, className)} ref={rootRef}>
      <p className={cn(styles.intro, { [styles.introHidden]: waited <= 0 })}>
        Place the blue bubble in the center of the grey ring.
        <span className={styles.introSeconds}>{waited}</span>
      </p>
      <span
        className={styles.bubble}
        style={{
          transform: `translateX(${bubblePosition.x}px) translateY(${bubblePosition.y}px)`,
        }}
      />
    </div>
  );
};
export default Rotate;
