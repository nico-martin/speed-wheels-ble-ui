import React from 'react';

const useScreenOrientation = (): 'landscape' | 'portrait' => {
  const [orientation, setOrientation] = React.useState<OrientationType>(
    screen.orientation.type
  );

  const orientationChange = (e) => setOrientation(e.target.type);

  React.useEffect(() => {
    screen.orientation.addEventListener('change', orientationChange);
  }, []);

  return orientation === 'landscape-primary' ? 'landscape' : 'portrait';
};

export default useScreenOrientation;
