class UserManager {
  constructor (_idbKeyval) {
    this.idbKeyval = _idbKeyval
  }

  async getUserCurrentChallenge (username) {
    const registeredUser = await this.idbKeyval.get(username)

    if (!registeredUser.pendingChallenge.status) {
      return registeredUser.pendingChallenge.challenge
    } else {
      return false
    }
  }

  async completeUserRegistration (username, authenticator) {
    let registeredUser = await this.idbKeyval.get(username)
    const currentAuthenticators = registeredUser.authenticators ? registeredUser.authenticators : []
    const newAuthenticators = currentAuthenticators.concat(authenticator)
    registeredUser.authenticators = newAuthenticators
    registeredUser.registered = true
    await this.idbKeyval.set(username, registeredUser)
  }

  async getUser (username) {
    let registeredUser = await this.idbKeyval.get(username)
    return registeredUser.registered ? registeredUser : false
  }

  async getUserAuthenticators (username) {
    const user = await this.getUser(username)
    return user.authenticators
  }

  async setUserCurrentChallenge (username, challenge) {
    const registeredUser = await this.idbKeyval.get(username)

    const pendingChallenge = {
      challenge: challenge,
      complete: false
    }

    registeredUser.pendingChallenge = pendingChallenge
    await this.idbKeyval.set(username, registeredUser)
  }
}

module.exports.UserManager = UserManager
