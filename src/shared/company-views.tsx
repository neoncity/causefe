import * as React from 'react'

import * as config from './config'

import * as text from './company-views.text'


interface Props {
}


export class CompanyAboutView extends React.Component<Props, undefined> {
    render() {
       return <div><p>{text.about[config.LANG()]}</p></div>;
    }
}


export class CompanyTermsView extends React.Component<Props, undefined> {
    render() {
       return <div><pre>{text.terms[config.LANG()]}</pre></div>;
    }
}


export class CompanyPrivacyView extends React.Component<Props, undefined> {
    render() {
       return <div><pre>{text.privacy[config.LANG()]}</pre></div>;
    }
}


export class CompanyCookiesView extends React.Component<Props, undefined> {
    render() {
       return <div><p>{text.cookies[config.LANG()]}</p></div>;
    }
}