/* global FPSMeter */

import 'fpsmeter';
import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';

import VideoStream from './stream';

import '@geenee/sdk-slam';
import Scene from '../lib/scene';

const THREE_CAMERA_FOV = 60;
const MODEL_SCALE = 0.3;

const App = () => {

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [showImuPermisssion, setShowImuPermission] = useState(false);
  const [showInitialization, setShowInitialization] = useState(true);

  const appRef = useRef<HTMLDivElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);

  const fpsMeterRef = useRef<FPSMeter | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const slamReadyRef = useRef(false);
  const frameIDRef = useRef(0);
  const videoSizeRef = useRef({ videoWidth: 0, videoHeight: 0 });
  const sizeRef = useRef({ width: 0, height: 0 });

  const { slam, loadWasm } = Geenee;

  //--------------------------------------------
  //-- Start DOM Events

  const onFrame = () => {
    frameIDRef.current = requestAnimationFrame(onFrame);
    if (slamReadyRef.current) {
      slam.process(sizeRef.current.width, sizeRef.current.height);
    }
  }

  const onPermissionRequestClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setShowImuPermission(false);
    slam.startImu();
  }

  const onStartClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!slamReadyRef.current) {
      return;
    }

    const { clientX, clientY } = e;

    slam.start(clientX, clientY, sizeRef.current.width, sizeRef.current.height).then(() => {
      console.log('Object located!!!');
      sceneRef.current?.show();
    }, (error: Error) => {
      sceneRef.current?.hide();
      console.log(error);
    });
  }

  const onResize = () => {
    const { innerWidth, innerHeight } = window;
    setSize({ width: innerWidth, height: innerHeight });
    sizeRef.current = { width: innerWidth, height: innerHeight };

    if (sceneRef.current) {
      sceneRef.current.resize(innerWidth, innerHeight);
    }
  }

  const onVideoStream = (video: HTMLVideoElement) => {
    const { videoWidth, videoHeight } = video;
    videoSizeRef.current = { videoWidth, videoHeight };

    loadWasm().then(() => {
      slam.on('geenee-slam-ready', onSlamReady);
      slam.on('geenee-slam-permission-request', onSlamPermissionRequest);
      slam.on('geenee-slam-update', onSlamUpdate);

      slam.initialize(video, THREE_CAMERA_FOV)
    });

    if (threeCanvasRef.current) {
      sceneRef.current = new Scene(
        threeCanvasRef.current,
        THREE_CAMERA_FOV,
        sizeRef.current.width,
        sizeRef.current.height,
        onSceneAddedToStage
      );
    }

    resize();
  }

  const onSceneAddedToStage = () => {
    addCubePrimitive();
  }

  //-- End DOM Events
  //--------------------------------------------


  //--------------------------------------------
  //-- Start Slam Events

  const onSlamReady = () => {
    slamReadyRef.current = true;
    setShowInitialization(false);
  }

  const onSlamPermissionRequest = () => {
    setShowImuPermission(true);
  }

  const onSlamUpdate = (imageData: ImageData, rototranslation: []) => {
    fpsMeterRef.current?.tick();

    if (!slamReadyRef.current) {
      return;
    }

    sceneRef.current?.render(rototranslation);
    renderVideoFrame(imageData);
  }

  //-- End Slam Events
  //--------------------------------------------


  //--------------------------------------------
  //-- Start Methods

  const addCubePrimitive = () => {
    const modelScale = MODEL_SCALE;
    const { width, height } = sizeRef.current;
    const scale = 1 / Math.max(width, height) * 2;
    const w = width * scale * 0.2;
    const h = height * scale;
    const depth = Math.min(w, h);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), new THREE.MeshNormalMaterial());
    cube.scale.multiplyScalar(modelScale);
    cube.position.setY(depth)
    cube.frustumCulled = false;

    sceneRef.current?.add(cube);
  }

  const resize = () => {
    const { innerWidth, innerHeight } = window;
    setSize({ width: innerWidth, height: innerHeight });
    sizeRef.current = { width: innerWidth, height: innerHeight };

    if (sceneRef.current) {
      sceneRef.current.resize(innerWidth, innerHeight);
    }
  }

  const renderVideoFrame = (imageData: ImageData) => {
    const canvas = videoCanvasRef.current;

    if (!canvas)
      return;

    const { width, height } = sizeRef.current;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (context)
      context.putImageData(imageData, 0, 0);
  }

  //-- End Methods
  //--------------------------------------------


  //--------------------------------------------
  //-- Start Initialization

  useEffect(() => {
    fpsMeterRef.current = new FPSMeter(appRef.current as HTMLElement, {
      position: 'absolute',
      left: 'auto',
      right: '5px'
    });

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    onFrame();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      cancelAnimationFrame(frameIDRef.current);
    }
  }, [])

  //-- End Initialization
  //--------------------------------------------

  return (
    <div className='App' onClick={onStartClick} ref={appRef}>
      <VideoStream
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size.width,
          height: size.height,
          opacity: 0
        }}
        onSuccess={onVideoStream} />

      <canvas
        className='canvas'
        style={{
          width: size.width,
          height: size.height
        }}
        width={size.width}
        height={size.height}
        ref={videoCanvasRef} />

      <canvas
        className='canvas'
        style={{
          width: size.width,
          height: size.height
        }}
        width={size.width}
        height={size.height}
        ref={threeCanvasRef} />

      <div
        className='canvas'
        style={{
          display: showInitialization ? 'block' : 'none'
        }}>
        Initialization...
      </div>

      <div className='canvas' style={{ display: showImuPermisssion ? 'block' : 'none', width: '100vw', height: '100vh' }} onClick={onPermissionRequestClick}>
        <div style={{
          background: '#FFF',
          borderRadius: '10px',
          position: 'absolute',
          top: '30vh',
          left: '15vw',
          width: '70vw',
          height: '20vh',
          textAlign: 'center',
          lineHeight: '20vh',
          opacity: 0.75,
        }}>
          <span style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            lineHeight: 'normal',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '25px',
          }}>AR requires aceess to device motion sensor. Tap to continue.</span>
        </div>
      </div>
    </div>
  );
}

export default App;
