import React from 'react';
import ReactDOM from 'react-dom';
import { Message } from '@theme';
import cn from '@common/utils/classnames';
import styles from './App.css';
import BluetoothButton from './app/BluetoothButton';
import Footer from './app/Footer';
import RemoteControl from './app/RemoteControl';

const encoder = new TextEncoder();

const USE_DEMO_CONTROLS = false;

let leftCmdSent = false;
let rightCmdSent = false;

const BROWSER_SUPPORT = 'bluetooth' in navigator;

const App = () => {
  const [bleCharRight, setBleCharRight] = React.useState<any>(null);
  const [bleCharLeft, setBleCharLeft] = React.useState<any>(null);
  const [buttonLoading, setButtonLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

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

  const moveLeftWheel = (speed: number) => {
    //if (!leftCmdSent) {
    leftCmdSent = true;
    bleCharLeft.writeValue(encoder.encode(`${speed}`)).finally(() => {
      leftCmdSent = false;
    });
    //}
  };

  const moveRightWheel = (speed: number) => {
    //if (!rightCmdSent) {
    rightCmdSent = true;
    bleCharRight.writeValue(encoder.encode(`${speed}`)).finally(() => {
      rightCmdSent = false;
    });
    //}
  };

  return (
    <div className={styles.root}>
      {USE_DEMO_CONTROLS ? (
        <RemoteControl
          onCmdLeft={(speed) => console.log('LEFT', speed)}
          onCmdRight={(speed) => console.log('RIGHT', speed)}
          onCmdStop={() => console.log('STOP')}
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
        <RemoteControl
          onCmdLeft={moveLeftWheel}
          onCmdRight={moveRightWheel}
          onCmdStop={() => {
            bleCharLeft.writeValue(encoder.encode('0'));
            bleCharRight.writeValue(encoder.encode('0'));
          }}
        />
      )}
      <Footer className={cn(styles.footer)} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
