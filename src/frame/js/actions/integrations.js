import { batchActions } from 'redux-batched-actions';

import { core } from '../utils/core';

import { handleConversationUpdated } from './conversation';
import { updateUser, getUserId } from './user';


export const SET_ERROR = 'SET_ERROR';
export const UNSET_ERROR = 'UNSET_ERROR';
export const SET_WECHAT_QR_CODE = 'SET_WECHAT_QR_CODE';
export const RESET_INTEGRATIONS = 'RESET_INTEGRATIONS';
export const SET_TWILIO_INTEGRATION_STATE = 'SET_TWILIO_INTEGRATION_STATE';
export const RESET_TWILIO_INTEGRATION_STATE = 'RESET_TWILIO_INTEGRATION_STATE';
export const SET_MESSAGEBIRD_INTEGRATION_STATE = 'SET_MESSAGEBIRD_INTEGRATION_STATE';
export const RESET_MESSAGEBIRD_INTEGRATION_STATE = 'RESET_MESSAGEBIRD_INTEGRATION_STATE';
export const SET_VIBER_QR_CODE = 'SET_VIBER_QR_CODE';
export const SET_TRANSFER_REQUEST_CODE = 'SET_TRANSFER_REQUEST_CODE';
export const RESET_TRANSFER_REQUEST_CODE = 'RESET_TRANSFER_REQUEST_CODE';

function handleLinkFailure(error) {
    return (dispatch, getState) => {
        const {ui: {text: {smsTooManyRequestsError, smsTooManyRequestsOneMinuteError, smsBadRequestError, smsUnhandledError}}} = getState();
        const retryAfter = error.headers ? error.headers.get('retry-after') : error.retryAfter;
        const {status} = error;
        let errorMessage;

        if (status === 429) {
            const minutes = Math.ceil(retryAfter / 60);
            if (minutes > 1) {
                errorMessage = smsTooManyRequestsError.replace('{minutes}', minutes);
            } else {
                errorMessage = smsTooManyRequestsOneMinuteError;
            }
        } else if (status > 499) {
            errorMessage = smsUnhandledError;
        } else {
            errorMessage = smsBadRequestError;
        }

        dispatch(updateTwilioAttributes({
            hasError: true,
            linkState: 'unlinked',
            errorMessage: errorMessage
        }));
    };
}

let fetchingWeChat = false;
let fetchingViber = false;

export function setError(channel) {
    return {
        type: SET_ERROR,
        channel
    };
}

export function unsetError(channel) {
    return {
        type: UNSET_ERROR,
        channel
    };
}

export function setWeChatQRCode(code) {
    return {
        type: SET_WECHAT_QR_CODE,
        code
    };
}

export function resetIntegrations() {
    return {
        type: RESET_INTEGRATIONS
    };
}
export function setTwilioIntegrationState(attrs) {
    return {
        type: SET_TWILIO_INTEGRATION_STATE,
        attrs
    };
}

export function resetTwilioIntegrationState() {
    return {
        type: RESET_TWILIO_INTEGRATION_STATE
    };
}

export function setMessageBirdIntegrationState(attrs) {
    return {
        type: SET_MESSAGEBIRD_INTEGRATION_STATE,
        attrs
    };
}

export function resetMessageBirdIntegrationState() {
    return {
        type: RESET_MESSAGEBIRD_INTEGRATION_STATE
    };
}

export function setViberQRCode(code) {
    return {
        type: SET_VIBER_QR_CODE,
        code
    };
}

export function setTransferRequestCode(channel, transferRequestCode) {
    return {
        type: SET_TRANSFER_REQUEST_CODE,
        channel,
        transferRequestCode
    };
}

export function resetTransferRequestCode(channel) {
    return {
        type: RESET_TRANSFER_REQUEST_CODE,
        channel
    };
}

export function fetchWeChatQRCode() {
    return (dispatch, getState) => {
        const {integrations: {wechat}} = getState();

        if (wechat.qrCode || fetchingWeChat) {
            return Promise.resolve();
        }

        dispatch(unsetError('wechat'));
        fetchingWeChat = true;
        return core(getState()).appUsers.wechat.getQRCode(getUserId(getState()))
            .then(({url}) => {
                dispatch(setWeChatQRCode(url));
            })
            .catch(() => {
                dispatch(setError('wechat'));
            })
            .then(() => {
                fetchingWeChat = false;
            });
    };
}

const smsFunctionMap = {
    twilio: {
        updateSMSAttributes: updateTwilioAttributes,
        resetSMSAttributes: resetTwilioAttributes
    },
    messagebird: {
        updateSMSAttributes: updateMessageBirdAttributes,
        resetSMSAttributes: resetMessageBirdAttributes
    }
};

export function updateSMSAttributes(attr, type) {
    return smsFunctionMap[type].updateSMSAttributes(attr);
}

export function updateTwilioAttributes(attr) {
    return (dispatch) => {
        dispatch(setTwilioIntegrationState(attr));
    };
}

export function updateMessageBirdAttributes(attr) {
    return (dispatch) => {
        dispatch(setMessageBirdIntegrationState(attr));
    };
}

export function resetSMSAttributes(type) {
    return smsFunctionMap[type].resetSMSAttributes();
}

