import React from 'react';
import { Icon } from '@theme';
import cn from '@common/utils/classnames';
import styles from './LightControl.css';

const SERVICE_LIGHT = '0000ff0f-0000-1000-8000-00805f9b34fb';
const CHAR_LIGHT = '0000fffc-0000-1000-8000-00805f9b34fb';

const LightControl = ({
  className = '',
  direction = 'STOP',
}: {
  className?: string;
  direction: 'FORWARD' | 'BACKWARD' | 'STOP';
}) => {
  const [device, setDevice] = React.useState<BluetoothDevice>(null);
  const [lightCharacterisctic, setLightCharacterisctic] =
    React.useState<BluetoothRemoteGATTCharacteristic>(null);

  React.useEffect(() => {
    lightCharacterisctic && writeColor(0, 0, 0);
  }, [lightCharacterisctic]);

  React.useEffect(() => {
    if (lightCharacterisctic) {
      switch (direction) {
        case 'BACKWARD':
          writeColor(255, 0, 0);
        case 'FORWARD':
          writeColor(255, 255, 255);
        case 'STOP':
          writeColor(0, 0, 0);
      }
    }
  }, [direction]);

  const writeColor = async (r: number, g: number, b: number): Promise<void> =>
    lightCharacterisctic.writeValue(new Uint8Array([0x00, r, g, b]));

  const connect = async () => {
    try {
      const device: BluetoothDevice = await navigator.bluetooth.requestDevice({
        //acceptAllDevices: true,
        filters: [{ name: 'PLAYBULB sphere' }],
        optionalServices: [SERVICE_LIGHT],
      });
      setDevice(device);
      device.addEventListener('gattserverdisconnected', () => {
        setDevice(null);
        setLightCharacterisctic(null);
      });
      const server = await device.gatt.connect();
      const serviceLight = await server.getPrimaryService(SERVICE_LIGHT);

      const charLight = await serviceLight.getCharacteristic(CHAR_LIGHT);
      setLightCharacterisctic(charLight);
    } catch (e) {
      alert('something went wrong');
      console.log(e);
    }
  };

  return (
    <button
      onClick={Boolean(device) ? () => device.gatt.disconnect() : connect}
      className={cn(className, styles.root, {
        [styles.rootActive]: Boolean(lightCharacterisctic),
      })}
    >
      <Icon icon={Boolean(device) ? 'mdi/bulb-active' : 'mdi/bulb'} />
    </button>
  );
};

export default LightControl;
