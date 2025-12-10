(() => {
  /** @type {ProgramInitCallback} */
  const init = (elevators, floors) => {
    const [elevator] = elevators

    const goToFloor = (floorNumber) => {
      if (!elevator.destinationQueue.includes(floorNumber)) {
        elevator.goToFloor(floorNumber)
      }
    }


    const buttonOnFloorPressed = (floor, _direction) => {
      goToFloor(floor.floorNum())
    }


    elevator.on('floor_button_pressed', (floorNumber) => {
      goToFloor(floorNumber)
    })

    for (const floor of floors) {
      floor.on('up_button_pressed', () => {
        buttonOnFloorPressed(floor, 'up')
      })
      floor.on('down_button_pressed', () => {
        buttonOnFloorPressed(floor, 'down')
      })
    }
  }


  /** @type {ProgramUpdateCallback} */
  const update = (_dt, _elevators, _floors) => {
    // Nothing yet!
  }


  return { init, update }
})()
