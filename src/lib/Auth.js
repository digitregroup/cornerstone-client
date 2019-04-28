const crypto    = require('crypto');
const axios     = require('axios');
const fs        = require('fs');
const dynamoose = require('dynamoose');
const config    = require('../../config/common')();

/**
 * Set authentification and session for request to Cornerstone api
 */
class Auth {

  constructor({apiId, apiSecret, username, alias, corpname, region = null, dynamodbName = null}) {
    this.apiId        = apiId;
    this.apiSecret    = apiSecret;
    this.username     = username;
    this.alias        = alias;
    this.corpname     = corpname;
    this.region       = region;
    this.dynamodbName = dynamodbName;
    this.tokenModel   = null;
  }


  /**
   * Set dynamoose model if region and dynamodb name are set
   * @returns {null|*}
   */
  async setTokenModel() {
    if (this.tokenModel !== null) {
      return this.tokenModel;
    }

    if (!this.region || !this.dynamodbName) {
      console.log('There are empty region or dynamo name');
      return null;
    }

    dynamoose.AWS.config.update({
      region: this.region,
    });

    this.tokenModel = dynamoose.model(this.dynamodbName, {
      session:     String,
      sessionInfo: String
    });

    return this.tokenModel;
  }

  /**
   * Create signature for authentification
   * @param {string} httpUrl api path like '/services/api/sts/session'
   * @param {string} dateUTC like '2019-03-11T17:05:00.969'
   * @returns {string}
   */
  getSignature({httpUrl, dateUTC}) {
    const httpMethod   = 'POST';
    const apiKeyCsod   = 'x-csod-api-key:' + this.apiId;
    const dateCsod     = 'x-csod-date:' + dateUTC;
    const stringToSign = httpMethod + '\n' + apiKeyCsod + '\n' + dateCsod + '\n' + httpUrl;
    const secretKey    = Buffer.from(this.apiSecret, 'base64');
    const hmac         = crypto.createHmac('sha512', secretKey);
    console.log('[getSignature] - signature: ', JSON.stringify(stringToSign));

    return hmac.update(stringToSign).digest('base64');
  }

  /**
   * Create signature for request reporting or request REST
   * @param {string} method http
   * @param {string} sessionToken
   * @param {string} sessionSecret
   * @param {string} httpUrl
   * @param {string} dateUTC
   * @returns {string}
   */
  getSignatureSession({method, sessionToken, sessionSecret, httpUrl, dateUTC}) {
    const sessionTokenKey = 'x-csod-session-token:' + sessionToken;
    const dateCsod        = 'x-csod-date:' + dateUTC;
    const stringToSign    = method + '\n' + dateCsod + '\n' + sessionTokenKey + '\n' + httpUrl;
    const secretKey       = Buffer.from(sessionSecret, 'base64');
    const hmac            = crypto.createHmac('sha512', secretKey);
    console.log('[getSignatureSession] - signature: ', JSON.stringify(stringToSign));

    return hmac.update(stringToSign).digest('base64');
  }

  /**
   * Connection for beginning request
   * @param baseUrl
   * @param apiKey
   * @param dateUTC
   * @param signature
   * @returns {Promise<*>}
   */
  async setConnection({baseUrl, apiKey, dateUTC, signature}) {

    return await axios.create({
      baseUrl: baseUrl,
      timeout: 50000,
      headers: {
        'x-csod-api-key':   apiKey,
        'x-csod-date':      dateUTC,
        'x-csod-signature': signature
      }
    });
  }

  /**
   * Create Axios object
   * @param {string} baseUrl
   * @param {string} dateUTC
   * @param {string} token
   * @param {string} signature
   * @returns {Promise<*>}
   */
  async setConnectionSession({baseUrl, dateUTC, token, signature}) {

    return await axios.create({
      baseUrl: baseUrl,
      timeout: 50000,
      headers: {
        'x-csod-date':          dateUTC,
        'x-csod-session-token': token,
        'x-csod-signature':     signature,
        'prefer':               "odata.maxpagesize=" + config.MAXPAGESIZE
      }
    });
  }

  /**
   * Set session authentification from cornerstone
   * @param {string} dateUTC
   * @returns {Promise<{alias: *, expiresOn: *, secret: *, status: number | string, token: *}>}
   */
  async setSession({dateUTC}) {
    let sessionFile  = null;
    const tokenModel = await this.setTokenModel();

    if (!this.tokenModel) {
      console.log('readFile');
      sessionFile = await JSON.parse(this.readSession());
    } else {
      console.log('readBdd');
      sessionFile = await tokenModel.get('cornerstone').then((item) => JSON.parse(item.sessionInfo));
    }

    console.log('session', sessionFile);

    if (sessionFile) {
      const dateNow     = new Date();
      const dateSession = new Date(sessionFile.expiresOn);

      if (dateNow < dateSession) {
        return sessionFile;
      }
    }

    const httpUrl = config.CORNERSTONE_PATH_SESSION;

    const signature = this.getSignature({
      apiId:     this.apiId,
      apiSecret: this.apiSecret,
      httpUrl:   httpUrl,
      dateUTC:   dateUTC
    });

    const baseUrl = this.getBaseUrl({corpname: this.corpname});

    const path = `${baseUrl}${httpUrl}?userName=${this.username}&alias=${this.alias + Date.now()}`;

    try {
      const connection = await this.setConnection({
        baseUrl:   baseUrl,
        apiKey:    this.apiId,
        dateUTC:   dateUTC,
        signature: signature
      });

      const response = await connection.post(path);

      if (response.data.status !== 201) {
        console.log('[setSession] - Error authentification', response.data)
      } else {
        console.log('[setSession] - status: ', response.data.status);
        const session = {
          status:    response.data.status,
          token:     response.data.data[0].Token,
          secret:    response.data.data[0].Secret,
          alias:     response.data.data[0].Alias,
          expiresOn: response.data.data[0].ExpiresOn
        };

        await this.saveSession({sessionInfo: session, tokenModel: this.tokenModel});

        return session;
      }
    } catch (e) {
      console.log('[setSession] - Error: ', e);
    }
  }

  /**
   * Get base url
   * @param corpname {string} fice, fice-pilot, fice-stage
   * @returns {string} url
   */
  getBaseUrl({corpname}) {
    return config.CORNERSTONE_BASE_URL.replace('{corpname}', corpname);
  }

  async saveSession({sessionInfo, tokenModel}) {

    if (!tokenModel) {
      if (!fs.existsSync(config.TMP_PATH)) {
        fs.mkdirSync(config.TMP_PATH);
      }

      await fs.writeFile(config.TMP_PATH + 'session.json', JSON.stringify(sessionInfo), 'utf8', (e) => {
        if (e) {
          console.log('[setSession] - Error save session file', e);
        } else {
          console.log('[setSession] - Session saved in tmp file');
        }
      });
    } else {
      const token = new tokenModel({
        session:     'cornerstone',
        sessionInfo: JSON.stringify(sessionInfo)
      });
      await token.save();
      console.log('Session save in dynamoDb');
    }
  }

  /**
   * Read tmp file session authentification
   * @returns {*}
   */
  readSession() {
    let file;

    if (fs.existsSync(config.TMP_PATH + 'session.json')) {
      file = fs.readFileSync(config.TMP_PATH + 'session.json', 'utf8');
      console.log('[readSession] - session tmp file: ', file);

      return file;
    }

    return null;
  }


}

module.exports = Auth;
