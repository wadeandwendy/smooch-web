export const RESET_WEBVIEW = 'RESET_WEBVIEW';
export const SHOW_WEBVIEW = 'SHOW_WEBVIEW';
export const HIDE_WEBVIEW = 'HIDE_WEBVIEW';
export const SHOW_WEBVIEW_CONTENT = 'SHOW_WEBVIEW_CONTENT';
export const HIDE_WEBVIEW_CONTENT = 'HIDE_WEBVIEW_CONTENT';
export const UPDATE_WEBVIEW_TITLE = 'UPDATE_WEBVIEW_TITLE';

export function showWebview({uri, heightRatio}) {
    return {
        type: SHOW_WEBVIEW,
        uri,
        heightRatio
    };
}

export function hideWebview() {
    return {
        type: HIDE_WEBVIEW
    };
}

export function showWebviewContent() {
    return {
        type: SHOW_WEBVIEW_CONTENT
    };
}

export function hideWebviewContent() {
    return {
        type: HIDE_WEBVIEW_CONTENT
    };
}

export function updateWebviewTitle(title) {
    return {
        type: UPDATE_WEBVIEW_TITLE,
        title
    };
}

export function resetWebview() {
    return {
        type: RESET_WEBVIEW
    };
}
