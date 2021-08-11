import React from 'react';

type DeviceOrientation = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

type UseDeviceOrientationData = {
  orientation: DeviceOrientation | null;
  error: Error | null;
  requestAccess: () => Promise<boolean>;
  revokeAccess: () => Promise<void>;
};

const useDeviceOrientation = (): UseDeviceOrientationData => {
  const [error, setError] = React.useState<Error | null>(null);
  const [orientation, setOrientation] =
    React.useState<DeviceOrientation | null>(null);

  const onDeviceOrientation = (event: DeviceOrientationEvent): void => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  };

  const revokeAccessAsync = async (): Promise<void> => {
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    setOrientation(null);
  };

  const requestAccessAsync = async (): Promise<boolean> => {
    if (!DeviceOrientationEvent) {
      setError(
        new Error('Device orientation event is not supported by your browser')
      );
      return false;
    }

    if (
      DeviceOrientationEvent.requestPermission &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      let permission: PermissionState;
      try {
        permission = await DeviceOrientationEvent.requestPermission();
      } catch (err) {
        setError(err);
        return false;
      }
      if (permission !== 'granted') {
        setError(
          new Error('Request to access the device orientation was rejected')
        );
        return false;
      }
    }

    window.addEventListener('deviceorientation', onDeviceOrientation);

    return true;
  };

  const requestAccess = React.useCallback(requestAccessAsync, []);
  const revokeAccess = React.useCallback(revokeAccessAsync, []);

  React.useEffect(() => {
    return (): void => {
      revokeAccess();
    };
  }, [revokeAccess]);

  return {
    orientation,
    error,
    requestAccess,
    revokeAccess,
  };
};

export default useDeviceOrientation;
