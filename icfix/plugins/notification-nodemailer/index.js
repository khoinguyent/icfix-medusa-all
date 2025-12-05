const { asClass } = require("awilix")
const NodemailerNotificationService = require("./services/notification")

module.exports = {
  resolve: {
    notificationService: asClass(NodemailerNotificationService).singleton(),
  },
}

