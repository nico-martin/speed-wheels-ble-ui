import React from 'react';
import { Icon } from '@theme';
import cn from '@common/utils/classnames';
import useBLECharacteristic from '../hooks/useBLECharacteristic';
import styles from './Battery.css';

const Battery = ({
  className = '',
  bleCharBattery,
  bleCharBatteryLoading,
}: {
  className?: string;
  bleCharBattery: BluetoothRemoteGATTCharacteristic;
  bleCharBatteryLoading: BluetoothRemoteGATTCharacteristic;
}) => {
  const { value: battery } = useBLECharacteristic(bleCharBattery);
  const { value: batteryLoading } = useBLECharacteristic(bleCharBatteryLoading);

  const batteryValue: number = battery ? battery.getUint8(0) : 0;
  const batteryLoadingValue: boolean = batteryLoading
    ? batteryLoading.getUint8(0) === 1
    : false;

  const batteryStep = React.useMemo(
    () => Math.ceil(batteryValue / 10) * 10,
    [batteryValue]
  );

  return (
    <p className={cn(className, styles.root)}>
      {batteryValue === 0 ? (
        <span>...</span>
      ) : (
        <span className={styles.battery}>
          <Icon
            className={styles.batteryIcon}
            icon={`mdi/battery-${batteryStep === 0 ? 10 : batteryStep}`}
          />{' '}
          {batteryValue}% {batteryLoadingValue && <Icon icon="mdi/lightning" />}
        </span>
      )}
    </p>
  );
};

export default Battery;
