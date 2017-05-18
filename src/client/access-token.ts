import { browserHistory } from 'react-router'
import * as queryString from 'query-string'
import { MarshalFrom } from 'raynor'

import { loadAccessToken, saveAccessToken } from './access-token-storage'
import { showAuth0Lock, Auth0RedirectInfo } from './auth0'


let rawAccessToken: string|null = loadAccessToken();

const auth0RedirectInfoMarshaller = new (MarshalFrom(Auth0RedirectInfo))();
const currentLocation = browserHistory.getCurrentLocation();

export let accessToken: string = 'INVALID';

if (rawAccessToken != null) {
    accessToken = rawAccessToken;
} else if (currentLocation.pathname == '/real/login') {
    const queryParsed = (Object as any).assign({}, queryString.parse((currentLocation as any).hash));
    const auth0RedirectInfo = auth0RedirectInfoMarshaller.extract(queryParsed);

    if (auth0RedirectInfo.accessToken != null) {
        saveAccessToken(auth0RedirectInfo.accessToken);
        accessToken = auth0RedirectInfo.accessToken;
    } else {
        accessToken = 'INVALID';
    }

    browserHistory.push(auth0RedirectInfo.state.path);
} else if ((currentLocation.pathname.indexOf('/admin') == 0) || (currentLocation.pathname.indexOf('/console') == 0)) {
    showAuth0Lock(false);
} else {
    accessToken = 'INVALID';
}