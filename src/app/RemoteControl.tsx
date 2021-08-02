import React from 'react';
import ArrowKeys from './Control/ArrowKeys/ArrowKeys';
import Circle from './Control/Circle/Circle';
import GestureControl from './Control/GestureControl/GestureControl';
import LeftRightDrag from './Control/LeftRightDrag/LeftRightDrag';

const RemoteControl = ({
  onCmd,
  onCmdStop,
  className = '',
}: {
  onCmd: (left: number, right: number) => void;
  onCmdStop: () => void;
  className?: string;
}) => {
  const [leftSpeed, setLeftSpeed] = React.useState<number>(0);
  const [rightSpeed, setRightSpeed] = React.useState<number>(0);

  React.useEffect(() => {
    leftSpeed === 0 && rightSpeed === 0
      ? onCmdStop()
      : onCmd(leftSpeed, rightSpeed);
  }, [leftSpeed, rightSpeed]);

  return (
    <GestureControl
      onCmdLeft={(speed) => setLeftSpeed(speed)}
      onCmdRight={(speed) => setRightSpeed(speed)}
      onCmdStop={() => {
        setLeftSpeed(0);
        setRightSpeed(0);
      }}
      className={className}
    />
  );
};

export default RemoteControl;
