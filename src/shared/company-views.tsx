import * as React from 'react'
import * as ReactMarkdown from 'react-markdown'
import { Helmet } from 'react-helmet'

import * as config from './config'

import * as commonText from './common.text'
import * as text from './company-views.text'


interface Props {
}


export class CompanyAboutView extends React.Component<Props, undefined> {
    render() {
        const realLink = `${config.ORIGIN}/company/about`;
        return (
            <div>
                <Helmet>
                    <title>{text.aboutPageTitle[config.LANG()]}</title>
                    <meta name="description" content={text.aboutPageDescription[config.LANG()]} />
                    <meta name="robots" content="index,follow" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content={text.aboutPageTitle[config.LANG()]} />
                    <meta name="twitter:description" content={text.aboutPageDescription[config.LANG()]} />
                    <meta name="twitter:creator" content={commonText.siteName[config.LANG()]} />
                    <meta name="twitter:site" content={config.ORIGIN} />
                    <meta property="og:url" content={realLink} />
                    <meta property="og:type" content="article" />
                    <meta property="og:title" content={text.aboutPageTitle[config.LANG()]} />
                    <meta property="og:description" content={text.aboutPageDescription[config.LANG()]} />
                    <meta property="og:site_name" content={commonText.siteName[config.LANG()]} />
                    <link rel="canonical" href={realLink} />
                </Helmet>
                <ReactMarkdown
                    escapeHtml={true}
                    source={text.about[config.LANG()]} />
            </div>
        );
    }
}


export class CompanyTermsView extends React.Component<Props, undefined> {
    render() {
        const realLink = `${config.ORIGIN}/company/terms`;
        return (
            <div>
                <Helmet>
                    <title>{text.termsPageTitle[config.LANG()]}</title>
                    <meta name="description" content={text.termsPageDescription[config.LANG()]} />
                    <meta name="robots" content="index,follow" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content={text.termsPageTitle[config.LANG()]} />
                    <meta name="twitter:description" content={text.termsPageDescription[config.LANG()]} />
                    <meta name="twitter:creator" content={commonText.siteName[config.LANG()]} />
                    <meta name="twitter:site" content={config.ORIGIN} />
                    <meta property="og:url" content={realLink} />
                    <meta property="og:type" content="article" />
                    <meta property="og:title" content={text.termsPageTitle[config.LANG()]} />
                    <meta property="og:description" content={text.termsPageDescription[config.LANG()]} />
                    <meta property="og:site_name" content={commonText.siteName[config.LANG()]} />
                    <link rel="canonical" href={realLink} />
                </Helmet>
                <ReactMarkdown
                    escapeHtml={true}
                    source={text.terms[config.LANG()]} />
            </div>
        );
    }
}


export class CompanyPrivacyView extends React.Component<Props, undefined> {
    render() {
        const realLink = `${config.ORIGIN}/company/privacy`;
        return (
            <div>
                <Helmet>
                    <title>{text.privacyPageTitle[config.LANG()]}</title>
                    <meta name="description" content={text.privacyPageDescription[config.LANG()]} />
                    <meta name="robots" content="index,follow" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content={text.privacyPageTitle[config.LANG()]} />
                    <meta name="twitter:description" content={text.privacyPageDescription[config.LANG()]} />
                    <meta name="twitter:creator" content={commonText.siteName[config.LANG()]} />
                    <meta name="twitter:site" content={config.ORIGIN} />
                    <meta property="og:url" content={realLink} />
                    <meta property="og:type" content="article" />
                    <meta property="og:title" content={text.privacyPageTitle[config.LANG()]} />
                    <meta property="og:description" content={text.privacyPageDescription[config.LANG()]} />
                    <meta property="og:site_name" content={commonText.siteName[config.LANG()]} />
                    <link rel="canonical" href={realLink} />
                </Helmet>
                <ReactMarkdown
                    escapeHtml={true}
                    source={text.privacy[config.LANG()]} />
            </div>
        );
    }
}


export class CompanyCookiesView extends React.Component<Props, undefined> {
    render() {
        const realLink = `${config.ORIGIN}/company/cookies`;
        return (
            <div>
                <Helmet>
                    <title>{text.cookiesPageTitle[config.LANG()]}</title>
                    <meta name="description" content={text.cookiesPageDescription[config.LANG()]} />
                    <meta name="robots" content="index,follow" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content={text.cookiesPageTitle[config.LANG()]} />
                    <meta name="twitter:description" content={text.cookiesPageDescription[config.LANG()]} />
                    <meta name="twitter:creator" content={commonText.siteName[config.LANG()]} />
                    <meta name="twitter:site" content={config.ORIGIN} />
                    <meta property="og:url" content={realLink} />
                    <meta property="og:type" content="article" />
                    <meta property="og:title" content={text.cookiesPageTitle[config.LANG()]} />
                    <meta property="og:description" content={text.cookiesPageDescription[config.LANG()]} />
                    <meta property="og:site_name" content={commonText.siteName[config.LANG()]} />
                    <link rel="canonical" href={realLink} />
                </Helmet>
                <ReactMarkdown
                    escapeHtml={true}
                    source={text.cookies[config.LANG()]} />
            </div>
        );
    }
}
