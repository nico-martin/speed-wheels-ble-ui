import React from 'react';

interface Element {
  left: number;
  top: number;
  width: number;
  height: number;
}

function useElementBounds<T extends HTMLElement = HTMLDivElement>(
  elementRef
): Element {
  const [element, setElement] = React.useState<Element>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const updateSize = React.useCallback(() => {
    const node = elementRef?.current;
    node &&
      setElement({
        left: node.offsetLeft || 0,
        top: node.offsetTop || 0,
        width: node.offsetWidth || 0,
        height: node.offsetHeight || 0,
      });
  }, [elementRef]);

  React.useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return element;
}

export default useElementBounds;
