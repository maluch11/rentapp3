import React, {Component} from 'react';
import {Page, Navbar, List, ListItem, Input, Fab, Icon, Block} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from "../config/labels";
import AuthService from '../AuthService';

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger

class RentsList extends Component {
    constructor(props) {
        super(props);
        
        if(store.get().rentslist === undefined){
            // SET EMPTY/DUMMY rentlist store
            store.get().set('apirentapp_rents', [
                        {
                            dt: '',
                            kwota: 0,
                            stat: '',
                            rentapp_rentid: '',
                        }
                    ]);
        }
    }
    
    componentWillMount() {

    }
    
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', () => { me.forceUpdate(); Auth.saveToLocalStorage();}); // RE-RENDER component if store updated
    
        this.getRentsListFromAPI();
    }
    
    componentWillReceiveProps(nextProps) {
    
    }
    
    componentWillUpdate(nextProps, nextState) {
    
    }
    
    componentDidUpdate(prevProps, prevState) {

    }
    
    componentWillUnmount() {
    
    }
    
    getRentsListFromAPI = () => {
        this.$f7.preloader.show(); //preloader show - working way
        
        const apiurl = '/api/rentapp_rents/contextid/'+store.get().selected_contextid;

        const selecturl = config.apihost + ':' + config.apiport + apiurl;
        log.debug(selecturl); //creting url
        
        return Auth.fetch(selecturl, {
            method: 'GET',
        })
            .then(
                (res) => {
                    if (res.meta.success === true){
                        let r = res.data;
                        /**
                         * SORT FUNCTION DESCENDING
                         */
                        r.sort(function (a, b) {
                            let c = a.dt.replace(/\D/g, '');
                            let d = b.dt.replace(/\D/g, '');
                            return d - c;
                        });
                        
                        // STORE UPDATE IF NOT EQUAL
                        store.get().set('apirentapp_rents', r);
                    }
                    this.$f7.preloader.hide();
                    return Promise.resolve(res);
                },
                (error) => {
                    // SET EMPTY/DUMMY rentlist store
                    store.get().set('apirentapp_rents', [
                        {
                            dt: '',
                            kwota: 0,
                            stat: '',
                            rentapp_rentid: '',
                        }
                    ]);
                    log.debug('RentsList.getRentList.ERROR: ' + error.message);
                    this.$f7.preloader.hide();
                    return false;
                }
            )
    }
    
    dtformat = (dtfull) => {
        var dt = dtfull.substring(0,10);
        return dt;
    };
    
    loadMore = (event, done) => {
        this.getRentsListFromAPI();
        done();
    }
    
    render() {
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll ptr onPtrRefresh={this.loadMore}>
                <Navbar title={labels.en.rentslisttitle} backLink={labels.en.back} />
                
                <List mediaList virtualList
                    virtualListParams={{ items: store.get().apirentapp_rents, height: this.$theme.ios ? 63 : 73}}>
                    <ul>
                        {store.get().apirentapp_rents.map((item, index) => (
                            <ListItem
                                key={index}
                                mediaItem
                                link={Auth.isAuthorized('Rent:visit') ? '/rent/'+item.rentapp_rentid : '#'}
                                header={<Input type='date' value={this.dtformat(item.dt)} disabled />}
                                badge={item.stat==='paid' ? labels.en.paid : labels.en.due}
                                badgeColor={item.stat==='paid' ? 'green' : 'red'}
                                title={item.kwota+' PLN'}
                            />
                        ))}
                    </ul>
                </List>
                
                {Auth.isAuthorized('Rent:edit') && 
                <Fab position="center-bottom" slot="fixed" color="blue" href='/rent/'>
                    <Icon ios="f7:add" md="material:add"></Icon>
                </Fab>
                }
            </Page>
        );
    }
}

export default RentsList;
