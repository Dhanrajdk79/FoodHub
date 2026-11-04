
const EventEmitter = require("events");

// Create one shared event bus
const eventBus = new EventEmitter();

module.exports = eventBus;
