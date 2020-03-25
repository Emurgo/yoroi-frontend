// @flow
import React, { Component } from 'react';
import type { Node, ElementRef } from 'react';
import { observer } from 'mobx-react';
import styles from './NavDropdownContent.scss';
import NavBarAddButton from './NavBarAddButton';

type Props = {|
  +contentComponents?: ?Node,
  +onAddWallet: void => void,
  +onClickOutside: void => void,
|};

type State = {|
  maxHeight: number
|};

@observer
export default class NavDropdownContent extends Component<Props, State> {
  static defaultProps = {
    contentComponents: undefined,
  };
  contentRef: ?ElementRef<*>;

  state = {
    maxHeight: Number.MAX_SAFE_INTEGER
  };

  constructor(props: Props) {
    super(props);
    this.contentRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousedown', this.handleClickOutside);
    this.resize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside: MouseEvent => void = (event) => {
    if (!this.contentRef || !this.contentRef.current) {
      return;
    }
    if (!this.contentRef.current.contains(event.target)) {
      this.props.onClickOutside();
    }
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
    const height = current.scrollHeight;

    const maxHeight = height + top < window.innerHeight
      ? height
      : window.innerHeight - top - 20; // 20 px of padding

    this.setState({ maxHeight });
  }

  render() {
    const {
      contentComponents,
    } = this.props;

    return (
      <div
        className={styles.content}
        ref={this.contentRef}
        style={{ maxHeight: this.state.maxHeight || Number.MAX_SAFE_INTEGER }}
      >
        {contentComponents}
        <div className={styles.buttonWrapper}>
          <NavBarAddButton onClick={this.props.onAddWallet} />
        </div>
      </div>
    );
  }
}
