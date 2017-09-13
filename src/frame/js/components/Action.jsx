import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StripeCheckout from '../lib/react-stripe-checkout';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { createTransaction } from '../actions/stripe';
import { immediateUpdate } from '../actions/user';
import { postPostback } from '../actions/conversation';
import { showWebview } from '../actions/webview';

import { getIntegration } from '../utils/app';
import { bindAll } from '../utils/functions';

import Loading from './Loading';

export class ActionComponent extends Component {

    static propTypes = {
        immediateUpdate: PropTypes.func.isRequired,
        postPostback: PropTypes.func.isRequired,
        createTransaction: PropTypes.func.isRequired,
        _id: PropTypes.string.isRequired,
        appName: PropTypes.string.isRequired,
        appIconUrl: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        type: PropTypes.string,
        buttonColor: PropTypes.string,
        amount: PropTypes.number,
        currency: PropTypes.string,
        uri: PropTypes.string,
        heightRatio: PropTypes.string,
        state: PropTypes.string,
        actionPaymentCompletedText: PropTypes.string.isRequired,
        integrations: PropTypes.array.isRequired,
        user: PropTypes.object.isRequired,
        showWebview: PropTypes.func.isRequired
    };

    static defaultProps = {
        type: 'link'
    };

    constructor(...args) {
        super(...args);

        this.state = {
            state: this.props.state,
            hasToken: false
        };

        bindAll(this,
            'onPostbackClick',
            'onStripeToken',
            'onStripeClick',
            'onStripeClose',
            'onWebviewClick'
        );
    }

    onPostbackClick(e) {
        e.preventDefault();

        this.setState({
            state: 'processing'
        });

        this.props.postPostback(this.props._id)
            .then(() => {
                this.setState({
                    state: ''
                });
            })
            .catch(() => {
                this.setState({
                    state: ''
                });
            });
    }

    onStripeToken(token) {
        const {user} = this.props;
        this.setState({
            hasToken: true
        });

        const promises = [];
        if (!user.email) {
            promises.push(this.props.immediateUpdate({
                email: token.email
            }));
        }

        const transactionPromise = createTransaction(this.props._id, token.id)
            .then(() => {
                this.setState({
                    state: 'paid'
                });
            })
            .catch(() => {
                this.setState({
                    state: 'offered'
                });
            });

        promises.push(transactionPromise);

        return Promise.all(promises);
    }

    onStripeClick(e) {
        e.preventDefault();
        this.setState({
            state: 'processing'
        });
    }

    onStripeClose() {
        if (!this.state.hasToken) {
            this.setState({
                state: 'offered'
            });
        }
    }

    onWebviewClick(e) {
        e.preventDefault();
        const {showWebview, uri, heightRatio} = this.props;
        showWebview({
            uri,
            heightRatio
        });
    }

    render() {
        const {buttonColor, amount, currency, text, uri, type, actionPaymentCompletedText, integrations, user, appName, appIconUrl} = this.props;
        const {state} = this.state;

        const stripeIntegration = getIntegration(integrations, 'stripeConnect');

        let style = {};

        if (buttonColor) {
            style.backgroundColor = style.borderColor = `#${buttonColor}`;
        }

        // the public key is necessary to use with Checkout
        // use the link fallback if this happens
        if (type === 'buy' && stripeIntegration) {
            if (state === 'offered') {
                return <StripeCheckout componentClass='div'
                                       className='action'
                                       token={ this.onStripeToken }
                                       stripeKey={ stripeIntegration.publicKey }
                                       email={ user.email }
                                       amount={ amount }
                                       currency={ currency.toUpperCase() }
                                       name={ appName }
                                       image={ appIconUrl }
                                       closed={ this.onStripeClose }
                                       executionContext={ parent }>
                           <a className='btn btn-primary'
                              onClick={ this.onStripeClick }
                              style={ style }>
                               { text }
                           </a>
                       </StripeCheckout>;
            } else {
                const buttonText = state === 'paid' ?
                    actionPaymentCompletedText :
                    <Loading />;

                if (state === 'paid') {
                    style = {};
                }

                return <div className='action'>
                           <div className={ `btn btn-action-${state}` }
                                style={ style }>
                               { buttonText }
                           </div>
                       </div>;
            }
        } else if (type === 'postback') {
            const isProcessing = state === 'processing';
            const buttonText = isProcessing ?
                <Loading /> :
                text;

            return <div className='action'>
                       <a className='btn btn-primary'
                          style={ style }
                          onClick={ !isProcessing && this.onPostbackClick }>
                           { buttonText }
                       </a>
                   </div>;
        } else if (type === 'link' || (type === 'buy' && !stripeIntegration)) {
            const isJavascript = uri.startsWith('javascript:');

            return <div className='action'>
                       <a className='btn btn-primary'
                          href={ uri }
                          target={ isJavascript ? '_self' : '_blank' }
                          style={ style }>
                           { text }
                       </a>
                   </div>;
        } else if (type === 'webview') {
            return <div className='action'>
                       <div className='btn btn-primary'
                            style={ style }
                            onClick={ this.onWebviewClick }>
                           { text }
                       </div>
                   </div>;
        }

        return null;
    }
}

const mapStateToProps = ({ui: {text}, user, config}) => {
    return {
        user,
        actionPaymentCompletedText: text.actionPaymentCompleted,
        integrations: config.integrations,
        appName: config.app.name,
        appIconUrl: config.app.iconUrl
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showWebview,
    postPostback,
    immediateUpdate,
    createTransaction
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(ActionComponent);
