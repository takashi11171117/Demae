import React, { useContext } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from 'components/AppBar'
import TabBar from 'components/TabBar'
import Home from 'components/home'
import Cart from 'components/cart'
import Account from 'components/account'
import Provider from 'components/providers'
import Checkout from 'components/checkout'
import Shipping from 'components/checkout/shipping'
import PaymentMethod from 'components/checkout/payment'
import { AppContext } from 'context'

export default ({ children }: { children: any }) => {

	const [appContent] = useContext(AppContext)

	return (
		<>
			<AppBar title={appContent.appBar.title} />
			<div>
				<Container maxWidth="sm">
					<CssBaseline />
					{children}
				</Container>
			</div>
			<TabBar />
		</>
	);
}

// const App = () => {
// 	return (
// 		<Switch>
// 			<Route path={`/home`} exact component={Home} />
// 			<Route path={`/cart`} exact component={Cart} />
// 			<Route path={`/account`} exact component={Account} />
// 			<Route path={`/providers`} exact component={Provider} />
// 			<Route path={`/checkout/shipping/:id`} exact component={Shipping} />
// 			<Route path={`/checkout/shipping`} exact component={Shipping} />
// 			<Route path={`/checkout`} exact component={Checkout} />
// 			<Route path={`/checkout/paymentMethod/:id`} exact component={PaymentMethod} />
// 			<Route path={`/checkout/paymentMethod`} exact component={PaymentMethod} />
// 		</Switch>
// 	)
// }
