import React from 'react';
import cn from '../../common/utils/classnames';
import styles from './Icon.css';

interface Props {
  icon: string;
  className?: string;
  rotate?: 90 | 180 | 270 | false;
  spinning?: boolean;
  button?: boolean;
  round?: boolean;
  [key: string]: any;
}

const Icon = ({
  icon,
  className = '',
  spinning = false,
  rotate = false,
  button = false,
  round = false,
  ...props
}: Props) => {
  const [loadedIcon, setLoadedIcon] = React.useState('');

  React.useEffect(() => {
    async function loadIcon() {
      return await import(
        /* webpackMode: "eager" */ `../../static/icons/${icon}.svg`
      );
    }

    loadIcon().then((loaded) => setLoadedIcon(loaded.default));
  }, [icon]);

  return (
    <figure
      className={cn(
        className,
        styles.root,
        rotate !== false ? styles[`isRotated-${rotate}`] : '',
        {
          [styles.hasAnimationSpin]: spinning,
          [styles.isButton]: button,
          [styles.isRound]: round,
        }
      )}
      dangerouslySetInnerHTML={{ __html: loadedIcon }}
      {...props}
    />
  );
};

export default Icon;
