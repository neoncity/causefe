import * as React from 'react'

import { LANG } from './from-server'

const text = require('./admin-account-view.text');


interface Props {
}


export class AdminAccountView extends React.Component<Props, undefined> {
    render() {
        return <div>{text.viewTitle[LANG]}</div>;
    }
}
