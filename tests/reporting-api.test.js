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

describe('Test reporting api', () => {
  it('[GetAllActiveUsers]', async() => {
    const response = await cornerstone.getAllActiveUsers();
    console.log(response);
    return expect(response.length).to.be.gt(5000);
  }).timeout(10000);

  it('[getReportingUserByEmail]', async() => {
    const response = await cornerstone.getReportingUserByEmail({ email: reporting_user_email });
    console.log(response);
    return expect(response[0].user_email).to.be.eql(reporting_user_email);
  }).timeout(10000);

  it('[getReportingByUserId]', async() => {
    const response = await cornerstone.getReportingByUserId({ user_id: reporting_user_id });
    console.log(response);
    return expect(response[0].user_id).to.be.eql(reporting_user_id);
  }).timeout(10000);

  it('[getReportingByUserRef]', async() => {
    const response = await cornerstone.getReportingByUserRef({ user_ref: reporting_user_ref });
    console.log(response);
    return expect(response[0].user_ref).to.be.eql(reporting_user_ref);
  }).timeout(10000);

  it('[getCustomReporting]', async() => {
    const response = await cornerstone.getCustomReporting(
      { query: '?$filter=lo_object_id eq d83c81e2-9c64-43cc-bedf-a0069e2a69e1', slug: 'vw_rpt_training' });
    console.log(response);
    return expect(response[0].lo_object_id).to.be.eql('d83c81e2-9c64-43cc-bedf-a0069e2a69e1');
  }).timeout(10000);

  it('[getReportingKeycodeByUserId]', async() => {
    const response = await cornerstone.getReportingKeycodeByUserId({ user_id: reporting_user_id });
    console.log(response);
    return expect(response[0].tu_contact_user_id).to.be.eql(reporting_user_id);
  }).timeout(10000);

  it('[getReportingOu]', async() => {
    const response = await cornerstone.getReportingOu();
    console.log(response);
    return expect(response.length).to.be.gt(1000);
  }).timeout(10000);

  it('[getReportingKeycodeByUserRef]', async() => {
    const response = await cornerstone.getReportingKeycodeByUserRef({user_ref: reporting_user_ref});
    console.log(response);
    return expect(response[0].tu_training_unit_key_code).to.be.eq(reporting_user_ref);
  }).timeout(10000);

  it('[getReportingTraining]', async() => {
    const response = await cornerstone.getReportingTraining({dateStart: '2020-12-12'});
    console.log(response);
    return expect(response.length).to.be.gt(50);
  }).timeout(10000);

  it('[getReportingTranscriptByObjectId]', async() => {
    const response = await cornerstone.getReportingTranscriptByObjectId(
      { objectId: 'd83c81e2-9c64-43cc-bedf-a0069e2a69e1' });
    console.log(response);
    return expect(response[0].transc_object_id).to.be.eq('d83c81e2-9c64-43cc-bedf-a0069e2a69e1');
  }).timeout(10000);

  it('[getReportingCustomfieldsById]', async() => {
    const response = await cornerstone.getReportingCustomfieldsById({id: 137});
    console.log(response);
    return expect(response.length).to.be.gt(10);
  }).timeout(10000);

  it('[getReportingCustomfields]', async() => {
    const response = await cornerstone.getReportingCustomfields();
    console.log(response);
    return expect(response.length).to.be.gt(10);
  }).timeout(10000);

});
