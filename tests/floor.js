class Floor {
  eventHandlers

  floorNumber

  constructor(floorNumber) {
    this.eventHandlers = {}
    this.floorNumber = floorNumber
  }

  on(event, handler) {
    this.eventHandlers[event] = handler
  }

  floorNum() {
    return this.floorNumber
  }
}


export function generateFloors(count) {
  const floors = []
  for (let index = 0; index < count; index++) {
    floors.push(new Floor(index))
  }
  return floors
}


export default Floor
