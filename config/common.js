require('console-stamp')(console, 'HH:MM:ss.l');
module.exports = () => {
  return {
    "TMP_PATH":                     "tmp/",
    "CORNERSTONE_BASE_URL":         "https://{corpname}.csod.com",
    "CORNERSTONE_PATH_SESSION":     "/services/api/sts/session",
    "CORNERSTONE_REPORTING_USER":   "/services/api/x/odata/api/views/vw_rpt_user",  // Main view to get all user data
    "CORNERSTONE_EMPLOYEE_SERVICE": "/services/api/x/users/v1/employees/" // This end point will update and return core employee record containing bulk of the information about the employee
  };

};