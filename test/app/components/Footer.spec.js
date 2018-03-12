import { expect } from 'chai';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import Footer from '../../../app/components/Footer';

function setup(propOverrides) {
  const props = {
    ...propOverrides
  };

  const renderer = new ShallowRenderer();
  renderer.render(<Footer {...props} />);
  const output = renderer.getRenderOutput();

  return { props, output };
}

describe('todoapp Footer component', () => {
  it('should render correctly', () => {
    const { output } = setup();
    expect(output.type).to.equal('footer');
  });
});
