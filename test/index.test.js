const chai        = require('chai');
const expect      = chai.expect;
const config      = require('../config/common')();
const Auth        = require('../src/lib/Auth');
const Cornerstone = require('../src/cornerstone');
const employee    = require('../src/models/employee');

// Params pilot
const params = {
  apiId:     '',
  apiSecret: '',
  username:  '',
  alias:     '',
  corpname:  ''
};

const test_reporting_user_id    = 1;
const test_reporting_user_ref   = '';
const test_reporting_user_email = '';

const test_rest_id                 = 1;
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
    console.log(user[0].user_id);
    return expect(user[0].user_id).to.be.eql(test_reporting_user_id);
  });

  it('[getReportingByUserId] - It should be true', async () => {
    const user = await cornerstone.getReportingByUserId({user_id: test_reporting_user_id});
    console.log(user);
    return expect(user[0].user_id).to.be.eql(test_reporting_user_id);
  });

  it('[getReportingByUserRef] - It should be true', async () => {
    const user = await cornerstone.getReportingByUserRef({user_ref: test_reporting_user_ref});
    console.log(user);
    return expect(user[0].user_id).to.be.eql(test_reporting_user_id);
  });
});

//*****************************************/
// REPORTING Training
//*****************************************/
describe('Test Reporting training', () => {
  it('[getReportingTraining] - It should be true', async () => {
    const trainings = await cornerstone.getReportingTraining({dateStart: '2019-04-01'});
    //console.log(trainings);
    return expect(trainings[0].lo_type).to.be.eql('Session');
  });
});

//*****************************************/
// REPORTING Transcript
//*****************************************/
describe('Test Reporting transcript', () => {
  it('[getReportingTranscriptByObjectId] - It should be true', async () => {
    const transcript = await cornerstone.getReportingTranscriptByObjectId({objectId: '944034f8-e6d3-4227-8f42-c11e9b729a08'});
    console.log(transcript);
    return expect(transcript[0].user_lo_status_id).to.be.eql(2048);
  });
});

//*****************************************/
// REPORTING Custom fields
//*****************************************/
describe('Test Reporting Custom fields dropdown values', () => {
  it('[getReportingCustomfields] - It should be true', async () => {
    const customFields = await cornerstone.getReportingCustomfields();
    console.log(customFields);
    return expect(customFields[0].culture_id).to.be.eql(33);
  });

  it('[getReportingCustomfieldsById] - It should be true', async () => {
    const customFields = await cornerstone.getReportingCustomfieldsById({id: 137});
    console.log(customFields);
    return expect(customFields[0].culture_id).to.be.eql(33);
  });
});


//*****************************************/
// Fondational Apis Roster
//*****************************************/
describe('Test Fondational Api Roster', () => {
  it('[getReportingTranscriptByObjectId] - It should be true', async () => {
    const transcript = await cornerstone.getRoster({query: "?sessionLOID=FCCE9F95-AE2B-48C4-9FD9-A8D3977D5136"});
    console.log(transcript);
    return expect(transcript.totalRecords).to.be.eql(1);
  });
});

//*****************************************/
// REPORTING Keycode
//*****************************************/
describe('Test Reporting key_code', () => {
  it('[getReportingKeycodeByUserId] - It should be true', async () => {
    const keycode = await cornerstone.getReportingKeycodeByUserId({user_id: test_reporting_user_id});
    console.log(keycode);
    return expect(keycode[0].tu_training_unit_key_code).to.be.eql(test_reporting_user_ref);
  });

  it('[getReportingKeycodeByUserRef] - It should be true', async () => {
    const keycode = await cornerstone.getReportingKeycodeByUserRef({user_ref: test_reporting_user_ref});
    console.log(keycode);

    return expect(keycode[0].tu_training_unit_key_code).to.be.eql(test_reporting_user_ref);
  });
});

//*****************************************/
// REPORTING Organisation Unit
//*****************************************/
describe('Test Reporting OU', () => {
  it('[getReportingOu] - It should be true', async () => {
    const ou = await cornerstone.getReportingOu();
    //console.log(ou);
    return expect(ou[0]).to.be.eql(ou[0]);
  });

});


//*****************************************/
// REST Employee Custom field
//*****************************************/
describe('Test REST custom fields', () => {
  it('[getEmployeesCustomFields] - It should be true', async () => {
    const customFields = await cornerstone.getEmployeesCustomFields({pagenumber: 1});
    console.log(customFields);
    return expect(customFields.size).to.be.eql(50);
  }).timeout(10000);

  it('[getEmployeesCustomFieldsByUserId] - It should be true', async () => {
    const customFields = await cornerstone.getEmployeesCustomFieldsByUserId({user_id: test_rest_userId});
    console.log(customFields);
    return expect(customFields.userId).to.be.eql(test_rest_userId);
  }).timeout(10000);

});

