import { expect } from 'chai';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import MainSection from '../../../app/components/MainSection';

function setup(/*propOverrides*/) {
  const props = {};

  const renderer = TestUtils.createRenderer();
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
