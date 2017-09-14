import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ANIMATION_TIMINGS } from '../constants/styles';
import { hideWebview, updateWebviewTitle, resetWebview, showWebviewContent, hideWebviewContent } from '../actions/webview';

class Webview extends Component {
    static propTypes = {
        isContentShown: PropTypes.bool.isRequired,
        uri: PropTypes.string.isRequired,
        title: PropTypes.string,
        heightRatio: PropTypes.string.isRequired,
        hideWebview: PropTypes.func.isRequired,
        updateWebviewTitle: PropTypes.func.isRequired,
        resetWebview: PropTypes.func.isRequired,
        showWebviewContent: PropTypes.func.isRequired,
        hideWebviewContent: PropTypes.func.isRequired
    };

    componentDidMount() {
        setTimeout(() => this.props.showWebviewContent(), ANIMATION_TIMINGS.WEBVIEW_CONTENT_TRANSITION);
    }

    onFrameLoad = () => {

    };

    componentWillUnmount() {
        this.props.resetWebview();
    }

    onClose = () => {
        this.props.hideWebviewContent();
        setTimeout(() => this.props.hideWebview(), ANIMATION_TIMINGS.WEBVIEW_CONTENT_TRANSITION);
    };

    render() {
        const {uri, heightRatio, title, isContentShown} = this.props;
        const containerClassNames = ['webview-container', heightRatio]
        return <ReactCSSTransitionGroup component='div'
                                        transitionName='webview-content'
                                        transitionEnterTimeout={ ANIMATION_TIMINGS.WEBVIEW_CONTENT_TRANSITION }
                                        transitionLeaveTimeout={ ANIMATION_TIMINGS.WEBVIEW_CONTENT_TRANSITION }
                                        id='webview'>
                   { isContentShown &&
                     <div className={ ['webview-container', heightRatio].join(' ') }
                          key='content'>
                         <div id='webview-header'>
                             { title }
                             <div className='close-handle'
                                  onClick={ this.onClose }>
                                 <i className='fa fa-times'></i>
                             </div>
                         </div>
                         <iframe ref={ (c) => this._iframe = c }
                                 id='webview-iframe'
                                 name='smooch-web'
                                 src={ uri }
                                 onLoad={ this.onFrameLoad }
                                 sandbox='allow-same-origin allow-scripts allow-popups allow-forms'></iframe>
                     </div> }
               </ReactCSSTransitionGroup>;
    }
}

const mapStateToProps = ({webview}) => {
    return {
        ...webview
    };
};
const mapDispatchToProps = (dispatch) => bindActionCreators({
    hideWebview,
    updateWebviewTitle,
    resetWebview,
    showWebviewContent,
    hideWebviewContent
}, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(Webview);
