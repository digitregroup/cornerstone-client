const config = require('../config/common')();
const axios  = require('axios');
const Auth   = require('./lib/Auth');

class Cornerstone {

  constructor({ apiId, apiSecret, corpname, region = null, dynamodbName = null }) {
    this.apiId        = apiId;
    this.apiSecret    = apiSecret;
    this.corpname     = corpname;
    this.auth         = null;
    this.region       = region;
    this.dynamodbName = dynamodbName;
    this.client       = null;
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
      apiId       : this.apiId,
      apiSecret   : this.apiSecret,
      corpname    : this.corpname,
      region      : this.region,
      dynamodbName: this.dynamodbName,
    });

    return this.auth;
  }

  getHeaders(scope) {
    return {
      headers: {
        'Authorization': 'Bearer ' + this.auth.accessToken[scope].accessToken,
        'cache-control': 'no-cache',
        'Accept'       : 'application/json',
        'Content-Type' : 'application/json',
        'prefer'       : 'odata.maxpagesize=20000',
      },
    };
  }

  /**
   * REPORTING - Main method for request reporting
   * @param {string} request
   * @param {string} url
   * @returns {Promise<*>}
   */
  async getReporting({ params, slug, scope }) {
    await this.setAuth().getAccessToken({ scope: scope });
    const fullUrl = `https://${this.corpname}.csod.com` + slug + params;

    try {
      const response = await axios.get(fullUrl, this.getHeaders(scope));
      if (response.status === 200 || response.status === 201) {
        return response.data.value;
      }

    } catch (error) {
      console.log('[getReporting] - Error:', error);
      throw new Error(JSON.stringify(error, null, 2));
    }
    return null;
  }

  async getRestApi({ slug, scope }) {
    await this.setAuth().getAccessToken({ scope: scope });
    const fullUrl = `https://${this.corpname}.csod.com` + slug;

    try {
      const response = await axios.get(fullUrl, this.getHeaders(scope));
      if (response.status === 200 || response.status === 201) {
        return response.data.data;
      }

    } catch (error) {
      console.log('[getRestApi] - Error:', error);
      throw new Error(JSON.stringify(error, null, 2));
    }
    return null;
  }

  async patchRestApi({ slug, scope, data }) {
    await this.setAuth().getAccessToken({ scope: scope });
    const fullUrl = `https://${this.corpname}.csod.com` + slug;

    try {
      const response = await axios.patch(fullUrl, data, this.getHeaders(scope));
      if (response.status === 204 || response.status === 200) {
        return { status: 'Success' };
      }

    } catch (error) {
      console.log('[patchRestApi] - Error:', error);
      throw new Error(JSON.stringify(error, null, 2));
    }
    return null;
  }

  async postRestApi({ slug, scope, data }) {
    await this.setAuth().getAccessToken({ scope: scope });
    const fullUrl = `https://${this.corpname}.csod.com` + slug;

    try {
      const response = await axios.post(fullUrl, data, this.getHeaders(scope));
      if (response.status === 204 || response.status === 200) {
        return { status: 'Success' };
      }

    } catch (error) {
      console.log('[postRestApi] - Error:', error);
      throw new Error(JSON.stringify(error, null, 2));
    }
    return null;
  }

  /**
   * REPORTING - Get all user data reporting with email
   * Return see src/models/wp_rpt_user.json
   * @param {string} email
   * @returns {Promise<*>}
   */
  async getReportingUserByEmail({ email }) {

    return await this.getReporting({
      params: '?$filter=user_email eq \'{email}\''.replace('{email}', email),
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_USER,
      scope : config.CORNERSTONE_REPORTING_USER + ':read',
    });
  }

  /**
   * REPORTING - Get all user data reporting by user_id
   * Return see src/models/wp_rpt_user.json
   * @param {int} user_id
   * @returns {Promise<*>}
   */
  async getReportingByUserId({ user_id }) {

    return await this.getReporting({
      params: '?$filter=user_id eq {user_id}'.replace('{user_id}', user_id),
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_USER,
      scope : config.CORNERSTONE_REPORTING_USER + ':read',
    });
  }

  /**
   * REPORTING - Get all user data reporting by user_ref
   * Return see src/models/wp_rpt_user.json
   * @param {string} user_ref
   * @returns {Promise<*>}
   */
  async getReportingByUserRef({ user_ref }) {

    return await this.getReporting({
      params: '?$filter=user_ref eq \'{user_ref}\''.replace('{user_ref}', user_ref),
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_USER,
      scope : config.CORNERSTONE_REPORTING_USER + ':read',
    });
  }

  /**
   * REPORTING - Get all active users
   * @returns {Promise<*>}
   */
  async getAllActiveUsers() {

    return await this.getReporting({
      params: '?$filter=user_status_id eq 1&$select=user_id, user_email, user_ref',
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_USER,
      scope : config.CORNERSTONE_REPORTING_USER + ':read',
    });
  }

  /**
   * REPORTING - make custom request
   * @param {string} query
   * @param {string} slug
   * @returns {Promise<*>}
   */
  async getCustomReporting({ query, slug }) {

    return await this.getReporting({
      params: query,
      slug  : config.CORNERSTONE_PATH + slug,
      scope : slug + ':read',
    });
  }

  /**
   * REPORTING - Main view to get training unit key code data with user_id
   * Return see src/models/vw_rpt_training_unit_key_code.json
   * @param {int} user_id
   * @returns {Promise<*>}
   */
  async getReportingKeycodeByUserId({ user_id }) {

    return await this.getReporting({
      params: '?$filter=tu_contact_user_id eq {user_id}'.replace('{user_id}', user_id),
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_KEYCODE,
      scope : config.CORNERSTONE_REPORTING_KEYCODE + ':read',
    });
  }

  /**
   * REPORTING - Organizational Unit (OU) data
   * @returns {Promise<*>}
   */
  async getReportingOu() {

    return await this.getReporting({
      params: '',
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_OU,
      scope : config.CORNERSTONE_REPORTING_OU + ':read',
    });
  }

  /**
   * REPORTING - Main view to get training unit key code data with user_iduser_ref
   * Return see src/models/vw_rpt_training_unit_key_code.json
   * @param {string} user_ref
   * @returns {Promise<*>}
   */
  async getReportingKeycodeByUserRef({ user_ref }) {

    return await this.getReporting({
      params: '?$filter=tu_training_unit_key_code eq \'{user_ref}\''.replace('{user_ref}', user_ref),
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_KEYCODE,
      scope : config.CORNERSTONE_REPORTING_KEYCODE + ':read',
    });
  }

  /**
   * REPORTING - Main view to get training data by date start
   * Return see src/models/vw_rpt_training.json
   * @param {string} dateStart YYYY-MM-DD
   * @returns {Promise<*>}
   */
  async getReportingTraining({ dateStart }) {

    return await this.getReporting({
      params: `?$filter=lo_start_dt gt cast('${dateStart}', Edm.DateTimeOffset)`,
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_TRAINING,
      scope : config.CORNERSTONE_REPORTING_TRAINING + ':read',
    });
  }

  /**
   * @param {string} objectId
   * @returns {Promise<*>}
   */
  async getReportingTranscriptByObjectId({ objectId }) {

    return await this.getReporting({
      params: `?$filter=transc_object_id eq ${objectId}`,
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_TRANSCRIPT,
      scope : config.CORNERSTONE_REPORTING_TRANSCRIPT + ':read',
    });
  }

  /**
   * REPORTING - Main view to get custom field dropdow values by id custom field
   * Return see src/models/vw_rpt_transcript.json
   * @param {Number} id custom field id, ex : Pack = 137
   * @returns {Promise<*>}
   */
  async getReportingCustomfieldsById({ id }) {

    return await this.getReporting({
      params: `?$filter=cfvl_field_id eq ${id} and culture_id eq 33`,
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_CUSTOM_FIELDS,
      scope : config.CORNERSTONE_REPORTING_CUSTOM_FIELDS + ':read',
    });
  }

  /**
   * REPORTING - Main view to get all custom fields dropdow value
   * Return see src/models/vw_rpt_transcript.json
   * @returns {Promise<*>}
   */
  async getReportingCustomfields() {

    return await this.getReporting({
      params: `?$filter=culture_id eq 33`,
      slug  : config.CORNERSTONE_PATH + config.CORNERSTONE_REPORTING_CUSTOM_FIELDS,
      scope : config.CORNERSTONE_REPORTING_CUSTOM_FIELDS + ':read',
    });
  }

  /**
   * REST - Returns the core Employee record containing bulk of the information about the Employee.
   * @param {Number} userId Valid User id, Cornerstone Internal Integer Id
   * @returns {Promise<*>}
   */
  async getEmployeeById({ userId }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_EMPLOYEE + userId,
      scope: 'employee:read',
    });
  }

  /**
   * REST - This service returns custom fields data for employees.
   * @param {int} pagenumber
   * @returns {Promise<*>}
   */
  async getEmployeesCustomFields({ pagenumber }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_CUSTOM_FIELDS + '?pagenumber=' + pagenumber,
      scope: 'employee:read',
    });
  }

  /**
   * REST - This service returns custom fields data by user_id employees.
   * @param {Number} user_id
   * @returns {Promise<*>}
   */
  async getEmployeesCustomFieldsByUserId({ user_id }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_CUSTOM_FIELDS_BY_USER.replace('{user_id}', user_id),
      scope: 'employee:read',
    });
  }

  /**
   * REST - This API returns employees and the groups in their employee profile.
   * @param {number} pagenumber
   * @returns {Promise<*>}
   */
  async getEmployeesGroups({ pagenumber }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_GROUPS + '?pagenumber=' + pagenumber,
      scope: 'employee:read',
    });
  }

  /**
   * REST - This API returns employees and the groups  by user_id employees.
   * @param {number} user_id
   * @returns {Promise<*>}
   */
  async getEmployeesGroupsByUserId({ user_id }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_GROUPS_BY_USER.replace('{user_id}', user_id),
      scope: 'group:read',
    });
  }

  /**
   * REST - This API returns User type and Employee Status details for employee records
   * @returns {Promise<*>}
   */
  async getEmployeesStatus() {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_EMPLOYEES_STATUS,
      scope: 'employee:read',
    });
  }

  /**
   * REST - Employment Status GET/PUT also supports different identifier types
   * @param {number} user_id
   * @returns {Promise<*>}
   */
  async getEmployeeEmploymentStatus({ user_id }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_EMPLOYMENT_STATUS.replace('{id}', user_id),
      scope: 'employee:read',
    });
  }

  /**
   * REST - Employment Status
   * @param {number} id User id, Cornerstone Internal Integer Id
   * @param {object} data
   * @returns {Promise<*>}
   */
  async updateEmployeeEmploymentStatus({ id, data }) {
    return await this.patchRestApi({
      slug : config.CORNERSTONE_SERVICE_EMPLOYMENT_STATUS.replace('{id}', id),
      scope: 'employee:updatepartial',
      data : data,
    });
  }

  /**
   * REST - This end point will update core employee record
   * @param {int} id User id, Cornerstone Internal Integer Id
   * @param {object} data See src/models/employee.json
   * @returns {Promise<*>}
   */
  async updateEmployeeByUserId({ id, data }) {
    return await this.patchRestApi({
      slug : config.CORNERSTONE_SERVICE_EMPLOYEE + id,
      scope: 'employee:updatepartial',
      data : data,
    });
  }

  /**
   * Fondational Apis - getRoster
   * @param {string} query path
   * @param {string} query sessionLOID / sessionNumber / locator / status
   * @returns {Promise<*>}
   */
  async getRoster({ query }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SESSION_ROSTER + query,
      scope: 'sessionroster:read',
    });
  }

  /**
   * REST - This end point will create employee record
   * @param {string} userName
   * @param {string} firstname
   * @param {string} lastname
   * @param {string|null} userId
   * @param {object} OU site and BU
   * @returns {Promise<null|*>}
   */
  async createEmployee({ userName, firstname, lastname, ous, userId = null }) {
    return await this.postRestApi({
      slug : config.CORNERSTONE_SERVICE_EMPLOYEE,
      scope: 'employee:create',
      data : {
        userName : userName,
        firstname: firstname,
        lastname : lastname,
        userId   : userId,
        ous      : ous,
      },
    });
  }

  /**
   * REST - The purpose of the Catalog Search web service is to search & retrieve training data
   * Return all catalog
   * @returns {Promise<*>}
   */
  async getCatalog() {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_CATALOG_SEARCH,
      scope: 'training:read',
    });
  }

  /**
   * REST - The Get Details operation allows the ability for an active user to drill down and obtain
   * a learning object’s (LO’s) standard and custom field data.
   * {ObjectId} The Cornerstone generated Learning Object ID (LO ID).
   * @returns {Promise<*>}
   */
  async getLearningData({ ObjectId }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_LEARNING_OBJECT + '?ObjectId=' + ObjectId,
      scope: 'training:read',
    });
  }

  /**
   * REST - The Transcript Search web service gives you the ability to retrieve users’ transcript information
   * from the Cornerstone Learning Management System (LMS).
   * {LOID} Learning Object (LO) Type that need to be retrieved.
   * @returns {Promise<*>}
   */
  async getLearningObjectTranscript({ loid }) {
    return await this.getRestApi({
      slug : config.CORNERSTONE_SERVICE_LEARNING_OBJECT_TRANSCRIPT + '?LOID=' + loid,
      scope: 'transcript:read',
    });
  }

  /**
   * REST - Enrolls users to a Learning Object (LO)
   * @param {string} Learning Object (LO)
   * @returns {Promise<*>}
   */
  // async postEnrollUserToAnlearningObject({ loid, userId }) {
  //   const data = {
  //     'data': {
  //       'record': [
  //         {
  //           'Training'              : [
  //             {
  //               'LOID': loid,
  //             },
  //           ],
  //           'ProxyType'             : 'Standard',
  //           'ForceEnrollment'       : false,
  //           'AssignmentStatus'      : 'Complete',
  //           'Availabilities'        : [
  //             {
  //               '__type'              : 'UserAvailability:www.CornerStoneOnDemand.com/Services',
  //               'IncludeSubs'         : false,
  //               'PreApproved'         : true,
  //               'RegisterUponApproval': true,
  //               'Id'                  : userId,
  //             },
  //           ],
  //           'EmailConfiguration'    : 'NoEmails',
  //           'ManageSeatAvailability': 'IncreaseAvailableSeats',
  //           'Comment'               : 'Added by api',
  //         },
  //       ],
  //     },
  //   };
  //
  //   return await this.postRestApi({
  //     slug : config.CORNERSTONE_SERVICE_EMPLOYEE,
  //     scope: 'employee:create',
  //     data : data,
  //   });
  // }

  /**
   * REST - Services for Session Roster
   * The purpose of this web service is to allow clients, in real time, to update the session attendance roster as well as complete the session.
   * @param {String} Learning Object (LO)
   * @param {String} userId
   * @param {String} actorId of Admin/Manager submitting the roster/updating attendance
   * @returns {Promise<*>}
   */
  // async postSessionRoster({ loid, userId, actorId }) {
  //   const data = {
  //     'data': {
  //       'record': [
  //         {
  //           'SessionLOID'  : loid,
  //           'Users'        : [
  //             {
  //               'UserID': userId,
  //               'Score' : 20,
  //             },
  //           ],
  //           'SessionStatus': 'Completed',
  //           'ActorID'      : actorId,
  //         },
  //       ],
  //     },
  //   };
  //  
  //   return await this.postRestApi({
  //     slug : config.CORNERSTONE_SERVICE_SESSION_ROSTER,
  //     scope: 'sessionroster:create',
  //     data : data,
  //   });
  // }
}

module.exports = Cornerstone;
