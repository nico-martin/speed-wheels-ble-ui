import React from 'react';
import PromiseQueue from './promiseQueue';

const bleQueue = new PromiseQueue();

export const useBleCharacteristic = (
  service: BluetoothRemoteGATTService,
  characteristicUUID: BluetoothCharacteristicUUID,
  promiseQueueWriteOnlyLast: boolean = false
): {
  value: DataView;
  writeValue: (DataView) => void;
  readValue: () => Promise<DataView | Error>;
} => {
  const [characteristic, setCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic>(null);
  const [value, setValue] = React.useState<DataView>(null);

  React.useEffect(() => {
    service &&
      service
        .getCharacteristic(characteristicUUID)
        .then((char) => setCharacteristic(char));
  }, [characteristicUUID, service]);

  const writeValue = async (data: DataView) => {
    if (characteristic?.properties?.writeWithoutResponse) {
      await bleQueue.add(
        () => characteristic.writeValueWithoutResponse(data),
        `${characteristicUUID}-write`,
        promiseQueueWriteOnlyLast
      );
    } else if (characteristic?.properties?.write) {
      await bleQueue.add(
        () => characteristic.writeValueWithResponse(data),
        `${characteristicUUID}-write`,
        promiseQueueWriteOnlyLast
      );
    } else {
      return new Error('"write" not available');
    }
  };

  const readValue = async () => {
    if (characteristic?.properties?.read) {
      const value = await bleQueue.add(
        () => characteristic.readValue(),
        `${characteristicUUID}-read`
      );
      setValue(value);
      return value;
    }
    return new Error('"read" not available');
  };

  const listener = (e) => setValue(e.target.value);

  const startNotifications = async () =>
    await bleQueue.add(async () => {
      characteristic.addEventListener('characteristicvaluechanged', listener);
      return await characteristic.startNotifications();
    }, `${characteristicUUID}-notify-start`);

  const stopNotifications = async () =>
    await bleQueue.add(async () => {
      characteristic.removeEventListener(
        'characteristicvaluechanged',
        listener
      );
      return await characteristic.stopNotifications();
    }, `${characteristicUUID}-notify-stop`);

  React.useEffect(() => {
    if (!characteristic) {
      return;
    }

    readValue();
    characteristic.properties.notify && startNotifications();

    return () => {
      characteristic.properties.notify && stopNotifications();
    };
  }, [characteristic]);

  return { value, writeValue, readValue };
};
