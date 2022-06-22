import React from 'react';
import cn from '@common/utils/classnames';
import { AnnotatedPrediction, HandPose } from '@tensorflow-models/handpose';
import useWindowSize from '../../../useWindowSize';
import styles from './HandposeVideo.css';

let stream = null;

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

const HandposeVideo = ({
  className = '',
  setVideoSources,
  setVideoSourceSize,
  videoSourceSize,
  setVideoScale,
  cameraId = null,
  setCurrentCameraId,
  handPoseModel,
  predictionsCallback,
}: {
  className?: string;
  setVideoSources: (devices: Array<MediaDeviceInfo>) => void;
  setVideoSourceSize: (size: { width: number; height: number }) => void;
  videoSourceSize: { width: number; height: number };
  cameraId?: string;
  setCurrentCameraId: (id: string) => void;
  setVideoScale: (scale: number) => void;
  handPoseModel: HandPose;
  predictionsCallback: (predictions: AnnotatedPrediction[]) => void;
}) => {
  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const [init, setInit] = React.useState<boolean>(false);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  React.useEffect(() => {
    const windowAspectRatio = windowWidth / windowHeight;
    const videoAspectRatio = videoSourceSize.width / videoSourceSize.height;
    const scale =
      windowAspectRatio >= videoAspectRatio
        ? windowWidth / videoSourceSize.width
        : windowHeight / videoSourceSize.height;
    setVideoScale(isNaN(scale) || !isFinite(scale) ? 1 : scale);
  }, [
    windowWidth,
    windowHeight,
    videoSourceSize.width,
    videoSourceSize.height,
  ]);

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
    if (init || !webcamRef.current) {
      return;
    }

    setInit(true);
    startUp();
  }, [webcamRef]);

  React.useEffect(() => {
    init && startUp();
  }, [cameraId]);

  const startUp = () => {
    initCamera().then((video) => {
      video.play();
      video.addEventListener('loadeddata', (event) => {
        console.log('Camera is ready');
        doPredictions();
      });
    });
  };

  const initCamera = async (): Promise<HTMLVideoElement> =>
    new Promise(async (resolve, reject) => {
      stream && stream.getTracks().forEach((track) => track.stop());

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: 'user',
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
          deviceId: cameraId,
        },
      };

      const video = webcamRef.current;

      // get video stream
      navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
        setVideoSourceSize({
          width: mediaStream.getVideoTracks()[0].getSettings().width,
          height: mediaStream.getVideoTracks()[0].getSettings().height,
        });
        setCurrentCameraId(
          mediaStream
            .getTracks()
            .map((track) => track.getSettings().deviceId)[0]
        );
        stream = mediaStream;
        video.srcObject = mediaStream;
        resolve(video);
      });
    });

  const doPredictions = async () => {
    const video = webcamRef.current;
    // main estimation loop
    const predictions = await handPoseModel.estimateHands(video, false);
    predictionsCallback(predictions);
    requestAnimationFrame(doPredictions);
  };

  return (
    <video
      ref={webcamRef}
      className={cn(className, styles.root)}
      playsInline
      width={videoSourceSize.width}
      height={videoSourceSize.height}
    />
  );
};

export default HandposeVideo;
