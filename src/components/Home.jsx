import React, {Component} from 'react';
import {Page, Navbar, Link, List, ListItem, BlockTitle, Block, BlockHeader, BlockFooter, NavLeft, NavRight,NavTitle} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";

let refreshNo = 0;

const log = Logger({level: config.loglevel}); // Logger
class Home extends Component {
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
    
    handleLogout = () => {
        store.get().set('isLogged','');
        this.$f7.views.main.router.navigate('/login/');
    };
    navigateLogin = () => {
        this.$f7.views.main.router.navigate('/login/');
    };
    
    render() {
        refreshNo++;
        return (
            <Page hideToolbarOnScroll hideNavbarOnScroll>
                <Navbar>
                    <NavLeft>
                        <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="left" />
                    </NavLeft>
                    <NavTitle>Home</NavTitle>
                    <NavRight>{
                        store.get().isLogged
                            ? <Link onClick={this.handleLogout}>Logout</Link>
                            : <Link onClick={this.navigateLogin}>Login</Link>
                    }</NavRight>
                </Navbar>
                <BlockTitle>Legged-In as:</BlockTitle>
                {/*<List>*/}
                    {/*<ListItem link="/login/" title="LoginPage"></ListItem>*/}
                    {/*<ListItem><Link onClick={this.handleLogout}>Logout</Link></ListItem>*/}
                {/*</List>*/}
                <Block>
                    <BlockHeader>username {store.get().username}</BlockHeader>
                    <BlockFooter>password {store.get().password}</BlockFooter>
                </Block>
                {/*{*/}
                    {/*store.get().isLogged ?*/}
                    {/*<List>*/}
                        {/*<ListItem><Link href="/">Home</Link></ListItem>*/}
                        {/*<ListItem><Link href="/c1/">Component1</Link></ListItem>*/}
                        {/*<ListItem><Link href="/c2/">Component2</Link></ListItem>*/}
                    {/*</List>*/}
                        {/*: null*/}
                {/*}*/}
            </Page>
        );
    }
}

export default Home;
