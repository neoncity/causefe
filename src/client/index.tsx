import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, IndexRedirect, browserHistory } from 'react-router'

import { AdminAccountView } from './admin-account-view'
import { AdminCauseAnalyticsView } from './admin-cause-analytics-view'
import { AdminFrame } from './admin-frame'
import { AdminMyActionsView } from './admin-myactions-view'
import { AdminMyCauseView } from './admin-mycause-view'
import { AppFrame } from './app-frame'
import { CauseView } from './cause-view'
import { HomeView } from './home-view'
import { IdentityFrame } from './identity-frame'
import './index.less'
import { store } from './store'


ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
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
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
