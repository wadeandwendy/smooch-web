import { BRAND } from './DOMAIN';

(function(root, factory) {
    /* global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return (root.BRAND = factory());
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.BRAND = factory();
    }
}(global, () => {
    return new BRAND();
}));
