class TimedPositionController {
  constructor(
    { position, timeout, openTimeout, closeTimeout },
    onStateChange = () => {},
  ) {
    this.position = position
    this.timeout = timeout
    this.openTimeout = openTimeout * 1000
    this.closeTimeout = closeTimeout * 1000
    this.onStateChange = onStateChange
    this.state = "unknown"
  }

  updateState = (state) => {
    this.state = state
    this.onStateChange(this.state, this.position)
  }

  open = (timeout) => {
    if (this.position === undefined || this.position < 100) {
      this.updateState("opening")

      if (timeout) {
        this.move(timeout, () => {
          this.pause()
        })
      } else {
        this.move(
          this.position === undefined
            ? this.openTimeout
            : (this.openTimeout * (100 - this.position)) / 100,
          () => {
            this.position = 100
            this.updateState("open")
          },
        )
      }
    }
  }

  close = (timeout) => {
    if (this.position === undefined || this.position > 0) {
      this.updateState("closing")

      if (timeout) {
        this.move(timeout, () => {
          this.pause()
        })
      } else {
        this.move(
          this.position === undefined
            ? this.closeTimeout
            : (this.closeTimeout * this.position) / 100,
          () => {
            this.position = 0
            this.updateState("closed")
          },
        )
      }
    }
  }

  setPosition = (position) => {
    switch (position) {
      case 100:
        this.open()
        break
      case 0:
        this.close()
        break
      default:
        if (this.position === undefined) {
          throw new Error("current position is unknown")
        }

        if (position > this.position) {
          this.open((this.openTimeout * (position - this.position)) / 100)
        } else if (position < this.position) {
          this.close((this.closeTimeout * (this.position - position)) / 100)
        }
    }
  }

  move = (timeout, cb) => {
    if (this.timeout !== undefined) {
      throw new Error("already moving")
    }

    this.startedAt = Date.now()
    this.timeout = setTimeout(() => {
      cb()
      this.startedAt = undefined
      this.timeout = undefined
    }, timeout)
  }

  pause = () => {
    if (this.timeout === undefined) {
      throw new Error("not currently moving")
    }

    const prevState = this.state
    this.updateState("pausing")

    clearTimeout(this.timeout)
    this.timeout = undefined

    if (this.position !== undefined) {
      const duration = Date.now() - this.startedAt

      if (prevState === "opening") {
        this.position += Math.round((duration * 100) / this.openTimeout)
      } else if (prevState === "closing") {
        this.position -= Math.round((duration * 100) / this.closeTimeout)
      }
    }

    this.updateState("paused")
  }
}

module.exports = TimedPositionController
