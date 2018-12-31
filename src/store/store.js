import Freezer from 'freezer-js';
// import Utils from './utils';

// Try to recover the store from the localStorage
let state = {
    a: 'ready',
    b: 'pending'
};

// Returns the freezer instance with the store.
export default new Freezer( state );