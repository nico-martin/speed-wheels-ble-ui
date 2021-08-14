import React from 'react';

const decoder = new TextDecoder();

const CarSoftwareRevision = ({
  characteristic,
}: {
  characteristic: BluetoothRemoteGATTCharacteristic;
}) => {
  const [value, setValue] = React.useState<string>(null);

  React.useEffect(() => {
    characteristic &&
      characteristic.readValue().then((e) => setValue(decoder.decode(e)));
  }, [characteristic]);

  return <span>{value}</span>;
};

export default CarSoftwareRevision;
