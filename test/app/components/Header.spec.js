import { expect } from 'chai';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import Header from '../../../app/components/Header';

function setup() {
  const props = {};

  const renderer = new ShallowRenderer();
  renderer.render(<Header {...props} />);
  const output = renderer.getRenderOutput();

  return { props, output, renderer };
}

describe('icaruspoc Header component', () => {
  it('should render correctly', () => {
    const { output } = setup();
    expect(output.type).to.equal('header');
  });
});
