import { SHOW_WEBVIEW, HIDE_WEBVIEW } from '../actions/webview';
import { RESET } from '../actions/common';

const INITIAL_STATE = {
    isShown: false,
    uri: null,
    heightRatio: null,
    isLoading: false
};

export default function WebviewReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case RESET:
            return {
                ...INITIAL_STATE
            };
        case SHOW_WEBVIEW:
            return state.isShown ? state : {
                ...state,
                isShown: true,
                uri: action.uri,
                heightRatio: action.heightRatio,
                isLoading: true
            };
        case HIDE_WEBVIEW:
            return {
                ...state,
                isShown: false
            };
        default:
            return state;
    }
}
