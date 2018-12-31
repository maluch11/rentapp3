import React, {Component} from 'react';
import {Page, Navbar, Link, List, ListItem, BlockTitle, NavTitle, NavLeft} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import Component2 from "./Component2";
import config from "../config/config";

let refreshNo = 0;

const log = Logger({level: config.loglevel}); // Logger
class Component1 extends Component {
    constructor(props) {
        super(props);
    }
    
    componentWillMount() {
    
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
    
    clickMeHandle = () => {
        log.debug(store.get());
        store.get().set('b','working '+refreshNo);
        store.emit('update-b');
        log.debug(store.get());
    };
    
    handleLogout = () => {
        store.get().set('isLogged','');
        this.$f7.views.main.router.navigate('/login/');
    };
    
    render() {
        refreshNo++;
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll>
                <Navbar title="Component1" backLink="Back"/>
                <BlockTitle>Component 1 is: {store.get().a} ({refreshNo})</BlockTitle>
                <List>
                    <ListItem><Link onClick={this.handleLogout}>Logout</Link></ListItem>
                    <ListItem><Link href="/">Home</Link></ListItem>
                    <ListItem><Link href="/c1/">Component1</Link></ListItem>
                    <ListItem><Link href="/c2/">Component2</Link></ListItem>
                </List>
                <Link href="#" onClick = {this.clickMeHandle}>Click me</Link>
            </Page>
        );
    }
}

export default Component1;
