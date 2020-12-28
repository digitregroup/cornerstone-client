# Cornerstone client API

## Description
It's an api client to request Cornerstone REST Services and Reporting Services.
 * Documentation [apiexplorer.csod.com](http://apiexplorer.csod.com/apiconnectorweb/apiexplorer#/)
 * There are several  examples in repository ```test/```
 * Be careful, userid, id and many more have different value in Reporting and REST for the same user and same key

## Reporting API
The Reporting API is a public facing web service that allows clients programmatic read-only access to their Cornerstone data via the Realtime Data Warehouse. It adheres to the OData protocol (http://www.odata.org/)
 * [Reporting API Starter Guide_v1.4](documentation/ReportingAPIStarterGuide_v1.4.pdf)
 * [Api documentation](documentation/api_doc.pdf)

###
There are some use cases in tests repository.

 * tests/reporting-api.test.js
 * tests/rest-api.test.js


### How to use
```
const params = {
    apiId:          Api Id, can be retrieved within the Manage API tab in Integration Center.
    apiSecret:      Api Secret, can be retrieved within the Manage API tab in Integration Center.
    corpname:       Client assigned hostname for CSOD application
    region:         Aws-region,
    dynamodbName:   Aws dynamodb,
};

const cornerstone = new Cornerstone(params);

const user = await cornerstone.getReportingUserByEmail({email: reporting_user_email});

```

### Queries
URL Option              | Syntax                                                           | Description
----------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------
Get Available Resources | {baseURL}/views                                                  | This call returns a list of available resources (views).
Get Metadata            | {baseURL}/views/$metadata                                        | This call returns a list of resources and their meta-data. **This call returns XML instead of JSON******
Get Specific Resource   | {baseURL}/views/vw_rpt_user                                      | Returns detail payload for specific resource.
Select                  | {baseURL}/views/vw_rpt_user?$select={comma separated field list} | Returns detail payload for specific selected fields for resource.
Filter                  | {baseURL}/views/vw_rpt_user?$filter={query filter}               | Returns specific data as per filter value for resource. Odata standards should be followed for operator types
Top                     | {baseURL}/views/vw_rpt_user?$top={max records}                   | Limits the number of records returned by the query.

### Filter Supported Operators
URL Option            | Syntax
--------------------- | ----------------------------------------------------------------------------------------------------------------------
Equals                | {baseURL}/views/vw_rpt_user?$filter=user_id eq 78
Not Equals            | {baseURL}/views/vw_rpt_user?$filter=user_id ne 78
Greater Than          | {baseURL}/views/vw_rpt_user?$filter=user_lo_last_action_dt gt cast('2016-08-16', Edm.DateTimeOffset)
Greater Than or Equal | {baseURL}/views/vw_rpt_user?$filter=user_lo_last_action_dt ge cast('2016-08-16', Edm.DateTimeOffset)
Less Than             | {baseURL}/views/vw_rpt_user?$filter=user_lo_last_action_dt lt cast('2016-08-16', Edm.DateTimeOffset)
Less Than or Equal    | {baseURL}/views/vw_rpt_user?$filter=user_lo_last_action_dt le cast('2016-08-16', Edm.DateTimeOffset)
Logical 'AND'         | {baseURL}/views/vw_rpt_user?$filter=user_lo_last_action_dt le cast('2016-08-16', Edm.DateTimeOffset) and user_id eq 78
Logical 'OR'          | {baseURL}/views/vw_rpt_user?$filter=user_lo_last_action_dt le cast('2016-08-16', Edm.DateTimeOffset) or user_id eq 78
Logical 'NOT'         | {baseURL}/views/vw_rpt_user?$filter=not (user_id eq 78)

## REST API
The REST API allows programmatic access to the REST record within the Cornerstone application. This service enables clients to create, update, and read REST data.
 * [EmployeeAPIStarterGuide](documentation/EmployeeAPIStarterGuide.pdf)
 * Go to the REST documentation online for description [apiexplorer.csod.com](http://apiexplorer.csod.com/apiconnectorweb/apiexplorer#/)
### How to use
```
const params = {
apiId:     Api Id, can be retrieved within the Manage API tab in Integration Center.
apiSecret: Api Secret, can be retrieved within the Manage API tab in Integration Center.
username: A valid username in the portal.
alias: An arbitrary title for your session.
corpname: Client assigned hostname for CSOD application
};

const cornerstone = new Cornerstone(params);

const user = await cornerstone.updateEmployeeByUserId({
    id: rest_id,
    data: {"personalEmail": rest_email}
});

const user = await cornerstone.getEmployeeByUserId({userId: rest_userId});
```

### Set Active or inactive
```javascript
const user = await cornerstone.updateEmployeeByUserId({
    id:   2328,
    data : {"workerStatus":{active: true}}
});
```
active = user_status_id = 1
inActive = user_status_id = 2