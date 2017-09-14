import { SHOW_WEBVIEW, HIDE_WEBVIEW, UPDATE_WEBVIEW_TITLE, RESET_WEBVIEW, SHOW_WEBVIEW_CONTENT, HIDE_WEBVIEW_CONTENT } from '../actions/webview';
import { RESET } from '../actions/common';

const INITIAL_STATE = {
    isShown: false,
    isContentShown: false,
    uri: null,
    heightRatio: null,
    isLoading: false,
    title: null
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
                isContentShown: false,
                uri: action.uri,
                heightRatio: action.heightRatio,
                isLoading: true
            };
        case HIDE_WEBVIEW:
            return {
                ...state,
                isShown: false
            };
        case SHOW_WEBVIEW_CONTENT:
            return state.isContentShown ? state : {
                ...state,
                isContentShown: true
            };
        case HIDE_WEBVIEW_CONTENT:
            return {
                ...state,
                isContentShown: false
            };
        case UPDATE_WEBVIEW_TITLE:
            return {
                ...state,
                title: action.title
            };

        case RESET_WEBVIEW:
            return {
                ...INITIAL_STATE
            };
        default:
            return state;
    }
}
