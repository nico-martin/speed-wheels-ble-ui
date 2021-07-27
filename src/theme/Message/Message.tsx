import React from 'react';
import cn from '@common/utils/classnames';
import { Icon } from '../index';
import styles from './Message.css';

export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

const Message = ({
  className = '',
  type,
  children,
}: {
  className?: string;
  type?: string;
  children: any;
}) => (
  <div className={cn(styles.root, styles[type || MESSAGE_TYPES[0]], className)}>
    <Icon
      className={styles.icon}
      icon={`mdi/${type === MESSAGE_TYPES.SUCCESS ? 'check' : 'alert'}`}
    />
    <p className={styles.content}>{children}</p>
  </div>
);

export default Message;
