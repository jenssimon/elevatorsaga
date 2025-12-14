class Elevator {
  constructor() {
    this.destinationQueue = []
    this.eventHandlers = {}
    this.goingUp = true
    this.goingDown = true
  }

  on(event, handler) {
    this.eventHandlers[event] = handler
  }

  goToFloor() {}

  stop() {}

  currentFloor() {
    return 0
  }

  goingUpIndicator(state) {
    if (state !== undefined) {
      this.goingUp = state
    }
    return this.goingUp
  }

  goingDownIndicator(state) {
    if (state !== undefined) {
      this.goingDown = state
    }
    return this.goingDown
  }

  maxPassengerCount() {
    return 0
  }

  loadFactor() {
    return 0
  }

  /** @returns {Direction | 'stopped'} */
  destinationDirection() {
    return 'stopped'
  }

  checkDestinationQueue() {}

  getPressedFloors() {
    return []
  }
}


export default Elevator
