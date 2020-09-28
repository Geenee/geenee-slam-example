import * as THREE from 'three';

/**
 * @class DebugTracker
 * @description  initialize AR Three.js instances (camera, object3D, scene...)
 */
export default class ThreeTracker {
  /**
   * @constructor
   * @param  {Object} options
   */
  constructor(canvas, options) {
    const { fov, targetWidth, targetHeight, modelScale } = { modelScale: 1.0, ...options };
    this.canvas = canvas;

    this.pitch = 0;
    this.yaw = 0;
    this.roll = 0;

    // init the renderer:
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas,
      alpha: true,
    });

    this.scene = new THREE.Scene();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // init the camera:
    this.defaultCamera = new THREE.PerspectiveCamera(fov, this.width / this.height, 0.01, 1000);
    this.scene.add(this.defaultCamera);

    // Store target dimensions and intended model scale:
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.modelScale = modelScale;

    // build the container, ie an object group which will follow the target image
    this.container = new THREE.Object3D();
    this.container.frustumCulled = false;
    this.container.matrixAutoUpdate = false;
    this.scene.add(this.container);

    this.addDebugCube();
    /* const padding = 4;
    for (let i = -10; i < 10; i++) {
      for (let j = -10; j < 10; j++) {
        this.addDebugObject(i * padding, j * padding);
      }
    } */

    this.objectLocated = false;
    this.moveMatrix = new Float32Array(16);

    this.hide();
  }

  /**
   *
   * @param path
   * @return {*}
   */
  initialize(path) {
    return Promise.resolve();
  }

  /**
   * @method addDebugCube
   */
  addDebugCube() {
    const { targetWidth, targetHeight, modelScale } = this;
    const scale = 1 / Math.max(targetWidth, targetHeight);
    const width = targetWidth * scale;
    const height = targetHeight * scale;
    const depth = Math.min(width, height);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshNormalMaterial());
    cube.scale.multiplyScalar(modelScale);
    // cube.position.setZ(modelScale * depth / 2.0);
    cube.position.setY(modelScale * depth / 2.0)
    cube.frustumCulled = false;
    this.container.add(cube);
  }

  /**
   * @method addDebugPlane
   */
  addDebugObject(posX = 0, posY = 0) {
    const { targetWidth, targetHeight, modelScale } = this;
    const scale = 1 / Math.max(targetWidth, targetHeight);
    const width = targetWidth * scale;
    const height = targetHeight * scale;
    const depth = Math.min(width, height);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshNormalMaterial());
    cube.scale.multiplyScalar(modelScale);

    cube.position.setX(modelScale * depth * posX);
    cube.position.setZ(modelScale * depth * posY);

    cube.position.setY(modelScale * depth / 2.0);
    cube.frustumCulled = false;
    this.container.add(cube);
  }

  /**
   *
   */
  show() {
    this.container.visible = true;
  }

  /**
   *
   */
  hide() {
    this.container.visible = false;
  }

  /**
   * @method updateDimensions
   */
  resize() {
    const { innerHeight, innerWidth } = window;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // update canvas size to window size. no compute additionnal pixels:
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.renderer.setSize(innerWidth, innerHeight);

    // override THREE.js auto CSS settings:
    this.canvas.style.width = 'auto';
    this.canvas.style.height = 'auto';
    this.canvas.style.maxWidth = '100vw';

    this.defaultCamera.aspect = innerWidth / innerHeight;
    this.defaultCamera.updateProjectionMatrix();
  }

  /**
   *
   * @param {number[]} translation_matrix
   */
  render(translation_matrix) {
    const T = translation_matrix;

    this.container.matrix.set(
      T[0], T[1], T[2], T[3],
      T[4], T[5], T[6], T[7],
      T[8], T[9], T[10], T[11],
      T[12], T[13], T[14], T[15],
    );

    this.renderer.render(this.scene, this.defaultCamera);
  }
}
