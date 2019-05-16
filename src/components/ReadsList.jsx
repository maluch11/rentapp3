import React, {Component} from 'react';
import {Page, Navbar, List, ListItem, Input, Fab, Icon, Block, Row, Col} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from "../config/labels";
import AuthService from '../AuthService';

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger

const readsurl = '/api/rentapp_reads/'; //store element then: apirentapp_reads
const waterpricesurl = '/api/rentapp_water_prices/'; //store element then apirentapp_water_prices
const energypricesurl = '/api/rentapp_energy_prices/'; //store element then apirentapp_energy_prices

class ReadsList extends Component {
    emptyListElement = () => {
        let emptyListElement = {
            dt: '',
            cw: 0,
            zw: 0,
            prad: 0,
            prad_oplata: -1,
            stat: 'due',
            rentapp_readid: '',
            cwcons: 0,
            zwcons: 0,
            pradcons: 0,
            cwcost: 0,
            zwcost: 0,
            pradcost: 0,
        };
        return emptyListElement;
    }

    constructor(props) {
        super(props);

        if(store.get().apirentapp_reads === undefined){
            // SET EMPTY/DUMMY rentlist store
            store.get().set(this.getStoreElem(readsurl), [
                        this.emptyListElement()
                    ]);
        }
    }
    
    componentWillMount() {

    }
    
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', () => { me.forceUpdate(); Auth.saveToLocalStorage();}); // RE-RENDER component if store updated

