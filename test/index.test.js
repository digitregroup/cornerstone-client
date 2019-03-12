const axios = require('axios');

const chai   = require('chai');
const expect = chai.expect;

const config = require('../config/common')();
const Auth   = require('../src/lib/Auth');

const auth = new Auth();

const credentials = {
  apiId:     'xxxxxxxxxx',
  apiSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  username:  'xxxx',
  alias:     'xxxx',
  corpname:  'xxxx'
};

it('[getSignature] - It should be true', () => {
  const signature = auth.getSignature({
    apiId:     credentials.apiId,
    apiSecret: credentials.apiSecret,
    httpUrl:   config.CORNERSTONE_PATH_SESSION,
    dateUTC:   '2019-03-12T13:54:27.000'
  });

  return expect(signature).to.be.eql('SK+18yK1NB+ANhaJ2h42+KohD6OaGVeeIB2fES2VPpJtlavmlefRAm0eWHqBcXrWgtijwoVIPR+pVRBMCidE9g==');
});


it('[getSession] - It should be true', async () => {
  const session = await auth.getSession(credentials);

  return expect(session.status).to.be.eql(201);
});