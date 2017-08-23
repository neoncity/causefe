import * as React from 'react'

import * as config from './config'

import * as text from './identity-frame.text'


interface Props {
    children: React.ReactNode;
}


export class IdentityFrame extends React.Component<Props, {}> {
    componentDidMount() {
        if (!config.SESSION().hasUser()) {
            config.AUTH0_CLIENT().showLock(false);
        }
    }

    render() {
        if (!config.SESSION().hasUser()) {
            return <div>{text.shouldBeLoggedIn[config.LANG()]}</div>;
        } else {
            return <div>{this.props.children}</div>;
        }
    }
}
