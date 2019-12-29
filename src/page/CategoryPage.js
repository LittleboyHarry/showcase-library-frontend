import React from 'react'
import { Skeleton, Card, Result, Empty, List } from 'antd';
import { useMockableJsonFetch } from '../hook'
import { category as virtualCategory } from '../MockData'

export default function CategoryPage() {
	const { loading, success, data } = useMockableJsonFetch('分类', {
		url: '/category'
	}, [], virtualCategory)

	return <Skeleton active {...{ loading }}>
		{success
			? data.length > 0
				? <List
					grid={{ gutter: 4, xs: 1, sm: 2 }}
					dataSource={data}
					renderItem={category => (
						<List.Item>
							<Card>
								{category.index}
								{category.name}
							</Card>
						</List.Item>
					)}
				/>
				: <Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					style={{ padding: '3rem 0' }}
					description="图生馆维护中 ……" />
			: <Result
				title="500"
				subTitle="无法获取分类列表"
			/>}
	</Skeleton>
}