// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './LoadingGif.scss';

function getBgUrl(el) {
  let bg = '';
  // $FlowDisable flow doesn't work that well for HTML access
  if (el.currentStyle != null) { // IE
    // $FlowDisable flow doesn't work that well for HTML access
    bg = el.currentStyle.backgroundImage;
  } else if (document.defaultView && document.defaultView.getComputedStyle) { // Firefox
    bg = document.defaultView.getComputedStyle(el, '').backgroundImage;
  } else { // try and get inline style
    bg = el.style.backgroundImage;
  }
  return bg.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
}

type State = {|
  isLoaded: boolean,
  image: HTMLImageElement,
|};

@observer
export default class LoadingGif extends Component<{||}, State> {
  state = {
    isLoaded: false,
    image: document.createElement('img'),
  };

  componentDidMount() {
    const loadingImg = getBgUrl(document.getElementsByClassName(styles.component)[0]);
    this.state.image.src = loadingImg;
    this.state.image.onload = () => {
      this.setState({ isLoaded: true, });
    };
  }

  componentWillUnmount() {
    this.state.image.onload = null;
  }

  render() {
    return (
      <div className={styles.component}>
        {!this.state.isLoaded && <div className={styles.spinner} />}
      </div>
    );
  }
}
