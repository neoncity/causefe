import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import './index.less'
import { store } from './store'


interface AppFrameProps {
}


class AppFrame extends React.Component<AppFrameProps, undefined> {
    render() {
        return (
	    <div>
		<div>This is the app frame</div>
		{this.props.children}
            </div>
        );
    }
}


interface HomeViewProps {
}


class HomeView extends React.Component<HomeViewProps, undefined> {
    render() {
        return (
	    <div>This is the home view</div>
	);
    }
}


interface CauseViewProps {
}


class CauseView extends React.Component<CauseViewProps, undefined> {
    render() {
        return (
	    <div>This is the cause view</div>
	);
    }
}


interface AdminViewProps {
}


class AdminView extends React.Component<AdminViewProps, undefined> {
    render() {
        return (
	    <div>This is the admin view</div>
        );
    }
}


interface ConsoleViewProps {
}


class ConsoleView extends React.Component<ConsoleViewProps, undefined> {
    render() {
        return (
	    <div>This is the console view</div>
	);
    }
}


ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={AppFrame}>
	        <IndexRoute component={HomeView} />
	        <Route path="/c/:cause-slug" component={CauseView} />
		<Route path="/admin" component={AdminView} />
		<Route path="/console" component={ConsoleView} />
	    </Route>
	</Router>
    </Provider>,
    document.getElementById('app')
);
