import { resolve } from 'url';
import Config from './Config';
import Shared from './Shared';
import OAuth1 from './OAuth1';
import OAuth2 from './OAuth2';

export default class OAuth {
  static $inject = ['$http'];

  constructor(private $http: angular.IHttpService,
              private config: Config,
              private shared: Shared,
              private oauth1: OAuth1,
              private oauth2: OAuth2) {}

  authenticate(name, data) {
    return new Promise((resolve, reject) => {
      const provider = this.config.providers[name];
      const oauth: OAuth1|OAuth2 = provider.oauthType === '1.0' ? this.oauth1() : this.oauth2();

      return oauth.init(provider, data)
        .then((response) => {
          if (provider.url) {
            this.shared.setToken(response, false);
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  unlink(provider, httpOptions) {
    httpOptions.url = httpOptions.url ? httpOptions.url : resolve(this.config.baseUrl, this.config.unlinkUrl);
    httpOptions.data = { provider } || httpOptions.data;
    httpOptions.method = httpOptions.method || 'POST';
    httpOptions.withCredentials = httpOptions.withCredentials || this.config.withCredentials;

    return this.$http(httpOptions);
  }
}
