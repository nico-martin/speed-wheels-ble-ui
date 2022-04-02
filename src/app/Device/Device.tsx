import React from 'react';
import { Icon, Loader } from '@theme';
import cn from '@common/utils/classnames';
import styles from './Device.css';

const Device = ({
  className = '',
  bleDevice,
}: {
  className?: string;
  bleDevice: BluetoothDevice;
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
      </div>
    </div>
  );
};

export default Device;
