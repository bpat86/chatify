import React, { Component } from 'react';
import SideBar from '../sidebar/SideBar';
import { COMMUNITY_CHAT, MESSAGE_SENT, MESSAGE_RECEIVED, TYPING, PRIVATE_MESSAGE,
	USER_CONNECTED, USER_DISCONNECTED, NEW_CHAT_USER } from '../../Events'
import ChatHeading from './ChatHeading';
import { createChatNameFromUsers } from '../../Factories';
import Messages from '../messages/Messages';
import MessageInput from '../messages/MessageInput';
import { values, difference, differenceBy, map, without, flattenDeep, last, uniq } from 'lodash';

export default class ChatContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			chats: [],
			users: [],
			activeUsers: [],
			mostRecentActiveUser: null,
			usersInChats: [],
			mostRecentUserAddedToChats: null,
			addUserToChatToggle: true,
			disconnectedUser: null,
			disconnectedUsers: [],
			activeChat: null
		};
	}

	componentDidMount() {
		const { socket } = this.props;

		this.initSocket(socket);
	}

	componentWillUnmount() {
		const { socket } = this.props;

		socket.off(PRIVATE_MESSAGE);
		socket.off(USER_CONNECTED);
		socket.off(USER_DISCONNECTED);
		socket.off(NEW_CHAT_USER);
	}

	initSocket(socket) {
		socket.emit(COMMUNITY_CHAT, this.resetChat);

		socket.on(PRIVATE_MESSAGE, this.addChat);
		socket.on(NEW_CHAT_USER, this.addUserToChat);

		socket.on(PRIVATE_MESSAGE, (users) => {
			const { user } = this.props;
			const myself = user.name;

			const usersInChatsArray = this.state.usersInChats;
			const addUsersIntoUsersInChatsArray = without(uniq(flattenDeep([...usersInChatsArray, values(users.users)])), myself);
			const addSelectedUserToUsersInChatsArray = last(addUsersIntoUsersInChatsArray);

			this.setState({
				usersInChats: addUsersIntoUsersInChatsArray,
				mostRecentUserAddedToChats: addSelectedUserToUsersInChatsArray
			});
		});

		socket.on('connect', () => {
			socket.emit(COMMUNITY_CHAT, this.resetChat);
		});

		socket.on(USER_CONNECTED, (users) => {
			const { user } = this.props;
			const myself = user.name;

			const activeUsersArray = this.state.activeUsers;
			const addActiveUsersIntoActiveUsersArray = without(uniq(flattenDeep([...activeUsersArray, map(users, 'name')])), myself);
			const addSelectedUserIntoActiveUsersArray = last(flattenDeep([...activeUsersArray, map(users, 'name')]));

			this.setState({
				users: values(users),
				activeUsers: addActiveUsersIntoActiveUsersArray,
				mostRecentActiveUser: addSelectedUserIntoActiveUsersArray
			});
		});

		socket.on(USER_DISCONNECTED, (users) => {
			const { activeChat } = this.state;
			const usersInChatsArray = this.state.usersInChats;
			const activeUsersArray = this.state.activeUsers;
			const disconnectedUsersArray = this.state.disconnectedUsers;

			const removedUsers = differenceBy(this.state.users, values(users), 'id'); // returns object
			const removedUsersName = map(removedUsers, 'name')[0];

			// console.log(disconnectedUsersInChats) // "jay"
			// console.log(removedUsersName) // jay

			const updateActiveUsersArray = without(activeUsersArray, removedUsersName);
			const updateUsersInChatsArray = without(usersInChatsArray, removedUsersName);
			const updateDisconnectedUsersArray = [...disconnectedUsersArray, removedUsers[0]];

			this.removeUsersFromChat(removedUsers);
			this.setActiveChatName(activeChat, activeChat.users.pop());

			this.setState({
				users: values(users),
				activeUsers: updateActiveUsersArray,
				usersInChats: updateUsersInChatsArray,
				disconnectedUsers: updateDisconnectedUsersArray
			});
		});
	}

	sendPrivateMessage = (receiver) => {
		const { chats, activeChat, addUserToChatToggle } = this.state;
		const { socket, user } = this.props;
		const myself = user.name;

		socket.emit(PRIVATE_MESSAGE, { receiver, sender: user.name, activeChat, chats, myself, addUserToChatToggle });
	}

	addUserToChat = ({ chatId, newUser }) => {
		const { chats } = this.state;

		const newChats = chats.map(chat => {
			if (chat.id === chatId) {
				if (! chat.users.includes(newUser)) {
					return Object.assign({}, chat, { users: [ ...chat.users, newUser ] });
				}
			}
			return chat;
		});

		this.setState({ chats: newChats });
	}

	removeUsersFromChat = removedUsers => {
		const { chats } = this.state;

		const newChats = chats.map(chat => {
			let newUsers = difference(chat.users, removedUsers.map(u => u.name))
				return Object.assign({}, chat, { users: newUsers });
		});

		this.setState({ chats: newChats });
	}

	/*
	*	Reset the chat back to only the chat passed in.
	* 	@param chat {Chat}
	*/
	resetChat = (chat) => {
		return this.addChat(chat, true);
	}

	/*
	*	Adds chat to the chat container, if reset is true removes all chats
	*	and sets that chat to the main chat.
	*	Sets the message and typing socket events for the chat.
	*
	*	@param chat {Chat} the chat to be added.
	*	@param reset {boolean} if true will set the chat as the only chat.
	*/
	addChat = (chat, reset = false) => {
		const { socket } = this.props;
		const { chats } = this.state;
		const newChats = reset ? [chat] : [...chats, chat];
		const messageEvent = `${MESSAGE_RECEIVED}-${chat.id}`;
		const typingEvent = `${TYPING}-${chat.id}`;

		this.setState({
			chats: newChats,
			activeChat: reset ? chat : this.state.activeChat
		});

		socket.on(typingEvent, this.updateTypingInChat(chat.id));
		socket.on(messageEvent, this.addMessageToChat(chat.id));
	}

	/*
	* 	Returns a function that will
	*	adds message to chat with the chatId passed in.
	*
	* 	@param chatId {number}
	*/
	addMessageToChat = (chatId) => {
		return message => {
			const { chats } = this.state;

			let newChats = chats.map((chat)=>{
				if (chat.id === chatId)
					chat.messages.push(message)
				return chat;
			});

			this.setState({ chats: newChats });
		}
	}

	/*
	*	Updates the typing of chat with id passed in.
	*	@param chatId {number}
	*/
	updateTypingInChat = (chatId) => {
		return ({isTyping, user}) => {
			if (user !== this.props.user.name) {

				const { chats } = this.state;

				let newChats = chats.map((chat) => {
					if (chat.id === chatId) {
						if (isTyping && !chat.typingUsers.includes(user)) {
							chat.typingUsers.push(user);
						} else if (!isTyping && chat.typingUsers.includes(user)) {
							chat.typingUsers = chat.typingUsers.filter(u => u !== user);
						}
					}
					return chat;
				})
				this.setState({ chats: newChats });
			}
		}
	}

	/*
	*	Adds a message to the specifeid chat
	*	@param chatId {number}  The id of the chat to be added to.
	*	@param message {string} The message to be added to the chat.
	*/
	sendMessage = (chatId, message) => {
		const { socket } = this.props;

		socket.emit(MESSAGE_SENT, { chatId, message });
	}

	/*
	*	Sends typing status to server.
	*	chatId {number} the id of the chat being typed in.
	*	typing {boolean} If the user is typing still or not.
	*/
	sendTyping = (chatId, isTyping) => {
		const { socket } = this.props;

		socket.emit(TYPING, { chatId, isTyping });
	}

	/*
    *   Set the active chat
    *
    *   @param activeChat
    */
	setActiveChat = (activeChat) => {
		this.setState({ activeChat });
	}

	/*
    *   Set the active chat name
    *
    *   @param chatData
    *   @param userData
    */
	setActiveChatName = (chatData, userData) => {
        return (
        	chatData.isCommunity ?
        	chatData.name :
        	createChatNameFromUsers(chatData.users, userData.name, chatData.name)
        );
    }

	/*
    *   Listens for addUserToChatToggle state
    *   to change so it can be passed to another
    *   child element
    *
    *   @param updatedState
    */
    updatedAddUserToChatToggleState = (updatedState) => {
        this.setState({
            addUserToChatToggle: !this.state.addUserToChatToggle
        });
    }

    render() {
    	const { chats, activeChat, users, activeUsers, usersInChats,
    			disconnectedUsers, addUserToChatToggle } = this.state;
    	const { user, logout } = this.props;

        return (
			<div className="chatArea row">
				<SideBar
					logout={logout}
					chats={chats}
					user={user}
					users={users}
					usersInChats={usersInChats}
					activeUsers={activeUsers}
					activeChat={activeChat}
					addUserToChatToggle={addUserToChatToggle}
					setActiveChatName={this.setActiveChatName}
					setActiveChat={this.setActiveChat}
					disconnectedUsers={disconnectedUsers}
					sendPrivateMessage={this.sendPrivateMessage}
					updatedAddUserToChatToggleState={this.updatedAddUserToChatToggleState}
					/>
				<div className="col-9 chatroom-container">
				{
					activeChat !== null ? (
						<div className="chatroom">
							<ChatHeading
								activeChat={activeChat}
								activeUsers={activeUsers}
								activeChatUsers={activeChat.users}
								setActiveChatName={this.setActiveChatName(activeChat, user)}
								/>
							<Messages
								user={user}
								messages={activeChat.messages}
								typingUsers={activeChat.typingUsers}
								/>
							<MessageInput
								sendMessage = {
									(message) => {
										this.sendMessage(activeChat.id, message)
									}
								}
								sendTyping = {
									(isTyping) => {
										this.sendTyping(activeChat.id, isTyping)
									}
								}
								/>

						</div>
					) :
					<div className="chatroom choose">
						<h3>Choose a chat</h3>
					</div>
				}
				</div>
			</div>
        );
    }
}
