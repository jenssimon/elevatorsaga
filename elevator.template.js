(() => {
  class ElevatorSaga {
    /**
     * @param {readonly Elevator[]} elevators
     * @param {readonly Floor[]} _floors
     */
    constructor(elevators, _floors) {
      const [elevator] = elevators // Let's use the first elevator

      // Whenever the elevator is idle (has no more queued destinations) ...
      elevator.on('idle', () => {
        // let's go to all the floors (or did we forget one?)
        elevator.goToFloor(0)
        elevator.goToFloor(1)
      })
    }


    /**
     * @param {Number} _dt
     * @param {readonly Elevator[]} _elevators
     * @param {readonly Floor[]} _floors
     */
    update(_dt, _elevators, _floors) {
      // Nothing yet!
    }
  }


  let elevatorSaga

  /** @type {ProgramInitCallback} */
  const init = (elevators, floors) => {
    elevatorSaga = new ElevatorSaga(elevators, floors)
  }


  /** @type {ProgramUpdateCallback} */
  const update = (dt, elevators, floors) => {
    if (!elevatorSaga) return
    elevatorSaga.update(dt, elevators, floors)
  }

  const elevator = { init, update }
  /* v8 ignore else -- @preserve */
  if (globalThis.process?.env.NODE_ENV === 'test') {
    globalThis.elevator = elevator
  }
  return elevator
})()
