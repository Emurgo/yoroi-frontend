// @flow

type StateConstraint<CurrentState, Input, Output> = $Call<
  (Input => () => StateMachine<Output>) & () => {...},
  CurrentState
>

class StateMachine<CurrentState>  {
  state: CurrentState;

  constructor(s: CurrentState) { this.state = s; }

  toStateTwo: StateConstraint<CurrentState, 1, 2> = () => {
    return new StateMachine(2);
  }

  toStateFour: StateConstraint<CurrentState, 1|2, 4> = () => {
    return new StateMachine(4);
  }

  toStateThree: StateConstraint<CurrentState, 2, 3> = () => {
    return new StateMachine(3);
  }

  static start(): StateMachine<1> {
    return new StateMachine(1);
  }
}

//const machine = new StateMachine(2);

let state1 = StateMachine.start();
let state2 = state1.toStateTwo().toStateThree();

// state is now '3' so template requirement isn't satisfied anymore
let state3 = state2.toStateThree();
