import * as React from 'react'
import { Helmet } from 'react-helmet'

import * as config from './config'

import * as text from './admin-account-view.text'


interface Props {
}


export class AdminAccountView extends React.Component<Props, undefined> {
    render() {
        return (
            <div>
                <Helmet>
                    <title>{text.pageTitle[config.LANG()]}</title>
                    <meta name="robots" content="noindex,nofollow" />
                </Helmet>
                <p>{text.viewTitle[config.LANG()]}</p>
            </div>
        );
    }
}
