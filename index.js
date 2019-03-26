const {RegisterHandler} = require('./handlers/register')
const {ResponseHandler} = require('./handlers/response')
const {LoginHandler} = require('./handlers/login')

const utils = require('./lib/utils')
const {IdbKeyVal} = require('./lib/idbKeyVal')
const {UserManager} = require('./lib/userManager')

const idbKeyval = new IdbKeyVal()
const userManager = new UserManager(idbKeyval)

const registerHandler = new RegisterHandler(idbKeyval, utils, userManager)
const loginHandler = new LoginHandler(idbKeyval, utils, userManager)
const responseHandler = new ResponseHandler(idbKeyval, utils, userManager)

module.exports = {
  responseHandler,
  loginHandler,
  registerHandler
}
