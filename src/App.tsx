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
const decoder = new TextDecoder();

const USE_DEMO_CONTROLS = false;
const BROWSER_SUPPORT = 'bluetooth' in navigator;

const BLE_UUID = {
  SERVICE_MOTOR: '0000fff1-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC_MOTOR_LEFT: '0000fff2-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC_MOTOR_RIGHT: '0000fff4-0000-1000-8000-00805f9b34fb',
  SERVICE_DEVICE: '0000ff01-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC_VERSION: '0000ff02-0000-1000-8000-00805f9b34fb',
  CHARACTERISTIC_SERIAL: '0000ff04-0000-1000-8000-00805f9b34fb',
};

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
  const [carSoftwareVersion, setCarSoftwareVersion] =
    React.useState<string>('');
  const [carSerial, setCarSerial] = React.useState<string>('');
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
        optionalServices: [BLE_UUID.SERVICE_DEVICE, BLE_UUID.SERVICE_MOTOR],
      })
      .then((device) => {
        setBleDevice(device);
        device.addEventListener('gattserverdisconnected', onDisconnected);
        return device.gatt.connect();
      })
      .then((server) =>
        Promise.all([
          server.getPrimaryService(BLE_UUID.SERVICE_MOTOR),
          server.getPrimaryService(BLE_UUID.SERVICE_DEVICE),
        ])
      )
      .then(([serviceMotor, serviceDevice]) =>
        Promise.all([
          serviceMotor.getCharacteristic(BLE_UUID.CHARACTERISTIC_MOTOR_LEFT),
          serviceMotor.getCharacteristic(BLE_UUID.CHARACTERISTIC_MOTOR_RIGHT),
          serviceDevice.getCharacteristic(BLE_UUID.CHARACTERISTIC_VERSION),
          serviceDevice.getCharacteristic(BLE_UUID.CHARACTERISTIC_SERIAL),
        ])
      )
      .then(([charLeft, charRight, charVersion, charSerial]) => {
        setBleCharRight(charRight);
        setBleCharLeft(charLeft);
        charVersion
          .readValue()
          .then((e) => setCarSoftwareVersion(decoder.decode(e)));
        charSerial.readValue().then((e) => setCarSerial(decoder.decode(e)));
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
          <div className={styles.device}>
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
            <div className={styles.deviceInfo}>
              <p>
                <b>Device Info</b>
              </p>
              <p>Car: {carSerial}</p>
              <p>Software Version: {carSoftwareVersion}</p>
            </div>
          </div>
        </React.Fragment>
      )}
      <Footer className={cn(styles.footer)} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
