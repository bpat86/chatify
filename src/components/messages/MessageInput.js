import React, { Component } from 'react';

export default class MessagesInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			message: "",
			isTyping: false
		};
	}

	addMessageOnEnterKey = (e) => {
	    if (e.keyCode === 13 && e.shiftKey === false) {
	      	this.handleSubmit(e);
	    }
	}

	handleSubmit = (e) => {
		e.preventDefault();

		this.sendMessage();

		this.setState({ message: "" });
	}

	sendMessage = () => {
		const { message } = this.state;
		const { sendMessage } = this.props;

		sendMessage(message);
	}

	componentWillUnmount() {
		this.stopCheckingTyping();
	}

	sendTyping = () => {
		const { sendTyping } = this.props;

		this.lastUpdateTime = Date.now()

		if (! this.state.isTyping) {
			this.setState({ isTyping: true });

			sendTyping(true);

			this.startCheckingTyping();
		}
	}

	/*
	*	startCheckingTyping
	*	Start an interval that checks if the user is typing.
	*/
	startCheckingTyping = () => {
		this.typingInterval = setInterval(() => {
			if ((Date.now() - this.lastUpdateTime) > 500){
				this.setState({ isTyping: false });
				this.stopCheckingTyping();
			}
		}, 300);
	}

	/*
	*	stopCheckingTyping
	*	Start the interval from checking if the user is typing.
	*/
	stopCheckingTyping = () => {
		const { sendTyping } = this.props;

		if (this.typingInterval) {
			clearInterval(this.typingInterval);
			sendTyping(false);
		}
	}

	render() {
		const { message } = this.state;

		return (
			<div className="form-group">
				<form
					onSubmit={this.handleSubmit}
					className="message-form"
					>
		  			<textarea
						id="message"
						ref={"messsage-input"}
						className="form-control"
						value={message}
						autoComplete={'off'}
		  				placeholder="Say something..."
		  				onKeyUp={ (e) => {e.keyCode !== 13 && this.sendTyping()} }
		  				onKeyDown={ this.addMessageOnEnterKey }
		  				onChange={
		  					({target}) => {
		  						this.setState({ message: target.value })
		  					}
		  				}
		  				></textarea>
		  			<button
						disabled={message.length < 1}
						type="submit"
						title={message.length < 1 ? "Compose a message first" : "Send your message"}
						className="send"
		  					>Send</button>
		  		</form>
		  	</div>
		);
	}
}
