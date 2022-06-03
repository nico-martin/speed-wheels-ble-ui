import React from 'react';
import { Icon } from '@theme';
import { useBleCharacteristic } from '@common/hooks/useBle';
import cn from '@common/utils/classnames';
import { BLE_UUID } from '@common/utils/constants';
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

const START_CONTROLS = 0;
const FACTOR_LEFT = 1;
const FACTOR_RIGHT = 1;

const RemoteControl = ({
  className = '',
  bleMotorService = null,
  bleLedService = null,
}: {
  className?: string;
  bleMotorService?: BluetoothRemoteGATTService;
  bleLedService?: BluetoothRemoteGATTService;
}) => {
  const [leftSpeed, setLeftSpeed] = React.useState<number>(0);
  const [rightSpeed, setRightSpeed] = React.useState<number>(0);
  const [activeControl, setActiveControl] = React.useState<string>(
    Object.keys(CONTROLS)[START_CONTROLS]
  );

  const { writeValue } = useBleCharacteristic(
    bleMotorService,
    BLE_UUID.CHAR_MOTOR,
    true
  );

  const { writeValue: writeValueLed, value: ledValue } = useBleCharacteristic(
    bleLedService,
    BLE_UUID.CHAR_LED
  );

  const moveWheels = (
    leftSpeed: number,
    rightSpeed: number,
    important = false
  ) => {
    const left = leftSpeed + 100;
    const right = rightSpeed + 100;

    if (leftSpeed === 0 && rightSpeed === 0) {
      console.log('LED stop');
      writeValueLed(new Uint8Array([0x00]));
    } else if (leftSpeed >= 0 && rightSpeed >= 0) {
      if (leftSpeed > rightSpeed) {
        console.log('LED right');
        writeValueLed(new Uint8Array([0x04]));
      } else if (rightSpeed > leftSpeed) {
        console.log('LED left');
        writeValueLed(new Uint8Array([0x03]));
      } else {
        console.log('LED forward');
        writeValueLed(new Uint8Array([0x02]));
      }
    } else {
      console.log('LED backward');
      writeValueLed(new Uint8Array([0x07]));
    }

    console.log('speed', {
      leftSpeed: leftSpeed * FACTOR_LEFT + 100,
      rightSpeed: rightSpeed * FACTOR_RIGHT + 100,
    });

    bleMotorService
      ? writeValue(
          new Uint8Array([
            leftSpeed * FACTOR_LEFT + 100,
            rightSpeed * FACTOR_RIGHT + 100,
          ])
        )
      : console.log({ leftSpeed, rightSpeed, important });
  };

  React.useEffect(() => {
    console.log({ ledValue });
  }, [ledValue]);

  React.useEffect(() => {
    moveWheels(leftSpeed, rightSpeed, leftSpeed === 0 && rightSpeed === 0);
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
