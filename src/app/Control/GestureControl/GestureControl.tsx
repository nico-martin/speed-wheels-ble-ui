// @ts-ignore
import * as fp from 'fingerpose';
import React from 'react';
import { Icon, Loader } from '@theme';
import useElementSize from '@common/hooks/useElementSize';
import cn from '@common/utils/classnames';
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import styles from './GestureControl.css';
import BackGesture from './Gestures/Back';
import LeftGesture from './Gestures/Left';
import RightGesture from './Gestures/Right';
import StartGesture from './Gestures/Start';
import StopGesture from './Gestures/Stop';

let stream = null;

const GestureControl = ({
  onCmdLeft,
  onCmdRight,
  onCmdStop,
  className = '',
}: {
  onCmdLeft: (speed: number) => void;
  onCmdRight: (speed: number) => void;
  onCmdStop: () => void;
  className?: string;
}) => {
  const artboardRef = React.useRef<HTMLDivElement>(null);
  const artboardSize = useElementSize(artboardRef);
  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [init, setInit] = React.useState<boolean>(false);
  const [handPose, setHandPose] = React.useState<string>('stop');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [videoSources, setVideoSources] = React.useState<
    Array<MediaDeviceInfo>
  >([]);

  const forward = () => {
    onCmdRight(70);
    onCmdLeft(70);
  };

  const backward = () => {
    onCmdRight(-50);
    onCmdLeft(-50);
  };

  const left = () => {
    onCmdLeft(1);
    onCmdRight(60);
  };

  const right = () => {
    onCmdLeft(60);
    onCmdRight(1);
  };

  const stop = () => {
    onCmdStop();
  };

  React.useEffect(() => {
    if (handPose === 'stop') {
      stop();
    } else if (handPose === 'left') {
      left();
    } else if (handPose === 'right') {
      right();
    } else if (handPose === 'start') {
      forward();
    } else if (handPose === 'back') {
      backward();
    }
  }, [handPose]);

  React.useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos) =>
        setVideoSources(
          deviceInfos.filter((device) => device.kind === 'videoinput')
        )
      );

    return () => {
      stream && stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  React.useEffect(() => {
    if (init || !webcamRef.current || artboardSize[0] === 0) {
      return;
    }

    setInit(true);
    startUp();
  }, [webcamRef, artboardSize]);

  const startUp = (cameraId = '') => {
    initCamera(cameraId, artboardSize[0], artboardSize[1], 30).then((video) => {
      video.play();
      video.addEventListener('loadeddata', (event) => {
        console.log('Camera is ready');
        main();
      });
    });
  };

  const initCamera = async (
    cameraId,
    width,
    height,
    fps
  ): Promise<HTMLVideoElement> =>
    new Promise(async (resolve, reject) => {
      stream && stream.getTracks().forEach((track) => track.stop());

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: 'user',
          width: width,
          height: height,
          frameRate: { max: fps },
          deviceId: cameraId,
        },
      };

      const video = webcamRef.current;

      // get video stream
      navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
        stream = mediaStream;
        video.srcObject = mediaStream;
        resolve(video);
      });
    });

  async function main() {
    const video = webcamRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const knownGestures = [
      BackGesture,
      LeftGesture,
      RightGesture,
      StartGesture,
      StopGesture,
    ];
    const GE = new fp.GestureEstimator(knownGestures);

    // load handpose model
    const model = await handpose.load();
    console.log('Handpose model loaded');
    setLoading(false);

    // main estimation loop
    const estimateHands = async () => {
      ctx.clearRect(0, 0, artboardSize[0], artboardSize[1]);

      const predictions = await model.estimateHands(video, true);
      predictions.map((prediction) => {
        Object.entries(prediction.annotations).map(([finger, points]) =>
          points.map((point) => drawPoint(ctx, point[0], point[1], 3, 'blue'))
        );

        const est = GE.estimate(prediction.landmarks, 7.5);

        if (est.gestures.length > 0) {
          const result = est.gestures.reduce((p, c) =>
            p.confidence > c.confidence ? p : c
          );

          setHandPose(result.name);
        }
      });

      setTimeout(() => {
        estimateHands();
      }, 1000 / 30);
    };

    estimateHands();
    console.log('Starting predictions');
  }

  const drawPoint = (ctx, x, y, r, color) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  };

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.artboard} ref={artboardRef}>
        <span
          className={cn(styles.indicator, styles[`indicator-${handPose}`], {
            [styles.indicatorLoading]: loading,
          })}
        >
          <Loader className={styles.loader} />
          <Icon
            icon={handPose === 'stop' ? `mdi/stop` : `mdi/arrow`}
            className={styles.icon}
          />
        </span>
        <video
          ref={webcamRef}
          className={styles.video}
          playsInline
          width={artboardSize[0]}
          height={artboardSize[1]}
        />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={artboardSize[0]}
          height={artboardSize[1]}
        />
        {videoSources.length !== 0 && (
          <select
            className={styles.videoSelect}
            onChange={(e) => startUp((e.target as HTMLSelectElement).value)}
          >
            {videoSources.map((source) => (
              <option value={source.deviceId}>{source.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default GestureControl;
