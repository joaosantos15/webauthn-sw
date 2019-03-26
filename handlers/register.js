class RegisterHandler {
  constructor (_idbKeyval, _utils, _userManager) {
    this.idbKeyval = _idbKeyval
    this.utils = _utils
    this.userManager = _userManager
  }
  async handle (event) {
    let response = {}
    const body = await event.request.json()
    if (!body.name) {
      response = {
        'status': 'failed',
        'message': `No name provided`
      }
      return new Response(JSON.stringify(response))
    }

    if (!body.username) {
      response = {
        'status': 'failed',
        'message': `No username provided`
      }
      return new Response(JSON.stringify(response))
    }
    const username = body.username
    const name = body.name
    const user = await this.idbKeyval.get(username)
    const secret = body.secret

    if (user !== undefined && user.registered) {
      response = {
        'status': 'failed',
        'message': `Username ${username} already exists`
      }
      return new Response(JSON.stringify(response))
    } else {
      // const userId = this.utils.randomBase64URLBuffer()
      let encodedSecret = this.utils.encodeSecret(secret)
      console.log('Encoded: ')
      console.log(encodedSecret)
      const newUser = {
        'name': name,
        'registered': false,
        // 'id': userId,
        // 'id': encodedSecret,
        'authenticators': []
      }

      await this.idbKeyval.set(username, newUser)

      let challengeMakeCred = this.utils.generateServerMakeCredRequest(username, name, encodedSecret)
      await this.userManager.setUserCurrentChallenge(username, challengeMakeCred.challenge)
      return new Response(JSON.stringify({status: 'ok', body: challengeMakeCred}))
    }
  }
}

module.exports.RegisterHandler = RegisterHandler
