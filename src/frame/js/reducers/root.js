import { combineReducers } from 'redux';
import { enableBatching } from 'redux-batched-actions';

import ConfigReducer from './config';
import ConversationReducer from './conversation';
import UIReducer from './ui';
import AppStateReducer from './app-state';
import AuthReducer from './auth';
import UserReducer from './user';
import FayeReducer from './faye';
import BrowserReducer from './browser';
import IntegrationsReducer from './integrations';
import WebviewReducer from './webview';

export default enableBatching(combineReducers({
    config: ConfigReducer,
    conversation: ConversationReducer,
    ui: UIReducer,
    appState: AppStateReducer,
    auth: AuthReducer,
    user: UserReducer,
    faye: FayeReducer,
    browser: BrowserReducer,
    integrations: IntegrationsReducer,
    webview: WebviewReducer
}));
