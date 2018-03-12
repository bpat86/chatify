import React, { Component } from 'react';
import { VERIFY_USER } from '../Events';

export default class LoginForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			nickname: "",
			error: ""
		};
	}

	checkUser = ({ user, isUser }) => {
		if (isUser) {
			this.setError("Username is taken");
		} else {
			this.setError("");
		}
	}

	setUser = ({ user, isUser }) => {
		const { setUser } = this.props;

		if (isUser) {
			this.setError("Username is taken");
		} else {
			this.setError("");
			setUser(user);
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const { socket } = this.props;
		const { nickname } = this.state;

		if (! nickname.length) {
			this.setError("Create a username");
		} else {
			socket.emit(VERIFY_USER, nickname, this.setUser);
		}
	}

	handleUserCheck = (e) => {
		e.preventDefault()

		const { socket } = this.props;
		const { nickname } = this.state;

		if (! nickname.length) return false;

		socket.emit(VERIFY_USER, nickname, this.checkUser);
	}

	handleChange = (e) => {
		this.setState({ nickname: e.target.value });
	}

	setError = (error) => {
		this.setState({ error });
	}

	render() {
		const { nickname, error } = this.state;

		return (
			<div className="login page">
				<form onSubmit={this.handleSubmit} className="form">
					<label htmlFor="nickname">
						<h3 className="title">Choose your username</h3>
					</label>
					<input
						type="text"
						id="nickname"
						value={nickname}
						autoComplete="off"
						className="usernameInput"
						onChange={this.handleChange}
						onKeyUp={this.handleUserCheck}
						ref={input => this.textInput = input}
						/>
					<div className="error">{error ? error : null}</div>
				</form>
			</div>
		);
	}
}
