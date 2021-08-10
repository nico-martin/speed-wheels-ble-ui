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
  CHAR_MOTOR: '0000fff2-0000-1000-8000-00805f9b34fb',
  SERVICE_DEVICE: '0000180a-0000-1000-8000-00805f9b34fb',
  CHAR_MANUFACRURER: '00002a29-0000-1000-8000-00805f9b34fb',
  CHAR_SOFTWARE_REVISION: '00002a28-0000-1000-8000-00805f9b34fb',
  CHAR_MODEL_NUMBER: '00002a24-0000-1000-8000-00805f9b34fb',
};

const queue = new Queue();
const mockSend = (leftSpeed, rightSpeed) => {
  console.log(leftSpeed, rightSpeed);
  return new Promise((resolve) =>
    setTimeout(() => resolve({ leftSpeed, rightSpeed }), 100)
  );
};

const App = () => {
  const [bleDevice, setBleDevice] = React.useState<any>(null);
  const [bleCharMotor, setBleCharMotor] = React.useState<any>(null);
  const [carSoftwareVersion, setCarSoftwareVersion] =
    React.useState<string>('');
  const [carModel, setCarModel] = React.useState<string>('');
  const [buttonLoading, setButtonLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [powerOffLoading, setPowerOffLoading] = React.useState<boolean>(false);

  const onDisconnected = (event) => {
    const device = event.target;
    console.log(`Device ${device.name} is disconnected.`);
    setBleCharMotor(null);
  };

  const connect = () => {
    setButtonLoading(true);
    //@ts-ignore
    navigator.bluetooth
      .requestDevice({
        //acceptAllDevices: true,
        filters: [{ name: 'WebBluetoothCar' }],
        optionalServices: [BLE_UUID.SERVICE_MOTOR, BLE_UUID.SERVICE_DEVICE],
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
          serviceMotor.getCharacteristic(BLE_UUID.CHAR_MOTOR),
          serviceDevice.getCharacteristic(BLE_UUID.CHAR_SOFTWARE_REVISION),
          serviceDevice.getCharacteristic(BLE_UUID.CHAR_MODEL_NUMBER),
        ])
      )
      .then(([charMotor, charVersion, charModel]) => {
        setBleCharMotor(charMotor);
        charVersion
          .readValue()
          .then((e) => setCarSoftwareVersion(decoder.decode(e)));
        charModel.readValue().then((e) => setCarModel(decoder.decode(e)));
      })
      .catch((error) => {
        setError(error.toString());
      })
      .finally(() => setButtonLoading(false));
  };

  const moveWheels = (
    leftSpeed: number,
    rightSpeed: number,
    important = false
  ) =>
    queue.add(
      () =>
        bleCharMotor.writeValue(
          encoder.encode(
            JSON.stringify({
              left: leftSpeed,
              right: rightSpeed,
            })
          )
        ),
      important
    );

  return (
    <div className={styles.root}>
      {USE_DEMO_CONTROLS ? (
        <RemoteControl
          onCmd={(left, right) => queue.add(() => mockSend(left, right))}
          onCmdStop={() => {
            queue.add(() => mockSend(0, 0), true);
          }}
          className={styles.remote}
        />
      ) : bleCharMotor === null ? (
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
            onCmd={(left, right) => moveWheels(left, right)}
            onCmdStop={() => moveWheels(0, 0, true)}
          />
          <div className={styles.device}>
            <button
              className={styles.powerOff}
              disabled={powerOffLoading}
              onClick={() => {
                setPowerOffLoading(true);
                queue.add(() => mockSend(0, 0));
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
              <p>Car: {carModel}</p>
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
