import React from 'react';
import { Icon } from '@theme';
import { useBleCharacteristic } from '@common/hooks/useBle';
import cn from '@common/utils/classnames';
import { BLE_UUID } from '@common/utils/constants';
import Queue from '@common/utils/promiseQueue';
import ArrowKeys from './Control/ArrowKeys/ArrowKeys';
import Circle from './Control/Circle/Circle';
import GestureControl from './Control/GestureControl/GestureControl';
import Rotate from './Control/Rotate/Rotate';
import LightControl from './LightControl';
import styles from './RemoteControl.css';

const CONTROLS = {
  arrows: ArrowKeys,
  movingpoint: Circle,
  rotate: Rotate,
  hand: GestureControl,
};

const queue = new Queue();
const mockSend = (leftSpeed, rightSpeed) => {
  console.log(leftSpeed, rightSpeed);
  return new Promise((resolve) =>
    setTimeout(() => resolve({ leftSpeed, rightSpeed }), 100)
  );
};

const START_CONTROLS = 0;

const RemoteControl = ({
  className = '',
  bleMotorService = null,
}: {
  className?: string;
  bleMotorService?: BluetoothRemoteGATTService;
}) => {
  const [leftSpeed, setLeftSpeed] = React.useState<number>(0);
  const [rightSpeed, setRightSpeed] = React.useState<number>(0);
  const [activeControl, setActiveControl] = React.useState<string>(
    Object.keys(CONTROLS)[START_CONTROLS]
  );

  const { writeValue } = useBleCharacteristic(
    bleMotorService,
    BLE_UUID.CHAR_MOTOR
  );

  const moveWheels = (
    leftSpeed: number,
    rightSpeed: number,
    important = false
  ) =>
    bleMotorService
      ? writeValue(new Uint8Array([leftSpeed + 100, rightSpeed + 100]))
      : console.log({ leftSpeed, rightSpeed, important });

  React.useEffect(() => {
    moveWheels(leftSpeed, rightSpeed, leftSpeed === 0 && rightSpeed === 0);
    /**
     * if (leftSpeed === 0 && rightSpeed === 0) {
      moveWheels(0, 0, true);
    }


     * somehow the wheels need a minimum speed so both wheels are spinning.
     * otherwise one wheel might not spin when it should while the other is 0
     * thats why either both are 0 (stop) or both have a minimum speed.


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

    moveWheels(sendLeftSpeed, sendRightSpeed);     */
  }, [leftSpeed, rightSpeed]);

  const ControlComponent = React.useMemo(() => {
    moveWheels(0, 0, true);
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
        <LightControl
          className={styles.lightControl}
          direction={
            leftSpeed === 0 && rightSpeed === 0
              ? 'STOP'
              : leftSpeed >= 0 && rightSpeed >= 0
              ? 'FORWARD'
              : 'BACKWARD'
          }
        />
      </div>
    </React.Fragment>
  );
};

export default RemoteControl;
