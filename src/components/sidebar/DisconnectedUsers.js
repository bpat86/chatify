import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { differenceBy } from 'lodash';

export default class DisconnectedUsers extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func
    }

    static defaultProps = {
        onClick: () => {}
    }

    hide = () => {
        const { addUserToChatToggle, updatedAddUserToChatToggleState } = this.props;

        updatedAddUserToChatToggleState(addUserToChatToggle);
    }

    render() {
        const { user, disconnectedUsers } = this.props;

        return (
            <div className="users">
                {
                    differenceBy(disconnectedUsers, [user], 'id').map((user) => {
                        return (
                            <div key={user.id} className="user offline">
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
