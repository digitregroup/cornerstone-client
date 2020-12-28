const crypto    = require('crypto');
const axios     = require('axios');
const fs        = require('fs');
const dynamoose = require('dynamoose');
const moment    = require('moment');
const config    = require('../../config/common')();

/**
 * Set authentification and session for request to Cornerstone api
 */
class Auth {

  constructor({ apiId, apiSecret, corpname, region = null, dynamodbName = null }) {
    this.apiId        = apiId;
    this.apiSecret    = apiSecret;
    this.corpname     = corpname;
    this.region       = region;
    this.dynamodbName = dynamodbName;
    this.tokenModel   = null;
    this.accessToken  = {};

    this.setTokenModel();
  }

  async getAccessToken({ scope }) {
    if (!scope) return null;

    if (this.accessToken[scope] && moment(this.accessToken[scope].createdAt).add(3600, 'second') > moment()) {

      return this.accessToken[scope];
    }

    try {
      const dynamoToken = await this.tokenModel.get({ session: scope }).then((item) => {
        return item && JSON.parse(item.sessionInfo) || null;
      });
      if (dynamoToken && moment(dynamoToken.createdAt).add(3600, 'second') > moment()) {
        this.accessToken[scope] = dynamoToken;

        return this.accessToken[scope];
      }

    } catch (error) {
      throw new Error('Error get token on dynamoDb' + error.message);
    }

    try {
      const accessToken = await this.getToken({ scope });
      const createdAt   = moment().format();
      await this.saveToken(accessToken, scope, createdAt);
      this.accessToken[scope] = { accessToken: accessToken, createdAt: createdAt };

      return this.accessToken[scope];
    } catch (error) {
      console.log('>>> Error get new token:' + error.message);
    }

    return null;
  }

  async saveToken(accessToken, scope, datetime) {
    const token = new this.tokenModel({
      session    : scope,
      sessionInfo: JSON.stringify({ accessToken: accessToken, createdAt: datetime }),
    });
    await token.save();
    console.log('>>> Access token save in dynamoDb');
  }

  async getToken({ scope }) {
    try {
      const response = await axios({
        method : 'post',
        url    : `https://${this.corpname}.csod.com/services/api/oauth2/token`,
        headers: {
          'Content-Type' : 'application/json',
          'cache-control': 'no-cache',
        },
        data   : {
          clientId    : this.apiId,
          clientSecret: this.apiSecret,
          grantType   : 'client_credentials',
          scope       : scope,
        },
      });

      if (response.status === 200) {
        return response.data.access_token;
      }

    } catch (error) {
      throw new Error('>>> Error get new token');
    }
  }

  /**
   * Set model
   */
  async setTokenModel() {
    if (this.tokenModel !== null) {
      return this.tokenModel;
    }

    if (!this.region || !this.dynamodbName) {
      console.log('There are empty region or dynamo name');
      return null;
    }

    dynamoose.aws.sdk.config.update({
      region: this.region,
    });

    this.tokenModel = dynamoose.model(this.dynamodbName, {
      session    : String,
      sessionInfo: String,
    });
  }

}

module.exports = Auth;
