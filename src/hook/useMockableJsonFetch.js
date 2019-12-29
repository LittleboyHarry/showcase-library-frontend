import React, { useReducer } from 'react'
import { useAsync } from 'react-use'
import { notification, Button, Icon } from 'antd'
import { makeStyles } from '@material-ui/styles';

const defaultParam = {
	method: 'get',
	body: null
}

function resultReducer(oldState, result) {
	switch (result.constructor) {
		case SuccessResult:
			return {
				loading: false,
				success: true,
				data: result.data
			}
		case FailureResult:
			return {
				loading: false,
				success: false,
				data: result.data
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

class SuccessResult {
	constructor(data) {
		this.prototype = SuccessResult;
		this.data = data;
	}
}

class FailureResult {
	constructor(initialData) {
		this.prototype = FailureResult;
		this.data = initialData;
	}
}

const mockLoadingIcon = <Icon type="loading" style={{ color: '#108ee9' }} />
const placement = 'bottomRight'

function HandleMockButtonGroup({ onLogout, onPass, onIntercept }) {
	return <>
		<Button style={{ marginRight: '3rem' }}
			type="link" size="small" onClick={onLogout}>
			输出数据</Button>
		<Button style={{ marginRight: '1rem' }}
			type="primary" size="small" onClick={onPass}>
			通过</Button>
		<Button
			type="danger" size="small" onClick={onIntercept}>
			拦截</Button>
	</>
}

function useMockableJsonFetch(name, param, initialData = null, mockData = null) {
	const { url, method, body } = { ...defaultParam, ...param }

	const [result, dispatch] = useReducer(resultReducer, {
		loading: true,
		success: false,
		data: initialData
	})

	const codeBlockStyle = useCodeBlockStyle()

	useAsync(async () => {
		const startTimestamp = new Date()
		if (useMockableJsonFetch.enableMock) {
			const key = `request-${name}-${startTimestamp}-${Math.random()}`
			setTimeout(() => {
				notification.open({
					message: `模拟请求 - ${name}`,
					description: `URL: ${url}`,
					icon: mockLoadingIcon,
					key,
					placement,
					btn: <HandleMockButtonGroup
						onLogout={() => { console.log(body) }}
						onPass={() => {
							notification.close(key)
							dispatch(new SuccessResult(mockData))
						}}
						onIntercept={() => {
							notification.close(key)
							dispatch(new FailureResult(initialData))
						}} />,
					duration: 0,
				})
			})
		} else {
			try {
				const response = await fetch(url, { method, body })
				const json = await response.json()
				dispatch(new SuccessResult(json))
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
				dispatch(new FailureResult(initialData))
			}
		}
	}, [body])

	return result
}

useMockableJsonFetch.enableMock = false;

export default useMockableJsonFetch;