        this.getAllDataFromAPIS();
    }

    componentWillReceiveProps(nextProps) {
    
    }
    
    componentWillUpdate(nextProps, nextState) {
    
    }
    
    componentDidUpdate(prevProps, prevState) {

    }
    
    componentWillUnmount() {
    
    }
    
    getAllDataFromAPIS = () => {
        this.getListFromAPI2(readsurl, 
            () => {this.getListFromAPI2( waterpricesurl, 
                () => {this.getListFromAPI2(energypricesurl, this.calculateConsumptionsAndCostAndSaveInStore)}
            )}
        ); //fetching compete
    }

    /** Get from API and run subfetch function while API call is finalized */
    getListFromAPI2 = (apiurl, subfetchfunction) => {
        // this.$f7.preloader.show(); //preloader show - working way
        
        const selecturl = config.apihost + ':' + config.apiport + apiurl; //ex. apiurl = /api/rentapp_reads/
        log.debug(selecturl); //creting url
        
        return Auth.fetch(selecturl, {
            method: 'GET',
        })
            .then(
                (res) => {
                    if (res.meta.success === true){
                        let r = res.data;
                        log.debug(r);
                        /**
                         * SORT FUNCTION DESCENDING
                         */
                        r.sort(function (a, b) {
                            let c = a.dt.replace(/\D/g, '');
                            let d = b.dt.replace(/\D/g, '');
                            return d - c;
                        });
                        
                        //TODO: STORE UPDATE IF NOT EQUAL
                        store.get().set(this.getStoreElem(apiurl), r); //update store with processed value
                        
                        subfetchfunction(); //process
                    }
                    // this.$f7.preloader.hide();
                    return Promise.resolve(res);
                },
                (error) => {
                    // SET EMPTY/DUMMY rentlist store
                    store.get().set(this.getStoreElem(apiurl), [
                        this.emptyListElement()
                    ]);
                    log.debug('ReadsList.getReadsFromAPI.ERROR: ' + error.message);
                    // this.$f7.preloader.hide();
                    return false;
                }
            )
    }

    //DEPRECATED
    getListFromAPI = (apiurl, processingFunction) => {
        // this.$f7.preloader.show(); //preloader show - working way
        
        const selecturl = config.apihost + ':' + config.apiport + apiurl; //ex. apiurl = /api/rentapp_reads/
        log.debug(selecturl); //creting url
        
        return Auth.fetch(selecturl, {
            method: 'GET',
        })
            .then(
                (res) => {
                    if (res.meta.success === true){
                        let r = res.data;
                        log.debug(r);
                        /**
                         * SORT FUNCTION DESCENDING
                         */
                        r.sort(function (a, b) {
                            let c = a.dt.replace(/\D/g, '');
                            let d = b.dt.replace(/\D/g, '');
                            return d - c;
                        });
                        
                        r = processingFunction(r); //process
                        //TODO: STORE UPDATE IF NOT EQUAL
                        store.get().set(this.getStoreElem(apiurl), r); //update store with processed value
                    }
                    // this.$f7.preloader.hide();
                    return Promise.resolve(res);
                },
                (error) => {
                    // SET EMPTY/DUMMY rentlist store
                    store.get().set(this.getStoreElem(apiurl), [
                        this.emptyListElement()
                    ]);
                    log.debug('ReadsList.getReadsFromAPI.ERROR: ' + error.message);
                    // this.$f7.preloader.hide();
                    return false;
                }
            )
    }

    //DEPRECATED
    getReadsListFromAPI = () => {
        this.$f7.preloader.show(); //preloader show - working way
        
        const selecturl = config.apihost + ':' + config.apiport + '/api/rentapp_reads/';
        log.debug(selecturl); //creting url
        
        return Auth.fetch(selecturl, {
            method: 'GET',
        })
            .then(
                (res) => {
                    if (res.meta.success === true){
                        let r = res.data;
                        log.debug(r);
                        /**
                         * SORT FUNCTION DESCENDING
                         */
                        r.sort(function (a, b) {
                            let c = a.dt.replace(/\D/g, '');
                            let d = b.dt.replace(/\D/g, '');
                            return d - c;
                        });
                        
                        //TODO: process r object
                        r = this.calculateConsumptions(r);

                        //TODO: calculate costs
                        r = this.calculateCostAndUpdateStore(r);

                        //TODO STORE UPDATE IF NOT EQUAL
                        store.get().set('ReadsList', r);
                    }
                    this.$f7.preloader.hide();
                    return Promise.resolve(res);
                },
                (error) => {
                    // SET EMPTY/DUMMY rentlist store
                    store.get().set('ReadsList', [
                        this.emptyListElement()
                    ]);
                    log.debug('ReadsList.getReadsFromAPI.ERROR: ' + error.message);
                    this.$f7.preloader.hide();
                    return false;
                }
            )
    }

    //DEPRECATED
    calculateConsumptions = (reads) => {
        var r = reads;
        // log.debug('calculateConsumption.reads: ');log.debug(r);

        let curr = 0;
        let prev = curr;
        let number_of_decimal_nums = 1000;
        for (var i = 0; i < r.length; i++) {
            curr = r[i];
            prev = ( i === r.length-1 ) ? curr : r[i+1]; //iterate from newest to oldesst
            
            r[i].cwcons = r[i].stat !== 'wymiana' ? Math.round((curr.cw - prev.cw) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].zwcons = r[i].stat !== 'wymiana' ? Math.round((curr.zw - prev.zw) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].pradcons = r[i].stat !== 'wymiana' ? Math.round((curr.prad - prev.prad) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].months = r[i].stat !== 'wymiana' ? this.countMonths(new Date(curr.dt), new Date(prev.dt)) : 0;
        }

        // #region TEST DATES DIFFERENCE
        // let d1 = new Date(2010, 2, 1); // November 4th, 2008
        // let d2 = new Date(2010, 2, 14);  // March 12th, 2010
        // console.log('dt1, dt2: '+d1+','+d2)
        // console.log('countFullMonths: '+this.countFullMonths(d1,d2));
        // console.log('countMonths: '+this.countMonths(d1,d2));
        // #endregion

        return r;
    }

    calculateConsumptionsAndCostAndSaveInStore = () => {
        var r = JSON.parse(JSON.stringify(store.get().apirentapp_reads)); // make a copy of an object not a refference
        var wps = store.get().apirentapp_water_prices;
        var eps = store.get().apirentapp_energy_prices;

        let curr = 0;
        let prev = curr;
        let number_of_decimal_nums = 1000;
        let waterprice = 0;
        let energyprice = 0;

        for (var i = 0; i < r.length; i++) {
            curr = r[i];
            prev = ( i === r.length-1 ) ? curr : r[i+1]; //iterate from newest to oldesst

            r[i].cwcons = r[i].stat !== 'wymiana' ? Math.round((curr.cw - prev.cw) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].zwcons = r[i].stat !== 'wymiana' ? Math.round((curr.zw - prev.zw) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].pradcons = r[i].stat !== 'wymiana' ? Math.round((curr.prad - prev.prad) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].months = r[i].stat !== 'wymiana' ? this.countMonths(new Date(curr.dt), new Date(prev.dt)) : 0;

            // log.debug(curr.dt);
            // log.debug(wps.find(x => x.dt <= curr.dt)); //returns first lower then

            waterprice = wps.find(x => x.dt <= curr.dt);
            r[i].zwcost = Math.round((waterprice.cenazwzuzycie * r[i].zwcons)*100)/100;
            // r[i].cwcost = waterprice.cenacwzuzycie * r[i].cwcons + waterprice.cenacwstala * this.countFullMonths(new Date(curr.dt), new Date(prev.dt));
            r[i].cwcost = Math.round((waterprice.cenacwzuzycie * r[i].cwcons + waterprice.cenacwstala * r[i].months)*100)/100;

            energyprice = eps.find(x => x.dt <= curr.dt);
            r[i].pradcost = 
                Math.round(
                    (
                        (r[i].months * (energyprice.sieciowastala + energyprice.przejsciowa + energyprice.abonament + energyprice.salesstala)
                        + r[i].pradcons * (energyprice.sieciowazmienna + energyprice.saleszmienna + energyprice.jakosciowa)) * 1.23
                        + 6
                    )*100
                )/100
            ;

            r[i].totalcost = Math.round((r[i].zwcost + r[i].cwcost + r[i].pradcost)*100)/100;

            // $cenapradu =
            // round($iloscmiesiecy * wybierzcenepradu($datawyliczenia, 'siecst'),2) +
            // round($zuzyciepradu * wybierzcenepradu($datawyliczenia, 'sieczm'),2) +
            // round($iloscmiesiecy * wybierzcenepradu($datawyliczenia, 'prze'),2) +
            // round($zuzyciepradu * wybierzcenepradu($datawyliczenia, 'jako'),2) +
            // round($iloscmiesiecy * wybierzcenepradu($datawyliczenia, 'abon'),2) +
            // round($zuzyciepradu * wybierzcenepradu($datawyliczenia, 'salezm'),2) +
            // round($iloscmiesiecy * wybierzcenepradu($datawyliczenia, 'salest'),2);
            // $cenapradu = round($cenapradu+$cenapradu*0.23+6,2);
        }

        store.get().set('apirentapp_reads', r); //update store with processed value
    }

    countMonths = (dateFrom, dateTo) => {
        let result = dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear())) + (dateTo.getDate() - dateFrom.getDate())/30;
        return Math.abs(Math.round(result*10)/10);
    }

    countFullMonths = (dateFrom, dateTo) => {
        let result = dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
        return Math.abs(result);
    }
    
    dtformat = (dtfull) => {
        var dt = dtfull.substring(0,10);
        return dt;
    };

    getStoreElem = (apiurl) => {
        return apiurl.replace(/\//g,'');
    }
    
    loadMore = (event, done) => {
        // this.getReadsListFromAPI();
        this.calculateConsumptionsAndCostAndSaveInStore();
        done();
    }
    
    render() {
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll ptr onPtrRefresh={this.loadMore}>
                <Navbar title={labels.en.ReadsListtitle} backLink={labels.en.back} />
                <List mediaList virtualList
                      virtualListParams={{ items: store.get().apirentapp_reads, height: this.$theme.ios ? 63 : 73}}>
                    <ul>
                        {store.get().apirentapp_reads.map((item, index) => (
                            <ListItem
                                key={index}
                                link={'/read/'+item.rentapp_readid}
                                header={<Input type='date' value={this.dtformat(item.dt)} disabled />}
                                title={(item.stat !== 'wymiana' && item.stat !== '-' && item.stat !== 'tocalculate') ? item.totalcost+' PLN' : ''}
                                badge={item.stat==='paid' ? labels.en.paid : item.stat==='due' ? labels.en.due : item.stat==='wymiana' ? labels.en.wymiana : item.stat==='-' ? labels.en.poczatkowy : labels.en.tocalculate}
                                badgeColor={item.stat==='paid' ? 'green' : item.stat==='due' ? 'red' : 'orange'}
                                footer={
                                    (item.stat !== 'wymiana' && item.stat !== '-' && item.stat !== 'tocalculate') ? 
                                    <Block>
                                    <Row>
                                        <Col></Col>
                                        <Col>Zimna woda</Col>
                                        <Col>Ciepla woda</Col>
                                        <Col>Prad</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.readreading}</Col>
                                        <Col>{item.zw}</Col>
                                        <Col>{item.cw}</Col>
                                        <Col>{item.prad}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.readconsumption}</Col>
                                        <Col>{item.zwcons}</Col>
                                        <Col>{item.cwcons}</Col>
                                        <Col>{item.pradcons}</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.readamount}</Col>
                                        <Col>{item.zwcost}</Col>
                                        <Col>{item.cwcost}</Col>
                                        <Col>{item.pradcost}</Col>
                                    </Row>
                                    </Block>
                                    :
                                    <Block>
                                    <Row>
                                        <Col></Col>
                                        <Col>Zimna woda</Col>
                                        <Col>Ciepla woda</Col>
                                        <Col>Prad</Col>
                                    </Row>
                                    <Row>
                                        <Col>{labels.en.readreading}</Col>
                                        <Col>{item.zw}</Col>
                                        <Col>{item.cw}</Col>
                                        <Col>{item.prad}</Col>
                                    </Row>
                                    </Block>
                                }
                            />
                        ))}
                    </ul>
                </List>
                <Fab position="center-bottom" slot="fixed" color="blue" href='/read/'>
                    <Icon ios="f7:add" md="material:add"></Icon>
                </Fab>
            </Page>
        );
    }
}

export default ReadsList;
