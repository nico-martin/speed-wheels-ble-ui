import React from 'react';
import cn from '@common/utils/classnames';
import styles from './CloseButton.css';

const CloseButton = ({
  className = '',
  onClick,
}: {
  className?: string;
  onClick: Function;
}) => (
  <button className={cn(styles.root, className)} onClick={() => onClick()}>
    close
  </button>
);

export default CloseButton;
