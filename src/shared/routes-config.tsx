import * as React from 'react'
import { Route, IndexRoute, IndexRedirect } from 'react-router'

import { AdminAccountView } from '../client/admin-account-view'
import { AdminCauseAnalyticsView } from '../client/admin-cause-analytics-view'
import { AdminFrame } from '../client/admin-frame'
import { AdminMyActionsView } from '../client/admin-myactions-view'
import { AdminMyCauseView } from '../client/admin-mycause-view'
import { AppFrame } from '../client/app-frame'
import { CauseView } from '../client/cause-view'
import { HomeView } from '../client/home-view'
import { IdentityFrame } from '../client/identity-frame'


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
    </Route>;
