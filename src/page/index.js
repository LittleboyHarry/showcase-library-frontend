import ExplorePage from './ExplorePage'
import CategoryPage from './CategoryPage'
import BookInfoPage from './BookInfoPage'
/* import SearchPage from './SearchPage'
import LoginPage from './LoginPage' */

export const PageKeys = {
	EXPLORE: 'explore',
	CATEGORY: 'category',
	BOOK: 'book'
}
export const PageMap = {
	[PageKeys.EXPLORE]: {
		name: '探索',
		component: ExplorePage
	},
	[PageKeys.CATEGORY]: {
		name: '分类',
		component: CategoryPage,
	},
	[PageKeys.BOOK]: {
		name: '图书详情',
		component: BookInfoPage
	}
}