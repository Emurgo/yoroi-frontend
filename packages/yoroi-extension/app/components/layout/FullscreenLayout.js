// @flow
import React, { Component } from 'react';
import type { Node, ElementRef } from 'react';
import { observer } from 'mobx-react';

type Props = {|
  +children?: Node,
  +bottomPadding: number,
|};

type State = {|
  height: number
|};

@observer
export default class FullscreenLayout extends Component<Props, State> {

  static defaultProps: {|children: void|} = {
    children: undefined
  };

  contentRef: ?ElementRef<*>;

  state: State = {
    height: Number.MAX_SAFE_INTEGER
  };

  constructor(props: Props) {
    super(props);
    this.contentRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize: void => void = () => {
    const { documentElement } = document;
    if (
      !documentElement || !documentElement.style ||
      !this.contentRef
    ) {
      return;
    }
    const current = this.contentRef.current;
    if (current == null) return;

    const rect = current.getBoundingClientRect();
    const { top } = rect;

    const height = Math.max(
      0,
      window.innerHeight - top - this.props.bottomPadding
    );

    this.setState({ height });
  }

  render(): Node {
    const { children } = this.props;
    return (
      <div
        ref={this.contentRef}
        style={{ height: this.state.height || Number.MAX_SAFE_INTEGER }}
      >
        {children}
      </div>
    );
  }
}
