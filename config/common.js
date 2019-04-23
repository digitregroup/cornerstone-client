require('console-stamp')(console, 'HH:MM:ss.l');
module.exports = () => {
  return {
    "MAXPAGESIZE":                                    5000,
    "TMP_PATH":                                       "../../tmp/",
    "CORNERSTONE_BASE_URL":                           "https://{corpname}.csod.com",
    "CORNERSTONE_PATH_SESSION":                       "/services/api/sts/session",
    "CORNERSTONE_PATH":                               "/services/api/x/odata/api/views/",
    "CORNERSTONE_REPORTING_USER":                     "/services/api/x/odata/api/views/vw_rpt_user",                    // Main view to getRestApi all user data
    "CORNERSTONE_REPORTING_USER_BASE":                "/services/api/x/odata/api/views/vw_rpt_user_base",               // Main view to user data
    "CORNERSTONE_REPORTING_KEYCODE":                  "/services/api/x/odata/api/views/vw_rpt_training_unit_key_code",  // Main view to getRestApi training unit key code data
    "CORNERSTONE_REPORTING_TRAINING":                 "/services/api/x/odata/api/views/vw_rpt_training",                // Main view to get training data
    "CORNERSTONE_REPORTING_TRANSCRIPT":               "/services/api/x/odata/api/views/vw_rpt_transcript",              // Main view to get all user transcript related data
    "CORNERSTONE_REPORTING_CUSTOM_FIELDS":            "/services/api/x/odata/api/views/vw_rpt_custom_field_value_local",// Main view to get all user custom fields value
    "CORNERSTONE_REPORTING_OU":                       "/services/api/x/odata/api/views/vw_rpt_ou",                      // Reporting Organizational Unit (OU) data
    "CORNERSTONE_SERVICE_EMPLOYEE":                   "/services/api/x/users/v1/employees/",                            // This end point will update and return core employee record containing bulk of the information about the employee
    "CORNERSTONE_SERVICE_KEYCODE":                    "/services/api/TrainingUnit/",                                    // Create Training Unit Assignment,
    "CORNERSTONE_SERVICE_CATALOG_SEARCH":             "/services/api/Catalog/GlobalSearch",                             // getRestApi catalog
    "CORNERSTONE_SERVICE_LEARNING_OBJECT":            "/services/api/LO/GetDetails",                                    // getRestApi learning object
    "CORNERSTONE_SERVICE_LEARNING_OBJECT_TRANSCRIPT": "/services/api/LOTranscript/TranscriptSearch",                    // getRestApi learning object transcript
    "CORNERSTONE_SERVICE_ENROLL_LO":                  "/services/api/ProxyEnroll/CreateProxyEnrollment",                // enrolls a user to an LO.
    "CORNERSTONE_SERVICE_ENROLL_LO_STATUS":           "/services/api/ProxyEnroll/ProxyEnrollmentStatus",                // enrolls status
    "CORNERSTONE_SERVICE_CUSTOM_FIELDS":              "/services/api/x/users/v1/employees/customfields",                // employee custom fields
    "CORNERSTONE_SERVICE_CUSTOM_FIELDS_BY_USER":      "/services/api/x/users/v1/employees/userid-{user_id}/customfields",// Custom fields by user_id
    "CORNERSTONE_SERVICE_GROUPS":                     "/services/api/x/users/v1/employees/groups",                      // employee groups
    "CORNERSTONE_SERVICE_GROUPS_BY_USER":             "/services/api/x/users/v1/employees/userid-{user_id}/groups",     // groups by user_id
    "CORNERSTONE_SERVICE_EMPLOYMENT_STATUS":          "/services/api/x/users/v1/employees/id-{id}/employmentstatus",     // Employment Status GET/PUT also supports different identifier types
    "CORNERSTONE_SERVICE_EMPLOYEES_STATUS":           "/services/api/x/users/v1/employees/employmentstatus",            // This API returns User type and Employee Status details for employee records
  };
};
