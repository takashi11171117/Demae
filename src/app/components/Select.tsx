import { useState, useEffect } from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

type MenuProp = {
	value: string | number
	label: string
}

type InputProps = {
	id?: string
	label?: string
	type?: string
	placeholder?: string
	fullWidth?: boolean
	required?: boolean
	autoComplete?: string
	style?: Object
	menu?: MenuProp[]
}

type InitProps = {
	initValue?: string
	inputProps?: InputProps
}

type InitValue = string | number | undefined

export const useSelect = (props: InitProps | InitValue) => {
	if (typeof props === 'string' || typeof props === 'undefined' || props === null) {
		const [value, setValue] = useState(props || "")
		useEffect(() => {
			setValue(props || "")
		}, [props])
		const handleChange = e => setValue(e.target.value)
		return {
			value,
			onChange: handleChange
		};
	} else if (typeof props === 'number') {
		const [value, setValue] = useState(String(props) || "")
		useEffect(() => {
			setValue(String(props) || "")
		}, [props])
		const handleChange = e => setValue(e.target.value)
		return {
			value,
			type: 'number',
			onChange: handleChange
		};
	} else {
		const [value, setValue] = useState(props.initValue ? props.initValue : "")
		useEffect(() => {
			setValue(props.initValue ? props.initValue : "")
		}, [props.initValue])
		const handleChange = e => setValue(e.target.value)
		return {
			...props.inputProps,
			value,
			onChange: handleChange
		};
	}
}

export default (props: InputProps) => {
	return (
		<Select
			{...props}
		>
			{props.menu?.map(menu => {
				return <MenuItem value={menu.value}>{menu.label}</MenuItem>
			})}
		</Select>
	)
}


