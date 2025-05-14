// MessagesRender.jsx
import React from "react";
import MessageItem from "./MessageItem"; // adjust the path as needed// adjust if needed
import { formatDate, isToday, isYesterday } from "@/helpers";

const MessagesRender = ({
    localMessage,
    last_message_read_id = null,
    showUnreadLabel,
    user,
    onAttachmentClick,
    unreadMessageRef,
}) => {
    let lastDate = "";
    let lastMessageRead = false;

    return (
        <>
            {localMessage.map((msg) => {
                const date = new Date(msg.created_at);
                let label = "";

                if (isToday(date)) {
                    label = "Today";
                } else if (isYesterday(date)) {
                    label = "Yesterday";
                } else {
                    label = formatDate(date);
                }

                let showLabel = label !== lastDate;
                let showUnread;

                if (!msg.group_id) {
                    showUnread =
                        Boolean(msg.is_read) === false &&
                        Boolean(msg.is_read) !== lastMessageRead;

                    lastMessageRead = Boolean(msg.is_read);

                    if (showLabel && showUnread) {
                        showLabel = false;
                    }
                } else {

                    
                    let isUnRead = false;
                    if(last_message_read_id === null){
                        isUnRead = true;
                    }else {
                        isUnRead = msg.id > last_message_read_id;
                    }

                    showUnread = isUnRead && !lastMessageRead;

                    if (showUnread) lastMessageRead = true;
                }

                lastDate = label;

                return (
                    <React.Fragment key={msg.id}>
                        {showLabel && (
                            <div className="flex justify-center text-gray-200 font-medium text-md md:text-lg my-3">
                                {label}
                            </div>
                        )}

                        {showUnreadLabel &&
                            showUnread &&
                            user.id !== msg.sender_id && (
                                <div
                                    className="flex justify-center my-3"
                                    ref={unreadMessageRef}
                                >
                                    <h2 className="text-slate-200 bg-slate-800 w-fit px-10 py-2 rounded-lg">
                                        Un Read Messages
                                    </h2>
                                </div>
                            )}

                        <MessageItem
                            key={msg.id}
                            message={msg}
                            attachmentClick={onAttachmentClick}
                        />
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default MessagesRender;
