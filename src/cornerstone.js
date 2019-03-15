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

  async getConnectionSession({httpUrl, method}) {
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

    const baseUrl = this.auth.getBaseUrl({corpname: this.corpname});
    console.log('[setConnectionSession] - baseUrl: ', baseUrl);
    console.log('[setConnectionSession] - httpUrl: ', httpUrl);

    const sessionSignature = this.auth.getSignatureSession({
      method:        method,
      sessionToken:  session.token,
      sessionSecret: session.secret,
      httpUrl:       httpUrl,
      dateUTC:       this.auth.getDatetimeUTC()
    });

    console.log('[setConnectionSession] - signature: ', sessionSignature);
    return await this.auth.setConnectionSession({
      baseUrl:   baseUrl,
      dateUTC:   this.auth.getDatetimeUTC(),
      token:     session.token,
      signature: sessionSignature
    });
  }

  async getReporting({request}) {
    this.getAuth();
    const path              = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_REPORTING_USER + request;
    const connectionSession = await this.getConnectionSession({httpUrl: config.CORNERSTONE_REPORTING_USER, method: 'GET'});
    const userObject        = await connectionSession.get(path);
    if (userObject.status === 200) {
      return userObject.data.value[0];
    }
    return null;
  }

  async getUserReportingByEmail({email}) {
    const request = "?$filter=user_email eq '{email}'".replace('{email}', email);

    return await this.getReporting({request: request});
  }

  async getUserReportingByUserIdCornerstone({user_id}) {
    const request = "?$filter=user_id eq {user_id}".replace('{user_id}', user_id);

    return await this.getReporting({request: request});
  }


  async getEmployeeByUserId({user_id}) {
    this.getAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_EMPLOYEE_SERVICE + 'userid-' + user_id;

    console.log('[getEmployeeByUserId] - path: ', path);

    const connectionSession = await this.getConnectionSession({httpUrl: config.CORNERSTONE_EMPLOYEE_SERVICE + 'userid-' + user_id, method: 'GET'});

    const userObject = await connectionSession.get(path);
    if (userObject.status === 200) {
      return userObject.data.data;
    }
    return null;
  }

  async updateEmployeeByUserId({id, data}) {
    this.getAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_EMPLOYEE_SERVICE + 'id-' + id;
    console.log('[updateEmployeeByUserId] - path: ', path);

    const connectionSession = await this.getConnectionSession({httpUrl: config.CORNERSTONE_EMPLOYEE_SERVICE + 'id-' + id, method: 'PATCH'});
    console.log('[updateEmployeeByUserId] - data employee to update: ', data);

    const userObject = await connectionSession.patch(path, data);

    if (userObject.status === 200) {

      return userObject.data;
    }
    return null;
  }

  clean(obj) {
    for (let propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
  }

}

module.exports = Cornerstone;