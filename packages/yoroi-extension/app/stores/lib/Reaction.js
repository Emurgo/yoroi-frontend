// @flow
import { autorun } from 'mobx';

/** Wrapper to create startable/stoppable autoruns */
export default class Reaction {

  reaction: () => void;
  hasBeenStarted: boolean;
  dispose: () => void;

  constructor(reaction: () => void) {
    this.reaction = reaction;
    this.hasBeenStarted = false;
  }

  start(): void {
    this.dispose = autorun(() => this.reaction());
    this.hasBeenStarted = true;
  }

  stop(): void {
    if (this.hasBeenStarted) this.dispose();
  }
}
