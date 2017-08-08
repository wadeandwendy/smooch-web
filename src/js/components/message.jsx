import isMobile from 'ismobilejs';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

import { TextMessage } from './text-message';
import { ImageMessage } from './image-message';
import { Action } from './action';
import { findDOMNode } from 'react-dom';
import { getElementProperties } from '../utils/dom';
import { resendMessage } from '../services/conversation';
import { SEND_STATUS, GLOBAL_ACTION_TYPES } from '../constants/message';
import { LoadingComponent } from './loading';

class Message extends Component {
    static propTypes = {
        name: PropTypes.string,
        actions: PropTypes.array,
        type: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        mediaUrl: PropTypes.string,
        text: PropTypes.string,
        accentColor: PropTypes.string,
        linkColor: PropTypes.string,
        firstInGroup: PropTypes.bool,
        lastInGroup: PropTypes.bool,
        sendStatus: PropTypes.string,
        tapToRetryText: PropTypes.string.isRequired,
        clickToRetryText: PropTypes.string.isRequired,
        locationSendingFailedText: PropTypes.string.isRequired
    };

    static defaultProps = {
        actions: [],
        sendStatus: SEND_STATUS.SENT
    };

    componentDidMount() {
        if (this.props.actions.length === 0) {
            this._restyleBubble();
        }
    }

    _restyleBubble() {
        const bubble = findDOMNode(this.refs.messageContent);
        if (bubble) {
            const messageElement = bubble.firstChild;
            const messageProperties = getElementProperties(messageElement);
            const bubbleProperties = getElementProperties(bubble);
            const multiLineCheck = parseInt(bubbleProperties.fontSize) * 2;
            if (messageProperties.height > multiLineCheck && messageProperties.width < bubbleProperties.width) {
                bubble.style.width = (messageProperties.width + parseInt(bubbleProperties.paddingLeft) + parseInt(bubbleProperties.paddingRight)) + 'px';
            }
        }
    }

    onMessageClick() {
        const {sendStatus} = this.props;

        if (sendStatus === SEND_STATUS.FAILED) {
            this.props.dispatch(resendMessage(this.props._clientId));
        }
    }

    render() {
        const {name, role, avatarUrl, text, accentColor, firstInGroup, lastInGroup, linkColor, type, mediaUrl, sendStatus, clickToRetryText, tapToRetryText, locationSendingFailedText} = this.props;
        const actions = this.props.actions.filter(({type}) => !GLOBAL_ACTION_TYPES.includes(type));
        const hasText = text && text.trim() && text.trim() !== mediaUrl;
        const hasFile = type === 'file';
        const hasImage = type === 'image';
        const hasLocation = type === 'location';
        const isAppUser = role === 'appUser';
        const hasActions = actions.length > 0;
        
        let lastItem;
        
        if (hasActions) {
            lastItem = 'actions';        
        } else if (hasText || hasFile) {
            lastItem = 'text';
        } else if (hasLocation) {
            lastItem = 'location'
        }

        const avatarClass = hasImage ? ['spark-msg-avatar', 'spark-msg-avatar-img'] : ['spark-msg-avatar'];
        const avatarPlaceHolder = isAppUser ? null : (<div className='spark-msg-avatar-placeholder' />);
        const containerClasses = ['spark-msg'];

        if (hasImage || actions.length > 0) {
            containerClasses.push('spark-msg-image');
        }

        const actionList = actions.map((action) => {
            return <Action key={ action._id }
                           buttonColor={ linkColor }
                           {...action} />;
        });

        const avatar = isAppUser ? null :
            <img alt={ `${name}'s avatar` }
                 className={ avatarClass.join(' ') }
                 src={ avatarUrl } />;

        const textClasses = ['spark-message-item', 'spark-message-text'];

        if (lastItem === 'text') {
            textClasses.push('spark-last-item');
        }

        const textPart = (hasText || hasFile) && <TextMessage {...this.props}
                                                              className={ textClasses.join(' ') } />;
        const imagePart = hasImage && <ImageMessage {...this.props} />;

        const style = {};

        if (!hasImage || hasActions || hasText) {
            if (isAppUser && accentColor) {
                style.backgroundColor = style.borderLeftColor = `#${accentColor}`;
            }
        }

        const rowClass = ['spark-row'];

        if (isAppUser) {
            rowClass.push('spark-right-row');
        } else {
            rowClass.push('spark-left-row');
        }

        if (firstInGroup) {
            if (isAppUser) {
                rowClass.push('spark-row-appuser-first');
            } else {
                rowClass.push('spark-row-appmaker-first');
            }
        }

        if (lastInGroup) {
            if (isAppUser) {
                rowClass.push('spark-row-appuser-last');
            } else {
                rowClass.push('spark-row-appmaker-last');
            }
        }

        if (!firstInGroup && !lastInGroup) {
            if (isAppUser) {
                rowClass.push('spark-row-appuser-middle');
            } else {
                rowClass.push('spark-row-appmaker-middle');
            }
        }

        const fromName = <div className='spark-from'>
                             { isAppUser ? '' : name }
                         </div>;

        const actionListClasses = ['spark-message-item'];

        if (lastItem === 'actions') {
            actionListClasses.push('spark-last-item');
        }

        if ([SEND_STATUS.SENDING, SEND_STATUS.FAILED].includes(sendStatus)) {
            containerClasses.push('spark-msg-unsent');
        }

        const clickToRetry = <div className='spark-retry'>
                                 { isMobile.any ? tapToRetryText : clickToRetryText }
                             </div>;


        const locationClasses = ['spark-message-item'];

        if (lastItem === 'location') {
            locationClasses.push('spark-last-item');
        }

        if (sendStatus === SEND_STATUS.SENDING) {
            locationClasses.push('spark-message-location-loading');
        } else {
            locationClasses.push('spark-message-text');
        }

        let locationPart;

        if (type === 'location' && !textPart) {
            locationPart = sendStatus === SEND_STATUS.FAILED ?
                <TextMessage className={ locationClasses.join(' ') }
                             text={ locationSendingFailedText }
                             role={ role } />
                : <div className={ locationClasses.join(' ') }>
                      <LoadingComponent color={ !isAppUser ? accentColor : null } />
                  </div> ;
        }

        return <div className={ rowClass.join(' ') }>
                   { !isAppUser && firstInGroup ? fromName : null }
                   { lastInGroup ? avatar : avatarPlaceHolder }
                   <div className='spark-msg-wrapper'>
                       <div className={ containerClasses.join(' ') }
                            style={ style }
                            ref='messageContent'
                            onClick={ this.onMessageClick.bind(this) }>
                           { imagePart ? imagePart : null }
                           { textPart ? textPart : null }
                           { locationPart ? locationPart : null }
                           { hasActions ? <div className={ actionListClasses.join(' ') }>
                                              { actionList }
                                          </div> : null }
                       </div>
                       { sendStatus === SEND_STATUS.FAILED ? clickToRetry : null }
                   </div>
                   <div className='spark-clear'></div>
               </div>;
    }
}

export const MessageComponent = connect(({ui: {text}}) => {
    return {
        clickToRetryText: text.clickToRetry,
        tapToRetryText: text.tapToRetry,
        locationSendingFailedText: text.locationSendingFailed
    };
})(Message);
