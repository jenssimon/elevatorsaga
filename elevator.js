(() => {
  const FLOOR_UP_REQUESTS = []
  const FLOOR_DOWN_REQUESTS = []

  const addFloorRequest = (list, floorNumber) => {
    if (!list.includes(floorNumber)) {
      list.push(floorNumber)
    }
  }

  const directionFromQueue = (currentFloor, destinationQueue) => {
    const [nextDestination] = destinationQueue
    return currentFloor < nextDestination ? 'up' : 'down'
  }

  const addFloorToQueue = (floorNumber, currentFloor, destinationQueue) => {
    const direction = directionFromQueue(currentFloor, destinationQueue)
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


  /** @type {ProgramInitCallback} */
  const init = (elevators, floors) => {
    const [elevator] = elevators
    let highestFloor = 0

    for (const floor of floors) {
      const floorNumber = floor.floorNum()
      highestFloor = Math.max(highestFloor, floorNumber)

      floor.on('up_button_pressed', () => addFloorRequest(FLOOR_UP_REQUESTS, floorNumber))
      floor.on('down_button_pressed', () => addFloorRequest(FLOOR_DOWN_REQUESTS, floorNumber))
    }

    elevator.on('idle', () => {
      const currentFloor = elevator.currentFloor()
      const [nearestRequestedFloor] = [...FLOOR_UP_REQUESTS, ...FLOOR_DOWN_REQUESTS].toSorted((a, b) => {
        const distanceA = Math.abs(a - currentFloor)
        const distanceB = Math.abs(b - currentFloor)
        // prefer higher floors if distances are equal
        return distanceA - distanceB || b - a
      })
      if (nearestRequestedFloor !== undefined) {
        // Do we need to take care of direction indicators here?
        elevator.goToFloor(nearestRequestedFloor)
      }
    })

    elevator.on('floor_button_pressed', (floorNumber) => {
      if (elevator.destinationQueue.includes(floorNumber)) return

      const currentFloor = elevator.currentFloor()
      const { destinationQueue } = elevator

      const queuedFloors = addFloorToQueue(floorNumber, currentFloor, destinationQueue)
      elevator.destinationQueue = queuedFloors
      const direction = directionFromQueue(currentFloor, queuedFloors)
      elevator.checkDestinationQueue()

      elevator.goingUpIndicator(direction === 'up')
      elevator.goingDownIndicator(direction === 'down')
    })

    elevator.on('passing_floor', (floorNumber, direction) => {
      if (elevator.destinationQueue.includes(floorNumber)) return
      if (elevator.loadFactor() >= 0.9) return // Skip if elevator is too full

      if ((direction === 'up' && FLOOR_UP_REQUESTS.includes(floorNumber))
          || (direction === 'down' && FLOOR_DOWN_REQUESTS.includes(floorNumber))) {
        elevator.goToFloor(floorNumber, true)
      }
    })

    elevator.on('stopped_at_floor', (floorNumber) => {
      if (elevator.destinationQueue.length === 0) {
        elevator.goingUpIndicator(floorNumber < highestFloor)
        elevator.goingDownIndicator(floorNumber > 0)
      }
      const [nextDestination] = elevator.destinationQueue
      if (FLOOR_UP_REQUESTS.includes(floorNumber)
        && (nextDestination === undefined || floorNumber <= nextDestination)) {
        FLOOR_UP_REQUESTS.splice(FLOOR_UP_REQUESTS.indexOf(floorNumber), 1)
      }
      if (FLOOR_DOWN_REQUESTS.includes(floorNumber)
        && (nextDestination === undefined || floorNumber >= nextDestination)) {
        FLOOR_DOWN_REQUESTS.splice(FLOOR_DOWN_REQUESTS.indexOf(floorNumber), 1)
      }
    })
  }


  /** @type {ProgramUpdateCallback} */
  const update = (_dt, _elevators, _floors) => {
    // Nothing yet!
  }

  const elevator = { init, update }
  /* v8 ignore else -- @preserve */
  if (globalThis.process?.env.NODE_ENV === 'test') {
    globalThis.elevator = elevator
  }
  return elevator
})()
