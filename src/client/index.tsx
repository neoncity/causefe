import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import './index.less'
import { routesConfig } from '../shared/routes-config'
import { store } from '../shared/store'


ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            {routesConfig}
        </Router>
    </Provider>,
    document.getElementById('app')
);
