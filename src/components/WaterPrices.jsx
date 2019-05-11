import React, {Component} from 'react';
import {Page, Navbar, List, ListItem, Input, Fab, Icon, Block, Row, Col} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from "../config/labels";
import AuthService from '../AuthService';

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger

class WaterPrices extends Component {
    emptyListElement = () => {
        let emptyListElement = {
            dt: '',
            cenacwstala: 0,
            cenacwzuzycie: 0,
            cenazwzuzycie: 0,
            rentapp_water_priceid: '',
        };
        return emptyListElement;
    }

    constructor(props) {
        super(props);
        
        if(store.get().WaterPrices === undefined){
            store.get().set('WaterPrices', [
                this.emptyListElement()
            ]);
        }
    }

    componentWillMount() {
    }
    
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', () => { me.forceUpdate(); Auth.saveToLocalStorage();}); // RE-RENDER component if store updated
    
        this.getListFromAPI();
    }
    
    componentWillReceiveProps(nextProps) {
    
    }
    
    componentWillUpdate(nextProps, nextState) {
    
    }
    
    componentDidUpdate(prevProps, prevState) {

    }
    
    componentWillUnmount() {
    
    }
    
    getListFromAPI = () => {
        this.$f7.preloader.show(); //preloader show - working way
        
        const selecturl = config.apihost + ':' + config.apiport + '/api/rentapp_water_prices/'; //creting url
        log.debug(selecturl); 
        
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
                        store.get().set('WaterPrices', r);
                    }
                    this.$f7.preloader.hide();
                    return Promise.resolve(res);
                },
                (error) => {
                    store.get().set('WaterPrices', [
                        this.emptyListElement()
                    ]);
                    log.debug('WaterPrices.getFromAPI.ERROR: ' + error.message);
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
        this.getListFromAPI();
        done();
    }
    
    render() {
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll ptr onPtrRefresh={this.loadMore}>
                <Navbar title={labels.en.WaterPricestitle} backLink={labels.en.back} />
                <List mediaList virtualList virtualListParams={{ items: store.get().WaterPrices, height: this.$theme.ios ? 63 : 73}}>
                    <ul>
                        {store.get().WaterPrices.map((item, index) => (
                            <ListItem
                                key={index}
                                link='#' //{'/waterprice/'+item.rentapp_readid}
                                title={<Input type='date' value={this.dtformat(item.dt)} disabled />}
                            >
                            <Block>
                                        <Row>
                                            <Col>{labels.en.WaterPricecenacwstala}:</Col>
                                            <Col>{item.cenacwstala}</Col>
                                        </Row>
                                        <Row>
                                            <Col>{labels.en.WaterPricecenacwzuzycie}:</Col>
                                            <Col>{item.cenacwzuzycie}</Col>
                                        </Row>
                                        <Row>
                                            <Col>{labels.en.WaterPricecenazwzuzycie}:</Col>
                                            <Col>{item.cenazwzuzycie}</Col>
                                        </Row>
                                    </Block>
                            </ListItem>
                        ))}
                    </ul>
                </List>
                <Fab position="center-bottom" slot="fixed" color="blue" href='/water_price/'>
                    <Icon ios="f7:add" md="material:add"></Icon>
                </Fab>
            </Page>
        );
    }
}

export default WaterPrices;
