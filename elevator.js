(() => {
  class ElevatorSaga {
    /**
     * @param {readonly Elevator[]} elevators
     * @param {readonly Floor[]} floors
     */
    constructor(elevators, floors) {
      this.elevators = elevators
      this.floors = floors

      this.floorUpRequests = []
      this.floorDownRequests = []

      /* elevator handlers */
      for (const elevator of this.elevators) {
        elevator.on('idle', () => this.elevatorIdle(elevator))
        elevator.on('floor_button_pressed', (...arguments_) => this.elevatorFloorButtonPressed(elevator, ...arguments_))
        elevator.on('passing_floor', (...arguments_) => this.elevatorPassingFloor(elevator, ...arguments_))
        elevator.on('stopped_at_floor', (...arguments_) => this.elevatorStoppedAtFloor(elevator, ...arguments_))
      }

      /* floor handlers */
      for (const floor of this.floors) {
        const floorNumber = floor.floorNum()
        floor.on('up_button_pressed', () => {
          if (!this.floorUpRequests.includes(floorNumber)) this.floorUpRequests.push(floorNumber)
        })
        floor.on('down_button_pressed', () => {
          if (!this.floorDownRequests.includes(floorNumber)) this.floorDownRequests.push(floorNumber)
        })
      }
    }


    /**
     * @param {Number} _dt
     * @param {readonly Elevator[]} _elevators
     * @param {readonly Floor[]} _floors
     */
    update(_dt, _elevators, _floors) {
      // Nothing yet!
    }


    /**
     * @param {Elevator} elevator
     */
    elevatorIdle(elevator) {
      const currentFloor = elevator.currentFloor()
      const [nearestRequestedFloor] = [
        ...this.floorUpRequests,
        ...this.floorDownRequests,
      ].toSorted((a, b) => {
        const distanceA = Math.abs(a - currentFloor)
        const distanceB = Math.abs(b - currentFloor)
        // prefer higher floors if distances are equal
        return distanceA - distanceB || b - a
      })
      if (nearestRequestedFloor !== undefined) {
        // Do we need to take care of direction indicators here?
        elevator.goToFloor(nearestRequestedFloor)
      }
    }


    /**
     * @param {Elevator} elevator
     * @param {number} floorNumber
     */
    elevatorFloorButtonPressed(elevator, floorNumber) {
      if (elevator.destinationQueue.includes(floorNumber)) return

      const currentFloor = elevator.currentFloor()
      const { destinationQueue } = elevator

      const queuedFloors = this.#addFloorToQueue(floorNumber, currentFloor, destinationQueue)
      elevator.destinationQueue = queuedFloors
      const direction = this.#directionFromQueue(currentFloor, queuedFloors)
      elevator.checkDestinationQueue()

      elevator.goingUpIndicator(direction === 'up')
      elevator.goingDownIndicator(direction === 'down')
    }


    /**
     * @param {Elevator} elevator
     * @param {number} floorNumber
     * @param {Direction} direction
     * @returns
     */
    elevatorPassingFloor(elevator, floorNumber, direction) {
      if (elevator.destinationQueue.includes(floorNumber)) return
      if (elevator.loadFactor() >= 0.9) return // Skip if elevator is too full

      if ((direction === 'up' && this.floorUpRequests.includes(floorNumber))
          || (direction === 'down' && this.floorDownRequests.includes(floorNumber))) {
        elevator.goToFloor(floorNumber, true)
      }
    }


    /**
     * @param {Elevator} elevator
     * @param {number} floorNumber
     */
    elevatorStoppedAtFloor(elevator, floorNumber) {
      if (elevator.destinationQueue.length === 0) {
        elevator.goingUpIndicator(floorNumber < this.highestFloor)
        elevator.goingDownIndicator(floorNumber > 0)
      }
      const [nextDestination] = elevator.destinationQueue
      if (this.floorUpRequests.includes(floorNumber)
        && (nextDestination === undefined || floorNumber <= nextDestination)) {
        this.floorUpRequests.splice(this.floorUpRequests.indexOf(floorNumber), 1)
      }
      if (this.floorDownRequests.includes(floorNumber)
        && (nextDestination === undefined || floorNumber >= nextDestination)) {
        this.floorDownRequests.splice(this.floorDownRequests.indexOf(floorNumber), 1)
      }
    }


    get highestFloor() {
      let highestFloor = 0
      for (const floor of this.floors) {
        const floorNumber = floor.floorNum()
        highestFloor = Math.max(highestFloor, floorNumber)
      }
      return highestFloor
    }


    #addFloorToQueue(floorNumber, currentFloor, destinationQueue) {
      const direction = this.#directionFromQueue(currentFloor, destinationQueue)
      const unsortedQueueWithNewFloor = [
        ...destinationQueue,
        floorNumber,
      ]

      const floorsInDirection = []
      const floorsAgainstDirection = []

      for (const floor of unsortedQueueWithNewFloor) {
        if (direction === 'up') {
          (floor >= currentFloor ? floorsInDirection : floorsAgainstDirection).push(floor)
        } else {
          (floor <= currentFloor ? floorsInDirection : floorsAgainstDirection).push(floor)
        }
      }

      const sortedInDirection = floorsInDirection.toSorted((a, b) => (direction === 'up' ? a - b : b - a))
      const sortedAgainstDirection = floorsAgainstDirection.toSorted((a, b) => (direction === 'up' ? b - a : a - b))

      const queuedFloors = [...sortedInDirection, ...sortedAgainstDirection]
      return queuedFloors
    }


    #directionFromQueue(currentFloor, destinationQueue) {
      const [nextDestination] = destinationQueue
      return currentFloor < nextDestination ? 'up' : 'down'
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
