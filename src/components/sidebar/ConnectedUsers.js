import React, { PureComponent } from 'react';
import { differenceBy } from 'lodash';

export default class ConnectedUsers extends PureComponent {
    clickHandler = (userName) => {
        const { activeChat, addUserToChatHandler, addUserToChatToggle } = this.props;
        const isCommunityTrue = ((activeChat !== undefined) && (activeChat !== null)) ? activeChat.isCommunity : null;

        if (isCommunityTrue || addUserToChatToggle) {
            addUserToChatHandler(userName);
        }

        if (! addUserToChatToggle) {
            addUserToChatHandler(userName);
        }

        this.hide();
    }

    hide = () => {
        const { addUserToChatToggle, updatedAddUserToChatToggleState } = this.props;

        if (addUserToChatToggle) return false;

        updatedAddUserToChatToggleState(addUserToChatToggle);
    }

    render() {
        const { user, users, addUserToChatToggle } = this.props;

        return (
            <div className="users">
                { users.length < 2

                    ?

                    <div className="user">
                        <div className="name">No users online :(</div>
                    </div>

                    :

                    differenceBy(users, [user], 'id').map((user) => {
                        return (
                            <div
                                key={user.id}
                                className="user"
                                onClick={() => this.clickHandler(user.name)}
                                >
                                { ! addUserToChatToggle ?
                                    <div className="add-user">
                                        <i className="fa fa-plus-circle"></i>
                                    </div>
                                : null }
                                <div className="user-photo">{user.name[0].toUpperCase()}</div>
                                <div className="user-info">
                                    <div className="name">
                                        {user.name}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}
