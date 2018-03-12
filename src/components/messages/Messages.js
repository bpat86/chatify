import React, { Component } from 'react';
import Moment from 'react-moment';
import { differenceBy } from 'lodash';

export default class Messages extends Component {
	scrollDown = () => {
		const { thread } = this.refs;

		thread.scrollTop = thread.scrollHeight;
	}

	componentDidMount() {
		this.scrollDown();
	}

	componentDidUpdate(prevProps, prevState){
		this.scrollDown();
	}

	render() {
		const { messages, user, typingUsers, disconnectedUsers } = this.props;

		return (
		  	<div ref='container' className="thread-container messages">
				<div ref='thread' className="thread col">
					{
						messages.map((msg, i) => {
							return (
								<div
									key={msg.id}
									className={`message-container ${msg.sender === user.name ? 'self' : 'other'}`}>
									<div className="message-body">
										<div className="message">{msg.message}</div>
										<Moment className="time" fromNow>{msg.time}</Moment>
										<div className="name">{msg.sender}</div>
									</div>
								</div>
							)
						})
					}
				</div>
				<div>
					{
						typingUsers.map((name) => {
							return (
								<div key={name} className="user-event">
									{`${name} is typing...`}
								</div>
							)
						})
					}
				</div>
				<div>
					{
                        differenceBy(disconnectedUsers, [user], 'name').map((user) => {
                            return (
								<div key={user.id} className="user-event">
									{`${user.name} has left the building`}
								</div>
							)
                        })
                    }
				</div>
		  	</div>
		);
	}
}
