import { VERSION } from '../../shared/js/constants/version';
import hostStyles from '../stylesheets/iframe.less';
import { waitForPage } from './utils/dom';
import { init as initEnquire } from './utils/enquire';

const Smooch = {};
let Lib;
let iframe;

let isEmbedded;
let embeddedContainer;

let pendingOnCalls = [];
let pendingInitCall;
let pendingInitNext;
let pendingInitCatch;

const shouldRenderLink = /lebo|awle|pide|obo|rawli/i.test(navigator.userAgent);
const isPhantomJS = /PhantomJS/.test(navigator.userAgent) && process.env.NODE_ENV !== 'test';

const LIB_FUNCS = [
    'init',
    'login',
    'on',
    'off',
    'logout',
    'track',
    'sendMessage',
    'updateUser',
    'getConversation',
    'getUserId',
    'getCore',
    'open',
    'close',
    'isOpened'
];

if (shouldRenderLink) {
    const el = document.createElement('a');
    el.href = 'https://smooch.io/live-web-chat/?utm_source=widget';
    el.text = 'Messaging by smooch.io';

    waitForPage(() => {
        document.body.appendChild(el);
    });
}

const Skeleton = {
    VERSION,
    on(...args) {
        if (!pendingOnCalls) {
            pendingOnCalls = [];
        }

        pendingOnCalls.push({
            args
        });
    },
    init(...args) {
        pendingInitCall = args;
        isEmbedded = args.length > 0 && !!args[0].embedded;

        if (!shouldRenderLink && !isPhantomJS) {
            waitForPage(() => {
                injectFrame();
                hostStyles.use();
            });
        }

        return {
            then: (next) => pendingInitNext = next,
            catch: (next) => pendingInitCatch = next
        };
    },
    render(container) {
        if (iframe) {
            container.appendChild(iframe);
        } else {
            embeddedContainer = container;
        }
    },
    destroy() {
        if (Lib) {
            Lib.destroy();
            iframe.remove();
            setUp();
        }
    }
};

function setUp() {
    Lib = undefined;
    iframe = undefined;
    window.__onLibReady = onSmoochReady;
    for (let func = LIB_FUNCS[0], i = 0; i < LIB_FUNCS.length; func = LIB_FUNCS[++i]) {
        Smooch[func] &&
        delete Smooch[func];
    }
    Object.assign(Smooch, Skeleton);
}

function onSmoochReady(_Lib) {
    window.__onLibReady = function() {};
    Lib = _Lib;
    if (!isEmbedded) {
        initEnquire(iframe);
    }

    for (let func = LIB_FUNCS[0], i = 0; i < LIB_FUNCS.length; func = LIB_FUNCS[++i]) {
        Smooch[func] = Lib[func];
    }

    if (pendingOnCalls) {
        for (let call = pendingOnCalls[0], i = 0; i < pendingOnCalls.length; call = pendingOnCalls[++i]) {
            Lib.on(...call.args);
        }
        pendingOnCalls = undefined;
    }


    if (pendingInitCall) {
        const promise = Lib.init(...pendingInitCall);
        pendingInitCall = undefined;

        if (pendingInitNext) {
            promise.then(pendingInitNext);
            pendingInitNext = undefined;
        }

        if (pendingInitCatch) {
            pendingInitCatch = undefined;
            promise.catch(pendingInitCatch);
        }
    }
}

function injectFrame() {
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.className = hostStyles.ref().locals.iframe;
        let loaded = false;
        iframe.onload = () => {
            if (!loaded) {
                loaded = true;
                delete iframe.onload;
                const doc = iframe.contentWindow.document;
                doc.open();
                doc.write(`<!DOCTYPE html><html><head><script src="${FRAME_LIB_URL}"></script></head><body><div id="mount"></div></html>`);
                doc.close();
            }
        };
    }

    if (isEmbedded) {
        if (embeddedContainer) {
            embeddedContainer.appendChild(iframe);
            embeddedContainer = undefined;
        }
    } else {
        document.body.appendChild(iframe);
    }
}

setUp();

export default Smooch;