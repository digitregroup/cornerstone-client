const config = require('../config/common')();
const Auth   = require('./lib/Auth');

class Cornerstone {

  constructor({apiId, apiSecret, username, alias, corpname}) {
    this.apiId             = apiId;
    this.apiSecret         = apiSecret;
    this.username          = username;
    this.alias             = alias;
    this.corpname          = corpname;
    this.connectionSession = null;
    this.auth              = null;
  }

  getAuth() {
    if (this.auth !== null) {
      return this.auth;
    }

    this.auth = new Auth({
      apiId:     this.apiId,
      apiSecret: this.apiSecret,
      username:  this.username,
      alias:     this.alias,
      corpname:  this.corpname
    });

    return this.auth;
  }

  async getConnectionSession() {
    if (this.connectionSession !== null) {
      return this.connectionSession;
    }

    const session = await this.auth.setSession({
      apiId:     this.apiId,
      apiSecret: this.apiSecret,
      username:  this.username,
      alias:     this.alias,
      corpname:  this.corpname
    });

    const baseUrl          = this.auth.getBaseUrl({corpname: this.corpname});
    const sessionSignature = this.auth.getSignatureSession({
      method:        'GET',
      sessionToken:  session.token,
      sessionSecret: session.secret,
      httpUrl:       config.CORNERSTONE_REPORTING_USER,
      dateUTC:       this.auth.getDatetimeUTC()
    });

    return await this.auth.setConnectionSession({
      baseUrl:   baseUrl,
      dateUTC:   this.auth.getDatetimeUTC(),
      token:     session.token,
      signature: sessionSignature
    });
  }

  async getUserReportingByEmail({email}) {
    const request = "?$filter=user_email eq '{email}'".replace('{email}', email);

    return await this.getReporting({request: request});
  }

  async getUserReportingByUserIdCornerstone({user_id}) {
    const request = "?$filter=user_id eq {user_id}".replace('{user_id}', user_id);

    return await this.getReporting({request: request});
  }

  async getReporting({request}) {
    this.getAuth();
    const path              = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_REPORTING_USER + request;
    const connectionSession = await this.getConnectionSession();
    const userObject        = await connectionSession.get(path);
    if (userObject.status === 200) {
      return userObject.data.value[0];
    }
    return null;
  }

}

module.exports = Cornerstone;