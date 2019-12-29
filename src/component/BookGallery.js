import React, { useContext } from 'react';
import { useMockableJsonFetch } from './../hook'
import { Card, Typography, Skeleton, Button, Result, Empty, List } from 'antd';
import * as MockData from '../MockData'
import { makeStyles } from '@material-ui/styles'
import App from '../App'
import { PageSegueEvent } from '../event'
import { PageKeys } from '../page'

const useStyles = makeStyles({
	root: {
		userSelect: 'none',
		'&>h2': {
			fontWeight: 'normal',
			textAlign: 'center',
			margin: '1rem 0'
		}
	}
})

export default function BookGallery({ disabled = false }) {
	// TODO: 增加图书分页查询功能	
	const { dispatch } = useContext(App.Context)
	const styles = useStyles()
	const { loading, success, data } = useMockableJsonFetch({
		name: '所有图书',
		url: '/api/book/get',
		defaultData: [],
		mockData: MockData.bookList,
		blocked: disabled
	}, [])

	return <div className={styles.root}>
		<Typography.Title level={2}>书库大全</Typography.Title>
		<Skeleton active {...{ loading }}>
			{
				success
					? data.length > 0
						? <List
							grid={{ gutter: 12, xs: 1, sm: 2, md: 3, lg: 4 }}
							dataSource={data}
							renderItem={(book, index) => (
								<List.Item>
									<Card
										type="inner"
										style={{ cursor: 'pointer' }}
										onClick={() => {
											dispatch(new PageSegueEvent({
												target: PageKeys.BOOK,
												data: {
													bookId: index,
													bookName: book.name
												}
											}))
										}}
										title={
											<span title={book.name}>{book.name}</span>}
									>
										<p>作者：{book.author}</p>
										<p>出版社：{book.press}</p>
									</Card>
								</List.Item>
							)}
						/>
						: <Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							style={{ padding: '3rem 0' }}
							description="图生馆维护中 ……" />
					: <Result
						status="error"
						title="网络异常"
						subTitle="请稍后重试"
						extra={
							<Button type="danger" icon="reload" onClick={() => { window.location.reload() }}>刷新</Button>}
					/>
			}
		</Skeleton>
	</div >
}
