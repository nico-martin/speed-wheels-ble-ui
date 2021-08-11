import React from 'react';
import { Icon } from '@theme';
import cn from '@common/utils/classnames';
import ArrowKeys from './Control/ArrowKeys/ArrowKeys';
import Circle from './Control/Circle/Circle';
import GestureControl from './Control/GestureControl/GestureControl';
import LeftRightDrag from './Control/LeftRightDrag/LeftRightDrag';
import Rotate from './Control/Rotate/Rotate';
import styles from './RemoteControl.css';

const CONTROLS = {
  arrows: ArrowKeys,
  movingpoint: Circle,
  rotate: Rotate,
  hand: GestureControl,
};

const START_CONTROLS = 2;

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
    Object.keys(CONTROLS)[START_CONTROLS]
  );

  React.useEffect(() => {
    if (leftSpeed === 0 && rightSpeed === 0) {
      onCmdStop();
    }

    /**
     * somehow the wheels need a minimum speed so both wheels are spinning.
     * otherwise one wheel might not spin when it should while the other is 0
     * thats why either both are 0 (stop) or both have a minimum speed.
     */

    let sendLeftSpeed = leftSpeed;
    let sendRightSpeed = rightSpeed;
    const minSpeedPos = 10;
    const minSpeedNeg = minSpeedPos * -1;

    if (
      rightSpeed !== 0 &&
      leftSpeed >= minSpeedNeg &&
      leftSpeed <= minSpeedPos
    ) {
      sendLeftSpeed = leftSpeed >= 0 ? minSpeedPos : minSpeedNeg;
    }

    if (
      leftSpeed !== 0 &&
      rightSpeed >= minSpeedNeg &&
      rightSpeed <= minSpeedPos
    ) {
      sendRightSpeed = rightSpeed >= 0 ? minSpeedPos : minSpeedNeg;
    }

    onCmd(sendLeftSpeed, sendRightSpeed);
  }, [leftSpeed, rightSpeed]);

  const ControlComponent = React.useMemo(() => {
    onCmdStop();
    return CONTROLS[activeControl];
  }, [activeControl]);

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
