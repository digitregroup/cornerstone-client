const config = require('../config/common')();
const Auth   = require('./lib/Auth');


class Cornerstone {

  constructor({apiId, apiSecret, username, alias, corpname}) {
    this.apiId     = apiId;
    this.apiSecret = apiSecret;
    this.username  = username;
    this.alias     = alias;
    this.corpname  = corpname;
    this.dateTime  = this.getDatetimeUTC();
    this.auth      = null;
  }

  /**
   * Set Auth with params
   * @returns {null}
   */
  setAuth() {
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

  /**
   * Set signature for request
   * @param httpUrl
   * @param method
   * @returns {Promise<*>}
   */
  async getConnectionSession({httpUrl, method}) {

    const session = await this.auth.setSession({dateUTC: this.dateTime});

    const baseUrl = this.auth.getBaseUrl({corpname: this.corpname});
    console.log('[setConnectionSession] - baseUrl: ', baseUrl);
    console.log('[setConnectionSession] - httpUrl: ', httpUrl);

    const sessionSignature = this.auth.getSignatureSession({
      method:        method,
      sessionToken:  session.token,
      sessionSecret: session.secret,
      httpUrl:       httpUrl,
      dateUTC:       this.dateTime
    });

    console.log('[setConnectionSession] - signature: ', sessionSignature);
    return await this.auth.setConnectionSession({
      baseUrl:   baseUrl,
      dateUTC:   this.dateTime,
      token:     session.token,
      signature: sessionSignature
    });
  }

  /**
   * Main method for reporting request
   * @param request
   * @param url
   * @returns {Promise<*>}
   */
  async getReporting({request, url}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + url + request;
    console.log('[getReporting] - path: ', path);
    const connectionSession = await this.getConnectionSession({
      httpUrl: url,
      method:  'GET'
    });

    try {
      const userObject = await connectionSession.get(path);
      if (userObject.status === 200 || userObject.status === 201) {
        console.log('[getReporting] - response: ', userObject.data);
        return userObject.data.value[0];
      }
    } catch (e) {
      console.log('[getReporting] - Error:', e.response.data);
    }

    return null;
  }

  /**
   * Get reporting user by user email
   * @param email
   * @returns {Promise<*>}
   */
  async getReportingUserByEmail({email}) {

    return await this.getReporting({
      request: "?$filter=user_email eq '{email}'".replace('{email}', email),
      url:     config.CORNERSTONE_REPORTING_USER
    });
  }

  /**
   * get user reporting by user_id
   * @param user_id
   * @returns {Promise<*>}
   */
  async getReportingByUserId({user_id}) {

    return await this.getReporting({
      request: "?$filter=user_id eq {user_id}".replace('{user_id}', user_id),
      url:     config.CORNERSTONE_REPORTING_USER
    });
  }

  /**
   * Get reporting by user_ref
   * @param user_ref
   * @returns {Promise<*>}
   */
  async getReportingByUserRef({user_ref}) {

    return await this.getReporting({
      request: "?$filter=user_ref eq '{user_ref}'".replace('{user_ref}', user_ref),
      url:     config.CORNERSTONE_REPORTING_USER
    });
  }

  /**
   * Get keycode reporting by user_id
   * @param user_id
   * @returns {Promise<*>}
   */
  async getReportingKeycodeByUserId({user_id}) {

    return await this.getReporting({
      request: "?$filter=tu_contact_user_id eq {user_id}".replace('{user_id}', user_id),
      url:     config.CORNERSTONE_REPORTING_KEYCODE
    });
  }

  /**
   * Get employee reporting by user_ref
   * @param user_ref
   * @returns {Promise<*>}
   */
  async getReportingKeycodeByUserRef({user_ref}) {

    return await this.getReporting({
      request: "?$filter=tu_training_unit_key_code eq '{user_ref}'".replace('{user_ref}', user_ref),
      url:     config.CORNERSTONE_REPORTING_KEYCODE
    });
  }

  /**
   * Get employee reporting by userId
   * @param userId
   * @returns {Promise<*>}
   */
  async getEmployeeByUserId({userId}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_EMPLOYEE + 'userid-' + userId;

    console.log('[getEmployeeByUserId] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_EMPLOYEE + 'userid-' + userId,
      method:  'GET'
    });

    try {
      const userObject = await connectionSession.get(path);
      if (userObject.status === 200) {
        return userObject.data.data;
      } else {
        console.log('[getEmployeeByUserId] - Error: ', JSON.stringify(connectionSession));
      }
    } catch (e) {
      console.log('[getEmployeeByUserId] - Error: ', e)
    }

    return null;
  }

