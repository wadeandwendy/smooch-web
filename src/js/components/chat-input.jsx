import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import isMobile from 'ismobilejs';
import bindAll from 'lodash.bindall';

import { sendMessage, resetUnreadCount } from '../services/conversation';

import { ImageUpload } from './image-upload';



export class ChatInputComponent extends Component {

    static propTypes = {
        accentColor: PropTypes.string,
        imageUploadEnabled: PropTypes.bool.isRequired,
        inputPlaceholderText: PropTypes.string.isRequired,
        sendButtonText: PropTypes.string.isRequired,
        unreadCount: PropTypes.number.isRequired,
        dispatch: PropTypes.func.isRequired
    };

    state = {
        text: ''
    };

    constructor(...args) {
        super(...args);
        bindAll(this,
            'blur',
            'checkAndResetUnreadCount',
            'onChange',
            'onFocus',
            'onSendMessage'
        );
    }

    blur() {
        this.refs.input.blur();
    }


    handleKeyDown(minRows, maxRows){
      return (e) => {
        const minHeight = minRows * 15;
        const scrollHeight = e.target.scrollHeight;
        const newHeight = scrollHeight - minHeight;
        const newRows = Math.ceil(newHeight / 15);
        if(newRows >= minRows && newRows <= maxRows){
          e.target.rows = newRows;
            /* const convoContainter = document.getElementById("sk-conversation");
             * const convoHeight = convoContainter.scrollHeight;
             * const newConvoHeight = convoHeight - scrollHeight;
             * console.log("new convo height: ", newConvoHeight);
             * convoContainter.height = newConvoHeight.toString() + 'px';
             * convoContainter.height = '0 px';
             * console.log("convo hegiht: ", convoContainter.height);*/
        }
      };
    }

    checkAndResetUnreadCount(unreadCount) {
        const {dispatch} = this.props;
        if (unreadCount > 0) {
            dispatch(resetUnreadCount());
        }
    }

    onChange(e) {
        this.checkAndResetUnreadCount(this.props.unreadCount);
        this.setState({
            text: e.target.value
        });
    }

    onFocus() {
        this.checkAndResetUnreadCount(this.props.unreadCount);
    }

    onSendMessage(e) {
        e.preventDefault();
        const {text} = this.state;
        const {dispatch} = this.props;
        if (text.trim()) {
            this.setState({
                text: ''
            });
            dispatch(sendMessage(text));
            this.refs.input.focus();
        }
    }

    render() {
        const {accentColor, imageUploadEnabled, inputPlaceholderText, sendButtonText} = this.props;

        let sendButton;

        const buttonClassNames = ['send'];
        const buttonStyle = {};

        if (this.state.text.trim()) {
            buttonClassNames.push('active');

            if (accentColor) {
                buttonStyle.color = `#${accentColor}`;
            }
        }

        if (isMobile.apple.device) {
            // Safari on iOS needs a way to send on click, without triggering a mouse event.
            // onTouchStart will do the trick and the input won't lose focus.
            sendButton = <span ref='button'
                               className={ buttonClassNames.join(' ') }
                               onTouchStart={ this.onSendMessage }
                               style={ buttonStyle }>{ sendButtonText }</span>;
        } else {
            sendButton = <a ref='button'
                            className={ buttonClassNames.join(' ') }
                            onClick={ this.onSendMessage }
                            style={ buttonStyle }>
                             { sendButtonText }
                         </a>;
        }

        const imageUploadButton = imageUploadEnabled ?
            <ImageUpload ref='imageUpload'
                         color={ accentColor } /> : null;

        const inputContainerClasses = ['input-container'];

        if (!imageUploadEnabled) {
            inputContainerClasses.push('no-upload');
        }

        return <div id='sk-footer'>
                   { imageUploadButton }
                   <form onSubmit={ this.onSendMessage }
                         action='#'>
                       <div className={ inputContainerClasses.join(' ') }>
                           <textarea ref='input'
                                  rows={2}
                                  onKeyDown={ this.handleKeyDown(2, 5) }
                                  placeholder={ inputPlaceholderText }
                                  type='textarea'
                                  className='input message-input'
                                  onChange={ this.onChange }
                                  onFocus={ this.onFocus }
                                  value={ this.state.text }
                                  title={ sendButtonText }/>
                       </div>
                   </form>
                   { sendButton }
               </div>;
    }
}

export const ChatInput = connect(({appState, app, ui, conversation: {unreadCount}}) => {
    return {
        imageUploadEnabled: appState.imageUploadEnabled,
        accentColor: app.settings.web.accentColor,
        sendButtonText: ui.text.sendButtonText,
        inputPlaceholderText: ui.text.inputPlaceholder,
        unreadCount
    };
}, undefined, undefined, {
    withRef: true
})(ChatInputComponent);
