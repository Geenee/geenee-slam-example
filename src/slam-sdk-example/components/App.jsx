import 'fpsmeter';
import React, { Component } from 'react';

import '@geenee/sdk-slam';

import { VideoStream } from './stream';
import ThreeTracker from '../three/ThreeTracker';

const THREE_CAMERA_FOV = 60;
const THREE_SCALE = 0.3;

/**
 * @class DemoApp
 * @extends {Component}
 */
export default class App extends Component {

  /**
   * @constructor
   * @param  {Object} props
   * @return {DemoApp}
   */
  constructor(props) {
    super(props);

    this.debug = true;

    this.state = {
      videoCanvas: null,
      threeCanvas: null,
      isSlamModuleLoaded: false,
      isSlamReady: false,
      showImuPermisssion: false,
    };

    this.meter = new FPSMeter({
      // TODO: Constants
      left: 'auto',
      right: 5,
    });

    this.video = null;

    this.curTime = 0;

    this.last_timestamp = 0;

    Geenee.slam.load().then(() => {
      Geenee.slam.on('geenee-slam-ready', this.onSlamReady);
      Geenee.slam.on('geenee-slam-permission-request', this.onSlamPermissionRequest);
      Geenee.slam.on('geenee-slam-update', this.onSlamUpdate);
      this.setState({ isSlamModuleLoaded: true });
      if (this.video) {
        this.initSlamModule();
      }
    });
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);
  }

  /**
   * @method render
   * @return {Object}
   */
  render() {
    const { innerWidth, innerHeight } = window;
    const width = innerWidth;
    const height = innerHeight;

    return (
      <div className='App' onClick={this.onClick}>
        <VideoStream width={width} height={height} onSuccess={this.onVideoStream} />
        <canvas id='video_stream_canvas' style={{ position: 'absolute', top: 0, left: 0 }} width={width} height={height} ref={this.onVideoCanvasRef} />
        <canvas id='threejs' className='canvas' ref={this.onThreeCanvasRef} width={width} height={height} />

        <div style={{ position: 'absolute', bottom: '5vh', right: '5vw' }}>
          <button onClick={this.onStopClick} style={{ width: '15vw', height: '5vh' }}>Stop</button>
        </div>

        <div className='canvas' style={{ display: this.state.isSlamReady ? 'none' : 'block' }}>Initialization...</div>
        <div className='canvas' style={{ display: this.state.showImuPermisssion ? 'block' : 'none', width: '100vw', height: '100vh' }} onClick={this.onPermissionRequestClick}>
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

  onClick = (e) => {
    if (!this.state.isSlamReady) {
      return;
    }

    const { clientX, clientY } = e;

    this.start(clientX, clientY);
  }

  onStopClick = (e) => {
    e.stopPropagation();
    Geenee.slam.stop();
    this.threeTracker.hide();
  }

  onPermissionRequestClick = (e) => {
    this.setState({ showImuPermisssion: false });
    Geenee.slam.startImu();
  }

  /**
   * 
   * @param {number} u 
   * @param {number} v 
   */
  start(u, v) {
    Geenee.slam.start(u, v).then(() => {
      console.log('Object located!!!');
      this.threeTracker.show();
    }, (error) => {
      this.threeTracker.hide();
      console.log(error);
    });
  }

  /**
   * @method onResize
   */
  onResize = () => {
    const { innerWidth, innerHeight } = window;
    const { threeCanvas } = this.state;
    const { threeTracker } = this;

    // update 3D AR canvas:
    threeCanvas.width = innerWidth;
    threeCanvas.height = innerHeight;
    threeTracker.resize();
  }

  /**
   * React callback for a video element reference.
   * @method onVideo
   * @param {HTMLVideoElement|null}
   */
  onVideo = (video) => {
    if (video) {
      video.addEventListener('play', () => this.onVideoStream(video));
    }
  }

  /**
   * @method onThreeCanvasRef
   * @param  {HTMLCanvasElement} canvas
   */
  onThreeCanvasRef = (canvas) => {
    this.setState({ threeCanvas: canvas });
  }

  onVideoCanvasRef = (canvas) => {
    this.setState({ videoCanvas: canvas });
  }

  /**
   * @method onVideoStream
   * @param  {HTMLVideoElement} video
   */
  onVideoStream = (video) => {
    const { isSlamModuleLoaded, threeCanvas } = this.state;
    const { videoWidth, videoHeight } = video;

    this.video = video;

    this.threeTracker = new ThreeTracker(threeCanvas, {
      fov: THREE_CAMERA_FOV,
      targetHeight: videoHeight,
      targetWidth: videoWidth,
      modelScale: THREE_SCALE,
    });

    if (isSlamModuleLoaded) {
      this.initSlamModule();
    }

    this.onResize();
  }

  initSlamModule() {
    const { videoCanvas } = this.state;
    Geenee.slam.init(this.video, videoCanvas, THREE_CAMERA_FOV);
  }

  onSlamReady = () => {
    this.setState({ isSlamReady: true });
  }

  onSlamPermissionRequest = () => {
    this.setState({ showImuPermisssion: true });
  }

  /**
   *
   * @param {Array} rototranslation
   */
  onSlamUpdate = (rototranslation) => {
    this.meter.tick();

    if (!this.state.isSlamReady) {
      return;
    }

    const { threeTracker } = this;

    threeTracker.render(rototranslation);
  }
}
