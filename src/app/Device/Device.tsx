import React from 'react';
import { Icon, Loader } from '@theme';
import cn from '@common/utils/classnames';
import Battery from './Battery';
import styles from './Device.css';

const Device = ({
  className = '',
  bleDevice,
  bleCharBattery,
  bleCharBatteryLoading,
}: {
  className?: string;
  bleDevice: BluetoothDevice;
  bleCharBattery: BluetoothRemoteGATTCharacteristic;
  bleCharBatteryLoading: BluetoothRemoteGATTCharacteristic;
}) => {
  return (
    <div className={cn(className, styles.root)}>
      <button
        className={styles.powerOff}
        onClick={() => bleDevice && bleDevice.gatt.disconnect()}
      >
        <Icon icon="mdi/power" />
      </button>
      <div className={styles.deviceInfo}>
        <p>{bleDevice && bleDevice.name}</p>
        {/*<Battery
          bleCharBattery={bleCharBattery}
          bleCharBatteryLoading={bleCharBatteryLoading}
        />*/}
      </div>
    </div>
  );
};

export default Device;
