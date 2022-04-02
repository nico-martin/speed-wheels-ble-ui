export const getBleServer = async (
  optionalServices: BluetoothServiceUUID[],
  filters: BluetoothRequestDeviceFilter[] = null,
  onDisconnect: (device: BluetoothDevice) => void = (device) => {}
): Promise<{ server: BluetoothRemoteGATTServer; device: BluetoothDevice }> => {
  const device = await navigator.bluetooth.requestDevice({
    ...(filters ? { filters } : { acceptAllDevices: true }),
    optionalServices,
  });

  device.addEventListener('gattserverdisconnected', (event) =>
    onDisconnect(event.target as BluetoothDevice)
  );

  const server = await device.gatt.connect();
  return { server, device };
};
