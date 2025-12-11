// Derived from documentation:
// Site: https://play.elevatorsaga.com/documentation.html
// Repo: https://github.com/magwo/elevatorsaga/blob/master/documentation.html

type Direction = 'down' | 'up'

type ElevatorIdleEventCallback = () => void
type ElevatorFloorButtonPressedCallback = (floorNum: number) => void

type ElevatorPassingFloorCallback = (
  floorNum: number,
  direction: Direction,
) => void

type ElevatorStoppedAtFloorCallback = (floorNum: number) => void

type FloorUpButtonPressedCallback = () => void
type FloorDownButtonPressedCallback = () => void

interface Elevator {
  /**
   * Queue the elevator to go to specified floor number. If you specify true as
   * second argument, the elevator will go to that floor directly, and then go
   * to any other queued floors.
   *
   * ```ts
   * elevator.goToFloor(3) // Do it after anything else
   * elevator.goToFloor(2, true) // Do it before anything else
   * ```
   */
  goToFloor (floorNum: number, directly?: boolean): void,

  /**
   * Clear the destination queue and stop the elevator if it is moving. Note
   * that you normally don't need to stop elevators - it is intended for
   * advanced solutions with in-transit rescheduling logic. Also, note that the
   * elevator will probably not stop at a floor, so passengers will not get out.
   *
   * ```ts
   * elevator.stop()
   * ```
   */
  stop (): void,

  /**
   * Gets the floor number that the elevator currently is on.
   *
   * ```ts
   * if (elevator.currentFloor() === 0) {
   *     // Do something special?
   * }
   * ```
   */
  currentFloor (): number,

  /**
   * Gets or sets the going up indicator, which will affect passenger behaviour
   * when stopping at floors.
   *
   * ```ts
   * if (elevator.goingUpIndicator()) {
   *     elevator.goingDownIndicator(false)
   * }
   * ```
   */
  goingUpIndicator (): boolean,
  goingUpIndicator (state: boolean): void,

  /**
   * Gets or sets the going down indicator, which will affect passenger
   * behaviour when stopping at floors.
   *
   * ```ts
   * if (elevator.goingDownIndicator()) {
   *     elevator.goingUpIndicator(false)
   * }
   * ```
   */
  goingDownIndicator (): boolean,
  goingDownIndicator (state: boolean): void,

  /**
   * Gets the maximum number of passengers that can occupy the elevator at the
   * same time.
   *
   * ```ts
   * if (elevator.maxPassengerCount() > 5) {
   *     // Use this elevator for something special, because it's big
   * }
   * ```
   */
  maxPassengerCount (): number,

  /**
   * Gets the load factor of the elevator. 0 means empty, 1 means full.
   * Varies with passenger weights, which vary - not an exact measure.
   *
   * ```ts
   * if (elevator.loadFactor() < 0.4) {
   *     // Maybe use this elevator, since it's not full yet?
   * }
   * ```
   */
  loadFactor (): number,

  /**
   * Gets the direction the elevator is currently going to move toward.
   * Can be "up", "down" or "stopped".
   */
  destinationDirection (): Direction | 'stopped',

  /**
   * The current destination queue, meaning the floor numbers the elevator
   * is scheduled to go to. Can be modified and emptied if desired. Note that
   * you need to call checkDestinationQueue() for the change to take effect
   * immediately.
   *
   * ```ts
   * elevator.destinationQueue = []
   * elevator.checkDestinationQueue()
   * ```
   */
  destinationQueue: number[],

  /**
   * Checks the destination queue for any new destinations to go to. Note that
   * you only need to call this if you modify the destination queue explicitly.
   *
   * ```ts
   * elevator.checkDestinationQueue();
   * ```
   */
  checkDestinationQueue (): void,

  /**
   * Gets the currently pressed floor numbers as an array.
   *
   * ```ts
   * if (elevator.getPressedFloors().length > 0) {
   *     // Maybe go to some chosen floor first?
   * }
   * ```
   */
  getPressedFloors (): number[],

  /**
   * Triggered when the elevator has completed all its tasks and is not doing
   * anything.
   *
   * ```ts
   * elevator.on("idle", function() { ... })
   * ```
   */
  on (type: 'idle', callback: ElevatorIdleEventCallback): void,

  /**
   * Triggered when a passenger has pressed a button inside the elevator.
   *
   * ```ts
   * elevator.on("floor_button_pressed", function(floorNum) {
   *     // Maybe tell the elevator to go to that floor?
   * })
   * ```
   */
  on (
    type: 'floor_button_pressed',
    callback: ElevatorFloorButtonPressedCallback,
  ): void,

  /**
   * Triggered slightly before the elevator will pass a floor. A good time to
   * decide whether to stop at that floor. Note that this event is not triggered
   * for the destination floor. Direction is either "up" or "down".
   *
   * ```ts
   * elevator.on("passing_floor", function(floorNum, direction) { ... })
   * ```
   */
  on (type: 'passing_floor', callback: ElevatorPassingFloorCallback): void,

  /**
   * Triggered when the elevator has arrived at a floor.
   *
   * ```ts
   * elevator.on("stopped_at_floor", function(floorNum) {
   *     // Maybe decide where to go next?
   * })
   * ```
   */
  on (type: 'stopped_at_floor', callback: ElevatorStoppedAtFloorCallback): void,
}

interface Floor {
  /**
   * Gets the floor number of the floor object.
   *
   * ```ts
   * if (floor.floorNum() > 3) { ... }
   * ```
   */
  floorNum (): number,

  /**
   * Triggered when someone has pressed the up button at a floor. Note that
   * passengers will press the button again if they fail to enter an elevator.
   *
   * ```ts
   * floor.on("up_button_pressed", function() {
   *     // Maybe tell an elevator to go to this floor?
   * })
   * ```
   */
  on (type: 'up_button_pressed', callback: FloorUpButtonPressedCallback): void,

  /**
   * Triggered when someone has pressed the down button at a floor. Note that
   * passengers will press the button again if they fail to enter an elevator.
   *
   * ```ts
   * floor.on("down_button_pressed", function() {
   *     // Maybe tell an elevator to go to this floor?
   * })
   * ```
   */
  on (
    type: 'down_button_pressed',
    callback: FloorDownButtonPressedCallback,
  ): void,
}

type ProgramInitCallback = (
  elevators: readonly Elevator[],
  floors: readonly Floor[],
) => void

/**
 * @param dt the number of game seconds that passed since the last time update
 * was called
 */
type ProgramUpdateCallback = (
  dt: number,
  elevators: readonly Elevator[],
  floors: readonly Floor[],
) => void

interface Program {
  init: ProgramInitCallback,
  update: ProgramUpdateCallback,
}
