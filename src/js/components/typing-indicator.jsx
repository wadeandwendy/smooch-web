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
                 className='spark-typing-indicator-avatar' /> :
            <div className='spark-typing-indicator-avatar-placeholder' />;

        const fromName = name && firstInGroup ? <div className='spark-from'>
                                                    { name }
                                                </div> : null;

        return <div className={ `spark-typing-indicator-container ${mounted ? 'fade-in' : ''}` }>
                   { fromName }
                   { avatar }
                   <div className={ `spark-typing-indicator ${firstInGroup ? 'spark-typing-indicator-first' : ''}` }>
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
