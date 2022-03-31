import PQueue from 'p-queue';
import React from 'react';

const bleQueue = new PQueue({ concurrency: 1 });

const useBLECharacteristic = (
  characteristic: BluetoothRemoteGATTCharacteristic
): {
  value: DataView;
  writeValue: (DataView) => void;
  readValue: () => Promise<DataView | Error>;
  properties: {
    write: boolean;
    read: boolean;
    notify: boolean;
  };
} => {
  const [value, setValue] = React.useState<DataView>(null);
  const write =
    characteristic.properties.write ||
    characteristic.properties.writeWithoutResponse;
  const read = characteristic.properties.read;
  const notify = characteristic.properties.notify;

  const listener = (e) => setValue(e.target.value);

  const writeValue = async (data: DataView) =>
    write
      ? await bleQueue.add(() => characteristic.writeValue(data))
      : new Error('"write" not available');

  const readValue = async () => {
    if (read) {
      const value = await bleQueue.add(() => characteristic.readValue());
      setValue(value);
      return value;
    }
    return new Error('"read" not available');
  };

  const startNotifications = async () =>
    notify
      ? await bleQueue.add(async () => {
          characteristic.addEventListener(
            'characteristicvaluechanged',
            listener
          );
          return await characteristic.startNotifications();
        })
      : new Error('"notify" not available');

  const stopNotifications = async () =>
    notify
      ? await bleQueue.add(async () => {
          characteristic.removeEventListener(
            'characteristicvaluechanged',
            listener
          );
          return await characteristic.stopNotifications();
        })
      : new Error('"notify" not available');

  React.useEffect(() => {
    if (!characteristic) {
      return;
    }

    readValue();
    startNotifications();

    return () => {
      stopNotifications();
    };
  }, []);

  return {
    value,
    writeValue,
    readValue,
    properties: {
      write,
      read,
      notify,
    },
  };
};

export default useBLECharacteristic;
