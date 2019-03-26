class LoginHandler {
  constructor (_idbKeyval, _utils, _userManager) {
    this.idbKeyval = _idbKeyval
    this.utils = _utils
    this.userManager = _userManager
  }
  async handle (event) {
    let response = {}
    const body = await event.request.json()
    if (!body || !body.username) {
      response = {
        'status': 'failed',
        'message': 'Request missing username field!'
      }
      return new Response(JSON.stringify(response))
    }

    let username = body.username
    const user = await this.userManager.getUser(username)

    if (!user) {
      response = {
        'status': 'failed',
        'message': `User ${username} does not exist or is not registered.`
      }
      return new Response(JSON.stringify(response))
    }

    let getAssertion = this.utils.generateServerGetAssertion(user.authenticators)
    getAssertion.status = 'ok'
    await this.userManager.setUserCurrentChallenge(username, getAssertion.challenge)
    return new Response(JSON.stringify(getAssertion))
  }
}

module.exports.LoginHandler = LoginHandler
