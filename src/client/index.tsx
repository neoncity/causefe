import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import './index.less'
import { store } from './store'


interface AppFrameProps {
    children: React.ReactNode;
}


class AppFrame extends React.Component<AppFrameProps, undefined> {
    render() {
        return (
	    <div>
		<div>This is the app frame</div>
		<div>
		  <Link to="/">Home</Link>
		  <Link to="/c/cause-1">Cause 1</Link>
		  <Link to="/c/cause-2">Cause 2</Link>
		  <Link to="/admin">Admin</Link>
		  <Link to="/console">Console</Link>
		</div>
		{this.props.children}
            </div>
        );
    }
}


interface HomeViewParams {
    causeSlug: string;
}


interface HomeViewProps {
    params: HomeViewParams;
}


class HomeView extends React.Component<HomeViewProps, undefined> {
    render() {
        return (
	    <div>This is the home view</div>
	);
    }
}


interface CauseViewProps {
    params: any
}


class CauseView extends React.Component<CauseViewProps, undefined> {
    render() {
        return (
	    <div>This is the cause view for {this.props.params.causeSlug}</div>
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
	        <Route path="c/:causeSlug" component={CauseView} />
		<Route path="admin" component={AdminView} />
		<Route path="console" component={ConsoleView} />
	    </Route>
	</Router>
    </Provider>,
    document.getElementById('app')
);
