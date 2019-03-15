const chai        = require('chai');
const expect      = chai.expect;
const config      = require('../config/common')();
const Auth        = require('../src/lib/Auth');
const Cornerstone = require('../src/cornerstone');
const employee = require('../src/models/employee');

const params = {
  apiId:     '',
  apiSecret: '',
  username:  '',
  alias:     '',
  corpname:  ''
};

const auth        = new Auth(params);
const cornerstone = new Cornerstone(params);

describe('Test signatures', () => {
  it('[getSignature] - It should be true', () => {
    const signature = auth.getSignature({
      httpUrl: config.CORNERSTONE_PATH_SESSION,
      dateUTC: '2019-03-12T13:54:27.000'
    });

    return expect(signature).to.be.eql('SK+18yK1NB+ANhaJ2h42+KohD6OaGVeeIB2fES2VPpJtlavmlefRAm0eWHqBcXrWgtijwoVIPR+pVRBMCidE9g==');
  });

  it('[getSessionSignature] - It should be true', () => {
    const sessionSignature = auth.getSignatureSession({
      method:        'GET',
      sessionToken:  's1xi67fv0hh3',
      sessionSecret: 'h6OrNw+XNR+OOrSZZk0FqZaVQ9O1JzZEY/d9CWNXJmqDfnWgxOhJZdXMXPGqr3R3JAo42dpWFu7X0aaFtnOAWw==',
      httpUrl:       config.CORNERSTONE_REPORTING_USER,
      dateUTC:       '2019-03-12T16:19:28.889'
    });

    return expect(sessionSignature).to.be.eql('x4Yru9HUPV3fzpC9kbpaGEfFDdfLLcMe1Eo5+ui/M98P/P5HJCeYZa1f3hkEF/OqKzITMlcIF5uXY770Oixlag==');
  });
});

//*****************************************/
// Test Session
//*****************************************/
describe('Test session', () => {
  it('[getSession] - It should be true', async () => {
    const session = await auth.setSession();

    return expect(session.status).to.be.eql(201);
  });
});

//*****************************************/
// REPORTING User
//*****************************************/
describe('Test Reporting user', () => {
  it('[getReportingUserByEmail] - It should be true', async () => {
    const user = await cornerstone.getReportingUserByEmail({email: 'dominique.lopez@digitregroup.com'});

    return expect(user.user_id).to.be.eql(2164);
  });

  it('[getReportingByUserId] - It should be true', async () => {
    const user = await cornerstone.getReportingByUserId({user_id: 2164});
    console.log(user);
    return expect(user.user_id).to.be.eql(2164);
  });

  it('[getReportingByUserRef] - It should be true', async () => {
    const user = await cornerstone.getReportingByUserRef({user_ref: 'CAPI11686'});
    console.log(user);
    return expect(user.user_id).to.be.eql(2164);
  });
});

//*****************************************/
// REPORTING Keycode
//*****************************************/
describe('Test Reporting key_code', () => {
  it('[getReportingKeycodeByUserId] - It should be true', async () => {
    const keycode = await cornerstone.getReportingKeycodeByUserId({user_id: 44});
    //console.log(keycode);
    return expect(keycode.tu_code_id).to.be.eql(1);
  });

  it('[getReportingKeycodeByUserRef] - It should be true', async () => {
    const keycode = await cornerstone.getReportingKeycodeByUserRef({user_ref: 'CAPI11686'});
    console.log(keycode);

    return expect(keycode.tu_code_id).to.be.eql(1);
  });
});

//*****************************************/
// REST Employee
//*****************************************/
describe('Test REST employees', () => {
  it('[getEmployeeByuserId] - It should be true', async () => {
    const user = await cornerstone.getEmployeeByUserId({user_id: 'CAPI11686'});
    console.log(user);
    return expect(user.userId).to.be.eql('dladmin');
  });

  it('[updateEmployee] - It should be true', async () => {
    employee.personalEmail = 'greef@gmail.com';
    const user = await cornerstone.updateEmployeeByUserId({id: 2164, data: {"userId": "CAPI11686"}});
    console.log(user);
    return expect(user.status).to.be.eql('Success');
  });
});

//*****************************************/
// REST Keycode
//*****************************************/
describe('Test REST keycode', () => {
  it('[updateEmployee] - It should be true', async () => {
    const user = await cornerstone.postKeycodeUserId({
      amount: 50,
      keyCode: 'CAPI11686',
      userId: 'CAPI11686',
      expirationDate: '2019-03-31',
      assignmentTitle: 'Test Dominique'
    });
    console.log(user);
    return expect(user.status).to.be.eql('Success');
  });
});