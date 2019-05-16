import decode from 'jwt-decode';
import config from "./config/config";
import Logger from './logger';
import store from './store/store';
import rules from "./rbac-rules";

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
            if (decoded.exp < Date.now() / 1000) { // Checking if token is expired.
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
        this.saveToLocalStorage();
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
     * Only App data + Token can be stored in Local Storage no profile data can be stored in there
     */
    saveToLocalStorage = () => {
        localStorage.setItem('rentapp3store', JSON.stringify(store.get()));
    }

    handleLogin = (username, password) => {
        const self = this;
        const router = self.$f7router;
        
        // Get a token from api server using the fetch api
        let url1 = `${this.domain}/authenticate`;
        log.debug(url1);
        
        return this.fetch(url1, {
            method: 'POST',
            body: JSON.stringify({
                login: username,
                password: password,
            })
        }).then(res => {
            this.setToken(res.token);
            router.back();
        }).catch(() => {
            log.debug("error");
        });
    }

    /** ROLE BASE ACCESS CONTROL */
    //DEPRECATED
    check = (rules, role, action, data) => {
        const permissions = rules[role];
        if (!permissions) {
            // role is not present in the rules
            return false;
        }
        
        const staticPermissions = permissions.static;
        
        if (staticPermissions && staticPermissions.includes(action)) {
            // static rule not provided for action
            return true;
        }
        
        const dynamicPermissions = permissions.dynamic;
        
        if (dynamicPermissions) {
            const permissionCondition = dynamicPermissions[action];
            if (!permissionCondition) {
            // dynamic rule not provided for action
            return false;
            }
        
            return permissionCondition(data);
        }
        return false;
    };

    /**
     * Takes RBAC-RULES as input and validates against it.
     * If action for specific role is in the rbac-rules.js file then returs TRUE
     * else returns false
     * 
     * usage example on page
     * {Auth.isAuthorized('Home:visit')
            ? <p>Authorized</p>
            : null
        }

        where 

        Auth.isAuthorized('Home:visit') returns TRUE/FALSE
     */
    isAuthorized = (action, data) => {
        const role = this.getProfile() ? this.getProfile().userrole : '';
        const permissions = rules[role];
        if (!permissions) {
            // role is not present in the rules
            return false;
        }
        
        const staticPermissions = permissions.static;
        
        if (staticPermissions && staticPermissions.includes(action)) {
            // static rule not provided for action
            return true;
        }
        
        const dynamicPermissions = permissions.dynamic;
        
        if (dynamicPermissions) {
            const permissionCondition = dynamicPermissions[action];
            if (!permissionCondition) {
            // dynamic rule not provided for action
            return false;
            }
        
            return permissionCondition(data);
        }
        return false;
    };

}