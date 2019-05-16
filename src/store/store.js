import Freezer from 'freezer-js'; //https://www.npmjs.com/package/freezer-js
// import Utils from './utils';

// TODO: Try to recover the store from the localStorage
let state = {
    appname: 'rentapp3'
};

// let state = localStorage.getItem('rentapp3store') === null ? {
//     a: 'ready',
//     b: 'pending'
// } : localStorage.getItem(JSON.parse('rentapp3store'));

// Returns the freezer instance with the store.
export default new Freezer(state);