export function resetTwilioAttributes() {
    return (dispatch) => {
        dispatch(resetTwilioIntegrationState());
    };
}

export function resetMessageBirdAttributes() {
    return (dispatch) => {
        dispatch(resetMessageBirdIntegrationState());
    };
}

export function fetchTwilioAttributes() {
    return (dispatch, getState) => {
        const {user: {clients, pendingClients}} = getState();
        const client = clients.find((client) => client.platform === 'twilio');
        const pendingClient = pendingClients.find((client) => client.platform === 'twilio');

        if (client) {
            dispatch(updateTwilioAttributes({
                linkState: 'linked',
                appUserNumber: client.displayName
            }));
        } else if (pendingClient) {
            dispatch(updateTwilioAttributes({
                linkState: 'pending',
                appUserNumber: pendingClient.displayName
            }));
        }
    };
}

export function fetchMessageBirdAttributes() {
    return (dispatch, getState) => {
        const {user: {clients, pendingClients}} = getState();
        const client = clients.find((client) => client.platform === 'messagebird');
        const pendingClient = pendingClients.find((client) => client.platform === 'messagebird');

        if (client) {
            dispatch(updateMessageBirdAttributes({
                linkState: 'linked',
                appUserNumber: client.displayName
            }));
        } else if (pendingClient) {
            dispatch(updateMessageBirdAttributes({
                linkState: 'pending',
                appUserNumber: pendingClient.displayName
            }));
        }
    };
}

export function linkSMSChannel(userId, data) {
    return (dispatch, getState) => {
        return core(getState()).appUsers.linkChannel(userId, data)
            .then(({appUser}) => {
                dispatch(updateUser(appUser));

                if (appUser.conversationStarted) {
                    return dispatch(handleConversationUpdated());
                }
            })
            .then(() => {
                dispatch(updateSMSAttributes({
                    linkState: 'pending'
                }, data.type));
            })
            .catch((e) => {
                dispatch(handleLinkFailure(e.response, data.type));
            });
    };
}

export function unlinkSMSChannel(userId, type) {
    return (dispatch, getState) => {
        return core(getState()).appUsers.unlinkChannel(userId, type)
            .then(() => {
                const {user: {clients, pendingClients}} = getState();
                dispatch(updateUser({
                    pendingClients: pendingClients.filter((pendingClient) => pendingClient.platform !== type),
                    clients: clients.filter((client) => client.platform !== type)
                }));
            })
            .then(() => {
                dispatch(updateSMSAttributes({
                    linkState: 'unlinked',
                    appUserNumber: '',
                    appUserNumberValid: false
                }, type));
            })
            .catch((e) => {
                const {response: {status}} = e;
                const {ui: {text: {smsBadRequestError}}} = getState();
                // Deleting a client that was never linked
                if (status === 400) {
                    dispatch(updateSMSAttributes({
                        linkState: 'unlinked'
                    }, type));
                } else {
                    dispatch(updateSMSAttributes({
                        linkState: 'unlinked',
                        hasError: true,
                        errorMessage: smsBadRequestError
                    }, type));
                }
            });
    };
}

export function pingSMSChannel(userId, type) {
    return (dispatch, getState) => {
        return core(getState()).appUsers.pingChannel(userId, type)
            .then(() => {
                dispatch(updateSMSAttributes({
                    linkState: 'linked'
                }, type));
            })
            .catch(() => {
                const {ui: {text: {smsPingChannelError}}} = getState();
                dispatch(updateSMSAttributes({
                    hasError: true,
                    errorMessage: smsPingChannelError
                }, type));
            });
    };
}

export function cancelSMSLink(type) {
    return (dispatch, getState) => {
        const {user: {pendingClients}, integrations, ui: {text: {smsLinkCancelled}}} = getState();
        const {appUserNumber} = integrations[type];
        dispatch(batchActions([
            updateUser({
                pendingClients: pendingClients.filter((pendingClient) => pendingClient.platform !== type)
            }),
            updateSMSAttributes({
                linkState: 'unlinked',
                hasError: true,
                errorMessage: smsLinkCancelled.replace('{appUserNumber}', appUserNumber)
            }, type)
        ]));
    };
}

export function failSMSLink(error, type) {
    return (dispatch) => {
        dispatch(handleLinkFailure(error, type));
    };
}

export function fetchViberQRCode() {
    return (dispatch, getState) => {
        const {integrations: {viber}} = getState();

        if (viber.qrCode || fetchingViber) {
            return Promise.resolve();
        }

        dispatch(unsetError('viber'));
        fetchingViber = true;
        return core(getState()).appUsers.viber.getQRCode(getUserId(getState()))
            .then(({url}) => {
                dispatch(setViberQRCode(url));
            })
            .catch(() => {
                dispatch(setError('viber'));
            })
            .then(() => {
                fetchingViber = false;
            });
    };
}

export function fetchTransferRequestCode(channel) {
    return (dispatch, getState) => {
        const userId = getUserId(getState());
        dispatch(unsetError(channel));
        return core(getState()).appUsers.transferRequest(userId, {
            type: channel
        }).then((res) => {
            const transferRequestCode = res.transferRequests[0].code;
            dispatch(setTransferRequestCode(channel, transferRequestCode));
        }).catch(() => {
            dispatch(setError(channel));
        });
    };
}
