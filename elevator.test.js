import {
  vi, describe, it, expect,
} from 'vitest'

import Elevator from './tests/elevator.js'
import { generateFloors } from './tests/floor.js'

import './elevator.js'


describe('queue floors', () => {
  it('should add a floor to the queue', async () => {
    const floors = generateFloors(3)
    const elevator = new Elevator()
    elevator.destinationQueue = []
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(1)

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(2)

    expect(elevator.destinationQueue).toEqual([2])
  })


  it('should queue a higher floor (going up)', async () => {
    const floors = generateFloors(5)
    const elevator = new Elevator()
    elevator.destinationQueue = [4, 1]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(3)

    expect(elevator.destinationQueue).toEqual([3, 4, 1])
  })


  it('should queue a lower floor (going up)', async () => {
    const floors = generateFloors(5)
    const elevator = new Elevator()
    elevator.destinationQueue = [4, 1]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(0)

    expect(elevator.destinationQueue).toEqual([4, 1, 0])
  })


  it('should queue a higher floor (going down)', async () => {
    const floors = generateFloors(5)
    const elevator = new Elevator()
    elevator.destinationQueue = [1, 3]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(4)

    expect(elevator.destinationQueue).toEqual([1, 3, 4])
  })


  it('should queue a lower floor (going down)', async () => {
    const floors = generateFloors(5)
    const elevator = new Elevator()
    elevator.destinationQueue = [0, 4]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(1)

    expect(elevator.destinationQueue).toEqual([1, 0, 4])
  })
})


describe('floor button pressed', () => {
  it('should go up', () => {
    const floors = generateFloors(4)
    const elevator = new Elevator()
    elevator.destinationQueue = []
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(3)

    expect(elevator.destinationQueue).toEqual([3])
    expect(elevator.goingUpIndicator()).toBe(true)
    expect(elevator.goingDownIndicator()).toBe(false)
  })


  it('should go down', () => {
    const floors = generateFloors(4)
    const elevator = new Elevator()
    elevator.destinationQueue = []
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(3)

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(0)

    expect(elevator.destinationQueue).toEqual([0])
    expect(elevator.goingUpIndicator()).toBe(false)
    expect(elevator.goingDownIndicator()).toBe(true)
  })


  it('shouldn\'t do anything when pressing an already queued floor', () => {
    const floors = generateFloors(5)
    const elevator = new Elevator()
    elevator.destinationQueue = [3, 4]
    elevator.goingUpIndicator(true)
    elevator.goingDownIndicator(false)
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)
    const goingUpSpy = vi.spyOn(elevator, 'goingUpIndicator')
    const goingDownSpy = vi.spyOn(elevator, 'goingDownIndicator')

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.floor_button_pressed(3)

    expect(elevator.destinationQueue).toEqual([3, 4])
    expect(elevator.goingUpIndicator()).toBe(true)
    expect(elevator.goingDownIndicator()).toBe(false)
    expect(goingUpSpy).not.toHaveBeenCalledWith(true)
    expect(goingDownSpy).not.toHaveBeenCalledWith(false)
  })
})


