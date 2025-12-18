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
          console.group('%o - floor %o', 'button-up', floorNumber)
          console.info('floor up pressed')
          if (!this.floorUpRequests.includes(floorNumber)) {
            this.floorUpRequests.push(floorNumber)
            console.info('floor up request added')
          }
          console.groupEnd()
        })
        floor.on('down_button_pressed', () => {
          console.group('%o - floor %o', 'button-down', floorNumber)
          console.info('floor down pressed')
          if (!this.floorDownRequests.includes(floorNumber)) {
            this.floorDownRequests.push(floorNumber)
            console.info('floor down request added')
          }
          console.groupEnd()
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

      console.group('%o - elevator %o floor %o', 'idle', this.elevators.indexOf(elevator), currentFloor)
      console.info('Idles')

      console.debug('floorUpRequests:', this.floorUpRequests)
      console.debug('floorDownRequests:', this.floorDownRequests)

      const [nearestRequestedFloor] = [
        ...this.floorUpRequests,
        ...this.floorDownRequests,
      ]
        .toSorted((a, b) => {
          const distanceA = Math.abs(a - currentFloor)
          const distanceB = Math.abs(b - currentFloor)
          // prefer higher floors if distances are equal
          return distanceA - distanceB || b - a
        })

      console.debug('nearest requested floor %o', nearestRequestedFloor)

      if (nearestRequestedFloor === currentFloor) {
        if (this.floorUpRequests.includes(currentFloor)) {
          this.floorUpRequests.splice(this.floorUpRequests.indexOf(currentFloor), 1)
          elevator.goingUpIndicator(true)
          elevator.goingDownIndicator(false)

          console.debug('set going up indicator')
        } else {
          this.floorDownRequests.splice(this.floorDownRequests.indexOf(currentFloor), 1)
          elevator.goingUpIndicator(false)
          elevator.goingDownIndicator(true)

          console.debug('set going down indicator')
        }
        console.groupEnd()
        return
      }

      if (nearestRequestedFloor !== undefined && nearestRequestedFloor !== currentFloor) {
        console.info('...but now goes to requested floor %o', nearestRequestedFloor)
        // Do we need to take care of direction indicators here?
        elevator.goToFloor(nearestRequestedFloor)
      }
      console.groupEnd()
    }


    /**
     * @param {Elevator} elevator
     * @param {number} floorNumber
     */
    elevatorFloorButtonPressed(elevator, floorNumber) {
      const currentFloor = elevator.currentFloor()
      console.group(
        '%o - elevator %o floor %o (requested %o)',
        'elevator-button',
        this.elevators.indexOf(elevator),
        currentFloor,
        floorNumber,
      )

      console.info('Elevator button for floor %o pressed on %o', floorNumber, currentFloor)
      if (elevator.destinationQueue.includes(floorNumber)) {
        console.info('...but floor %o is already in the queue', floorNumber)
        console.groupEnd()
        return
      }

      const { destinationQueue } = elevator

      console.info('add floor %o to queue', floorNumber)
      const queuedFloors = this.#addFloorToQueue(floorNumber, currentFloor, destinationQueue)
      elevator.destinationQueue = queuedFloors
      const direction = this.#directionFromQueue(currentFloor, queuedFloors)
      elevator.checkDestinationQueue()
      console.info('destination queue', elevator.destinationQueue)

      elevator.goingUpIndicator(direction === 'up')
      elevator.goingDownIndicator(direction === 'down')

      console.groupEnd()
    }


    /**
     * @param {Elevator} elevator
     * @param {number} floorNumber
     * @param {Direction} direction
     * @returns
     */
    elevatorPassingFloor(elevator, floorNumber, direction) {
      console.group(
        '%o - elevator %o passing floor %o going %o',
        'passing-floor',
        this.elevators.indexOf(elevator),
        floorNumber,
        direction,
      )
      console.info('Passing floor, direction %o', direction)

      if (elevator.destinationQueue.includes(floorNumber)) {
        console.info('Already in destination queue')
        console.groupEnd()
        return
      }
      if (elevator.loadFactor() >= 0.9) {
        console.info('Elevator too full to stop')
        console.groupEnd()
        return // Skip if elevator is too full
      }

      const goingUpRequested = direction === 'up' && this.floorUpRequests.includes(floorNumber)
      const goingDownRequested = direction === 'down' && this.floorDownRequests.includes(floorNumber)

      if (!goingUpRequested && !goingDownRequested) {
        console.info('No request for this floor')
        console.groupEnd()
        return
      }

      const floorRequestList = goingUpRequested ? this.floorUpRequests : this.floorDownRequests
      floorRequestList.splice(floorRequestList.indexOf(floorNumber), 1)
      console.info('Stop at this floor')
      elevator.goToFloor(floorNumber, true)

      console.groupEnd()
    }


    /**
     * @param {Elevator} elevator
     * @param {number} floorNumber
     */
    elevatorStoppedAtFloor(elevator, floorNumber) {
      console.group(
        '%o - elevator %o stopped at floor %o',
        'stopped-at-floor',
        this.elevators.indexOf(elevator),
        floorNumber,
      )
      console.info('Stopped')
      if (elevator.destinationQueue.length === 0) {
        console.info('Destination queue empty')

        if (elevator.destinationQueue.length === 0) {
          if (this.floorUpRequests.includes(floorNumber)) {
            this.floorUpRequests.splice(this.floorUpRequests.indexOf(floorNumber), 1)
          }
          if (this.floorDownRequests.includes(floorNumber)) {
            this.floorDownRequests.splice(this.floorDownRequests.indexOf(floorNumber), 1)
          }
        }

        elevator.goingUpIndicator(floorNumber < this.highestFloor)
        elevator.goingDownIndicator(floorNumber > 0)
      }
      console.groupEnd()
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
