import { Sparkcentral } from './sparkcentral';

(function(root, factory) {
    /* global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return (root.Sparkcentral = factory());
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Sparkcentral = factory();
    }
}(global, () => {
    return new Sparkcentral();
}));
