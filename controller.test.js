const Controller = require("./controller")

describe("controller", () => {
  let controller
  let onStatusUpdate

  beforeEach(() => {
    onStatusUpdate = jest.fn()

    controller = new Controller(
      { openTimeout: 25, closeTimeout: 30 },
      onStatusUpdate,
    )

    expect(controller.openTimeout).toEqual(25_000)
    expect(controller.closeTimeout).toEqual(30_000)
    expect(controller.state).toEqual("unknown")
    expect(controller.position).toBeUndefined()
    expect(onStatusUpdate).not.toBeCalled()

    jest.useFakeTimers()
  })

  test("open", () => {
    controller.open()
    expect(() => {
      controller.open()
    }).toThrow("already moving")
  })

  test("open", () => {
    controller.open()
    expect(controller.state).toEqual("opening")
    jest.advanceTimersByTime(controller.openTimeout)
    expect(controller.state).toEqual("open")
    expect(controller.position).toEqual(100)
  })

  test("close", () => {
    controller.close()
    expect(() => {
      controller.close()
    }).toThrow("already moving")
  })

  test("close", () => {
    controller.close()
    expect(controller.state).toEqual("closing")
    jest.advanceTimersByTime(controller.closeTimeout)
    expect(controller.position).toEqual(0)
    expect(controller.state).toEqual("closed")
  })

  test("pause", () => {
    expect(() => {
      controller.pause()
    }).toThrow("not currently moving")
  })

  test("pause", () => {
    controller.open()
    expect(controller.state).toEqual("opening")
    jest.advanceTimersByTime(controller.openTimeout / 2)
    expect(controller.state).not.toBeUndefined()
    expect(controller.state).toEqual("opening")
    controller.pause()
    jest.runAllTimers()
    expect(controller.position).toBeUndefined()
    expect(controller.state).toEqual("paused")
  })

  test("setPosition", () => {
    controller.setPosition(100)
    expect(controller.state).toEqual("opening")
    jest.runAllTimers()
    expect(controller.state).toEqual("open")
    expect(controller.position).toEqual(100)
  })

  test("setPosition", () => {
    controller.setPosition(0)
    expect(controller.state).toEqual("closing")
    jest.runAllTimers()
    expect(controller.state).toEqual("closed")
    expect(controller.position).toEqual(0)
  })

  test("setPosition", () => {
    expect(() => {
      controller.setPosition(50)
    }).toThrow("current position is unknown")
  })

  test("setPosition", () => {
    controller.close()
    jest.runAllTimers()

    expect(controller.position).toEqual(0)
    expect(controller.state).toEqual("closed")

    controller.setPosition(50)
    expect(controller.state).toEqual("opening")
    jest.runAllTimers()
    expect(controller.state).toEqual("paused")
    expect(controller.position).toEqual(50)

    controller.setPosition(75)
    jest.runAllTimers()
    expect(controller.state).toEqual("paused")
    expect(controller.position).toEqual(75)

    controller.open()
    jest.runAllTimers()
    expect(controller.state).toEqual("open")
    expect(controller.position).toEqual(100)

    controller.setPosition(50)
    jest.runAllTimers()
    expect(controller.state).toEqual("paused")
    expect(controller.position).toEqual(50)

    controller.setPosition(25)
    jest.runAllTimers()
    expect(controller.state).toEqual("paused")
    expect(controller.position).toEqual(25)

    controller.close()
    jest.runAllTimers()
    expect(controller.state).toEqual("closed")
    expect(controller.position).toEqual(0)
  })
})
