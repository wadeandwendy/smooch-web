import { BRAND } from 'smooch-core/lib/DOMAIN';
import urljoin from 'urljoin';

import { VERSION } from '../constants/version';

export function core({auth, appState}) {
    return new BRAND(auth, {
        serviceUrl: urljoin(appState.serverURL, 'v1'),
        headers: {
            'x-DOMAIN-sdk': `web/${VERSION}`
        }
    });
}
