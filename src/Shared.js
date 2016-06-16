class Shared {
    constructor($window, $log, SatellizerConfig, SatellizerStorage) {
        this.$window = $window;
        this.$log = $log;
        this.config = SatellizerConfig;
        this.storage = SatellizerStorage;
        const { tokenName, tokenPrefix } = this.config;
        this.prefixedTokenName = tokenPrefix ? [tokenPrefix, tokenName].join('_') : tokenName;
    }
    getToken() {
        return this.storage.get(this.prefixedTokenName);
    }
    getPayload() {
        const token = this.storage.get(this.prefixedTokenName);
        if (token && token.split('.').length === 3) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace('-', '+').replace('_', '/');
                return JSON.parse(decodeURIComponent(window.atob(base64)));
            }
            catch (e) { }
        }
    }
    setToken(response) {
        if (!response) {
            return this.$log.warn('Can\'t set token without passing a value');
        }
        let token;
        const accessToken = response && response.access_token;
        if (accessToken) {
            if (angular.isObject(accessToken) && angular.isObject(accessToken.data)) {
                response = accessToken;
            }
            else if (angular.isString(accessToken)) {
                token = accessToken;
            }
        }
        if (!token && response) {
            const tokenRootData = this.config.tokenRoot && this.config.tokenRoot.split('.').reduce(function (o, x) { return o[x]; }, response.data);
            token = tokenRootData ? tokenRootData[this.config.tokenName] : response.data && response.data[this.config.tokenName];
        }
        if (!token) {
            const tokenPath = this.config.tokenRoot ? this.config.tokenRoot + '.' + this.config.tokenName : this.config.tokenName;
            return this.$log.warn('Expecting a token named "' + tokenPath);
        }
        this.storage.set(this.prefixedTokenName, token);
    }
    removeToken() {
        this.storage.remove(this.prefixedTokenName);
    }
    isAuthenticated() {
        const token = this.storage.get(this.prefixedTokenName);
        if (token) {
            if (token.split('.').length === 3) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace('-', '+').replace('_', '/');
                    const exp = JSON.parse(this.$window.atob(base64)).exp;
                    if (exp) {
                        const isExpired = Math.round(new Date().getTime() / 1000) >= exp;
                        if (isExpired) {
                            return false; // FAIL: Expired token
                        }
                        else {
                            return true; // PASS: Non-expired token
                        }
                    }
                }
                catch (e) {
                    return true; // PASS: Non-JWT token that looks like JWT
                }
            }
            return true; // PASS: All other tokens
        }
        return false; // FAIL: No token at all
    }
    logout() {
        this.storage.remove(this.prefixedTokenName);
    }
    setStorageType(type) {
        this.storageType = type;
    }
}
export default Shared;
//# sourceMappingURL=Shared.js.map