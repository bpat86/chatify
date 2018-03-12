import React, { Component } from 'react';

export default class UserOptionsMenu extends Component {
    componentWillMount() {
        document.addEventListener('mousedown', this.addUserToChat, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.addUserToChat, false);
    }

    addUserToChat = (e) => {
        const { addUserToChat, hide } = this.props;
        const menuToggle = document.querySelector(".more-btn");

        if (this.node.contains(e.target)) {
            addUserToChat();
            return;
        }

        hide(e.target === menuToggle);
    }

    render() {
        const { isToggled, disconnectedUsers } = this.props;

        return (
            <div
                className={`menu-container ${isToggled ? '' : 'show'}`}
                ref={node => this.node = node}
                >
                <div
                    className={`more-menu ${disconnectedUsers ? 'offline' : ''}`}
                    >
                    <div className="more-menu-caret">
                        <div className="more-menu-caret-outer"></div>
                        <div className="more-menu-caret-inner"></div>
                    </div>
                    <ul
                        role="menu"
                        aria-hidden="true"
                        aria-labelledby="more-btn"
                        className="more-menu-items"
                        onClick={(e) => this.addUserToChat(e)}
                        >
                        <li
                            className="more-menu-item"
                            role="presentation"
                            >
                            <button
                                type="button"
                                className="more-menu-btn"
                                title="Add a user to the chat"
                                >
                                Add User <i className="fa fa-user-plus"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}
