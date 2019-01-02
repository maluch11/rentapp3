import Freezer from 'freezer-js';
// import Utils from './utils';

// Try to recover the store from the localStorage
// let state = {
//     a: 'ready',
//     b: 'pending'
// };

let state = localStorage.getItem('rentapp3store') === null ? {
    a: 'ready',
    b: 'pending'
} : localStorage.getItem(JSON.parse('rentapp3store'));

// Returns the freezer instance with the store.
export default new Freezer(state);