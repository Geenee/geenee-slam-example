import WebRTCHelper from './WebRTCHelper';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './VideoStream.scss';

/**
 * @type {Object}
 */
const propTypes = {
  onSuccess: PropTypes.func.isRequired,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(null),
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(null),
  ]),
};

/**
 * @class VideoStream
 * @extends {Component}
 */
export default class VideoStream extends Component {
  /**
   * @type {Object}
   * @static
   */
  static propTypes = propTypes

  /**
   * @constructor
   * @param  {Object} props
   * @return {VideoStream}
   */
  constructor(props) {
    super(props);
    this.state = {
      containerEl: null,
      error: null,
    };
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    const rtcHelper = new WebRTCHelper();
    const isIOS = rtcHelper.isIOS();
    const { width, height } = this.props;

    let w = 640, h = 480;
    const orientation = this.getOrientation();
    if (orientation === 'landscape') {
      w = width;
      h = height;
    } else if (orientation === 'portrait') {
      w = height;
      h = width;
    }

    const constraints = {
      video: {
        width: isIOS ? void 0 : { min: w, max: w, ideal: w },
        height: isIOS ? void 0 : { min: h, max: h, ideal: h },
        fps: isIOS ? 60 : void 0,
        facingMode: 'environment',
      },
    };

    rtcHelper.getVideoStream(null, constraints)
      .then(this.onSuccess)
      .catch(this.onFail);
  }

  getOrientation() {
    const orientation = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
    if (orientation === 'landscape-primary') {
      return 'landscape';
    } else if (orientation === "landscape-secondary") {
      return 'landscape';
    } else if (orientation === "portrait-secondary" || orientation === "portrait-primary") {
      return 'portrait';
    } else if (orientation === undefined) {
      console.log("The orientation API isn't supported in this browser :(");
    }
    return null;
  }

  /**
   * @method onContainerRef
   * @param  {HTMLElement} containerEl
   */
  onContainerRef = (containerEl) => {
    this.setState({ containerEl });
  }

  /**
   * @method onSuccess
   * @param  {HTMLVideoElement} video
   */
  onSuccess = (video) => {
    const { onSuccess } = this.props;
    const { containerEl } = this.state;

    // debugger;
    containerEl.appendChild(video);

    if (typeof onSuccess === 'function') {
      onSuccess(video);
    }
  }

  /**
   * @method onFail
   * @param  {Error} e
   */
  onFail = (e) => {
    this.setState({
      error: new Error(e.stack || `Could not initialize video stream.`),
    });
  }

  /**
   * @method render
   * @return {Object}
   */
  render() {
    const { error } = this.state;

    if (error !== null) {
      return (<span>${error.message}</span>);
    }

    return (
      <div className={styles.Container} ref={this.onContainerRef} />
    );
  }
}
