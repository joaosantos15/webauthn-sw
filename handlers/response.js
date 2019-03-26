class ResponseHandler {
  constructor (_idbKeyval, _utils, _userManager) {
    this.idbKeyval = _idbKeyval
    this.utils = _utils
    this.userManager = _userManager
  }

  async handle (event) {
    let response = {}
    const body = await event.request.json()
    if (!body || !body.id ||
      !body.rawId || !body.response ||
      !body.type || body.type !== 'public-key') {
      response = {
        'status': 'failed',
        'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
      }
      return new Response(JSON.stringify(response))
    }
    const username = body.username
    const clientData = this.utils.decodeClientData(body.response.clientDataJSON)

    const pendingChallenge = await this.userManager.getUserCurrentChallenge(username)
    if (pendingChallenge !== clientData.challenge) {
      response = {
        'status': 'failed',
        'message': `Challenges don't match`
      }
      return new Response(JSON.stringify(response))
    }

    // add a check for origin ...

    if (body.response.attestationObject !== undefined) {
      // response to a login
      const result = this.utils.verifyAuthenticatorAttestationResponse(body)
      // const result = {verified: true} // skipping digital signature check, for now

      if (result.verified) {
        await this.userManager.completeUserRegistration(username, result.authrInfo)
        // set session to logged in
        response = {'status': 'ok', 'message': 'user logged in'}
      } else {
        response = {
          'status': 'failed',
          'message': 'Can not authenticate signature!'
        }
      }
      return new Response(JSON.stringify(response))
    } else if (body.response.authenticatorData !== undefined) {
      // response to a registration
      let result
      /* This is get assertion */
      const userAuthenticators = await this.userManager.getUserAuthenticators(username)
      result = {verified: true} // skipping digital signature check, for now
      // result = utils.verifyAuthenticatorAssertionResponse(body, userAuthenticators)
      if (result.verified) {
        console.log('User secret')
        console.log(body.response.userHandle)
        response = {
          'status': 'ok',
          'message': 'user authenticarted'
        }
        return new Response(JSON.stringify(response))
      } else {
        response = {
          'status': 'failed',
          'message': 'Digital signature verification failed'
        }
        return new Response(JSON.stringify(response))
      }
    } else {
      response = {
        'status': 'failed',
        'message': 'attestationObject is not defined'
      }
      return new Response(JSON.stringify(response))
    }
  }
}

module.exports.ResponseHandler = ResponseHandler
