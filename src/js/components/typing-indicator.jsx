import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

export class TypingIndicatorComponent extends Component {
    static propTypes = {
        avatarUrl: PropTypes.string,
        name: PropTypes.string,
        firstInGroup: PropTypes.bool
    };

    static defaultProps = {
        firstInGroup: true
    };

    state = {
        mounted: false
    };

    componentDidMount() {
        this.setState({
            mounted: true
        });
    }

    render() {
        const {avatarUrl, name, firstInGroup} = this.props;
        const {mounted} = this.state;

        const avatar = avatarUrl ?
            <img src={ avatarUrl }
                 alt={ `${name}'s avatar` }
                 className='CLASS_PREFIX-typing-indicator-avatar' /> :
            <div className='CLASS_PREFIX-typing-indicator-avatar-placeholder' />;

        const fromName = name && firstInGroup ? <div className='CLASS_PREFIX-from'>
                                                    { name }
                                                </div> : null;

        return <div className={ `CLASS_PREFIX-typing-indicator-container ${mounted ? 'fade-in' : ''}` }>
                   { fromName }
                   { avatar }
                   <div className={ `CLASS_PREFIX-typing-indicator ${firstInGroup ? 'CLASS_PREFIX-typing-indicator-first' : ''}` }>
                       <span></span>
                       <span></span>
                       <span></span>
                   </div>
               </div>;
    }
}


export const TypingIndicator = connect(({appState}) => {
    return {
        avatarUrl: appState.typingIndicatorAvatarUrl,
        name: appState.typingIndicatorName
    };
})(TypingIndicatorComponent);
