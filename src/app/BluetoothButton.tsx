import React from 'react';
import { Icon } from '@theme';
import cn from '@common/utils/classnames';
import styles from './BluetoothButton.css';

const BluetoothButton = ({
  connect,
  className,
}: {
  connect: () => void;
  className?: string;
}) => {
  return (
    <button className={cn(styles.root, className)} onClick={connect}>
      <Icon icon="mdi/bluetooth" className={cn(styles.icon)} /> Connect device
    </button>
  );
};

export default BluetoothButton;
