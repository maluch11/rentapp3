import React, {Component} from 'react';
import {Page, Navbar, List, ListItem, BlockFooter, BlockHeader, Block } from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from '../config/labels';

let refreshNo = 0;

const log = Logger({level: config.loglevel}); // Logger
class PanelLeft extends Component {
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
            <Page>
                <Navbar title="Menu"/>
                <Block>
                    <BlockHeader>Menu</BlockHeader>
                    <List>
                        <ListItem link="/" title="Home" view="#main-view" panelClose />
                        {/*<ListItem link="/c1/" title="Component1" view="#main-view" panelClose />*/}
                        {/*<ListItem link="/c2/" title="Component2" view="#main-view" panelClose />*/}
                        <ListItem link="/rentsList/" title={labels.en.rentslisttitle} view="#main-view" panelClose />
                        <ListItem link="/readsList/" title={labels.en.ReadsListtitle} view="#main-view" panelClose />
                        <ListItem link="/waterPricesList/" title={labels.en.WaterPricestitle} view="#main-view" panelClose />
                        <ListItem link="/energyPricesList/" title={labels.en.EnergyPricestitle} view="#main-view" panelClose />
                        {/*<ListItem link="/rent/" title={labels.en.rentaddtitle} view="#main-view" panelClose />*/}
                    </List>
                    <BlockFooter>Menu Footer</BlockFooter>
                </Block>
            </Page>
        );
    }
}

export default PanelLeft;
