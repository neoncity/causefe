import * as React from 'react'

import * as config from './config'

import * as text from './admin-account-view.text'


interface Props {
}


export class AdminAccountView extends React.Component<Props, undefined> {
    render() {
        return <div>{text.viewTitle[config.LANG]}</div>;
    }
}
