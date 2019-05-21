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

class EnergyPrice extends Component {
    emptyListElement = () => {
        let emptyListElement = {
             dt: this.getFirstDayNextMonth(), 
             sieciowastala: 0,  
             sieciowazmienna: 0,  
             jakosciowa: 0,  
             przejsciowa: 0,  
             abonament: 0,  
             saleszmienna: 0,  
             salesstala: 0,  
             rentapp_energy_priceid: '',
             contextid: store.get().selected_contextid,
        };
        return emptyListElement;
    }

    constructor(props) {
        super(props);

        log.debug(props.rentapp_energy_priceid);

        if (props.energy_priceid === undefined || props.energy_priceid === 'null' || props.energy_priceid === null || props.energy_priceid === '') {
            //NEW RENT
            this.state = this.emptyListElement();
        } else {
            //EDIT RENT
            this.state = store.get().apirentapp_energy_prices.find(x => x.rentapp_energy_priceid === props.energy_priceid); //get edited object
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
        if (this.state.rentapp_energy_priceid === '') {

            //NEW energy_price
            log.debug("NEW ENERGY PRICE")

            this.setState({ 'rentapp_energy_priceid': uniqueid.getUniqueid() }) //generate unique id
            store.get().apirentapp_energy_prices.unshift(this.state) //add new record to store
            
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

            //UPDATE energy_price
            log.debug("UPDATE ENERGY PRICE")
            
            let idx = store.get().apirentapp_energy_prices.findIndex(x => x.rentapp_energy_priceid === this.state.rentapp_energy_priceid) //get index of record in store
            store.get().apirentapp_energy_prices[idx].set(this.state) //update store

        }

        let inserturl = config.apihost + ':' + config.apiport + '/api/rentapp_energy_prices/' + this.state.rentapp_energy_priceid; //call API - create url
        log.debug(inserturl);
        Auth.fetch(inserturl, { //call API - POST
            method: 'POST',
            body: JSON.stringify({
                dt: this.state.dt,
                sieciowastala: this.state.sieciowastala,  
                sieciowazmienna: this.state.sieciowazmienna,  
                jakosciowa: this.state.jakosciowa,  
                przejsciowa: this.state.przejsciowa,  
                abonament: this.state.abonament,  
                saleszmienna: this.state.saleszmienna,  
                salesstala: this.state.salesstala,  
                rentapp_energy_priceid: this.state.rentapp_energy_priceid,
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
                            label={labels.en.EnergyPricesieciowastala}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.sieciowastala}
                            onInput={
                                (e) => {
                                    this.setState({ 'sieciowastala': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPricesieciowazmienna}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.sieciowazmienna}
                            onInput={
                                (e) => {
                                    this.setState({ 'sieciowazmienna': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPricejakosciowa}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.jakosciowa}
                            onInput={
                                (e) => {
                                    this.setState({ 'jakosciowa': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPriceprzejsciowa}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.przejsciowa}
                            onInput={
                                (e) => {
                                    this.setState({ 'przejsciowa': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPriceabonament}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.abonament}
                            onInput={
                                (e) => {
                                    this.setState({ 'abonament': e.target.value })
                                }
                            }
                        />                       
                        <ListInput
                            label={labels.en.WaterPricesaleszmienna}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.saleszmienna}
                            onInput={
                                (e) => {
                                    this.setState({ 'saleszmienna': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPricesalesstala}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.salesstala}
                            onInput={
                                (e) => {
                                    this.setState({ 'salesstala': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.WaterPricesaleszmienna}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.saleszmienna}
                            onInput={
                                (e) => {
                                    this.setState({ 'saleszmienna': e.target.value })
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
                            value={this.state.rentapp_energy_priceid}
                        />
                    </List>
                    {Auth.isAuthorized('EnergyPrice:edit') &&
                    <List>
                        <ListButton onClick={this.clickMeHandle} > {labels.en.ok} </ListButton>
                    </List> 
                    }
                </Page>
        );
    }
}

export default EnergyPrice;