import * as React from 'react'
import { Route, IndexRoute, IndexRedirect } from 'react-router'

import { AdminAccountView } from './admin-account-view'
import { AdminCauseAnalyticsView } from './admin-cause-analytics-view'
import { AdminFrame } from './admin-frame'
import { AdminMyActionsView } from './admin-myactions-view'
import { AdminMyCauseView } from './admin-mycause-view'
import { AppFrame } from './app-frame'
import { CauseView } from './cause-view'
import {
    CompanyAboutView,
    CompanyTermsView,
    CompanyPrivacyView,
    CompanyCookiesView } from './company-views'
import { HomeView } from './home-view'
import { IdentityFrame } from './identity-frame'


export const routesConfig =
    <Route path="/" component={AppFrame}>
        <IndexRoute component={HomeView} />

        <Route path="c/:causeId/:causeSlug" component={CauseView} />

        <Route path="/" component={IdentityFrame}>
            <Route path="admin" component={AdminFrame}>
                <IndexRedirect to="my-cause" />
                <Route path="my-cause" component={AdminMyCauseView} />
                <Route path="cause-analytics" component={AdminCauseAnalyticsView} />
                <Route path="my-actions" component={AdminMyActionsView} />
                <Route path="account" component={AdminAccountView} />
            </Route>
        </Route>

        <Route path="company">
            <IndexRedirect to="about" />
            <Route path="about" component={CompanyAboutView} />
            <Route path="terms" component={CompanyTermsView} />
            <Route path="privacy" component={CompanyPrivacyView} />
            <Route path="cookies" component={CompanyCookiesView} />
        </Route>
    </Route>;