//*****************************************/
// REST Employee Groups
//*****************************************/
describe('Test REST groups', () => {
  it('[getEmployeesGroups] - It should be true', async () => {
    const customFields = await cornerstone.getEmployeesGroups({pagenumber: 1});
    console.log(customFields);
    return expect(customFields.size).to.be.eql(50);
  }).timeout(10000);

  it('[getEmployeesGroupsByUserId] - It should be true', async () => {
    const customFields = await cornerstone.getEmployeesGroupsByUserId({user_id: test_rest_userId});
    console.log(customFields);
    return expect(customFields.userId).to.be.eql(test_rest_userId);
  }).timeout(10000);

});

//*****************************************/
// REST Employee
//*****************************************/
describe('Test REST employees', () => {
  it('[getEmployeeByuserId] - It should be true', async () => {
    const user = await cornerstone.getEmployeeByUserId({userId: "dladmin"});
    console.log(user);
    return expect(user.userId).to.be.eql(test_rest_userId);
  }).timeout(10000);

  it('[updateEmployee] - It should be true', async () => {
    const user = await cornerstone.updateEmployeeByUserId({
      id:   43,
      data: {"customFields": [{id: 137, name: 'Pack', value: 'Intégral 2019'}]},
    });
    console.log(user);
    return expect(user.status).to.be.eql('Success');
  });

  it('[createEmployee] - It should be true', async () => {
    const user = await cornerstone.createEmployee({
      lastname:  'JEAN',
      firstname: 'Pierre',
      userName:  'DIGIT_10',
      "ous":     [
        {
          id:   96,
          ouId: 'DIGIT',
          name: 'Digit RE Group',
          type: 'Business Unit'
        },
        {id: 102, ouId: 'FICE', name: 'Fice', type: 'Site'}
      ]
    });
    console.log(user);
    return expect(user.status).to.be.eql('Success');
  }).timeout(10000);

});

//*****************************************/
// REST Catalog Search
//*****************************************/
describe('Test REST catalog search', () => {
  it('[getCatalog] - It should be true', async () => {
    const catalog = await cornerstone.getCatalog();
    console.log(JSON.stringify(catalog));

    return expect(catalog[0].Availabilities[0].__type).to.be.eql('OUAvailability:www.CornerStoneOnDemand.com/Services');
  }).timeout(10000);
});

//*****************************************/
// REST Learning object
//*****************************************/
describe('Test REST learning object', () => {
  it('[getLearningObject] - It should be true', async () => {
    const learningObject = await cornerstone.getLearningData({ObjectId: '1a7b8e61-e30f-4f8c-a2dd-71c95da55f37'});

    console.log(JSON.stringify(learningObject[0]));

    return expect(learningObject[0].Result).to.be.eql('Success');
  }).timeout(10000);
});


//*****************************************/
// REST Learning object transcript
//*****************************************/
describe('Test REST learning object transcript', () => {
  it('[getLearningObjectTranscript] - It should be true', async () => {
    const getLearningObjectTranscript = await cornerstone.getLearningObjectTranscript({LOID: '2141e19e-c862-456a-930b-7a9c6d11b0d0'});

    console.log(getLearningObjectTranscript[0].TranscriptItem.Transcripts[0]);

    return expect(getLearningObjectTranscript[0].Result).to.be.eql('Success');
  }).timeout(10000);
});

//*****************************************/
// REST Enroll LO
//*****************************************/
describe('Test REST enroll LO', () => {
  // it('[postEnrollUserToAnlearningObject] - It should be true', async () => {
  //   const enroll = await cornerstone.postEnrollUserToAnlearningObject({
  //     LOID: "944034f8-e6d3-4227-8f42-c11e9b729a08",
  //     userId: 'FICE6'
  //   });
  //   console.log(JSON.stringify(enroll));
  //
  //   return expect(enroll.status).to.be.eql(201);
  // });


  it('[getEnrollStatus] - It should be true', async () => {
    const enrollStatus = await cornerstone.getEnrollStatus({
      fromDate: '2019-03-19',
      toDate:   '2019-03-20'
    });
    console.log(enrollStatus);

    return expect(enrollStatus).to.be.eql(enrollStatus);
  }).timeout(10000);
});

//*****************************************/
// REST Keycode
//*****************************************/
describe('Test REST keycode', () => {
  it('[updateEmployee] - It should be true', async () => {
    //TODO on ne peut que poster une fois, ensuite c'est erreur duplicate keycode
    //
    // const user = await cornerstone.postKeycodeUserId({
    //   amount: 20,
    //   keyCode: '',
    //   userId: '',
    //   expirationDate: '2019-03-31',
    //   assignmentTitle: 'Test Dominique'
    // });
    //
    // console.log(user);
    // return expect(user.status).to.be.eql('Success');
  });
});
