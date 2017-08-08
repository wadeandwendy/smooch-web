import { BRAND } from 'smooch-core/lib/smooch';
import urljoin from 'urljoin';

import { VERSION } from '../constants/version';

export function core({auth, appState}) {
    return new BRAND(auth, {
        serviceUrl: urljoin(appState.serverURL, 'v1'),
        headers: {
            'x-smooch-sdk': `web/${VERSION}`
        }
    });
}
