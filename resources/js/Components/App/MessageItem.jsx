import { usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import ReactMarkdown from "react-markdown";
import { formatMessageDateLong } from "@/helpers";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import MessageAttachments from "./MessageAttachments";

const MessageItem = ({ message, attachmentClick }) => {
    const currentUser = usePage().props.auth.user;
    // console.log(message);
    // console.log(currentUser.id);

    return (
        <div
            className={
                "chat " +
                (message.sender_id === currentUser.id
                    ? "chat-end"
                    : "chat-start")
            }
        >
            <UserAvatar user={message.sender} />

            <div className="chat-header">
                {message.sender_id !== currentUser.id
                    ? message.sender.name
                    : ""}
                <time className="text-xs opacity-50 ml-2">
                    {formatMessageDateLong(message.created_at)}
                </time>
                {message.sender_id === currentUser.id ? "You" : ""}
            </div>

            <div
                className={
                    "chat-bubble relative " +
                    (message.sender_id === currentUser.id
                        ? "chat-bubble-info"
                        : "bg-gray-700")
                }
            >
                <div className="chat-message">
                    <div className="chat-message-content break-words break-all whitespace-pre-wrap">
                        {/* <ReactMarkdown 
                             remarkPlugins={[remarkBreaks]}
                             rehypePlugins={[rehypeRaw]}
                        >
                            {message.message.replace(/(\r\n|\r|\n)/g, "<br />")}
                        </ReactMarkdown> */}
                        <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                    <MessageAttachments 
                        attachments={message.attachments}
                        attachmentClick={attachmentClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
