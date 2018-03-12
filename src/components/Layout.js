import React, { Component } from 'react';
import io from 'socket.io-client';
import { USER_CONNECTED, LOGOUT, VERIFY_USER } from '../Events';
import LoginForm from './LoginForm';
import ChatContainer from './chats/ChatContainer';

const socketUrl = "http://localhost:3231";
export default class Layout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			socket: null,
			user: null
		};
	}

	componentWillMount() {
		this.initSocket();
	}

	/*
	* Connect to and initializes the socket.
	*/
	initSocket = () => {
		const socket = io(socketUrl);

		socket.on("connect", () => {
			const { user } = this.state;

			if (user) {
			 	this.reconnect(socket);
			}
		});

		this.setState({ socket });
	}

	/*
	*   Sets the user property in state
	* @param user {id:number, name:string}
	*/
	setUser = (user) => {
		const { socket } = this.state;

		socket.emit(USER_CONNECTED, user);
		this.setState({ user });
	}

	/**
	 * Reverifies user with socket and then resets user.
	 */
	reconnect = (socket) => {
		socket.emit(VERIFY_USER, this.state.user.name, ({ isUser, user }) => {
			isUser ?
			this.setState({ user: null }) :
			this.setUser(user);
		});
	}

	/*
	* Sets the user property in state to null.
	*/
	logout = () => {
		const { socket } = this.state;

		socket.emit(LOGOUT);

		this.setState({ user: null });
	}

	render() {
		const { socket, user } = this.state;

		return (
			<div className="Layout">
				<div className="pages">
					{ ! user ?
						<LoginForm socket={socket} setUser={this.setUser} /> :
						<ChatContainer socket={socket} user={user} logout={this.logout} />
					}
				</div>
			</div>
		);
	}
}
