import React, {Component} from 'react';
import {Page, Navbar, Link, List, ListItem, BlockTitle, Block, BlockHeader, BlockFooter, NavLeft, NavRight,NavTitle, Toolbar, Popover, Input, Button, Row, Col, Icon, Subnavbar} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import labels from "../config/labels";
import AuthService from '../AuthService';
import rules from "../rbac-rules";

import RentsList from './RentsList';
import ReadsList from './ReadsList';

let refreshNo = 0;

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger
class Home extends Component {
    constructor(props) {
        super(props);
        log.debug('Home.constructor');
    }
    
    componentWillMount() {
        
    }
    
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', function(){ me.forceUpdate(); Auth.saveToLocalStorage();}); // RE-RENDER component if store updated 

        //everything happening here is before authentication
        log.debug('home.componentDidMount');
    }
    
    componentWillReceiveProps(nextProps) {
    
    }
    
    componentWillUpdate(nextProps, nextState) {
    }
    
    componentDidUpdate(prevProps, prevState) {
    }
    
    componentWillUnmount() {
    
    }
    
    handleLogout = () => {
        Auth.logout();
        this.$f7.views.main.router.navigate('/login/');
    };
    navigateLogin = () => {
        this.$f7.views.main.router.navigate('/login/');
    };

    handleContextChange = (contextid) => {
        log.debug('handleContextChange: '+JSON.stringify(contextid));
        store.get().set('selected_contextid', contextid);
    }
    
    dtformat = (dtfull) => {
        var dt = dtfull.substring(0,10);
        return dt;
    };

    refresh = () => {
        var rents = new RentsList();
        rents.getRentsListFromAPI();
        var reads = new ReadsList();
        reads.getAllDataFromAPIS();
    }

    loadMore = (event, done) => {
        this.refresh();
        done();
    }

    render() {
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll ptr onPtrRefresh={this.loadMore}>
                <Navbar>
                    <NavLeft>
                        <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="left" />
                    </NavLeft>
                    <NavTitle>Home</NavTitle>
                    <NavRight>{
                        Auth.isLogged()
                            ? <Link onClick={this.handleLogout}>Logout</Link>
                            : <Link onClick={this.navigateLogin}>Login</Link>
                    }</NavRight>
                </Navbar>
                <Block> 
                    <BlockTitle><center>Przeciągnij w dół aby odświezyć</center></BlockTitle>
                    <BlockHeader><center>Witaj {Auth.getProfile() != null ? Auth.getProfile().username : ''}</center></BlockHeader>
                </Block> 

{
                // {Auth.isLogged && <Block><Row><Col></Col><Col><Button fill onClick={this.refresh}>
                //     <Icon ios="f7:refresh" aurora="f7:refresh" md="material:refresh"></Icon>
                // </Button></Col><Col></Col></Row></Block>}
}
                <BlockTitle>{labels.en.rentslisttitle}</BlockTitle>
                <List>
                    {
                        (store.get().apirentapp_rents !== undefined ? store.get().apirentapp_rents : []).map((item, index) => (
                        index <= 2 && <ListItem
                            key={index}
                            header={<Input type='date' value={this.dtformat(item.dt)} disabled />}
                            badge={item.stat==='paid' ? labels.en.paid : labels.en.due}
                            badgeColor={item.stat==='paid' ? 'green' : 'red'}
                            title={item.kwota+' PLN'}
                            link={Auth.isAuthorized('Rent:visit') ? '/rent/'+item.rentapp_rentid : '#'}
                        />
                        ))
                    }
                </List>

                <BlockTitle>{labels.en.ReadsListtitle}</BlockTitle>
                <List>
                    {
                        (store.get().apirentapp_reads !== undefined ? store.get().apirentapp_reads : []).map((item, index) => (
                        index <= 2 && <ListItem
                            key={index}
                            header={<Input type='date' value={this.dtformat(item.dt)} disabled />}
                            title={(item.stat !== 'wymiana' && item.stat !== '-' && item.stat !== 'tocalculate') ? item.totalcost+' PLN' : ''}
                            badge={item.stat==='paid' ? labels.en.paid : item.stat==='due' ? labels.en.due : item.stat==='wymiana' ? labels.en.wymiana : item.stat==='-' ? labels.en.poczatkowy : labels.en.tocalculate}
                            badgeColor={item.stat==='paid' ? 'green' : item.stat==='due' ? 'red' : 'orange'}
                            link={Auth.isAuthorized('Read:visit') ? '/read/'+item.rentapp_readid : '#'}
                        />
                        ))
                    }
                </List>



                {Auth.isAuthorized('Context:edit') && 
                <Toolbar bottom-md>
                    <Link popoverOpen='.submenu'>{Auth.isLogged ? store.get().selected_contextid : 'not logged'}</Link>
                </Toolbar>
                }
            
                <Popover className="submenu">
                    <List>
                        {
                            (store.get().apirentapp_users_contexts !== undefined ? store.get().apirentapp_users_contexts : []).map((item, index) => (
                            <ListItem
                                key={index}
                                onClick={(e) => this.handleContextChange(item.contextid)}
                                link='#'
                                popoverClose 
                                title={item.contextid}
                            />
                            ))
                        }
                    </List>
                </Popover>
                

            </Page>
        );
    }
}

export default Home;
