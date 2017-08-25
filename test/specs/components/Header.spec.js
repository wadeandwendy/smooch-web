import sinon from 'sinon';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import { WIDGET_STATE } from '../../../src/frame/js/constants/app';
import Header, { HeaderComponent, __Rewire__ as HeaderRewire } from '../../../src/frame/js/components/Header';

import { createMockedStore, generateBaseStoreProps } from '../../utils/redux';
import { scryRenderedDOMComponentsWithId, findRenderedDOMComponentsWithId, wrapComponentWithStore } from '../../utils/react';

const sandbox = sinon.sandbox.create();

function getStoreState(state = {}) {
    return generateBaseStoreProps({
        ui: {
            text: {
                headerText: 'headerText',
                settingsHeaderText: 'settingsHeaderText'
            }
        },
        appState: {
            settingsVisible: true,
            widgetState: WIDGET_STATE.OPENED,
            visibleChannelType: false,
            ...state.appState
        },
        conversation: {
            unreadCount: 0,
            ...state.conversation
        }
    });
}

describe('Header Component', () => {
    let mockedStore;
    let header;
    let headerNode;
    let toggleWidgetSpy;

    beforeEach(() => {
        toggleWidgetSpy = sandbox.stub().returnsSyncThunk();
        HeaderRewire('toggleWidget', toggleWidgetSpy);
        HeaderRewire('hasChannels', sandbox.stub().returns(true));
        sandbox.stub(HeaderComponent.prototype, 'showSettings');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('settings view', () => {

        beforeEach(() => {
            mockedStore = createMockedStore(sandbox, getStoreState());
            header = wrapComponentWithStore(Header, null, mockedStore);
            headerNode = ReactDOM.findDOMNode(header);
        });

        it('should display the main header', () => {
            headerNode.textContent.should.eq(mockedStore.getState().ui.text.settingsHeaderText);
        });

        it('should contain the back button', () => {
            TestUtils.scryRenderedDOMComponentsWithClass(header, 'back-handle').length.should.be.eq(1);
        });

        it('should not contain the settings button', () => {
            scryRenderedDOMComponentsWithId(header, 'settings-handle').length.should.be.eq(0);
        });

        it('should call the toggleWidget action on header click', () => {
            TestUtils.Simulate.click(headerNode);
            toggleWidgetSpy.should.have.been.calledOnce;
        });

        it('should not contain the show handle', () => {
            TestUtils.scryRenderedDOMComponentsWithClass(header, 'show-handle').length.should.be.eq(0);
        });

        it('should contain the close handle', () => {
            TestUtils.scryRenderedDOMComponentsWithClass(header, 'close-handle').length.should.be.eq(1);
        });
    });

    describe('settings view in embedded mode', () => {

        beforeEach(() => {
            mockedStore = createMockedStore(sandbox, getStoreState({
                appState: {
                    settingsVisible: false,
                    widgetState: WIDGET_STATE.EMBEDDED
                }
            }));
            header = wrapComponentWithStore(Header, null, mockedStore);
            headerNode = ReactDOM.findDOMNode(header);
        });

        it('should display the main header', () => {
            headerNode.textContent.should.eq(mockedStore.getState().ui.text.headerText);
        });

        it('should not contain the back button', () => {
            TestUtils.scryRenderedDOMComponentsWithClass(header, 'back-handle').length.should.be.eq(0);
        });

        it('should contain the settings button', () => {
            scryRenderedDOMComponentsWithId(header, 'settings-handle').length.should.be.eq(1);
        });

        it('should call the openSettings action on settings button click', () => {
            const settingsButton = findRenderedDOMComponentsWithId(header, 'settings-handle');
            TestUtils.Simulate.click(settingsButton);
            HeaderComponent.prototype.showSettings.should.have.been.calledOnce;
        });

        it('should not call the toggleWidget action on header click', () => {
            TestUtils.Simulate.click(headerNode);
            toggleWidgetSpy.should.not.have.been.called;
        });

        it('should not contain the show handle', () => {
            TestUtils.scryRenderedDOMComponentsWithClass(header, 'show-handle').length.should.be.eq(0);
        });

        it('should not contain the close handle', () => {
            TestUtils.scryRenderedDOMComponentsWithClass(header, 'close-handle').length.should.be.eq(0);
        });
    });
});