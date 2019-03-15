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

describe('Test session', () => {
  it('[getSession] - It should be true', async () => {
    const session = await auth.setSession();

    return expect(session.status).to.be.eql(201);
  });
});

describe('Test reporting api', () => {
  it('[getUserReportingByEmail] - It should be true', async () => {
    const user = await cornerstone.getUserReportingByEmail({email: 'dominique.lopez@digitregroup.com'});

    return expect(user.user_id).to.be.eql(2164);
  });

  it('[getUserByUserReportingIdCornerstone] - It should be true', async () => {
    const user = await cornerstone.getUserReportingByUserIdCornerstone({user_id: 2164});

    return expect(user.user_id).to.be.eql(2164);
  });
});

describe('Test rest employees', () => {
  it('[getEmployeeByuserId] - It should be true', async () => {
    const user = await cornerstone.getEmployeeByUserId({user_id: 'dladmin'});
    console.log(user);
    return expect(user.userId).to.be.eql('dladmin');
  });

  it('[updateEmployee] - It should be true', async () => {
    employee.personalEmail = 'greef@gmail.com';
    const user = await cornerstone.updateEmployeeByUserId({id: 43, data: {"personalEmail": "greef@free.fr"}});

    return expect(user.status).to.be.eql('Success');
  });
});