describe('stopped at floor', () => {
  it('should set the indicators when there are no more destinations', () => {
    const floors = generateFloors(4)
    const elevator = new Elevator()
    elevator.destinationQueue = []
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)

    globalThis.elevator.init([elevator], floors)

    elevator.goingUpIndicator(false)
    elevator.goingDownIndicator(false)

    elevator.eventHandlers.stopped_at_floor(2)

    expect(elevator.goingUpIndicator()).toBe(true)
    expect(elevator.goingDownIndicator()).toBe(true)
  })


  it('should set the indicators when there are no more destinations (ground floor)', () => {
    const floors = generateFloors(4)
    const elevator = new Elevator()
    elevator.destinationQueue = []
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(0)

    globalThis.elevator.init([elevator], floors)

    elevator.goingUpIndicator(false)
    elevator.goingDownIndicator(false)

    elevator.eventHandlers.stopped_at_floor(0)

    expect(elevator.goingUpIndicator()).toBe(true)
    expect(elevator.goingDownIndicator()).toBe(false)
  })


  it('should set the indicators when there are no more destinations (highest floor)', () => {
    const floors = generateFloors(4)
    const elevator = new Elevator()
    elevator.destinationQueue = []
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(0)

    globalThis.elevator.init([elevator], floors)

    elevator.goingUpIndicator(false)
    elevator.goingDownIndicator(false)

    elevator.eventHandlers.stopped_at_floor(3)

    expect(elevator.goingUpIndicator()).toBe(false)
    expect(elevator.goingDownIndicator()).toBe(true)
  })


  it('should handle stops without any floor requests', () => {
    const floors = generateFloors(4)
    const elevator = new Elevator()
    elevator.destinationQueue = [3, 4]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)
    const goingUpSpy = vi.spyOn(elevator, 'goingUpIndicator')
    const goingDownSpy = vi.spyOn(elevator, 'goingDownIndicator')

    globalThis.elevator.init([elevator], floors)

    elevator.eventHandlers.stopped_at_floor(2)

    expect(goingUpSpy).not.toHaveBeenCalled()
    expect(goingDownSpy).not.toHaveBeenCalled()
  })


  it('should handle stops with going up requests (going up)', () => {
    const floors = generateFloors(4)
    const myFloor = floors.find((f) => f.floorNum() === 2)
    const elevator = new Elevator()
    elevator.destinationQueue = [3, 4]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)
    const goingUpSpy = vi.spyOn(elevator, 'goingUpIndicator')
    const goingDownSpy = vi.spyOn(elevator, 'goingDownIndicator')

    globalThis.elevator.init([elevator], floors)

    myFloor.eventHandlers.up_button_pressed()
    elevator.eventHandlers.stopped_at_floor(2)

    expect(goingUpSpy).not.toHaveBeenCalled()
    expect(goingDownSpy).not.toHaveBeenCalled()
  })


  it('should handle stops with going down requests (going up)', () => {
    const floors = generateFloors(4)
    const myFloor = floors.find((f) => f.floorNum() === 2)
    const elevator = new Elevator()
    elevator.destinationQueue = [3, 4]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)
    const goingUpSpy = vi.spyOn(elevator, 'goingUpIndicator')
    const goingDownSpy = vi.spyOn(elevator, 'goingDownIndicator')

    globalThis.elevator.init([elevator], floors)

    myFloor.eventHandlers.down_button_pressed()
    elevator.eventHandlers.stopped_at_floor(2)

    expect(goingUpSpy).not.toHaveBeenCalled()
    expect(goingDownSpy).not.toHaveBeenCalled()
  })


  it('should handle stops with going up requests (going down)', () => {
    const floors = generateFloors(4)
    const myFloor = floors.find((f) => f.floorNum() === 2)
    const elevator = new Elevator()
    elevator.destinationQueue = [1, 0]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)
    const goingUpSpy = vi.spyOn(elevator, 'goingUpIndicator')
    const goingDownSpy = vi.spyOn(elevator, 'goingDownIndicator')

    globalThis.elevator.init([elevator], floors)

    myFloor.eventHandlers.up_button_pressed()
    elevator.eventHandlers.stopped_at_floor(2)

    expect(goingUpSpy).not.toHaveBeenCalled()
    expect(goingDownSpy).not.toHaveBeenCalled()
  })


  it('should handle stops with going down requests (going down)', () => {
    const floors = generateFloors(4)
    const myFloor = floors.find((f) => f.floorNum() === 2)
    const elevator = new Elevator()
    elevator.destinationQueue = [1, 0]
    vi.spyOn(elevator, 'currentFloor').mockReturnValue(2)
    const goingUpSpy = vi.spyOn(elevator, 'goingUpIndicator')
    const goingDownSpy = vi.spyOn(elevator, 'goingDownIndicator')

    globalThis.elevator.init([elevator], floors)

    myFloor.eventHandlers.down_button_pressed()
    elevator.eventHandlers.stopped_at_floor(2)

    expect(goingUpSpy).not.toHaveBeenCalled()
    expect(goingDownSpy).not.toHaveBeenCalled()
  })
})


describe('passing floor', () => {
  it.skip('should stop at requested floor when going up', () => {
    const floors = generateFloors(4)
    const myFloor = floors.find((f) => f.floorNum() === 2)
    const elevator = new Elevator()
    elevator.destinationQueue = [3]
    vi.spyOn(elevator, 'loadFactor').mockReturnValue(0.5)
    const goToFloorSpy = vi.spyOn(elevator, 'goToFloor')

    globalThis.elevator.init([elevator], floors)

    myFloor.eventHandlers.up_button_pressed()
    elevator.eventHandlers.passing_floor(2, 'up')

    expect(goToFloorSpy).toHaveBeenCalledWith(2, true)
    expect(elevator.destinationQueue).toEqual([2, 3])
  })
})
