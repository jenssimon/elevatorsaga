export default class Elevator {
  constructor() {
    this.destinationQueue = []
    /** @type {Record<string, Function>} */
    this.eventHandlers = {}
    this.goingUp = true
    this.goingDown = true
  }

  /**
   * @param {string} event
   * @param {Function} handler
   */
  on(event, handler) {
    this.eventHandlers[event] = handler
  }

  goToFloor() {}

  stop() {}

  currentFloor() {
    return 0
  }

  /**
   * @param {boolean} [state]
   */
  goingUpIndicator(state) {
    if (state !== undefined) {
      this.goingUp = state
    }
    return this.goingUp
  }

  /**
   * @param {boolean} [state]
   */
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

  destinationDirection() {
    return 'stopped'
  }

  checkDestinationQueue() {}

  getPressedFloors() {
    return []
  }
}
