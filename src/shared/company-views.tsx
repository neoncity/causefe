import * as React from 'react'
import * as ReactMarkdown from 'react-markdown'

import * as config from './config'

import * as text from './company-views.text'


interface Props {
}


export class CompanyAboutView extends React.Component<Props, undefined> {
    render() {
        return (
            <div>
                <ReactMarkdown
                    escapeHtml={true}
                    source={text.about[config.LANG()]} />
            </div>
        );
    }
}


export class CompanyTermsView extends React.Component<Props, undefined> {
    render() {
       return (
           <div>
               <ReactMarkdown
                   escapeHtml={true}
                   source={text.terms[config.LANG()]} />
           </div>
       );
    }
}


export class CompanyPrivacyView extends React.Component<Props, undefined> {
    render() {
       return (
           <div>
               <ReactMarkdown
                   escapeHtml={true}
                   source={text.privacy[config.LANG()]} />
           </div>
       );
    }
}


export class CompanyCookiesView extends React.Component<Props, undefined> {
    render() {
       return (
           <div>
               <ReactMarkdown
                   escapeHtml={true}
                   source={text.cookies[config.LANG()]} />
           </div>
       );
    }
}
