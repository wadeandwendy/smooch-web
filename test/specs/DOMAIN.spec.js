import sinon from 'sinon';

import { createMockedStore } from '../utils/redux';

import * as authService from '../../src/js/services/auth';
import * as conversationService from '../../src/js/services/conversation';
import * as coreService from '../../src/js/services/core';
import * as userService from '../../src/js/services/user';
import * as appUtils from '../../src/js/utils/app';
import * as commonActions from '../../src/js/actions/common-actions';
import * as appStateActions from '../../src/js/actions/app-state-actions';

import { BRAND } from '../../src/js/DOMAIN';

const AppStore = require('../../src/js/store');
const store = AppStore.store;

function mockAppStore(sinon, state) {
    var mockedStore = createMockedStore(sinon, state);

    Object.defineProperty(AppStore, 'store', {
        get: () => {
            return mockedStore;
        }
    });

    return mockedStore;
}

function restoreAppStore() {
    Object.defineProperty(AppStore, 'store', {
        get: () => {
            return store;
        }
    });
}

const defaultState = {
    user: {
        conversationStarted: true
    },
    conversation: {
        messages: []
    },
    appState: {
        serverUrl: 'http://localhost'
    },
    auth: {
        jwt: '1234'
    },
    faye: {
        subscription: true
    },
    ui: {
        text: {}
    },
    app: {}
};

