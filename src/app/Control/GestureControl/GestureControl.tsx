// @ts-ignore
import * as fp from 'fingerpose';
import React from 'react';
import Webcam from 'react-webcam';
import { Icon } from '@theme';
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

  const forward = () => {
    console.log('forward');
    onCmdRight(70);
    onCmdLeft(70);
  };

  const backward = () => {
    console.log('backward');
    onCmdRight(-50);
    onCmdLeft(-50);
  };

  const left = () => {
    console.log('left');
    onCmdLeft(0);
    onCmdRight(50);
  };

  const right = () => {
    console.log('right');
    onCmdLeft(50);
    onCmdRight(0);
  };

  const stop = () => {
    console.log('stop');
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
    if (init || !webcamRef.current || artboardSize[0] === 0) {
      return;
    }

    setInit(true);
    initCamera(artboardSize[0], artboardSize[1], 30).then((video) => {
      video.play();
      video.addEventListener('loadeddata', (event) => {
        console.log('Camera is ready');
        main();
      });
    });
  }, [webcamRef, artboardSize]);

  const initCamera = async (width, height, fps): Promise<HTMLVideoElement> =>
    new Promise(async (resolve, reject) => {
      const constraints = {
        audio: false,
        video: {
          facingMode: 'user',
          //width: width,
          height: height,
          aspectRatio: width / height,
          frameRate: { max: fps },
        },
      };

      const video = webcamRef.current;

      // get video stream
      video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
      video.onloadedmetadata = () => {
        resolve(video);
      };
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
        <span className={cn(styles.indicator, styles[`indicator-${handPose}`])}>
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
      </div>
    </div>
  );
};

export default GestureControl;
