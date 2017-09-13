export const SHOW_WEBVIEW = 'SHOW_WEBVIEW';
export const HIDE_WEBVIEW = 'HIDE_WEBVIEW';

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
