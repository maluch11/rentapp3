import decode from 'jwt-decode';
import config from "./config/config";
import Logger from './logger';
import store from './store/store';

let log = Logger({ level: config.loglevel });

export default class AuthService {
    constructor(domain) {
        this.domain = domain || config.apihost + ':' + config.apiport + '/api'; // API server domain
    }

    getToken = () => {
        return store.get().token; //Get token from Freezer
    }
    setToken = (token) => {
        store.get().set('token', token); //store id_token to Freezer
    }
    isTokenExpired = (token) => {
        try {
            const decoded = decode(token);
            if (decoded.exp < Date.now() / 1000) { // Checking if token is expired. N
                return true;
            } else
                return false;
        } catch (err) {
            return false;
        }
    }
    isLogged = () => {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken(); // Getting token from store
        log.debug('AuthService.isLogged: ' + token !== '' && token !== undefined && !!token && !this.isTokenExpired(token));
        return token !== '' && token !== undefined && !!token && !this.isTokenExpired(token); // handwaiving here
    }

    logout = () => {
        this.setToken(''); //clear freezer and localStorage
    }
    getProfile = () => {
        // Using jwt-decode npm package to decode the token
        // return !!this.getToken() ? decode(this.getToken()) : null;
        // return decode(this.getToken());
        return this.isLogged() ? decode(this.getToken()) : null;
    }

    fetch = (url, options) => {
        // performs api calls sending the required authentication headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        // Setting Authorization header
        // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
        if (this.isLogged()) {
            headers['Authorization'] = 'Bearer ' + this.getToken()
        }

        return fetch(url, {
                headers,
                ...options
            })
            .then(this._checkStatus)
            .then(response => response.json())
    }

    _checkStatus = (response) => {
        // raises an error in case response status is not a success
        if (response.status >= 200 && response.status < 300) { // Success status lies between 200 to 300
            return response
        } else {
            let error = new Error(response.statusText);
            error.response = response;
            throw error
        }
    }

    /**
     * DEPRECATED temporarily
     */
    saveToLocalStorage = () => {
        localStorage.setItem('rentapp3store', JSON.stringify(store.get()));
    }
}