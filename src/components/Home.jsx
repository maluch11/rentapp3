import React, {Component} from 'react';
import {Page, Navbar, Link, List, ListItem, BlockTitle, Block, BlockHeader, BlockFooter, NavLeft, NavRight,NavTitle} from 'framework7-react';

import store from '../store/store';
import Logger from '../logger';
import config from "../config/config";
import AuthService from '../AuthService';
import rules from "../rbac-rules";

let refreshNo = 0;

const Auth = new AuthService(); // Authentication service
const log = Logger({level: config.loglevel}); // Logger
class Home extends Component {
    constructor(props) {
        super(props);
    }
    
    componentWillMount() {
    
    }
    
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', function(){ me.forceUpdate(); Auth.saveToLocalStorage();}); // RE-RENDER component if store updated


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

    check = (rules, role, action, data) => {
        const permissions = rules[role];
        if (!permissions) {
            // role is not present in the rules
            return false;
        }
        
        const staticPermissions = permissions.static;
        
        if (staticPermissions && staticPermissions.includes(action)) {
            // static rule not provided for action
            return true;
        }
        
        const dynamicPermissions = permissions.dynamic;
        
        if (dynamicPermissions) {
            const permissionCondition = dynamicPermissions[action];
            if (!permissionCondition) {
            // dynamic rule not provided for action
            return false;
            }
        
            return permissionCondition(data);
        }
        return false;
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
                        Auth.isLogged()
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
                    <BlockHeader>username {Auth.getProfile() != null ? Auth.getProfile().username : ''}</BlockHeader>
                    <BlockFooter>password {store.get().password}</BlockFooter>
                </Block> 
                {
                    //TODO: delete this block for production release
                }
                
                <Block>
                <p>
                    {JSON.stringify(Auth.getProfile())}
                </p>

                {Auth.isAuthorized('Home:visit') && <p>Authorized</p>}
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
