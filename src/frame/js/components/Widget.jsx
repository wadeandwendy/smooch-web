import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import isMobile from 'ismobilejs';

import MessengerButton from './MessengerButton';
import Header from './Header';
import Conversation from './Conversation';
import Settings from './Settings';
import Channel from './channels/Channel';
import ErrorNotification from './ErrorNotification';
import ChatInput from './ChatInput';
import MessageIndicator from './MessageIndicator';
import Webview from './Webview';

import { resetUnreadCount } from '../actions/conversation';
import { hasChannels } from '../utils/app';
import { DISPLAY_STYLE } from '../constants/styles';
import { WIDGET_STATE } from '../constants/app';
import { disableAnimation } from '../actions/app-state';

export class WidgetComponent extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        config: PropTypes.object.isRequired,
        widgetSize: PropTypes.string.isRequired,
        appState: PropTypes.object.isRequired,
        isWebviewShown: PropTypes.bool.isRequired
    };

    onTouchStart = (e) => {
        this.props.dispatch(resetUnreadCount());
        // the behavior is problematic only on iOS devices
        if (this._input && isMobile.apple.device) {
            const component = this._input.getWrappedInstance();
            const node = findDOMNode(component);

            // only blur if touching outside of the footer
            if (!node.contains(e.target)) {
                component.blur();
            }
        }
    };

    onClick = () => {
        this.props.dispatch(resetUnreadCount());
    };

    handleResize = () => {
        this.props.dispatch(disableAnimation());
    };

    componentDidMount = () => {
        window.addEventListener('resize', this.handleResize);
    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this.handleResize);
    };

    render() {
        const {appState, config, widgetSize, isWebviewShown} = this.props;
        const {displayStyle, isBrandColorDark, isAccentColorDark, isLinkColorDark} = config.style;

        const settingsComponent = appState.settingsVisible ? <Settings /> : null;

        // if no user set in store or the app has no channels,
        // no need to render the channel page manager
        const channelsComponent = hasChannels(config) ? <Channel /> : null;

        const footer = appState.settingsVisible ? null : <ChatInput ref={ (c) => this._input = c } />;

        const classNames = [
            `${displayStyle}-display`
        ];

        if (appState.widgetState === WIDGET_STATE.OPENED) {
            classNames.push('appear');
        } else if (appState.widgetState === WIDGET_STATE.CLOSED) {
            classNames.push('close');
        } else if (appState.widgetState === WIDGET_STATE.EMBEDDED) {
            classNames.push('embedded');
        } else {
            // state is WIDGET_STATE.INIT
            classNames.push('init');
        }

        if (isMobile.apple.device) {
            classNames.push('ios-device');
        }

        if (appState.showAnimation) {
            classNames.push('animation');
        }

        const notification = appState.errorNotificationMessage ?
            <ErrorNotification message={ appState.errorNotificationMessage } /> : null;

        const wrapperClassNames = [
            `branding-color-${isBrandColorDark ? 'dark' : 'light'}`,
            `accent-color-${isAccentColorDark ? 'dark' : 'light'}`,
            `link-color-${isLinkColorDark ? 'dark' : 'light'}`
        ];

        let messengerButton;

        if (displayStyle === DISPLAY_STYLE.BUTTON && appState.widgetState !== WIDGET_STATE.EMBEDDED) {
            messengerButton = <MessengerButton shown={ appState.widgetState !== WIDGET_STATE.OPENED } />;
        }

        return <div className={ `widget-${widgetSize}` }>
                   <div id='container'
                        className={ classNames.join(' ') }
                        onTouchStart={ this.onTouchStart }
                        onClick={ this.onClick }>
                       <MessageIndicator />
                       <div id='wrapper'
                            className={ wrapperClassNames.join(' ') }>
                           <Header />
                           <ReactCSSTransitionGroup component='div'
                                                    className='notification-container'
                                                    transitionName='notification'
                                                    transitionAppear={ true }
                                                    transitionAppearTimeout={ 500 }
                                                    transitionEnterTimeout={ 500 }
                                                    transitionLeaveTimeout={ 500 }>
                               { notification }
                           </ReactCSSTransitionGroup>
                           <ReactCSSTransitionGroup component='div'
                                                    transitionName='settings'
                                                    transitionAppear={ true }
                                                    transitionAppearTimeout={ 250 }
                                                    transitionEnterTimeout={ 250 }
                                                    transitionLeaveTimeout={ 250 }>
                               { settingsComponent }
                           </ReactCSSTransitionGroup>
                           { channelsComponent }
                           <Conversation />
                           { footer }
                           { isWebviewShown && <Webview /> }
                       </div>
                   </div>
                   { messengerButton }
               </div>;
    }
}

export default connect(({appState: {settingsVisible, widgetState, errorNotificationMessage, showAnimation, widgetSize}, config, webview}) => {
    // only extract what is needed from appState as this is something that might
    // mutate a lot
    return {
        appState: {
            settingsVisible,
            widgetState,
            errorNotificationMessage,
            showAnimation
        },
        config,
        widgetSize,
        isWebviewShown: webview.isShown
    };
})(WidgetComponent);
