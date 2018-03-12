import { expect } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Header from '../../../app/components/Header';

function setup() {
  const props = {};

  const renderer = TestUtils.createRenderer();
  renderer.render(<Header {...props} />);
  const output = renderer.getRenderOutput();

  return { props, output, renderer };
}

describe('todoapp Header component', () => {
  it('should render correctly', () => {
    const { output } = setup();
    expect(output.type).to.equal('header');
  });
});
