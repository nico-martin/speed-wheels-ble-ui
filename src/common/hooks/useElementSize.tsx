import React from 'react';

const useElementSize = (element) => {
  const [size, setSize] = React.useState([0, 0]);

  React.useLayoutEffect(() => {
    if (!element.current) {
      return;
    }
    const updateSize = () => {
      setSize([element.current.offsetWidth, element.current.offsetHeight]);
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [element]);
  return size;
};

export default useElementSize;
