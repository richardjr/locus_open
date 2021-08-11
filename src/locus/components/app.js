import React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './home';
import Report from './report';
import Category from './category';
import Error from './error';

const App = () => {
	return (
		<Router>
			<div>
				<Switch>
					<Route exact path="/" component={Home} />
					<Route path="/Report/:reportId" component={Report} />
					<Route path="/Category/:category" component={Category} />
					<Route component={Error} />
				</Switch>
			</div>
		</Router>
	);
};

export default App;