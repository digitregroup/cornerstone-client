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
   * @returns {Auth}
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
   * @param {string} httpUrl
   * @param {string} method http
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
   * REPORTING - Main method for request reporting
   * @param {string} request
   * @param {string} url
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
      const response = await connectionSession.get(path);
      if (response.status === 200 || response.status === 201) {
        console.log('[getReporting] - response: ', response.data);
        return response.data.value;
      }
    } catch (e) {
      console.log('[getReporting] - Error:', e.response.data);
    }
    return null;
  }

  /**
   * REPORTING - Get all user data reporting with email
   * Return see src/models/wp_rpt_user.json
   * @param {string} email
   * @returns {Promise<*>}
   */
  async getReportingUserByEmail({email}) {

    return await this.getReporting({
      request: "?$filter=user_email eq '{email}'".replace('{email}', email),
      url:     config.CORNERSTONE_REPORTING_USER
    });
  }

  /**
   * REPORTING - Get all user data reporting by user_id
   * Return see src/models/wp_rpt_user.json
   * @param {int} user_id
   * @returns {Promise<*>}
   */
  async getReportingByUserId({user_id}) {

    return await this.getReporting({
      request: "?$filter=user_id eq {user_id}".replace('{user_id}', user_id),
      url:     config.CORNERSTONE_REPORTING_USER
    });
  }

  /**
   * REPORTING - Get all user data reporting by user_ref
   * Return see src/models/wp_rpt_user.json
   * @param {string} user_ref
   * @returns {Promise<*>}
   */
  async getReportingByUserRef({user_ref}) {

    return await this.getReporting({
      request: "?$filter=user_ref eq '{user_ref}'".replace('{user_ref}', user_ref),
      url:     config.CORNERSTONE_REPORTING_USER
    });
  }

  /**
   * REPORTING - make custom request
   * @param {string} path
   * @param {string} query
   * @returns {Promise<*>}
   */
  async getCustomReporting({path, query}) {

    return await this.getReporting({
      request: query,
      url:     config.CORNERSTONE_PATH + path
    });
  }


  /**
   * REPORTING - Main view to get training unit key code data with user_id
   * Return see src/models/vw_rpt_training_unit_key_code.json
   * @param {int} user_id
   * @returns {Promise<*>}
   */
  async getReportingKeycodeByUserId({user_id}) {

    return await this.getReporting({
      request: "?$filter=tu_contact_user_id eq {user_id}".replace('{user_id}', user_id),
      url:     config.CORNERSTONE_REPORTING_KEYCODE
    });
  }

  /**
   * REPORTING - Organizational Unit (OU) data
   * @returns {Promise<*>}
   */
  async getReportingOu() {

    return await this.getReporting({
      request: "",
      url:     config.CORNERSTONE_REPORTING_OU
    });
  }

  /**
   * REPORTING - Main view to get training unit key code data with user_iduser_ref
   * Return see src/models/vw_rpt_training_unit_key_code.json
   * @param {string} user_ref
   * @returns {Promise<*>}
   */
  async getReportingKeycodeByUserRef({user_ref}) {

    return await this.getReporting({
      request: "?$filter=tu_training_unit_key_code eq '{user_ref}'".replace('{user_ref}', user_ref),
      url:     config.CORNERSTONE_REPORTING_KEYCODE
    });
  }

  /**
   * REPORTING - Main view to get training data by date start
   * Return see src/models/vw_rpt_training.json
   * @param {string} dateStart YYYY-MM-DD
   * @returns {Promise<*>}
   */
  async getReportingTraining({dateStart}) {

    return await this.getReporting({
      request: `?$filter=lo_start_dt gt cast('${dateStart}', Edm.DateTimeOffset)`,
      url:     config.CORNERSTONE_REPORTING_TRAINING
    });
  }

  /**
   * REPORTING - Main view to get all user transcript related data
   * Return see src/models/vw_rpt_transcript.json
   * @param {string} dateStart YYYY-MM-DD
   * @returns {Promise<*>}
   */
  async getReportingTranscriptByObjectId({objectId}) {

    return await this.getReporting({
      request: `?$filter=transc_object_id eq ${objectId}`,
      url:     config.CORNERSTONE_REPORTING_TRANSCRIPT
    });
  }

  /**
   * REPORTING - Main view to get custom field dropdow values by id custom field
   * Return see src/models/vw_rpt_transcript.json
   * @param {int} custom field id, ex : Pack = 137
   * @returns {Promise<*>}
   */
  async getReportingCustomfieldsById({id}) {

    return await this.getReporting({
      request: `?$filter=cfvl_field_id eq ${id} and culture_id eq 33`,
      url:     config.CORNERSTONE_REPORTING_CUSTOM_FIELDS
    });
  }

  /**
   * REPORTING - Main view to get all custom fields dropdow value
   * Return see src/models/vw_rpt_transcript.json
   * @returns {Promise<*>}
   */
  async getReportingCustomfields() {

    return await this.getReporting({
      request: `?$filter=culture_id eq 33`,
      url:     config.CORNERSTONE_REPORTING_CUSTOM_FIELDS
    });
  }

  /**
   * REPORTING - Main method for REST request
   * @param {Axios} connectionSession
   * @param {string} path
   * @returns {Promise<*>}
   */
  async getRestApi({connectionSession, path}) {
    try {
      const response = await connectionSession.get(path);
      if (response.status === 200) {
        return response.data.data;
      } else {
        console.log('[getRestApi] - Error: ', JSON.stringify(connectionSession));
      }
    } catch (e) {
      console.log('[getRestApi] - Error: ', e.response.data)
    }

    return null;
  }

  /**
   * REST - Returns the core Employee record containing bulk of the information about the Employee.
   * @param {string} userId Valid User id, Cornerstone Internal Integer Id
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

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - This service returns custom fields data for employees.
   * @param {int} pagenumber
   * @returns {Promise<*>}
   */
  async getEmployeesCustomFields({pagenumber}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_CUSTOM_FIELDS + '?pagenumber=' + pagenumber;
    console.log('[getEmployeesCustomFields] - path: ', path);
    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_CUSTOM_FIELDS,
      method:  'GET'
    });

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - This service returns custom fields data by user_id employees.
   * @param {string} user_id
   * @returns {Promise<*>}
   */
  async getEmployeesCustomFieldsByUserId({user_id}) {
    this.setAuth();

    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_CUSTOM_FIELDS_BY_USER.replace('{user_id}', user_id);
    console.log('[getEmployeesCustomFieldsByUserId] - path: ', path);
    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_CUSTOM_FIELDS_BY_USER.replace('{user_id}', user_id),
      method:  'GET'
    });

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - This API returns employees and the groups in their employee profile.
   * @param {int} pagenumber
   * @returns {Promise<*>}
   */
  async getEmployeesGroups({pagenumber}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_GROUPS + '?pagenumber=' + pagenumber;
    console.log('[getEmployeesGroups] - path: ', path);
    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_GROUPS,
      method:  'GET'
    });

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - This API returns employees and the groups  by user_id employees.
   * @param {string} user_id
   * @returns {Promise<*>}
   */
  async getEmployeesGroupsByUserId({user_id}) {
    this.setAuth();

    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_GROUPS_BY_USER.replace('{user_id}', user_id);
    console.log('[getEmployeesGroupsByUserId] - path: ', path);
    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_GROUPS_BY_USER.replace('{user_id}', user_id),
      method:  'GET'
    });

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - This end point will update core employee record
   * @param {int} id User id, Cornerstone Internal Integer Id
   * @param {object} data See src/models/employee.json
   * @returns {Promise<*>}
   */
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
   * REST - This end point will create employee record
   * @param {string} userName
   * @param {string} firstname
   * @param {string} lastname
   * @param {object} OU site and BU
   * @returns {Promise<null|*>}
   */
  async createEmployee({userName, firstname, lastname, ous}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_EMPLOYEE;
    console.log('[createEmployee] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_EMPLOYEE,
      method:  'POST'
    });
    console.log('[createEmployee] - data to create employee: ', userName, firstname, lastname, ous);

    try {
      const userObject = await connectionSession.post(path, {userName: userName, firstname: firstname, lastname: lastname, ous: ous});
      if (userObject.status === 200) {
        return userObject.data;
      } else {
        console.log('[createEmployee] - Error: ', JSON.stringify(connectionSession));
      }
    } catch (e) {
      console.log('[createEmployee] - Error: ', e.response.data)
    }

    return null;
  }

  /**
   * REST - Create Training Unit Assignment
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
   * REST - The purpose of the Catalog Search web service is to search & retrieve training data
   * Return all catalog
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

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - The Get Details operation allows the ability for an active user to drill down and obtain
   * a learning object’s (LO’s) standard and custom field data.
   * {ObjectId} The Cornerstone generated Learning Object ID (LO ID).
   * @returns {Promise<*>}
   */
  async getLearningData({ObjectId}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_LEARNING_OBJECT + '?ObjectId=' + ObjectId;
    console.log('[getCatalog] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_LEARNING_OBJECT,
      method:  'GET'
    });

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - The Transcript Search web service gives you the ability to retrieve users’ transcript information
   * from the Cornerstone Learning Management System (LMS).
   * {LOID} Learning Object (LO) Type that need to be retrieved.
   * @returns {Promise<*>}
   */
  async getLearningObjectTranscript({LOID}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_LEARNING_OBJECT_TRANSCRIPT + '?LOID=' + LOID;
    console.log('[getLearningObjectTranscript] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_LEARNING_OBJECT_TRANSCRIPT,
      method:  'GET'
    });

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }

  /**
   * REST - Enrolls users to a Learning Object (LO)
   * @param {LOID} Learning Object (LO)
   * @returns {Promise<*>}
   */
  async postEnrollUserToAnlearningObject({LOID, userId}) {
    const data = {
      "data": {
        "record": [
          {
            "Training":               [
              {
                "LOID": LOID
              }
            ],
            "ProxyType":              "Standard",
            "ForceEnrollment":        false,
            "AssignmentStatus":       "Approve",
            "Availabilities":         [
              {
                "__type":               "UserAvailability:www.CornerStoneOnDemand.com/Services",
                "IncludeSubs":          false,
                "PreApproved":          true,
                "RegisterUponApproval": false,
                "Id":                   userId
              }
            ],
            "EmailConfiguration":     "NoEmails",
            "ManageSeatAvailability": "IncreaseAvailableSeats"
          }
        ]
      }
    };

    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_ENROLL_LO;
    console.log('[postEnrollUserToAnlearningObject] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_ENROLL_LO,
      method:  'POST'
    });
    console.log('[postEnrollUserToAnlearningObject] - data: ', data);

    try {
      const userObject = await connectionSession.post(path, data);
      if (userObject.status === 200) {
        return userObject.data;
      } else {
        console.log('[postEnrollUserToAnlearningObject] - Error: ', JSON.stringify(connectionSession));
      }
    } catch (e) {
      console.log('[postEnrollUserToAnlearningObject] - Error: ', e.response.data)
    }

    return null;
  }

  /**
   * REST - The Proxy Enrollment Status web service gets proxy enrollment statuses based on a given date range.
   * @param {string} fromDate YYYY-MM-DD
   * @param {string} toDate YYYY-MM-DD
   * @returns {Promise<*>}
   */
  async getEnrollStatus({fromDate, toDate}) {
    this.setAuth();
    const path = this.auth.getBaseUrl({corpname: this.corpname}) + config.CORNERSTONE_SERVICE_ENROLL_LO_STATUS
      + `?FromDate=${fromDate}&ToDate=${toDate}`;
    console.log('[getLearningObjectTranscript] - path: ', path);

    const connectionSession = await this.getConnectionSession({
      httpUrl: config.CORNERSTONE_SERVICE_ENROLL_LO_STATUS,
      method:  'GET'
    });

    return this.getRestApi({connectionSession: connectionSession, path: path})
  }
}

module.exports = Cornerstone;