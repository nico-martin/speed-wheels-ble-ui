import React from 'react';
import { Icon, Loader } from '@theme';
import cn from '@common/utils/classnames';
import styles from './BluetoothButton.css';

const BluetoothButton = ({
  connect,
  className,
  loading = false,
  disabled = false,
}: {
  connect: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <button
      className={cn(styles.root, className, {
        [styles.isLoading]: loading,
      })}
      disabled={disabled || loading}
      onClick={connect}
    >
      <Loader className={styles.loader} />
      <Icon icon="mdi/bluetooth" className={cn(styles.icon)} />
      <span className={styles.content}>Connect</span>
    </button>
  );
};

export default BluetoothButton;
