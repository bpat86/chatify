import React, { Component } from 'react';
import ConnectedUsers from './ConnectedUsers';
import DisconnectedUsers from './DisconnectedUsers';
import ActiveChats from './ActiveChats';
import { last, get, find, truncate, includes } from 'lodash';

export default class SideBar extends Component {
    static type = {
        USERS: "users",
        CHATS: "chats"
    }

    constructor(props){
        super(props)
        this.state = {
            receiver: "",
            activeSideBar: SideBar.type.CHATS,
            selectedActiveChatUsers: [],
            userIsInAGroupChat: null
        };
    }

    /*
    *   Opening a private chat message from the search bar
    *
    */
    handleSubmit = (e) => {
        e.preventDefault();

        const { receiver } = this.state;
        const { sendPrivateMessage } = this.props;

        sendPrivateMessage(receiver);
        this.setState({ receiver: "" });
    }

    /*
    *   When you click a chat name under Chats in the sidebar,
    *   it sets the selected chat as "active"
    *
    *   @param chat {Chat} the chat to be added.
    */
    setActiveChatHandler = (chat) => {
        const { setActiveChat } = this.props;

        if (chat.isCommunity || chat.name) {
            setActiveChat(chat);
        }
    }

    /*
    *   When you click a user name under Users in sidebar,
    *   it opens a private chat between users. Both users can
    *   expect to see the new chat appear in their sidebar.
    *
    *   @param receiver String
    *   @param receiverObject Object
    */
    addChatForUser = (receiver) => {
        const { activeChat, users, disconnectedUsers, sendPrivateMessage, setActiveChatName,
                addUserToChatToggle } = this.props;
        const getReceiverIdFromUsersState = find(users, ['name', receiver]).id;
        const getDisconnectedUsersId = disconnectedUsers.length && find(disconnectedUsers, ['name', receiver]) !== undefined ? find(disconnectedUsers, ['name', receiver]).id : null;

        if (getDisconnectedUsersId === getReceiverIdFromUsersState) return false;

        sendPrivateMessage(receiver);
        this.setActiveSideBar(SideBar.type.CHATS);

        if (! includes(activeChat.users, receiver) && ! addUserToChatToggle) {
            setActiveChatName(activeChat, activeChat.users.push(receiver));
        }
    }

    /*
    *   Set active sidebar section
    *
    *   @param type
    */
    setActiveSideBar = (type) => {
        this.setState({
            activeSideBar: type
        });
    }

    /*
    *   Click handler for add user to chat button
    *   in the user options menu under Chats
    *
    *   @param selectedUser
    */
    addUserToChatHandler = (selectedUser) => {
        this.addChatForUser(selectedUser);
    }

    /*
    *   Get the last message sent and display
    *   it under the User's name in active chats list
    *
    *   @param persistedData
    */
    persistLastMessage = (persistedData) => {
        return truncate(get(last(persistedData), 'message', ''), { 'length': 75, 'separator': /,? +/ });
    }

    /*
    *   Get the last message sent's timestamp and display
    *   it under the User's name in active chats list
    *
    *   @param persistedData
    */
    persistLastMessageTime = (persistedData) => {
        return get(last(persistedData), 'time', '');
    }

    /*
    *   Determine if chat is active
    *
    *   Returns a boolean
    *   @param activeChatData
    *   @param chatData
    */
    chatIsActive = (activeChatData, chatData) => {
        return activeChatData.id === chatData.id;
    }

    /*
    *   Cancels the add user to chat action
    */
    cancel = () => {
        const { addUserToChatToggle, updatedAddUserToChatToggleState } = this.props;

        updatedAddUserToChatToggleState(addUserToChatToggle)
    }

    render() {
        const { receiver } = this.state; // activeSideBar
        const { user, users, chats, activeChat, setActiveChat, setActiveChatName, logout,
                disconnectedUsers, updatedAddUserToChatToggleState, addUserToChatToggle } = this.props;

        return (
            <div id="sidebar" className="col-3 col">
                <div className="current-user">
                    <span>
                        <i className="fa fa-user"></i>
                        {user.name}
                    </span>
                    <div
                        onClick={() => logout()}
                        title="Logout"
                        className="logout"
                        >
                            Log Out <i className="fa fa-power-off right"></i>
                    </div>
                </div>

                <form
                    className="row search"
                    onSubmit={this.handleSubmit}
                    >
                    <input
                        type="text"
                        value={receiver}
                        placeholder="Find a user..."
                        onChange={(e) => this.setState({ receiver: e.target.value }) }
                        />
                </form>

                <div className="row">
                    <div className="heading">
                        <div className="app-name">
                            <i className="fa fa-users"></i> Users
                            { ! addUserToChatToggle ?
                                <div
                                    className="cancel"
                                    title="Cancel"
                                    onClick={() => this.cancel()}
                                    >
                                    <i className="fa fa-times-circle"></i>
                                </div>
                                : null}
                        </div>
                    </div>
                    <ConnectedUsers
                        user={user}
                        users={users}
                        receiver={receiver}
                        activeChat={activeChat}
                        addChatForUser={this.addChatForUser}
                        addUserToChatToggle={addUserToChatToggle}
                        addUserToChatHandler={this.addUserToChatHandler}
                        updatedAddUserToChatToggleState={updatedAddUserToChatToggleState}
                    />
                </div>

                {
                    ! disconnectedUsers.length > 0 ? null :
                    <div className="row">
                        <div className="heading">
                            <div className="app-name">
                                <i className="fa fa-users"></i> Offline Users
                            </div>
                        </div>
                        <DisconnectedUsers
                            user={user}
                            disconnectedUsers={disconnectedUsers}
                        />
                    </div>
                }

                <div className="row">
                    <div className="heading">
                        <div className="app-name">
                            <i className="fa fa-comments"></i> Chats
                        </div>
                    </div>
                    <div
                        ref="activeChats"
                        className="users"
                        onClick={(e) => (e.target === this.refs.activeChats) && setActiveChat(null)}
                        >
                        {
                            chats.map((chat) => {
                                return (
                                    <ActiveChats
                                        key={chat.id}
                                        chat={chat}
                                        users={users}
                                        setActiveChat={setActiveChat}
                                        name={setActiveChatName(chat, user)}
                                        addUserToChatToggle={addUserToChatToggle}
                                        active={this.chatIsActive(activeChat, chat)}
                                        onClick={() => this.setActiveChatHandler(chat)}
                                        lastMessage={this.persistLastMessage(chat.messages)}
                                        lastMessageTime={this.persistLastMessageTime(chat.messages)}
                                        updatedAddUserToChatToggleState={updatedAddUserToChatToggleState}
                                    />
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}
