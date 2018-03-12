import React from 'react';
import Pluralize from 'react-pluralize';

export default function({ activeChat, activeUsers, setActiveChatName, activeChatUsers }) {
	return (
	  	<div className="chat-header">
			<div className="user-info">
                <div className="active-chat-name">{setActiveChatName}</div>
            </div>
            {
                !activeChat.isCommunity ? null :
    			<div className="status">
    				<div className="active-chat-users">
                        <i className={`fa fa-circle ${activeUsers.length >= 1 ? ' green' : ''}`}></i>
                        <Pluralize singular="user" count={activeUsers.length} />
                        { " online" }
                    </div>
    			</div>
            }
	  	</div>
	);
}
