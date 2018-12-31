import React, {Component} from 'react';
import {Page, Navbar, Link, List, ListItem, BlockTitle, NavTitle, NavLeft, Input} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import AuthService from '../AuthService';

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger
class RentListPage extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            inputValue:
                [
                    {
                        dt: '',
                        kwota: 0,
                        stat: ''
                    }
                ],
        }
    }
    
    componentWillMount() {
        if(Auth.isLogged()){
            this.getRentsList();
        }
    }
    
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', function(){ me.forceUpdate(); }); // RE-RENDER component if store updated
    }
    
    componentWillReceiveProps(nextProps) {
    
    }
    
    componentWillUpdate(nextProps, nextState) {
    
    }
    
    componentDidUpdate(prevProps, prevState) {
    
    }
    
    componentWillUnmount() {
    
    }
    
    getRentsList = () => {
        this.$f7.preloader.show(); //preloader show - working way
        
        const url1 = config.apihost + ':' + config.apiport + '/api/rentapp_rents/';
        log.debug(url1);
        
        return Auth.fetch(url1, {
            method: 'GET',
        })
            .then(
                (res) => {
                    log.debug('rentlistpage.getRentList.RESULT:');
                    log.debug(res);
                    
                    if (res.success !== 'undefined' && res.success !== '' && res.success !== false) {
                        let r = res.data;
                        /**
                         * SORT FUNCTION DESCENDING
                         */
                        r.sort(function (a, b) {
                            let c = a.dt.replace(/\D/g, '');
                            let d = b.dt.replace(/\D/g, '');
                            return d - c;
                        });
                        this.setState({inputValue: r});
                    }
                    this.$f7.preloader.hide();
                    let me = this;
                    // this.setToken(res.token); // Setting the token in localStorage
                    me.forceUpdate();
                    return Promise.resolve(res);
                    
                },
                (error) => {
                    this.setState({
                        inputValue: [
                            {
                                dt: '',
                                kwota: 0,
                                stat: ''
                            }
                        ]
                    });
                    log.debug('RentListPage.getRentList.ERROR: ' + error.message);
                    this.$f7.preloader.hide();
                    return false;
                }
            )
    }
    
    dtformat = (dtfull) => {
        var dt = dtfull.substring(0,10);
        return dt;
    };
    
    render() {
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll>
                <Navbar title="Czynsz" backLink="Back" />
                <List mediaList virtualList
                      virtualListParams={{ items: this.state.inputValue, height: this.$theme.ios ? 63 : 73}}>
                    <ul>
                        {this.state.inputValue.map((item, index) => (
                            <ListItem
                                key={index}
                                mediaItem
                                // link="#"
                                title={<Input type='date' value={this.dtformat(item.dt)} disabled />}
                                badge={item.stat==='paid' ? 'ok' : 'do zapłaty'}
                                badgeColor={item.stat==='paid' ? 'green' : 'red'}
                                subtitle={item.kwota}
                            />
                        ))}
                    </ul>
                </List>
            </Page>
        );
    }
}

export default RentListPage;
