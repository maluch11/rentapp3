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
class Rent extends Component {
    constructor(props) {
        super(props);
        // log.debug('Rent, props.rentid: ' + props.rentid);
        // #region just for testing
        // log.debug(JSON.parse(props.rentid));
        //
        // let rentslist = store.get().rentslist;
        // log.debug(rentslist);
        //
        // let obj = rentslist.find(x => x.rentapp_rentid == JSON.parse(props.rentid).rentapp_rentid);
        // let idx = rentslist.findIndex(x => x.rentapp_rentid == JSON.parse(props.rentid).rentapp_rentid); //working
        //
        // log.debug(obj);
        // log.debug(idx);
        //
        //
        // let indx = rentslist.indexOf(JSON.parse(props.rentid));
        // log.debug('index in table: '+indx);
        // #endregion   

        if (props.rentid === undefined || props.rentid === 'null' || props.rentid === null || props.rentid === '') {
            //NEW RENT
            this.state = {
                dt: this.getFirstDayNextMonth(),
                kwota: 900,
                stat: 'due',
                rentapp_rentid: '',
            }
        } else {
            //EDIT RENT
            this.state = store.get().rentslist.find(x => x.rentapp_rentid === props.rentid); //get edited object
        }
    }

    componentWillMount() {}

    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', () => { me.forceUpdate(); }); // RE-RENDER component if store updated
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
        if (this.state.rentapp_rentid === '') {

            //NEW RENT
            log.debug("NEW RENT")

            this.setState({ 'rentapp_rentid': uniqueid.getUniqueid() }) //generate unique id
            store.get().rentslist.unshift(this.state) //add new record to store
            
            let inserturl = config.apihost + ':' + config.apiport + '/api/rentapp_rent/' + this.state.rentapp_rentid; //call API - create url
            log.debug(inserturl);
            Auth.fetch(inserturl, { //call API - POST
                method: 'POST',
                body: JSON.stringify({
                    dt: this.state.dt,
                    kwota: this.state.kwota,
                    stat: this.state.stat,
                })
            })

        } else {

            //UPDATE RENT
            log.debug("UPDATE RENT")
            
            let idx = store.get().rentslist.findIndex(x => x.rentapp_rentid === this.state.rentapp_rentid) //get index of record in store
            store.get().rentslist[idx].set(this.state) //update store

            let inserturl = config.apihost + ':' + config.apiport + '/api/rentapp_rent/' + this.state.rentapp_rentid; //call API - create url
            log.debug(inserturl);
            Auth.fetch(inserturl, { //call API - POST
                method: 'POST',
                body: JSON.stringify({
                    dt: this.state.dt,
                    kwota: this.state.kwota,
                    stat: this.state.stat,
                })
            })

        }

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
                    <Navbar title={labels.en.renttitle} backLink={labels.en.back} />
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
                            label={labels.en.rentamount}
                            type="text"
                            required validate pattern="[0-9]*"
                            clearButton defaultValue={this.state.kwota}
                            onInput={
                                (e) => {
                                    this.setState({ 'kwota': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.statuslabel}
                            type='select'
                            defaultValue={this.state.stat}
                            placeholder={labels.en.selectlabel}
                            onInput={
                                (e) => {
                                    this.setState({ 'stat': e.target.value })
                                }
                            }
                        >
                            <option value='paid' > {labels.en.paid} </option>
                            <option value='due' > {labels.en.due} </option>
                        </ListInput>
                        <ListInput label='rentid'
                            type='text'
                            value={this.state.rentapp_rentid}
                        />
                    </List>
                    <List>
                        <ListButton onClick={this.clickMeHandle} > {labels.en.ok} </ListButton>
                    </List>
                </Page>
        );
    }
}

export default Rent;