function makeRepeated(arr, repeats) {
	return Array.from({ length: repeats }, () => arr).flat()
}

export const bookList = makeRepeated([
	{
		name: '教你做人',
		author: '贾鱼村',
		press: '清清大学出版社'
	}, {
		name: '修仙日记',
		author: '风清扬',
		press: '电子手工业出版社'
	}, {
		name: '做男人如何保护好自己的发际线',
		author: '扫地增',
		press: '人人邮电出版社'
	}, {
		name: '大学没压力',
		author: '混世膜王',
		press: '轮子出版社'
	}], 4)

export const category = [
	{
		"index": "A",
		"name": "马克思主义、列宁主义、毛泽东思想、邓小平理论"
	},
	{
		"index": "B",
		"name": "哲学、宗教"
	},
	{
		"index": "C",
		"name": "社会科学总论"
	},
	{
		"index": "D",
		"name": "政治、法律"
	},
	{
		"index": "E",
		"name": "军事"
	},
	{
		"index": "F",
		"name": "经济",
		"icon": "icon-example"
	},
	{
		"index": "G",
		"name": "文化、科学、教育、体育"
	},
	{
		"index": "H",
		"name": "语言、文字"
	},
	{
		"index": "I",
		"name": "文学"
	},
	{
		"index": "J",
		"name": "艺术"
	},
	{
		"index": "K",
		"name": "历史、地理"
	},
	{
		"index": "N",
		"name": "自然科学总论"
	},
	{
		"index": "O",
		"name": "数理科学和化学"
	},
	{
		"index": "Q",
		"name": "生物科学"
	},
	{
		"index": "R",
		"name": "医药、卫生"
	},
	{
		"index": "S",
		"name": "农业科学"
	},
	{
		"index": "T",
		"name": "工业技术"
	},
	{
		"index": "U",
		"name": "交通运输"
	},
	{
		"index": "V",
		"name": "航空、航天"
	},
	{
		"index": "X",
		"name": "环境科学、劳动保护科学（安全科学）"
	},
	{
		"index": "Z",
		"name": "综合性图书"
	}
]