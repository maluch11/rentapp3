import React from 'react';
import {Page, List, LoginScreenTitle, ListInput, ListButton, BlockFooter } from 'framework7-react';
import config from "../config/config";
import labels from "../config/labels";
import store from '../store/store';
import Logger from '../logger';

const log = Logger({level: config.loglevel}); // Logger
export default class extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            username: '',
            password: '',
        };
    
        this.domain = config.apihost+':'+config.apiport+'/api';
    }
    
    render() {
        return (
            <Page noToolbar noNavbar noSwipeback loginScreen>
                <LoginScreenTitle>Application</LoginScreenTitle>
                <List form>
                    <ListInput
                        label={labels.en.username}
                        type="text"
                        placeholder="Your username"
                        value={this.state.username}
                        onInput={(e) => {
                            this.setState({ username: e.target.value});
                        }}
                    />
                    <ListInput
                        label={labels.en.password}
                        type="password"
                        placeholder="Your password"
                        value={this.state.password}
                        onInput={(e) => {
                            this.setState({ password: e.target.value});
                        }}
                    />
                </List>
                <List>
                    <ListButton onClick={this.signIn.bind(this)}>{labels.en.loginbt}</ListButton>
                    <BlockFooter>{labels.en.logininfo}</BlockFooter>
                </List>
            </Page>
        )
    }
    
    signIn() {
        const self = this;
        //todo call-authorize-endpoint, if response 200 then save token and profile in store and set isLogged in store
        this.handleLogin(self.state.username, self.state.password);
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
            store.get().set(self.state); //todo DELETE - ONLY TEST PURPOSE
            store.get().set('token',res.token);
            store.get().set('isLogged',true);
            router.back();
        }).catch(() => {
            log.debug("error");
        });
    }
    
    isLogged = () => {
        return store.get().isLogged;
    }
    
    getToken = () => {
        return store.get().token; //Get token from Freezer
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
}