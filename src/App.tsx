import React from 'react';
import ReactDOM from 'react-dom';
import { Icon, Loader, Message } from '@theme';
import cn from '@common/utils/classnames';
import Queue from '@common/utils/promiseQueue';
import styles from './App.css';
import BluetoothButton from './app/BluetoothButton';
import Footer from './app/Footer';
import RemoteControl from './app/RemoteControl';

const encoder = new TextEncoder();

const USE_DEMO_CONTROLS = false;
const BROWSER_SUPPORT = 'bluetooth' in navigator;

const leftQueue = new Queue();
const rightQueue = new Queue();
const mockSend = (speed, dir = '') => {
  console.log(dir, speed);
  return new Promise((resolve) => setTimeout(() => resolve(speed), 100));
};

const App = () => {
  const [bleDevice, setBleDevice] = React.useState<any>(null);
  const [bleCharRight, setBleCharRight] = React.useState<any>(null);
  const [bleCharLeft, setBleCharLeft] = React.useState<any>(null);
  const [buttonLoading, setButtonLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [powerOffLoading, setPowerOffLoading] = React.useState<boolean>(false);

  const onDisconnected = (event) => {
    const device = event.target;
    console.log(`Device ${device.name} is disconnected.`);
    setBleCharRight(null);
    setBleCharLeft(null);
  };

  const connect = () => {
    setButtonLoading(true);
    //@ts-ignore
    navigator.bluetooth
      .requestDevice({
        //acceptAllDevices: true,
        filters: [{ name: 'WebBluetoothCar' }],
        optionalServices: ['0000fff1-0000-1000-8000-00805f9b34fb'],
      })
      .then((device) => {
        setBleDevice(device);
        device.addEventListener('gattserverdisconnected', onDisconnected);
        return device.gatt.connect();
      })
      .then((server) =>
        server.getPrimaryService('0000fff1-0000-1000-8000-00805f9b34fb')
      )
      .then((service) =>
        Promise.all([
          service.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb'),
          service.getCharacteristic('0000fff4-0000-1000-8000-00805f9b34fb'),
        ])
      )
      .then(([charLeft, charRight]) => {
        setBleCharRight(charRight);
        setBleCharLeft(charLeft);
      })
      .catch((error) => {
        setError(error.toString());
      })
      .finally(() => setButtonLoading(false));
  };

  const moveLeftWheel = (speed: number, important = false) =>
    leftQueue.add(() => bleCharLeft.writeValue(encoder.encode(`${speed}`)));

  const moveRightWheel = (speed: number, important = false) =>
    rightQueue.add(() => bleCharRight.writeValue(encoder.encode(`${speed}`)));

  return (
    <div className={styles.root}>
      {USE_DEMO_CONTROLS ? (
        <RemoteControl
          onCmdLeft={(speed) => leftQueue.add(() => mockSend(speed, 'left'))}
          onCmdRight={(speed) => rightQueue.add(() => mockSend(speed, 'right'))}
          onCmdStop={() => {
            leftQueue.add(() => mockSend(0, 'left'), true);
            rightQueue.add(() => mockSend(0, 'right'), true);
          }}
          className={styles.remote}
        />
      ) : bleCharRight === null || bleCharLeft === null ? (
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
          <RemoteControl
            onCmdLeft={moveLeftWheel}
            onCmdRight={moveRightWheel}
            onCmdStop={() => {
              moveLeftWheel(0);
              moveRightWheel(0);
            }}
          />
          <button
            className={styles.powerOff}
            disabled={powerOffLoading}
            onClick={() => {
              setPowerOffLoading(true);
              moveLeftWheel(0);
              moveRightWheel(0);
              // make sure the wheels have stopped!
              bleDevice &&
                window.setTimeout(() => {
                  bleDevice.gatt.disconnect();
                  setPowerOffLoading(false);
                }, 2000);
            }}
          >
            {powerOffLoading ? (
              <Loader className={styles.powerOffLoader} />
            ) : (
              <Icon icon="mdi/power" />
            )}
          </button>
        </React.Fragment>
      )}
      <Footer className={cn(styles.footer)} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
