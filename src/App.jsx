import React, { Component } from 'react';
import {App as F7App, View, Panel} from 'framework7-react';
import config from "./config/config";
import Logger from './logger';

import logo from './img/logo.svg';
import './css/app.css';
import Component1 from "./components/Component1";
import Component2 from "./components/Component2";
import LoginPage from "./components/Login";
import Home from "./components/Home";
import LeftPanel from "./components/PanelLeft";
import store from './store/store';
import RentsList from "./components/RentsList";
import Rent from './components/Rent';

const f7params = {
    name: 'My App',
    id: 'com.myapp.test',
    // specify routes for app
    routes: [
        {
            path: '/',
            component: Home,
        },
        {
            path: '/login/',
            component: LoginPage,
        },
        {
            path: '/c1/',
            component: Component1,
        },
        {
            path: '/c2/',
            component: Component2,
        },
        {
            path: '/panel-left/',
            component: LeftPanel,
        },
        {
            path: '/rentsList/',
            component: RentsList,
        },
        {
            path: '/rent/',
            component: Rent,
        },
        {
            path: '/rent/:rentid',
            component: Rent,
        },
        
    ],
};

const log = Logger({level: config.loglevel}); // Logger
class App extends Component {
    componentDidMount() {
        var me = this; // reference to this component
        store.on('update', function(){ me.forceUpdate(); }); // RE-RENDER component if store updated
        
        if(!store.get().isLogged) this.$f7.views.main.router.navigate('/login/');
    }
    
  render() {
    return (
      <F7App params={f7params}>
          <Panel left cover themeDark >
              <View id="left-panel" url={'/panel-left/'} /*user={this.state.user}*/ />
          </Panel>
          <View id="main-view" url={'/'} main className="ios-edges">
              <Home/>
          </View>
      </F7App>
    );
  }
}

export default App;