  async updateEmployeeByUserId({id, data}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_EMPLOYEE + 'id-' + id;
    console.log('[updateEmployeeByUserId] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_EMPLOYEE + 'id-' + id,
      method:  'PATCH'
    });
    console.log('[updateEmployeeByUserId] - data employee to update: ', data);

    try {
      const userObject = await connectionSession.patch(path, data);
      if (userObject.status === 200) {
        return userObject.data;
      } else {
        console.log('[getEmployeeByUserId] - Error: ', JSON.stringify(connectionSession));
      }
    } catch (e) {
      console.log('[getEmployeeByUserId] - Error: ', e.response.data)
    }

    return null;
  }

  /**
   * Set unit for key code
   * @param assignmentTitle {string} String content
   * @param amount {int}
   * @param expirationDate {date} "YYYY-MM-DD"
   * @param keyCode {string}
   * @param userId {string}
   * @param trainingUnitDetails {string}
   * @param additionalComments {string}
   * @returns {Promise<*>}
   */
  async postKeycodeUserId({assignmentTitle, amount, expirationDate, keyCode, userId, trainingUnitDetails = '', additionalComments = ''}) {
    const data = {
      "data": {
        "record": [
          {
            "AssignmentTitle": assignmentTitle,
            "ExpirationDate":  expirationDate,
            "KeyCodeDetails":  {
              "KeyCode":             keyCode,
              "ContactIds":          [
                {
                  "UserId": userId
                }
              ],
              "TrainingUnitDetails": trainingUnitDetails,
              "AdditionalComments":  additionalComments
            },
            "Availabilities":  [
              {
                "__type":      "UserAvailability:www.CornerStoneOnDemand.com/Services",
                "IncludeSubs": false,
                "Id":          keyCode,
                "Amount":      amount
              }
            ]
          }
        ]
      }
    };

    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_KEYCODE;
    console.log('[postKeycodeUserId] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_KEYCODE,
      method:  'POST'
    });
    console.log('[postKeycodeUserId] - data keycode to post: ', data);

    try {
      const userObject = await connectionSession.post(path, data);
      if (userObject.status === 200) {
        return userObject.data;
      } else {
        console.log('[postKeycodeUserId] - Error: ', JSON.stringify(connectionSession));
      }
    } catch (e) {
      console.log('[postKeycodeUserId] - Error: ', e.response.data)
    }

    return null;
  }

  /**
   * Get UTC datetime
   * @returns {string} ex: '2019-03-11T17:05:00.969'
   */
  getDatetimeUTC() {
    const dateTimeUTC = new Date().toISOString();

    return dateTimeUTC.substring(0, dateTimeUTC.length - 1);
  }

  /**
   * Get Catalog
   * @returns {Promise<*>}
   */
  async getCatalog() {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_CATALOG_SEARCH;

    console.log('[getCatalog] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_CATALOG_SEARCH,
      method:  'GET'
    });

    try {
      const catalogObject = await connectionSession.get(path);
      if (catalogObject.status === 200) {
        return catalogObject.data.data;
      } else {
        console.log('[getCatalog] - Error: ', JSON.stringify(connectionSession));
      }
    } catch (e) {
      console.log('[getCatalog] - Error: ', e.response.data)
    }

    return null;
  }
}

module.exports = Cornerstone;