import React from 'react';
import ArrowKeys from './Control/ArrowKeys/ArrowKeys';
import Circle from './Control/Circle/Circle';
import GestureControl from './Control/GestureControl/GestureControl';
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
  <GestureControl
    onCmdLeft={onCmdLeft}
    onCmdRight={onCmdRight}
    onCmdStop={onCmdStop}
    className={className}
  />
);

export default RemoteControl;
