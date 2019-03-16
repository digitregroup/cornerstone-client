const chai        = require('chai');
const expect      = chai.expect;
const config      = require('../config/common')();
const Auth        = require('../src/lib/Auth');
const Cornerstone = require('../src/cornerstone');
const employee    = require('../src/models/employee');

const params = {
  apiId:     '',
  apiSecret: '',
  username:  '',
  alias:     '',
  corpname:  ''
};

// params prod
const test_reporting_user_id    = 0;
const test_reporting_user_ref   = '';
const test_reporting_user_email = '';

const test_rest_id                 = 0;
const test_rest_userId             = '';
const test_signature_result        = '';
const test_signatureSession_result = '';
const test_keycodeId               = '';

const cornerstone = new Cornerstone(params);

describe('Test signatures', () => {
  it('[getSignature] - It should be true', () => {
    const auth      = new Auth(params);
    const signature = auth.getSignature({
      httpUrl:  config.CORNERSTONE_PATH_SESSION,
      dateTime: '2019-03-12T13:54:27.000'
    });

    return expect(signature).to.be.eql(test_signature_result);
  });

  it('[getSessionSignature] - It should be true', () => {
    const auth             = new Auth(params);
    const sessionSignature = auth.getSignatureSession({
      method:        'GET',
      sessionToken:  's1xi67fv0hh3',
      sessionSecret: 'h6OrNw+XNR+OOrSZZk0FqZaVQ9O1JzZEY/d9CWNXJmqDfnWgxOhJZdXMXPGqr3R3JAo42dpWFu7X0aaFtnOAWw==',
      httpUrl:       config.CORNERSTONE_REPORTING_USER,
      dateTime:      '2019-03-12T16:19:28.889'
    });
    console.log(sessionSignature);
    return expect(sessionSignature).to.be.eql(test_signatureSession_result);
  });
});

//*****************************************/
// Test Session
//*****************************************/
describe('Test session', () => {
  it('[getSession] - It should be true', async () => {
    const auth    = new Auth(params);
    const session = await auth.setSession({dateUTC: cornerstone.dateTime});

    return expect(session.status).to.be.eql(201);
  });
});

//*****************************************/
// REPORTING User
//*****************************************/
describe('Test Reporting user', () => {
  it('[getReportingUserByEmail] - It should be true', async () => {
    const user = await cornerstone.getReportingUserByEmail({
      email: test_reporting_user_email,
    });
    console.log(user);
    return expect(user.user_id).to.be.eql(test_reporting_user_id);
  });

  it('[getReportingByUserId] - It should be true', async () => {
    const user = await cornerstone.getReportingByUserId({user_id: test_reporting_user_id});
    console.log(user);
    return expect(user.user_id).to.be.eql(test_reporting_user_id);
  });

  it('[getReportingByUserRef] - It should be true', async () => {
    const user = await cornerstone.getReportingByUserRef({user_ref: test_reporting_user_ref});
    console.log(user);
    return expect(user.user_id).to.be.eql(test_reporting_user_id);
  });
});

//*****************************************/
// REPORTING Keycode
//*****************************************/
describe('Test Reporting key_code', () => {
  it('[getReportingKeycodeByUserId] - It should be true', async () => {
    const keycode = await cornerstone.getReportingKeycodeByUserId({user_id: test_reporting_user_id});
    console.log(keycode);
    return expect(keycode.tu_training_unit_key_code).to.be.eql(test_reporting_user_ref);
  });

  it('[getReportingKeycodeByUserRef] - It should be true', async () => {
    const keycode = await cornerstone.getReportingKeycodeByUserRef({user_ref: test_reporting_user_ref});
    console.log(keycode);

    return expect(keycode.tu_training_unit_key_code).to.be.eql(test_reporting_user_ref);
  });
});

//*****************************************/
// REST Employee
//*****************************************/
describe('Test REST employees', () => {
  it('[getEmployeeByuserId] - It should be true', async () => {
    const user = await cornerstone.getEmployeeByUserId({userId: test_rest_userId});
    console.log(user);
    return expect(user.userId).to.be.eql(test_rest_userId);
  });

  it('[updateEmployee] - It should be true', async () => {
    employee.personalEmail = 'greef@gmail.com';
    const user             = await cornerstone.updateEmployeeByUserId({
      id:   test_rest_id,
      data: {"personalEmail": 'dominique@gmail.com'}
      //data: {"userId": 'DIGIT2'}
    });
    console.log(user);
    return expect(user.status).to.be.eql('Success');
  });
});

//*****************************************/
// REST Keycode
//*****************************************/
describe('Test REST keycode', () => {
  it('[updateEmployee] - It should be true', async () => {
    // TODO on ne peut que poster une fois, ensuite c'est erreur duplicate keycode
    // const user = await cornerstone.postKeycodeUserId({
    //   amount: 20,
    //   keyCode: test_keycodeId,
    //   userId: test_keycodeId,
    //   expirationDate: '2019-03-31',
    //   assignmentTitle: 'Test Dominique'
    // });
    console.log(user);
    return expect(user.status).to.be.eql('Success');
  });
});