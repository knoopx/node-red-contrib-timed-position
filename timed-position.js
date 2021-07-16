const Controller = require("./controller")

module.exports = (RED) => {
  let prevState

  class TimedPosition {
    constructor(config) {
      RED.nodes.createNode(this, config)
      this.controller = new Controller(config, this.onStateChange)

      if (prevState) {
        Object.assign(this.controller, prevState)
      }

      this.onStateChange(this.controller.state, this.controller.position)

      this.on("input", this.onInput)
      this.on("close", this.onClose)
    }

    onStateChange = (state, position) => {
      let status = state
      if (position !== undefined) {
        status += `, position: ${this.controller.position}%`
      }
      this.status(status)

      this.send({ payload: state })
    }

    onInput = async (msg) => {
      try {
        switch (msg.payload.action) {
          case "open":
            this.controller.open()
            break
          case "close":
            this.controller.close()
            break
          case "pause":
            this.controller.pause()
            break
          case "position":
            this.controller.setPosition(msg.payload.position)
            break
          default:
            this.warn("unknown action", [msg.payload.action])
            break
        }
      } catch (err) {
        this.error(err)
      }
    }

    onClose = () => {
      const { state, position } = this.controller
      prevState = { state, position }
    }
  }

  RED.nodes.registerType("timed position", TimedPosition)
}
