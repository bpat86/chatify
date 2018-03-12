import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import Moment from 'react-moment';
import UserOptionsMenu from '../sidebar/UserOptionsMenu';

export default class ActiveChats extends PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired,
        lastMessage: PropTypes.string,
        lastMessageTime: PropTypes.string,
        active: PropTypes.bool,
        onClick: PropTypes.func
    }

    static defaultProps = {
        lastMessage: "",
        lastMessageTime: "",
        active: false
    }

    constructor(props) {
        super(props)
        this.state = {
            isToggled: true
        };
    }

    clickHandler = () => {
        const { onClick } = this.props;

        onClick();
        this.hide();
    }

    menuVisibilityToggle = () => {
        this.setState(prevState => ({
            isToggled: !prevState.isToggled
        }));
    }

    hide = (toggleButtonClicked) => {
        const { isToggled } = this.state;

        if (isToggled) return false;
        if (toggleButtonClicked) return false;

        this.setState(prevState => ({
            isToggled: !prevState.isToggled
        }));
    }

    addUserToChat = () => {
        const { addUserToChatToggle, updatedAddUserToChatToggleState } = this.props;

        updatedAddUserToChatToggleState(addUserToChatToggle);

        this.hide();
    }

    render() {
        const { isToggled } = this.state;
        const { users, chat, active, disconnectedUsers, name, lastMessage, lastMessageTime } = this.props;
        const moreThanThreeUsersArePresent = (users.length < 3) || (! active || chat.isCommunity);
        const ifUserDisconnected = (disconnectedUsers && !active) || !active;

        return (
            <div
                className={`user ${ifUserDisconnected ? '' : 'active'}`}
                >
                <div className="user-photo">{name[0].toUpperCase()}</div>
                <div className="user-info" onClick={this.clickHandler}>
                    <div className="name">{name}</div>
                    <div className={`last-message ${lastMessage ? '' : 'hidden'}`}>
                        { lastMessage ? lastMessage : null }
                    </div>
                    {
                        lastMessageTime ?
                        <Moment className="last-message-time" fromNow>{lastMessageTime}</Moment> :
                        null
                    }
                </div>
                { moreThanThreeUsersArePresent ? null :
                    <div>
                        <button
                            className={`more-btn ${disconnectedUsers ? 'offline' : ''}`}
                            onClick={this.menuVisibilityToggle}
                            >
                            <span className="more-dot"></span>
                            <span className="more-dot"></span>
                            <span className="more-dot"></span>
                        </button>
                        <UserOptionsMenu
                            isToggled={isToggled}
                            menuVisibilityToggle={this.menuVisibilityToggle}
                            disconnectedUsers={disconnectedUsers}
                            addUserToChat={this.addUserToChat}
                            hide={this.hide}
                            />
                    </div>
                }
            </div>
        )
    }
}
