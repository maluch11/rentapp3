import React, { Component } from 'react';
import { Page, Navbar, List, ListButton, ListInput } from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from "../config/labels";
import AuthService from '../AuthService';
import uniqueid from "../store/uniqueid";

const log = Logger({ level: config.loglevel }); // Logger
const Auth = new AuthService(); // Authentication service

class WaterPrice extends Component {
    emptyListElement = () => {
        let emptyListElement = {
            dt: this.getNow(),
            cenacwzuzycie: 0,
            cenacwstala: 0,
            cenazwzuzycie: 0,
            rentapp_water_priceid: '',
            contextid: store.get().selected_contextid,
        };
        return emptyListElement;
    }

    constructor(props) {
        super(props);

        log.debug(props.rentapp_water_priceid);

        if (props.water_priceid === undefined || props.water_priceid === 'null' || props.water_priceid === null || props.water_priceid === '') {
            //NEW RENT
            this.state = this.emptyListElement();
        } else {
            //EDIT RENT
            this.state = store.get().apirentapp_water_prices.find(x => x.rentapp_water_priceid === props.water_priceid); //get edited object
        }
    }

    componentWillMount() {}

    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', () => { me.forceUpdate(); Auth.saveToLocalStorage();}); // RE-RENDER component if store updated
    }

    componentWillReceiveProps(nextProps) {

    }

    componentWillUpdate(nextProps, nextState) {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    componentWillUnmount() {

    }

    clickMeHandle = () => {
        if (this.state.rentapp_water_priceid === '') {

            //NEW water_price
            log.debug("NEW water_price")

            this.setState({ 'rentapp_water_priceid': uniqueid.getUniqueid() }) //generate unique id
            store.get().apirentapp_water_prices.unshift(this.state) //add new record to store
            
            // let inserturl = config.apihost + ':' + config.apiport + '/api/rentapp_read/' + this.state.rentapp_readid; //call API - create url
            // log.debug(inserturl);
            // Auth.fetch(inserturl, { //call API - POST
            //     method: 'POST',
            //     body: JSON.stringify({
            //         dt: this.state.dt,
            //         cw: this.state.cw,
            //         zw: this.state.zw,
            //         prad: this.state.prad,
            //         prad_oplata: this.state.prad_oplata,
            //         stat: this.state.stat,
            //     })
            // })

        } else {

            //UPDATE READ
            log.debug("UPDATE READ")
            
            let idx = store.get().apirentapp_water_prices.findIndex(x => x.rentapp_water_priceid === this.state.rentapp_water_priceid) //get index of record in store
            store.get().apirentapp_water_prices[idx].set(this.state) //update store

        }

        let inserturl = config.apihost + ':' + config.apiport + '/api/rentapp_water_price/' + this.state.rentapp_water_priceid; //call API - create url
        log.debug(inserturl);
        Auth.fetch(inserturl, { //call API - POST
            method: 'POST',
            body: JSON.stringify({
                dt: this.state.dt,
                cenacwzuzycie: this.state.cenacwzuzycie,
                cenacwstala: this.state.cenacwstala,
                cenazwzuzycie: this.state.cenazwzuzycie,
                contextid: this.state.contextid,
            })
        })

        ///rentapp_rent UPDATE STORE based on STATE and UPDATE API based on STATE (if OFFLINE then store the call in store and LOCAL-STOREGE
        log.debug(store.get());
    };

    dtformat = (dtfull) => {
        var dt = dtfull.substring(0, 10);
        return dt;
    };

    getNow = () => {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }

    getFirstDayNextMonth = () => {
        let today = new Date();
        let dd = '1';
        let mm = today.getMonth() + 2; //January is 0!
        let yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        if (mm > 12) {
            mm = '01'
            yyyy++;
        }

        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }

    render() {
        return (<Page hideToolbarOnScroll hideNavbarOnScroll >
                    <Navbar title={labels.en.readtitle} backLink={labels.en.back} />
                    <List form>
                        <ListInput
                            label={labels.en.dt}
                            type="date"
                            defaultValue={this.dtformat(this.state.dt)}
                            onInput={
                                (e) => {
                                    this.setState({ 'dt': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPricecenacwstala}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.cenacwstala}
                            onInput={
                                (e) => {
                                    this.setState({ 'cenacwstala': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPricecenacwzuzycie}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.cenacwzuzycie}
                            onInput={
                                (e) => {
                                    this.setState({ 'cenacwzuzycie': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPricecenazwzuzycie}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.cenazwzuzycie}
                            onInput={
                                (e) => {
                                    this.setState({ 'cenazwzuzycie': e.target.value })
                                }
                            }
                        />
                        <ListInput label={labels.en.contextid}
                            type='text'
                            disabled
                            value={this.state.contextid}
                        />
                        <ListInput label={labels.en.id}
                            type='text'
                            disabled
                            value={this.state.rentapp_water_priceid}
                        />
                    </List>
                    {Auth.isAuthorized('WaterPrice:edit') &&
                    <List>
                        <ListButton onClick={this.clickMeHandle} > {labels.en.ok} </ListButton>
                    </List> 
                    }
                </Page>
        );
    }
}

export default WaterPrice;