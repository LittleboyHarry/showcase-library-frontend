import React, { useReducer } from 'react'
import { useAsync } from 'react-use'
import { notification, Button, Dropdown, Icon, Menu } from 'antd'
import { makeStyles } from '@material-ui/styles';
import { limitConnection } from '../Config'

function resultReducer(oldState, event) {
	const { data, handle } = event
	switch (event.constructor) {
		case RestartEvent:
			return {
				loading: true,
				success: false,
				data
			}
		case SuccessEvent:
			countOfOpeningFetch--
			if (handle) handle(true)
			return {
				loading: false,
				success: true,
				data
			}
		case FailureEvent:
			countOfOpeningFetch--
			if (handle) handle(false)
			return {
				loading: false,
				success: false,
				data
			}
		default:
			throw new Error('Invalid result!');
	}
}

const useCodeBlockStyle = makeStyles({
	root: {
		maxHeight: '5rem',
		backgroundColor: '#ffebeb',
		color: 'red',
		padding: '4px'
	}
})

class RestartEvent {
	constructor(data) {
		this.data = data
	}
}

class SuccessEvent {
	constructor(data, handle) {
		this.data = data
		this.handle = handle
	}
}

class FailureEvent {
	constructor(data, handle) {
		this.data = data
		this.handle = handle
	}
}

const mockLoadingIcon = <Icon type="loading" style={{ color: '#108ee9' }} />
const placement = 'bottomRight'

function HandleMockButtonGroup({ name, notificationKey: key, body, mockData, defaultData, onFinish, dispatch }) {
	const printButton = <Button
		style={{
			marginRight: '2rem',
			justifySelf: 'start'
		}}
		type="link"
		size="small"
		onClick={() => { console.log(body) }}>
		输出请求数据
	</Button>

	const passAllMenu = <Menu onClick={() => {
		mockWhitelist.add(name)
		notification.close(key)
		dispatch(new SuccessEvent(mockData, onFinish))
	}}>
		<Menu.Item key="1">
			<Icon type="check-circle" />
			以后此类别全部通过
 		</Menu.Item>
	</Menu>

	const passButton = <Dropdown.Button
		style={{ marginRight: '1rem' }}
		type="primary"
		size="small"
		icon={<Icon type="down" />}
		onClick={() => {
			notification.close(key)
			dispatch(new SuccessEvent(mockData, onFinish))
		}}
		overlay={passAllMenu}>
		通过
	</Dropdown.Button>


	const denyAllMenu = <Menu onClick={() => {
		mockBlacklist.add(name)
		notification.close(key)
		dispatch(new FailureEvent(defaultData, onFinish))
	}}>
		<Menu.Item key="1">
			<Icon type="stop" />
			以后此类别全部拦截
		</Menu.Item>
	</Menu>

	const denyButton = <Dropdown.Button
		type="danger"
		size="small"
		icon={<Icon type="down" />}
		onClick={() => {
			notification.close(key)
			dispatch(new FailureEvent(defaultData, onFinish))
		}}
		overlay={denyAllMenu}>
		拦截</Dropdown.Button>

	return <div style={{ display: 'flex' }}>
		{printButton}
		{passButton}
		{denyButton}
	</div>
}

const mockWhitelist = new Set()
const mockBlacklist = new Set()

let countOfOpeningFetch = 0;

function useMockableJsonFetch({ name, url, method = 'GET', body, defaultData, mockData, onFinish, blocked }, dependency) {

	const [result, dispatch] = useReducer(resultReducer, {
		loading: true,
		success: false,
		data: defaultData
	})

	const codeBlockStyle = useCodeBlockStyle()


	useAsync(async () => {
		if (blocked) return

		if (++countOfOpeningFetch > limitConnection)
			throw new Error('太多请求')

		dispatch(new RestartEvent(defaultData));
		const startTimestamp = new Date()

		if (useMockableJsonFetch.enableMock) {
			if (mockBlacklist.has(name)) {
				dispatch(new FailureEvent(defaultData, onFinish))
			} else if (mockWhitelist.has(name)) {
				dispatch(new SuccessEvent(mockData, onFinish))
			} else {
				const key = `request-${name}-${startTimestamp}-${Math.random()}`
				setTimeout(() => {
					notification.open({
						message: `模拟请求 - ${name}`,
						description: `URL: ${url} Method: ${method}`,
						icon: mockLoadingIcon,
						key,
						placement,
						btn: <HandleMockButtonGroup {...{ name, notificationKey: key, body, mockData, defaultData, dispatch, onFinish }} />,
						duration: 0,
						onClose: () => { countOfOpeningFetch-- }
					})
				})
			}
		} else {
			try {
				const response = await fetch(url, { method, body })
				const json = await response.json()
				dispatch(new SuccessEvent(json, onFinish))
			} catch (error) {
				const durationSecond = Math.floor(((new Date()).getTime() - startTimestamp.getTime()) / 1000)
				notification.error({
					message: '发送网络请求异常',
					placement,
					description: (
						<div>
							请求操作 {name} 时，发生异常<br />
							持续时长：{Math.floor(durationSecond / 60)}分 {durationSecond % 60}秒<br />
							<p>详细异常：</p>
							<pre className={codeBlockStyle.root}>{`${error}`}</pre>
						</div>),
					duration: 0
				})
				dispatch(new FailureEvent(defaultData, onFinish))
			}
		}
	}, [...dependency, blocked])

	return result
}

useMockableJsonFetch.enableMock = false;

export default useMockableJsonFetch;