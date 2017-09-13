import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Loading from './Loading';

class Webview extends Component {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired
    };

    render() {
        const {isLoading} = this.props;

        if (isLoading) {
            return <div id='webview'>
                       <Loading />
                   </div>;
        }

        return <div id='webview'>
                   I'm a Webview
               </div>;
    }
}

const mapStateToProps = ({webview}) => webview;
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(Webview);
