const chai        = require('chai');
const expect      = chai.expect;
const Cornerstone = require('@digitregroup/cornerstone-client');

// Param prod
const params = {
  apiId       : '',
  apiSecret   : '',
  corpname    : '',
  region      : '',
  dynamodbName: '',
};

const reporting_user_id    = 1;
const reporting_user_ref   = '';
const reporting_user_email = '';

const cornerstone = new Cornerstone(params);

describe('Test rest api', () => {

  it('[getEmployeeByUserId]', async() => {
    const response = await cornerstone.getEmployeeById({ userId: reporting_user_id });
    console.log(response);
    return expect(response.id).to.be.eq(reporting_user_id);
  }).timeout(10000);

  it('[getEmployeesCustomFields]', async() => {
    const response = await cornerstone.getEmployeesCustomFields({ pagenumber: 1 });
    console.log(response);
    return expect(response.userCustomFields.length).to.be.eq(50);
  }).timeout(10000);

  it('[getEmployeesCustomFieldsByUserId]', async() => {
    const response = await cornerstone.getEmployeesCustomFieldsByUserId({ user_id: reporting_user_id });
    console.log(response);
    return expect(response.id).to.be.eq(reporting_user_id);
  }).timeout(10000);

  it('[getEmployeesGroups]', async() => {
    const response = await cornerstone.getEmployeesGroups({ pagenumber: 1 });
    console.log(response);
    return expect(response.groups.length).to.be.eq(50);
  }).timeout(10000);

  it('[getEmployeesGroupsByUserId]', async() => {
    const response = await cornerstone.getEmployeesGroupsByUserId({ user_id: reporting_user_id });
    console.log(response);
    return expect(response[0].id).to.be.eq(95);
  }).timeout(10000);

  it('[getEmployeesStatus]', async() => {
    const response = await cornerstone.getEmployeesStatus();
    console.log(response);
    return expect(response.employmentStatus.length).to.be.eq(50);
  }).timeout(10000);

  it('[getEmployeeEmploymentStatus]', async() => {
    const response = await cornerstone.getEmployeeEmploymentStatus({ user_id: reporting_user_id });
    console.log(response);
    return expect(response.categoryId).to.be.eq(null);
  }).timeout(10000);

  it('[getRoster]', async() => {
    const response = await cornerstone.getRoster({ query: '?sessionLOID=2b97bb75-e590-4a56-8de1-e587373d98e0' });
    console.log(JSON.stringify(response, null, 2));
    return expect(response.length).to.be.gt(0);
  }).timeout(10000);

  it('[getCatalog]', async() => {
    const response = await cornerstone.getCatalog();
    console.log(JSON.stringify(response, null, 2));
    return expect(response.length).to.be.gt(0);
  }).timeout(10000);

  it('[getLearningData]', async() => {
    const response = await cornerstone.getLearningData({ObjectId: '852d09a3-50b8-4cab-a177-0be503f36596'});
    console.log(JSON.stringify(response, null, 2));
    return expect(response[0].trainingItem.ObjectId).to.be.eq('852d09a3-50b8-4cab-a177-0be503f36596');
  }).timeout(10000);

  it('[getLearningObjectTranscript]', async() => {
    const response = await cornerstone.getLearningObjectTranscript({ loid: '852d09a3-50b8-4cab-a177-0be503f36596' });
    console.log(JSON.stringify(response, null, 2));
    return expect(response[0].TranscriptItem.Transcripts[0].LOID).to.be.eq('852d09a3-50b8-4cab-a177-0be503f36596');
  }).timeout(10000);

  it('[updateEmployeeEmploymentStatus]', async() => {
    const response = await cornerstone.updateEmployeeEmploymentStatus(
      { id: reporting_user_id, data: { employmentStatusId: null } });
    console.log(response);
    return expect(response.status).to.be.eq('Success');
  }).timeout(10000);

  it('[updateEmployeeByUserId]', async() => {
    const response = await cornerstone.updateEmployeeByUserId(
      {
        id  : reporting_user_id,
        data: { 'customFields': [{ id: 137, name: 'Pack', value: 'Elite' }] },
      });
    console.log(response);
    return expect(response.status).to.be.eq('Success');
  }).timeout(10000);

  // it('[createEmployee]', async() => {
  //   const response = await cornerstone.createEmployee(
  //     {
  //       lastname : 'JEAN',
  //       firstname: 'Pierre',
  //       userName : 'DIGIT_12',
  //       'ous'    : [
  //         {
  //           id  : 96,
  //           ouId: 'DIGIT',
  //           name: 'Digit RE Group',
  //           type: 'Business Unit',
  //         },
  //         { id: 102, ouId: 'FICE', name: 'Fice', type: 'Site' },
  //       ],
  //     });
  //   console.log(response);
  //   return expect(response.status).to.be.eq('Success');
  // }).timeout(10000);

});
