import React from 'react';
import ReactDOM from 'react-dom';
import { Message } from '@theme';
import { getBleServer, BROWSER_SUPPORT } from '@common/hooks/useBle';
import cn from '@common/utils/classnames';
import { BLE_UUID } from '@common/utils/constants';
import styles from './App.css';
import BluetoothButton from './app/BluetoothButton';
import Device from './app/Device/Device';
import Footer from './app/Footer';
import RemoteControl from './app/RemoteControl';

const USE_DEMO_CONTROLS = true;

const App = () => {
  const [bleDevice, setBleDevice] = React.useState<BluetoothDevice>(null);
  const [bleMotorService, setBleMotorService] =
    React.useState<BluetoothRemoteGATTService>(null);

  const [buttonLoading, setButtonLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const onDisconnected = (device) => {
    console.log(`Device ${device.name} is disconnected.`);
    setBleMotorService(null);
  };

  const connect = async () => {
    setButtonLoading(true);
    setError('');
    getBleServer(
      [BLE_UUID.SERVICE_MOTOR],
      [{ namePrefix: 'SpeedWheels' }],
      (device) => onDisconnected(device)
    ).then(({ device, server }) => {
      setBleDevice(device);
      Promise.all([server.getPrimaryService(BLE_UUID.SERVICE_MOTOR)])
        .then(([motor]) => {
          setBleMotorService(motor);
        })
        .catch((e) => setError(e.toString()))
        .finally(() => setButtonLoading(false));
    });

    setButtonLoading(false);
  };

  return (
    <div className={styles.root}>
      {USE_DEMO_CONTROLS ? (
        <RemoteControl className={styles.remote} />
      ) : bleMotorService === null ? (
        <div className={styles.connectionErrorContainer}>
          {error !== '' && (
            <Message type="error" className={styles.connectionError}>
              {error}
            </Message>
          )}
          {BROWSER_SUPPORT ? (
            <BluetoothButton
              loading={buttonLoading}
              connect={connect}
              className={styles.bluetoothButton}
            />
          ) : (
            <Message type="error" className={styles.connectionError}>
              Your browser does not support the WebBluetooth API:{' '}
              <a href="https://caniuse.com/web-bluetooth" target="_blank">
                https://caniuse.com/web-bluetooth
              </a>
            </Message>
          )}
        </div>
      ) : (
        <React.Fragment>
          <RemoteControl bleMotorService={bleMotorService} />
          <Device className={styles.device} bleDevice={bleDevice} />
        </React.Fragment>
      )}
      <Footer className={cn(styles.footer)} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
