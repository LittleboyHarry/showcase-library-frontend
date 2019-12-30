import React, { useState } from 'react'
import { Descriptions, Badge, Result, Spin, Skeleton, Button, Icon, Popover, Row, Divider, Card, Popconfirm, message } from 'antd'
import { useMockableJsonFetch, useAppContext, useLoginState } from '../hook'
import { getBookInfo } from '../MockData'
import { makeStyles } from '@material-ui/styles'

const { Item } = Descriptions
const ButtonGroup = Button.Group

const useStyles = makeStyles({
	PinModifyBox: {
		background: '#f7f7f7',
		borderRadius: 4,
		marginTop: 24,
	}
})

function ModifyBox({ pin = false, onTogglePin }) {
	const styles = useStyles()
	const modifyTools = <Row type="flex" justify="space-around" style={{ width: 256 }}>
		<Button type="primary" icon="edit" >修改</Button>
		<Popconfirm
			title="这会永久删除图书信息"
			onConfirm={()=>{
				message.loading('向后台发送请求中..');
			}}
			okText="确定"
			okType="danger"
			trigger="click"
		>
			<Button type="danger" icon="close-circle" >删除记录</Button>
		</Popconfirm>
	</Row>

	return <>
		<Row type="flex" justify="center">
			<ButtonGroup>
				<Popover content={modifyTools} {...pin && { visible: false }}>
					<Button size="large" icon="form" {...pin && { disabled: true }}>
						管理
			</Button>
				</Popover>
				<Button size="large" {...pin && { type: 'primary' }} onClick={() => { if (onTogglePin) onTogglePin() }}>
					<Icon type="pushpin" />
				</Button>
			</ButtonGroup>
		</Row >
		<Row type="flex" justify="center">
			{
				pin &&
				<Card bordered={false} className={styles.PinModifyBox}>{modifyTools}</Card>
			}
		</Row>
	</>
}

export default function BookInfoPage({ loseFocus }) {
	const { browsingBookId: bookId } = useAppContext()
	const [pinModifyBox, setPinModifyBox] = useState(false)
	let { isAdmin } = useLoginState()
	const { loading, success, data: book } = useMockableJsonFetch({
		name: '获取图书信息',
		url: '/api/browser/book',
		body: {
			id: bookId
		},
		defaultData: null,
		mockData: getBookInfo(bookId),
		blocked: loseFocus
	}, [bookId])
	isAdmin = true
	return <Spin spinning={loading}>
		<Skeleton active {...{ loading }} paragraph={{ rows: 8 }}>
			{success
				? book
					? <>
						<Descriptions title={book.name}>
							<Item label="作者">{book.author}</Item>
							<Item label="出版社">{book.press}</Item>
							<Item label="库存">
								<Badge status="processing" text="Running" />
							</Item>
						</Descriptions>
						{isAdmin && <>
							<Divider />
							<ModifyBox
								pin={pinModifyBox}
								onTogglePin={() => { setPinModifyBox(!pinModifyBox) }} />
						</>}
					</>
					: <Result
						status="404"
						title="查无此书"
						subTitle="图书馆书库更新了"
					/>
				: <Result
					status="error"
					title="无效图书数据"
					subTitle="有问题可以进一步资讯管理员"
				/>
			}
		</Skeleton>
	</Spin>

}