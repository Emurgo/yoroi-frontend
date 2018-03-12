import { expect } from 'chai';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import MainSection from '../../../app/components/MainSection';

function setup(/*propOverrides*/) {
  const props = {};

  const renderer = new ShallowRenderer();
  renderer.render(<MainSection {...props} />);
  const output = renderer.getRenderOutput();

  return { props, output, renderer };
}

describe('todoapp MainSection component', () => {
  it('should render correctly', () => {
    const { output } = setup();
    expect(output.type).to.equal('section');
  });
});
