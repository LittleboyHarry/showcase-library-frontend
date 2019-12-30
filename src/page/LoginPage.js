import React from 'react'
import { useAppContext } from '../hook'
import { LoginEvent, PageSegueEvent } from '../event'
import { PageKeys } from '../page'
import { Form, Icon, Input, Button, Checkbox } from 'antd';

class NormalLoginForm extends React.Component {
	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				console.log('Received values of form: ', values);
			}
		});
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
			<Form onSubmit={this.handleSubmit} className="login-form">
				<Form.Item>
					{getFieldDecorator('username', {
						rules: [{ required: true, message: 'Please input your username!' }],
					})(
						<Input
							prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
							placeholder="Username"
						/>,
					)}
				</Form.Item>
				<Form.Item>
					{getFieldDecorator('password', {
						rules: [{ required: true, message: 'Please input your Password!' }],
					})(
						<Input
							prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
							type="password"
							placeholder="Password"
						/>,
					)}
				</Form.Item>
				<Form.Item>
					{getFieldDecorator('remember', {
						valuePropName: 'checked',
						initialValue: true,
					})(<Checkbox>Remember me</Checkbox>)}
					{/* <a className="login-form-forgot" href="">
						Forgot password
          </a> */}
					<Button type="primary" htmlType="submit" className="login-form-button">
						Log in
          </Button>
					Or {/* <a href="">register now!</a> */}
				</Form.Item>
			</Form>
		);
	}
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);



export default function LoginPage() {
	const { dispatch } = useAppContext()

	return <div>
		<WrappedNormalLoginForm />
		<Button onClick={() => {
			dispatch(new LoginEvent({
				username: '某人',
				isAdmin: true
			}))

			dispatch(new PageSegueEvent({
				target: PageKeys.MYSELF
			}))
		}}>虚拟登录</Button>
	</div >
}