import React, {Component} from 'react';
import {Page, Navbar, List, ListItem, Input, Fab, Icon, Block, Row, Col} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from "../config/labels";
import AuthService from '../AuthService';

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger

class EnergyPrices extends Component {
    emptyListElement = () => {
        let emptyListElement = {
             dt: '' ,  
             sieciowastala: 0,  
             sieciowazmienna: 0,  
             jakosciowa: 0,  
             przejsciowa: 0,  
             abonament: 0,  
             saleszmienna: 0,  
             salesstala: 0,  
             rentapp_energy_priceid: '',
        };
        return emptyListElement;
    }

    constructor(props) {
        super(props);
        
        if(store.get().EnergyPrices === undefined){
            store.get().set('EnergyPrices', [
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
        
        const selecturl = config.apihost + ':' + config.apiport + '/api/rentapp_energy_prices/'; //creting url
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
                        store.get().set('EnergyPrices', r);
                    }
                    this.$f7.preloader.hide();
                    return Promise.resolve(res);
                },
                (error) => {
                    store.get().set('EnergyPrices', [
                        this.emptyListElement()
                    ]);
                    log.debug('EnergyPrices.getFromAPI.ERROR: ' + error.message);
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
                <Navbar title={labels.en.EnergyPricestitle} backLink={labels.en.back} />
                <List mediaList virtualList virtualListParams={{ items: store.get().EnergyPrices, height: this.$theme.ios ? 63 : 73}}>
                    <ul>
                        {store.get().EnergyPrices.map((item, index) => (
                            <ListItem
                                key={index}
                                link='#' //{'/waterprice/'+item.rentapp_readid}
                                title={<Input type='date' value={this.dtformat(item.dt)} disabled />}
                            >
                                <Block>
                                    <Row>
                                        <Col>{labels.en.EnergyPricesieciowastala}:</Col>
                                        <Col>{item.sieciowastala}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.EnergyPricesieciowazmienna}:</Col>
                                        <Col>{item.sieciowazmienna}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.EnergyPricejakosciowa}:</Col>
                                        <Col>{item.jakosciowa}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.EnergyPriceprzejsciowa}:</Col>
                                        <Col>{item.przejsciowa}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.EnergyPriceabonament}:</Col>
                                        <Col>{item.abonament}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.EnergyPricesaleszmienna}:</Col>
                                        <Col>{item.saleszmienna}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.EnergyPricesalesstala}:</Col>
                                        <Col>{item.salesstala}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.EnergyPriceid}:</Col>
                                        <Col>{item.rentapp_energy_priceid}</Col>
                                    </Row>
                                </Block>
                            </ListItem>
                        ))}
                    </ul>
                </List>
                <Fab position="center-bottom" slot="fixed" color="blue" href='/energy_price/'>
                    <Icon ios="f7:add" md="material:add"></Icon>
                </Fab>
            </Page>
        );
    }
}

export default EnergyPrices;
