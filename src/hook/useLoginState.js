import { useContext } from 'react'
import App from '../App'

export default function useLoginState() {
	const { user } = useContext(App.Context)

	return {
		isAdmin: Boolean(user)
	}
}