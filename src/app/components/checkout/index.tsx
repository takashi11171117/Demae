import React, { useContext, useState } from 'react'
import Paper from '@material-ui/core/Paper';
import { useHistory } from 'react-router-dom'
import firebase from 'firebase'
import { Grid, Dialog, DialogContent, DialogContentText, DialogActions, DialogTitle, AppBar, Toolbar, Checkbox, FormControlLabel } from '@material-ui/core';
import { List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { useUserShippingAddresses } from 'hooks/commerce'
import { UserContext, CartContext } from 'hooks/commerce'
import { useFunctions } from 'hooks/stripe'
import Shipping from 'models/commerce/Shipping';
import Loading from 'components/Loading'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, Divider, Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DataLoading from 'components/DataLoading';
import { useDialog, DialogProps } from 'components/Dialog'
import * as Commerce from 'models/commerce'
import { PaymentMethod } from '@stripe/stripe-js';

export default () => {
	const [user, isUserLoading] = useContext(UserContext)
	const [cart] = useContext(CartContext)

	const checkout = async () => {
		if (!user) { return }
		if (!cart) { return }

		// customerID
		const customerID = user.customerID
		if (!customerID) { return }

		// defaultShipping
		const defaultShipping = user.defaultShipping
		if (!defaultShipping) { return }

		// paymentMethodID
		const paymentMethodID = user.defaultPaymentMethodID
		if (!paymentMethodID) { return }

		cart.purchasedBy = user.id
		cart.shipping = defaultShipping
		cart.currency = 'USD'
		cart.amount = cart.total()
		const data = cart.data({ convertDocumentReference: true })
		const checkoutCreate = firebase.functions().httpsCallable('v1-commerce-checkout-create')

		try {
			const response = await checkoutCreate({
				order: data,
				paymentMethodID: paymentMethodID,
				customerID: customerID
			})
			const { error, result } = response.data
			if (error) {
				console.log(error)
				return
			}

			const token = result
			try {
				const checkoutConfirm = firebase.functions().httpsCallable('v1-commerce-checkout-confirm')
				const response = await checkoutConfirm(token)
				const { error, result } = response.data
				console.log(result)
			} catch (error) {
				console.log(error)
				return
			}

		} catch (error) {
			console.log(error)
		}
	}

	if (isUserLoading) {
		return <Loading />
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<ShippingAddresses user={user!} />
			</Grid>
			<Grid item xs={12}>
				<PaymentMethods user={user!} />
			</Grid>
		</Grid>
	)
}

const ShippingAddresses = ({ user }: { user: Commerce.User }) => {

	const _AlertDialog = (props: DialogProps) => (
		<Dialog
			open={props.open}
			onClose={props.onClose}
		>
			<DialogTitle>Delete Shipping address</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Are you sure you want to delete it?
			</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>
					Cancel
      </Button>
				<Button onClick={props.onNext} color='primary' autoFocus>
					OK
      </Button>
			</DialogActions>
		</Dialog>
	)

	const [shippingAddresses, isLoading] = useUserShippingAddresses()
	const history = useHistory()
	const [deleteShipping, setDeleteShipping] = useState<Shipping | undefined>(undefined)
	const [setOpen, AlertDialog] = useDialog(_AlertDialog, async () => {
		await deleteShipping?.delete()
		setOpen(false)
	})

	if (isLoading) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Typography variant='h6'>
						Shippingg Addresses
          </Typography>
				</Toolbar>
			</AppBar>
			{
				shippingAddresses.map(shipping => {
					return (
						<ExpansionPanel key={shipping.id} >
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<FormControlLabel
									onClick={async (event) => {
										event.stopPropagation()
										user.defaultShipping = shipping
										await user.save()
									}}
									onFocus={(event) => event.stopPropagation()}
									control={<Checkbox checked={user.defaultShipping?.id === shipping.id} />}
									label={

										<Typography>{shipping.format(['postal_code', 'line1'])}</Typography>
									}
								/>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<Typography>
									{shipping.formatted()}
								</Typography>
							</ExpansionPanelDetails>
							<Divider />
							<ExpansionPanelActions>
								<Button size="small" onClick={async () => {
									// await shipping.delete()
									setDeleteShipping(shipping)
									setOpen(true)
								}}>Delete</Button>
								<Button size="small" color="primary" onClick={() => {
									history.push(`/checkout/shipping/${shipping.id}`)
								}}>
									Edit
          			</Button>
							</ExpansionPanelActions>
						</ExpansionPanel>
					)
				})
			}
			<List>
				<ListItem button onClick={() => {
					history.push(`/checkout/shipping`)
				}}>
					<ListItemIcon>
						<AddIcon color="secondary" />
					</ListItemIcon>
					<ListItemText primary={`Add new shpping address`} />
				</ListItem>
			</List>
			<AlertDialog />
		</Paper>
	)
}


const PaymentMethods = ({ user }: { user: Commerce.User }) => {

	const _AlertDialog = (props: DialogProps) => (
		<Dialog
			open={props.open}
			onClose={props.onClose}
		>
			<DialogTitle>Delete Payment method</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Are you sure you want to delete it?
			</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>
					Cancel
      </Button>
				<Button onClick={props.onNext} color='primary' autoFocus>
					OK
      </Button>
			</DialogActions>
		</Dialog>
	)
	const history = useHistory()
	const [paymentMethods, isLoading] = useFunctions<PaymentMethod>('v1-stripe-paymentMethod-list', { type: 'card' })
	const [setOpen, AlertDialog] = useDialog(_AlertDialog, async () => {
		// await deleteShipping?.delete()
		setOpen(false)
	})

	if (isLoading) {
		return (
			<Paper>
				<DataLoading />
			</Paper>
		)
	}

	return (
		<Paper>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<Typography variant='h6'>
						Payments
          </Typography>
				</Toolbar>
			</AppBar>
			{
				paymentMethods.map(method => {
					return (
						<ExpansionPanel key={method.id} >
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<FormControlLabel
									onClick={async (event) => {
										event.stopPropagation()
										user.defaultPaymentMethodID = method.id
										await user.save()
									}}
									onFocus={(event) => event.stopPropagation()}
									control={<Checkbox checked={user.defaultPaymentMethodID === method.id} />}
									label={
										<Box display="flex" alignItems="center" flexGrow={1} style={{ width: '140px' }}>
											<Box display="flex" alignItems="center" flexGrow={1}>
												<i className={`pf pf-${method.card?.brand}`}></i>
											</Box>
											<Box justifySelf="flex-end">
												{`• • • •  ${method.card?.last4}`}
											</Box>
										</Box>
									}
								/>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<Typography>

								</Typography>
							</ExpansionPanelDetails>
							<Divider />
							<ExpansionPanelActions>
								<Button size="small" onClick={async () => {
									// await shipping.delete()
									// setDeleteShipping(shipping)
									// setOpen(true)
								}}>Delete</Button>
								<Button size="small" color="primary" onClick={() => {
									// history.push(`/checkout/shipping/${shipping.id}`)
								}}>
									Edit
          			</Button>
							</ExpansionPanelActions>
						</ExpansionPanel>
					)
				})
			}
			<List>
				<ListItem button onClick={() => {
					history.push(`/checkout/paymentMethod`)
				}}>
					<ListItemIcon>
						<AddIcon color="secondary" />
					</ListItemIcon>
					<ListItemText primary={`Add new payment method`} />
				</ListItem>
			</List>
			<AlertDialog />
		</Paper>
	)
}
