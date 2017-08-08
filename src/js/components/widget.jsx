import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import isMobile from 'ismobilejs';
import debounce from 'lodash.debounce';

import { MessengerButton } from './messenger-button';
import { Header } from './header';
import { Conversation } from './conversation';
import { Settings } from './settings';
import { Channel } from './channels/channel';
import { ErrorNotification } from './error-notification';
import { ChatInput } from './chat-input';
import { MessageIndicator } from './message-indicator';

import { resetUnreadCount } from '../services/conversation';
import { hasChannels } from '../utils/app';
import { DISPLAY_STYLE } from '../constants/styles';
import { WIDGET_STATE } from '../constants/app';
import { disableAnimation } from '../actions/app-state-actions';

export class WidgetComponent extends Component {
    static propTypes = {
        DOMAINId: PropTypes.string,
        app: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        ui: PropTypes.object.isRequired,
        appState: PropTypes.object.isRequired
    };

    onTouchStart = (e) => {
        resetUnreadCount();
        // the behavior is problematic only on iOS devices
        if (this.refs.input && isMobile.apple.device) {
            const component = this.refs.input.getWrappedInstance();
            const node = findDOMNode(component);

            // only blur if touching outside of the footer
            if (!node.contains(e.target)) {
                component.blur();
            }
        }
    };

    onClick = () => {
        resetUnreadCount();
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
        const {appState, settings, DOMAINId} = this.props;
        const {displayStyle, isBRANDColorDark, isAccentColorDark, isLinkColorDark} = settings;

        const settingsComponent = appState.settingsVisible ? <Settings /> : null;

        // if no user set in store or the app has no channels,
        // no need to render the channel page manager
        const channelsComponent = DOMAINId && hasChannels(settings) ? <Channel /> : null;

        const footer = appState.settingsVisible ? null : <ChatInput ref='input' />;

        const classNames = [
            `CLASS_PREFIX-${displayStyle}-display`
        ];

        if (appState.embedded) {
            classNames.push('CLASS_PREFIX-embedded');
        } else {
            if (appState.widgetState === WIDGET_STATE.OPENED) {
                classNames.push('CLASS_PREFIX-appear');
            } else if (appState.widgetState === WIDGET_STATE.CLOSED) {
                classNames.push('CLASS_PREFIX-close');
            } else {
                // state is WIDGET_STATE.INIT
                classNames.push('CLASS_PREFIX-init');
            }
        }

        if (isMobile.apple.device) {
            classNames.push('CLASS_PREFIX-ios-device');
        }

        if (appState.showAnimation) {
            classNames.push('CLASS_PREFIX-animation');
        }

        const notification = appState.errorNotificationMessage ?
            <ErrorNotification message={ appState.errorNotificationMessage } /> : null;

        const wrapperClassNames = [
            `CLASS_PREFIX-branding-color-${isBRANDColorDark ? 'dark' : 'light'}`,
            `CLASS_PREFIX-accent-color-${isAccentColorDark ? 'dark' : 'light'}`,
            `CLASS_PREFIX-link-color-${isLinkColorDark ? 'dark' : 'light'}`
        ];

        let messengerButton;

        if (displayStyle === DISPLAY_STYLE.BUTTON && !appState.embedded) {
            messengerButton = <MessengerButton shown={ appState.widgetState !== WIDGET_STATE.OPENED } />;
        }

        return <div>
                   <div id='CLASS_PREFIX-container'
                        className={ classNames.join(' ') }
                        onTouchStart={ this.onTouchStart }
                        onClick={ this.onClick }>
                       <MessageIndicator />
                       <div id='CLASS_PREFIX-wrapper'
                            className={ wrapperClassNames.join(' ') }>
                           <Header />
                           <ReactCSSTransitionGroup component='div'
                                                    className='CLASS_PREFIX-notification-container'
                                                    transitionName='CLASS_PREFIX-notification'
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
                       </div>
                   </div>
                   { messengerButton }
               </div>;
    }
}

export const Widget = connect(({appState: {settingsVisible, widgetState, errorNotificationMessage, embedded, showAnimation}, app, ui, user}) => {
    // only extract what is needed from appState as this is something that might
    // mutate a lot
    return {
        appState: {
            settingsVisible,
            widgetState,
            errorNotificationMessage,
            embedded,
            showAnimation
        },
        app,
        settings: app.settings.web,
        ui,
        DOMAINId: user._id
    };
})(WidgetComponent);
