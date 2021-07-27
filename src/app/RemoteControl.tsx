import React from 'react';
import Circle from './Control/Circle/Circle';
import LeftRightDrag from './Control/LeftRightDrag/LeftRightDrag';

const RemoteControl = ({
  onCmdLeft,
  onCmdRight,
  onCmdStop,
  className = '',
}: {
  onCmdLeft: (speed: number) => void;
  onCmdRight: (speed: number) => void;
  onCmdStop: () => void;
  className?: string;
}) => (
  <Circle
    onCmdLeft={onCmdLeft}
    onCmdRight={onCmdRight}
    onCmdStop={onCmdStop}
    className={className}
  />
);

export default RemoteControl;
