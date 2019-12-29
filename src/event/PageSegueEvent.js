export default class PageSegueEvent {
	constructor({
		target,
		data
	}) {
		this.targetPageKey = target
		this.data = data
	}
}