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

class Read extends Component {
    emptyListElement = () => {
        let emptyListElement = {
            dt: this.getNow(),
            cw: 0,
            zw: 0,
            prad: 0,
            prad_oplata: -1,
            stat: 'due',
            rentapp_readid: '',
        };
        return emptyListElement;
    }

    constructor(props) {
        super(props);

        log.debug(props.readid);

        if (props.readid === undefined || props.readid === 'null' || props.readid === null || props.readid === '') {
            //NEW RENT
            this.state = this.emptyListElement();
        } else {
            //EDIT RENT
            this.state = store.get().apirentapp_reads.find(x => x.rentapp_readid === props.readid); //get edited object
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
        if (this.state.rentapp_readid === '') {

            //NEW READ
            log.debug("NEW READ")

            this.setState({ 'rentapp_readid': uniqueid.getUniqueid() }) //generate unique id
            store.get().apirentapp_reads.unshift(this.state) //add new record to store
            
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
            
            let idx = store.get().apirentapp_reads.findIndex(x => x.rentapp_readid === this.state.rentapp_readid) //get index of record in store
            store.get().apirentapp_reads[idx].set(this.state) //update store

        }

        let inserturl = config.apihost + ':' + config.apiport + '/api/rentapp_read/' + this.state.rentapp_readid; //call API - create url
        log.debug(inserturl);
        Auth.fetch(inserturl, { //call API - POST
            method: 'POST',
            body: JSON.stringify({
                dt: this.state.dt,
                cw: this.state.cw,
                zw: this.state.zw,
                prad: this.state.prad,
                prad_oplata: this.state.prad_oplata,
                stat: this.state.stat,
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
                            label={labels.en.readcw}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.cw}
                            onInput={
                                (e) => {
                                    this.setState({ 'cw': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.readzw}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.zw}
                            onInput={
                                (e) => {
                                    this.setState({ 'zw': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            label={labels.en.readprad}
                            type="text"
                            required validate pattern="[0-9]*\.?[0-9]+"
                            clearButton defaultValue={this.state.prad}
                            onInput={
                                (e) => {
                                    this.setState({ 'prad': e.target.value })
                                }
                            }
                        />
                        <ListInput
                            disabled={!Auth.isAuthorized('Read:edit')}
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
                            <option value='wymiana' > {labels.en.wymiana} </option>
                            <option value='tocalculate' > {labels.en.tocalculate} </option>
                            <option value='-' > {labels.en.poczatkowy} </option>
                            
                        </ListInput>
                        <ListInput label={labels.en.id}
                            type='text'
                            value={this.state.rentapp_readid}
                        />
                    </List>
                    {Auth.isAuthorized('Read:edit') &&
                    <List>
                        <ListButton onClick={this.clickMeHandle} > {labels.en.ok} </ListButton>
                    </List> 
                    }
                </Page>
        );
    }
}

export default Read;