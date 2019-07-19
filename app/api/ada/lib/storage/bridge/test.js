// @flow

type StateConstraint<CurrentState, Input, Output> = $Call<
  (Input => (...any) => StateMachine<Output>) & () => {...},
  CurrentState
>

type StateOne = { one: 1 };
const stateOne = { one: 1 };
type StateTwo = { two: 2 };
const stateTwo = { two: 2 };
type StateThree = { three: 3 };
const stateThree = { three: 3 };
type StateFour = { four: 4 };
const stateFour = { four: 4 };

class StateMachine<CurrentState: {}>  {
  state: CurrentState;

  constructor(s: CurrentState) { this.state = s; }

  toStateTwo: StateConstraint<CurrentState, StateOne, StateTwo> = () => {
    return new StateMachine(stateTwo);
  }

  toStateFour: StateConstraint<CurrentState, StateOne|StateTwo, StateFour> = () => {
    return new StateMachine(stateFour);
  }

  toStateThree: StateConstraint<CurrentState, StateTwo, StateThree> = () => {
    return new StateMachine(stateThree);
  }

  static start(): StateMachine<StateOne> {
    return new StateMachine(stateOne);
  }
}

//const machine = new StateMachine(2);

let state1 = StateMachine.start();
let state2 = state1.toStateTwo().toStateThree();

// state is now '3' so template requirement isn't satisfied anymore
let state3 = state2.toStateThree();
