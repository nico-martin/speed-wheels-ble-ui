import React from 'react';
import { Icon } from '@theme';
import cn from '@common/utils/classnames';
import ArrowKeys from './Control/ArrowKeys/ArrowKeys';
import Circle from './Control/Circle/Circle';
import GestureControl from './Control/GestureControl/GestureControl';
import LeftRightDrag from './Control/LeftRightDrag/LeftRightDrag';
import styles from './RemoteControl.css';

const CONTROLS = {
  arrows: ArrowKeys,
  movingpoint: Circle,
  rotate: Circle,
  hand: GestureControl,
};

const RemoteControl = ({
  onCmd,
  onCmdStop,
  className = '',
}: {
  onCmd: (left: number, right: number) => void;
  onCmdStop: () => void;
  className?: string;
}) => {
  const [leftSpeed, setLeftSpeed] = React.useState<number>(0);
  const [rightSpeed, setRightSpeed] = React.useState<number>(0);
  const [activeControl, setActiveControl] = React.useState<string>(
    Object.keys(CONTROLS)[0]
  );

  React.useEffect(() => {
    leftSpeed === 0 && rightSpeed === 0
      ? onCmdStop()
      : onCmd(leftSpeed, rightSpeed);
  }, [leftSpeed, rightSpeed]);

  const ControlComponent = React.useMemo(
    () => CONTROLS[activeControl],
    [activeControl]
  );

  return (
    <React.Fragment>
      <ControlComponent
        onCmdLeft={(speed) => setLeftSpeed(speed)}
        onCmdRight={(speed) => setRightSpeed(speed)}
        onCmdStop={() => {
          setLeftSpeed(0);
          setRightSpeed(0);
        }}
        className={className}
      />
      <div className={styles.controls}>
        {Object.keys(CONTROLS).map((controlKey) => (
          <button
            className={cn(styles.button, {
              [styles.buttonActive]: activeControl === controlKey,
            })}
            onClick={() => setActiveControl(controlKey)}
          >
            <Icon icon={`mdi/${controlKey}`} className={styles.buttonIcon} />
          </button>
        ))}
      </div>
    </React.Fragment>
  );
};

export default RemoteControl;