describe('BRAND', () => {
    const sandbox = sinon.sandbox.create();
    let DOMAIN;

    let loginStub;
    let sendMessageStub;
    let connectFayeStub;
    let disconnectFayeStub;
    let updateUserStub;
    let trackEventStub;
    let getUserIdStub;
    let coreStub;
    let mockedStore;

    beforeEach(() => {
        sandbox.stub(BRAND.prototype, 'render');
        sandbox.spy(commonActions, 'reset');
        sandbox.spy(appStateActions, 'openWidget');
        sandbox.spy(appStateActions, 'closeWidget');
        DOMAIN = new BRAND();
        DOMAIN._container = '_container';
        sandbox.stub(document.body, 'appendChild');
        sandbox.stub(document.body, 'removeChild');
        sandbox.stub(document, 'addEventListener', (eventName, cb) => {
            if (eventName === 'DOMContentLoaded') {
                cb();
            }
        });

    });

    afterEach(() => {
        sandbox.restore();
        restoreAppStore();
        delete DOMAIN.appToken;
    });

    describe('Init', () => {
        const state = Object.assign({}, defaultState);

        beforeEach(() => {
            loginStub = sandbox.stub(DOMAIN, 'login');
            loginStub.resolves();
            mockedStore = mockAppStore(sandbox, state);
        });

        it('should call login', () => {
            const props = {
                userId: 'some-id',
                appToken: 'some-token',
                jwt: 'some-jwt',
                email: 'some@email.com'
            };

            return DOMAIN.init(props).then(() => {
                DOMAIN.appToken.should.eq(props.appToken);
                loginStub.should.have.been.calledWith(props.userId, props.jwt, {
                    email: 'some@email.com'
                });
            });
        });

    });

    describe('Login', () => {
        let loginStub;
        let immediateUpdateStub;
        let handleConversationUpdatedStub;

        beforeEach(() => {
            mockedStore = mockAppStore(sandbox, defaultState);
            loginStub = sandbox.stub(authService, 'login');
            loginStub.resolves({
                appUser: {
                    _id: 1
                },
                app: {
                    settings: {}
                }
            });

            immediateUpdateStub = sandbox.stub(userService, 'immediateUpdate');
            immediateUpdateStub.resolves({});

            connectFayeStub = sandbox.stub(conversationService, 'connectFayeConversation');
            connectFayeStub.resolves({});

            handleConversationUpdatedStub = sandbox.stub(conversationService, 'handleConversationUpdated');
            handleConversationUpdatedStub.resolves({});

            disconnectFayeStub = sandbox.stub(conversationService, 'disconnectFaye');

            const hasChannelsStub = sandbox.stub(appUtils, 'hasChannels');
            hasChannelsStub.returns(false);

            const getIntegrationStub = sandbox.stub(appUtils, 'getIntegration');
            getIntegrationStub.returns({});

            const getMessagesStub = sandbox.stub(conversationService, 'getMessages');
            getMessagesStub.resolves({});

        });

        afterEach(() => {
            sandbox.restore();
        });

        xit('should reset the user', () => {
            const props = {
                userId: 'some-id',
                appToken: 'some-token',
                jwt: 'some-jwt',
                email: 'some@email.com'
            };

            return DOMAIN.login(props.userId, props.jwt).then(() => {
                mockedStore.dispatch.firstCall.should.have.been.calledWith({
                    type: 'RESET_AUTH'
                });

                mockedStore.dispatch.secondCall.should.have.been.calledWith({
                    type: 'RESET_USER'
                });


                mockedStore.dispatch.thirdCall.should.have.been.calledWith({
                    type: 'RESET_CONVERSATION'
                });

                disconnectFayeStub.should.have.been.calledOnce;
            });
        });

        describe('conversation started', () => {
            const state = Object.assign({}, defaultState);
            beforeEach(() => {
                mockedStore = mockAppStore(sandbox, state);
            });

            it('should call the auth service, get the conversation and not connect to faye', () => {
                const props = {
                    userId: 'some-id',
                    appToken: 'some-token',
                    jwt: 'some-jwt',
                    email: 'some@email.com'
                };

                return DOMAIN.login(props.userId, props.jwt).then(() => {
                    const callArgs = loginStub.args[0][0];
                    callArgs.userId.should.eq(props.userId);
                    immediateUpdateStub.should.have.been.calledWith, {
                        email: 'some@email.com'
                    };
                    handleConversationUpdatedStub.should.have.been.calledOnce;
                    connectFayeStub.should.not.have.been.called;
                });
            });
        });

        describe('conversation not started', () => {
            const state = Object.assign({}, defaultState, {
                user: {
                    conversationStarted: false
                }
            });

            beforeEach(() => {
                mockedStore = mockAppStore(sandbox, state);
            });

            it('should call the auth service, get the conversation and not connect to faye', () => {
                const props = {
                    userId: 'some-id',
                    appToken: 'some-token',
                    jwt: 'some-jwt',
                    email: 'some@email.com'
                };

                return DOMAIN.login(props.userId, props.jwt).then(() => {
                    const callArgs = loginStub.args[0][0];
                    callArgs.userId.should.eq(props.userId);

                    immediateUpdateStub.should.have.been.calledWith, {
                        email: 'some@email.com'
                    };
                    handleConversationUpdatedStub.should.not.have.been.called;
                    connectFayeStub.should.not.have.been.called;
                });
            });
        });
    });

    describe('Track event', () => {
        beforeEach(() => {
            mockedStore = mockAppStore(sandbox, defaultState);
            trackEventStub = sandbox.stub(userService, 'trackEvent');
            trackEventStub.resolves({
                conversationUpdated: true
            });
        });


        it('should call trackEvent', () => {
            const props = {
                email: 'some@email.com'
            };

            return DOMAIN.track('some-event', props).then(() => {
                trackEventStub.should.have.been.calledWith('some-event', props);
            });
        });
    });

    describe('Send message', () => {
        beforeEach(() => {
            mockedStore = mockAppStore(sandbox, defaultState);

            sendMessageStub = sandbox.stub(conversationService, 'sendMessage');
            sendMessageStub.resolves({});
        });

        it('should call the conversation service', () => {
            return DOMAIN.sendMessage('here is my message').then(() => {
                sendMessageStub.should.have.been.calledWith('here is my message');
            });
        });

    });

    describe('Get conversation', () => {

        let handleConversationUpdatedStub;

        beforeEach(() => {
            mockedStore = mockAppStore(sandbox, defaultState);
            handleConversationUpdatedStub = sandbox.stub(conversationService, 'handleConversationUpdated');
            handleConversationUpdatedStub.resolves({});
        });

        describe('conversation exists', () => {

            it('should call handleConversationUpdated', () => {
                return DOMAIN.getConversation().then(() => {
                    handleConversationUpdatedStub.should.have.been.calledOnce;
                });
            });

            it('should resolve conversation object', () => {
                return DOMAIN.getConversation().then((conversation) => {
                    if (!conversation.messages) {
                        return Promise.reject(new Error('Conversation not found'));
                    }
                });
            });

            it('should update conversationStarted to true ', () => {
                return DOMAIN.getConversation().then(() => {
                    mockedStore.dispatch.should.have.been.calledWith({
                        type: 'UPDATE_USER',
                        properties: {
                            conversationStarted: true
                        }
                    });
                });
            });
        });

        describe('conversation does not exist', () => {
            beforeEach(() => {
                handleConversationUpdatedStub.rejects();
            });

            it('should reject', (done) => {
                return DOMAIN.getConversation()
                    .catch(() => done())
                    .then(() => done(new Error('Promise should not have resolved')));
            });

            it('should not update conversationStarted to true ', () => {
                return DOMAIN.getConversation().catch(() => {
                    mockedStore.dispatch.should.not.have.been.calledWith({
                        type: 'UPDATE_USER',
                        properties: {
                            conversationStarted: true
                        }
                    });
                });
            });
        });

    });

    describe('Update user', () => {
        beforeEach(() => {
            mockedStore = mockAppStore(sandbox, defaultState);

            updateUserStub = sandbox.stub(userService, 'update');

            sandbox.stub(conversationService, 'handleConversationUpdated');
            conversationService.handleConversationUpdated.resolves({});
        });

        describe('conversation started', () => {
            beforeEach(() => {
                updateUserStub.resolves({
                    appUser: {
                        conversationStarted: true
                    }
                });
            });

            it('should call handleConversationUpdated', () => {
                return DOMAIN.updateUser({
                    email: 'update@me.com'
                }).then(() => {
                    updateUserStub.should.have.been.calledWith({
                        email: 'update@me.com'
                    });

                    conversationService.handleConversationUpdated.should.have.been.calledOnce;
                });
            });
        });

        describe('conversation not started', () => {
            beforeEach(() => {
                updateUserStub.resolves({
                    appUser: {
                        conversationStarted: false
                    }
                });
            });

            it('should not handleConversationUpdated', () => {
                return DOMAIN.updateUser({
                    email: 'update@me.com'
                }).then(() => {
                    updateUserStub.should.have.been.calledWith({
                        email: 'update@me.com'
                    });

                    conversationService.handleConversationUpdated.should.not.have.been.calledOnce;
                });
            });
        });
    });

    describe('Logout', () => {
        beforeEach(() => {
            loginStub = sandbox.stub(DOMAIN, 'login');
        });

        it('should call login', () => {
            DOMAIN.logout();
            loginStub.should.have.been.called;
        });
    });

    describe('Destroy', () => {
        beforeEach(() => {
            mockedStore = mockAppStore(sandbox, defaultState);
            disconnectFayeStub = sandbox.stub(conversationService, 'disconnectFaye');
            loginStub = sandbox.stub(DOMAIN, 'login').resolves();
        });

        describe('with init first', () => {
            beforeEach((done) => {
                DOMAIN.init().then(done);
            });

            it('should reset store state and remove the container', () => {
                DOMAIN.destroy();
                commonActions.reset.should.have.been.calledOnce;
                document.body.removeChild.should.have.been.calledOnce;
            });

            it('should not remove the container from body if it is undefined', () => {
                delete DOMAIN._container;
                DOMAIN.destroy();
                commonActions.reset.should.have.been.calledOnce;
                document.body.removeChild.should.not.have.been.calledOnce;
            });
        });

        describe('without init first', () => {
            it('should do nothing', () => {
                DOMAIN.destroy();
                commonActions.reset.should.not.have.been.calledOnce;
                document.body.removeChild.should.not.have.been.calledOnce;
            });
        });

        describe('with init first then destroy twice', () => {
            beforeEach((done) => {
                DOMAIN.init().then(done);
            });

            it('should do nothing on the second call', () => {
                DOMAIN.destroy();
                commonActions.reset.should.have.been.calledOnce;
                document.body.removeChild.should.have.been.calledOnce;

                DOMAIN.destroy();
                commonActions.reset.should.not.have.been.calledTwice;
                document.body.removeChild.should.not.have.been.calledTwice;
            });

        });
    });

    describe('Open', () => {
        describe('normal', () => {
            beforeEach(() => {
                mockedStore = mockAppStore(sandbox, defaultState);
            });

            it('should dispatch open action', () => {
                DOMAIN.open();
                appStateActions.openWidget.should.have.been.calledOnce;
            });
        });

        describe('embedded', () => {
            beforeEach(() => {
                const state = Object.assign({}, defaultState, {
                    appState: Object.assign({}, defaultState.appState, {
                        embedded: true
                    })
                });
                mockedStore = mockAppStore(sandbox, state);
            });

            it('should not dispatch open action', () => {
                DOMAIN.open();
                appStateActions.openWidget.should.not.have.been.called;
            });
        });
    });

    describe('Close', () => {
        describe('normal', () => {
            beforeEach(() => {
                mockedStore = mockAppStore(sandbox, defaultState);
            });

            it('should dispatch close action', () => {
                DOMAIN.close();
                appStateActions.closeWidget.should.have.been.calledOnce;
            });
        });

        describe('embedded', () => {
            beforeEach(() => {
                const state = Object.assign({}, defaultState, {
                    appState: Object.assign({}, defaultState.appState, {
                        embedded: true
                    })
                });
                mockedStore = mockAppStore(sandbox, state);
            });

            it('should not dispatch close action', () => {
                DOMAIN.close();
                appStateActions.closeWidget.should.not.have.been.called;
            });
        });
    });

    describe('Get User Id', () => {
        beforeEach(() => {
            mockedStore = mockAppStore(sandbox, defaultState);

            getUserIdStub = sandbox.stub(userService, 'getUserId');
            getUserIdStub.returns('1234');
        });

        it('should call the conversation service', () => {
            return DOMAIN.getUserId(mockedStore.getState()).should.eq('1234');
        });
    });

    describe('Get Core', () => {
        beforeEach(() => {
            coreStub = sandbox.stub(coreService, 'core');
        });

        it('should call the core service', () => {
            DOMAIN.getCore();
            coreStub.should.have.been.calledOnce;
        });
    });
});
