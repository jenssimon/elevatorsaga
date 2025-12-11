(() => {
  const floorUpRequests = []
  const floorDownRequests = []

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

      floor.on('up_button_pressed', () => addFloorRequest(floorUpRequests, floorNumber))
      floor.on('down_button_pressed', () => addFloorRequest(floorDownRequests, floorNumber))
    }

    elevator.on('idle', () => {
      const currentFloor = elevator.currentFloor()
      const [nearestRequestedFloor] = [...floorUpRequests, ...floorDownRequests].toSorted((a, b) => {
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

      if ((direction === 'up' && floorUpRequests.includes(floorNumber))
          || (direction === 'down' && floorDownRequests.includes(floorNumber))) {
        elevator.goToFloor(floorNumber, true)
      }
    })

    elevator.on('stopped_at_floor', (floorNumber) => {
      if (elevator.destinationQueue.length === 0) {
        elevator.goingUpIndicator(floorNumber < highestFloor)
        elevator.goingDownIndicator(floorNumber > 0)
      }
      const [nextDestination] = elevator.destinationQueue
      if (floorUpRequests.includes(floorNumber)
        && (nextDestination === undefined || floorNumber <= nextDestination)) {
        floorUpRequests.splice(floorUpRequests.indexOf(floorNumber), 1)
      }
      if (floorDownRequests.includes(floorNumber)
        && (nextDestination === undefined || floorNumber >= nextDestination)) {
        floorDownRequests.splice(floorDownRequests.indexOf(floorNumber), 1)
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
