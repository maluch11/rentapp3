import React, {Component} from 'react';
import {Page, Navbar, List, ListItem, Input, Fab, Icon, Block, Row, Col} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from "../config/labels";
import AuthService from '../AuthService';

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger

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
        
        if(store.get().ReadsList === undefined){
            // SET EMPTY/DUMMY rentlist store
            store.get().set('ReadsList', [
                        this.emptyListElement()
                    ]);
        }
    }
    
    componentWillMount() {

    }
    
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', () => { me.forceUpdate(); Auth.saveToLocalStorage();}); // RE-RENDER component if store updated
    
        this.getReadsListFromAPI();
        log.debug('componentDidMount'+'getReadsListFromAPI()');
        // this.calculateConsumptions();
        // log.debug('componentDidMount'+'calculateConsumptions()');
    }
    
    componentWillReceiveProps(nextProps) {
    
    }
    
    componentWillUpdate(nextProps, nextState) {
    
    }
    
    componentDidUpdate(prevProps, prevState) {

    }
    
    componentWillUnmount() {
    
    }
    
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
                        
                        //TODO process r object
                        r = this.calculateConsumptions(r);

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

    calculateConsumptions = (reads) => {
        let r = reads;

        let curr = 0;
        let prev = curr;
        let number_of_decimal_nums = 1000;
        for (var i = 0; i < r.length; i++) {
            curr = r[i];
            prev = ( i === r.length-1 ) ? curr : r[i+1];
            
            r[i].cwcons = r[i] !== 'wymiana' ? Math.round((curr.cw - prev.cw) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].zwcons = r[i] !== 'wymiana' ? Math.round((curr.zw - prev.zw) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].pradcons = r[i] !== 'wymiana' ? Math.round((curr.prad - prev.prad) * number_of_decimal_nums) / number_of_decimal_nums : 0;
            r[i].months = r[i] !== 'wymiana' ? this.countMonths(new Date(curr.dt), new Date(prev.dt)) : 0;
        }

        // #region TEST DATES DIFFERENCE
        // let d1 = new Date(2010, 1, 1); // November 4th, 2008
        // let d2 = new Date(2010, 2, 10);  // March 12th, 2010
        // console.log(this.countFullMonths(d1,d2));
        // console.log(this.countMonths(d1,d2));
        // #endregion

        return r;
    }

    countFullMonths = (dt2,dt1) => {
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60 * 24 * 7 * 4);
        return Math.abs(Math.round(diff));
    }
    
    countMonths = (dt2, dt1) => {
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60 * 24 * 7 * 4);
        return Math.abs(Math.round(diff*10)/10);
    }

    calculateCostAndUpdateStore = () => {

    }
    
    dtformat = (dtfull) => {
        var dt = dtfull.substring(0,10);
        return dt;
    };
    
    loadMore = (event, done) => {
        this.getReadsListFromAPI();
        done();
    }
    
    render() {
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll ptr onPtrRefresh={this.loadMore}>
                <Navbar title={labels.en.ReadsListtitle} backLink={labels.en.back} />
                <List mediaList virtualList
                      virtualListParams={{ items: store.get().ReadsList, height: this.$theme.ios ? 63 : 73}}>
                    <ul>
                        {store.get().ReadsList.map((item, index) => (
                            <ListItem
                                key={index}
                                link={'/read/'+item.rentapp_readid}
                                title={<Input type='date' value={this.dtformat(item.dt)} disabled />}
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
                                        <Col>{labels.en.readamount} months: {item.months}</Col>
                                        <Col>{item.zw}</Col>
                                        <Col>{item.cw}</Col>
                                        <Col>{item.prad}</Col>
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
