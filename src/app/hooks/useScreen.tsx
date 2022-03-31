import React from 'react';
import { matrix, matrixToArray, MatrixType } from '@common/utils/matrix';
import useBLECharacteristic from './useBLECharacteristic';

const useScreen = (
  charMatrix: BluetoothRemoteGATTCharacteristic
): [MatrixType, (MatrixType) => void] => {
  const [activeMatrix, setActiveMatrix] = React.useState<MatrixType>(matrix);
  const { writeValue } = useBLECharacteristic(charMatrix);

  React.useEffect(() => {
    writeValue(new Uint8Array(matrixToArray(activeMatrix)));
  }, [activeMatrix]);

  return [activeMatrix, setActiveMatrix];
};

export default useScreen;
