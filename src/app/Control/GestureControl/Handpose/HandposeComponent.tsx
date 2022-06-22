import * as fp from 'fingerpose';
import React from 'react';
import { Icon, Loader, PortalBox } from '@theme';
import cn from '@common/utils/classnames';
import * as handpose from '@tensorflow-models/handpose';
import { HandPose } from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import BackGesture from '../Gestures/Back';
import LeftGesture from '../Gestures/Left';
import RightGesture from '../Gestures/Right';
import StartGesture from '../Gestures/Start';
import StopGesture from '../Gestures/Stop';
import HandposeCanvas from './HandposeCanvas';
import styles from './HandposeComponent.css';
import HandposeVideo from './HandposeVideo';

const HandposeComponent = ({
  className = '',
  onPoseFound,
  onLoad,
}: {
  className?: string;
  onPoseFound: (name: string) => void;
  onLoad: () => void;
}) => {
  const [showCameraSelector, setShowCameraSelector] =
    React.useState<boolean>(false);
  const [videoSources, setVideoSources] = React.useState<
    Array<MediaDeviceInfo>
  >([]);
  const [currentCameraId, setCurrentCameraId] = React.useState<string>(null);
  const [videoScale, setVideoScale] = React.useState<number>(1);
  const [videoSourceSize, setVideoSourceSize] = React.useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [handPoseModel, setHandPoseModel] = React.useState<HandPose>(null);
  const [gestureEstimator, setGestureEstimator] = React.useState<any>(null);
  const [previewPoints, setPreviewPoints] =
    React.useState<Record<string, Array<[number, number, number]>>>(null);

  React.useEffect(() => {
    handPoseModel && gestureEstimator && onLoad();
  }, [handPoseModel, gestureEstimator]);

  const loadEstimator = async (): Promise<void> => {
    const knownGestures = [
      BackGesture,
      LeftGesture,
      RightGesture,
      StartGesture,
      StopGesture,
    ];
    const GE = new fp.GestureEstimator(knownGestures);
    const model = await handpose.load();
    console.log('Handpose model loaded');
    setGestureEstimator(GE);
    setHandPoseModel(model);
  };

  React.useEffect(() => {
    loadEstimator();
  }, []);

  const predictionsCallback = (predictions) => {
    if (predictions.length) {
      predictions.map((prediction) => {
        setPreviewPoints(prediction.annotations);
        const est = gestureEstimator.estimate(prediction.landmarks, 7.5);

        if (est.gestures.length > 0) {
          const result = est.gestures.reduce((p, c) =>
            p.confidence > c.confidence ? p : c
          );

          onPoseFound(result.name);
        }
      });
    } else {
      onPoseFound('stop');
      setPreviewPoints({});
    }
  };

  return (
    <div className={cn(styles.root, className)}>
      {videoSources.length !== 0 && (
        <React.Fragment>
          <button
            title="Select Camera Source"
            className={styles.cameraSelectorButton}
            onClick={() => setShowCameraSelector(true)}
          >
            <Icon icon="mdi/webcam" />
          </button>
          {showCameraSelector && (
            <PortalBox
              close={() => setShowCameraSelector(false)}
              title="Select Camera Source"
              size="small"
            >
              {videoSources.map((source) => (
                <button
                  className={cn(styles.cameraSelectorSourceButton, {
                    [styles.cameraSelectorSourceButtonActive]:
                      source.deviceId === currentCameraId,
                  })}
                  onClick={() => {
                    setCurrentCameraId(source.deviceId);
                    setShowCameraSelector(false);
                  }}
                >
                  {source.label}
                </button>
              ))}
            </PortalBox>
          )}
        </React.Fragment>
      )}
      {handPoseModel && gestureEstimator ? (
        <div className={styles.window}>
          <div
            className={styles.artboard}
            style={{
              color: 'black',
              transform: `translateX(-50%) translateY(-50%) scale(${videoScale})`,
            }}
          >
            <HandposeVideo
              className={styles.video}
              setVideoSources={setVideoSources}
              setVideoSourceSize={setVideoSourceSize}
              setVideoScale={setVideoScale}
              videoSourceSize={videoSourceSize}
              cameraId={currentCameraId}
              setCurrentCameraId={setCurrentCameraId}
              handPoseModel={handPoseModel}
              predictionsCallback={predictionsCallback}
            />
            <HandposeCanvas
              className={styles.canvas}
              previewPoints={previewPoints}
              size={videoSourceSize}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HandposeComponent;
