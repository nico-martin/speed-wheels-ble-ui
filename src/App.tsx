import React from 'react';
import ReactDOM from 'react-dom';
import styles from './App.css';
import BluetoothButton from './app/BluetoothButton';

const encoder = new TextEncoder();

const App = () => {
  const [bluetoothMotorCharacteristic, setBluetoothMotorCharacteristic] =
    React.useState<any>(null);

  const onDisconnected = (event) => {
    const device = event.target;
    console.log(`Device ${device.name} is disconnected.`);
    setBluetoothMotorCharacteristic(null);
  };

  const connect = () => {
    //@ts-ignore
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: 'WebBluetoothCar' }],
        optionalServices: ['0000fff1-0000-1000-8000-00805f9b34fb'],
      })
      .then((device) => {
        device.addEventListener('gattserverdisconnected', onDisconnected);
        return device.gatt.connect();
      })
      .then((server) => {
        console.log(server);
        return server.getPrimaryService('0000fff1-0000-1000-8000-00805f9b34fb');
        //return server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb');
      })
      .then((service) =>
        service.getCharacteristic('0000fff2-0000-1000-8000-00805f9b34fb')
      )
      .then((characteristic) => {
        setBluetoothMotorCharacteristic(characteristic);
        // Writing 1 is the signal to reset energy expended.
        //const resetEnergyExpended = Uint8Array.of(1);
        //return characteristic.writeValue(resetEnergyExpended);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className={styles.root}>
      {bluetoothMotorCharacteristic === null ? (
        <BluetoothButton connect={connect} className={styles.bluetoothButton} />
      ) : (
        <p>
          <button
            onClick={() => {
              bluetoothMotorCharacteristic.writeValue(encoder.encode('l:50'));
            }}
          >
            start left wheel
          </button>
          <button
            onClick={() => {
              bluetoothMotorCharacteristic.writeValue(encoder.encode('r:50'));
            }}
          >
            start right wheel
          </button>
          <button
            onClick={() => {
              bluetoothMotorCharacteristic.writeValue(encoder.encode('stop'));
            }}
          >
            stop
          </button>
        </p>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
