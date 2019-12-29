import React, { } from 'react'
import { Popover, Button, Typography } from 'antd'

function DebuggerMenu() {
	return <div style={{ width: '400px', maxWidth: '80vw' }}>
		<div style={{
			display: 'flex',
			alignItems: 'center',
		}}>

		</div>
	</div>
}

export default function () {
	return (
		<div style={{ position: 'absolute', right: '48px', bottom: '48px', overflow: 'hidden' }}>
			<Popover placement="topRight" title={
				<Typography.Text type="warning" children="调试器" />
			} content={<DebuggerMenu />} trigger="hover">
				<Button type="danger" shape="circle" icon="bug" size="large" />
			</Popover>
		</div>)
}