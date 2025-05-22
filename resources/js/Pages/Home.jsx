import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageItem from "@/Components/App/MessageItem";
import MessageInput from "@/Components/App/MessageInput";
import { usePage } from "@inertiajs/react";
import { useEventBus } from "@/EventBus";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import AttachmentPreviewModel from "@/Components/App/AttachmentPreviewModel";
import MessagesRender from "@/Components/App/MessagesRender";

function Home({ message, selectedConversation, last_message_read_id = null }) {
    const [localMessage, setLocalMessage] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [noMoreMessagesNotification, setNoMoreMessagesNotification] =
        useState(false);
    const [showUnreadLabel, setShowUnreadLabel] = useState(true);

    const user = usePage().props.auth.user;

    const { on, newMessageIds } = useEventBus();

    const messagesCtrRef = useRef(null);
    const unreadMessageRef = useRef(null);
    const loadMoreIntersect = useRef(null);

    const onAttachmentClick = (attachments, index) => {
        console.log(attachments, index);
        setPreviewAttachment({
            attachments,
            index,
        });
        setShowAttachmentPreview(true);
    };

    useEffect(() => {
        if (unreadMessageRef.current && showUnreadLabel) {
            unreadMessageRef.current.scrollIntoView({
                behavior: "smooth", // ya "smooth"
                block: "center", // "start", "center", or "end"
            });
        }
    }, [localMessage]);

    const messageCreated = (message) => {
        console.log("messageCreated function ", newMessageIds);
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            // changes for group chatting read unread functionality
            if (message.group_id) {
                axios
                    .post(route("update.read_message_id"), {
                        group_id: message.group_id,
                        user_id: user.id,
                        last_message_id: message.id,
                    })
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err) => console.log(err));
                setShowUnreadLabel(false);
                setLocalMessage((prev) => [...prev, message]);
            }
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            // users chatting kai case mai
            if (user.id == message.receiver_id) {
                console.log(
                    "call howa hai unread update function axios kai through congrats"
                );
                axios
                    .post(route("update.is_read"), {
                        conversation_id: [
                            message.sender_id,
                            message.receiver_id,
                        ]
                            .sort()
                            .join("_"),
                        receiver_id: message.receiver_id,
                    })
                    .then((res) => {
                        message.is_read = 1;
                        setLocalMessage((prev) => [...prev, message]);
                    })
                    .catch((err) => console.log(err));
                return;
            }

            setShowUnreadLabel(false);
            setLocalMessage((prev) => [...prev, message]);
        }

        setScrollFromBottom(
            messagesCtrRef.current.scrollHeight -
                messagesCtrRef.current.clientHeight -
                messagesCtrRef.current.scrollTop
        );
    };

    const messageDeleted = ({ message }) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setLocalMessage((prevMessage) => {
                return prevMessage.filter((msg) => msg.id !== message.id);
            });
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            setLocalMessage((prevMessage) => {
                return prevMessage.filter((msg) => msg.id !== message.id);
            });
        }
    };

    useEffect(() => {
        if (!messagesCtrRef.current) return;
        setTimeout(() => {
            messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight;
        }, 10);

        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);

        return () => {
            offCreated();
            offDeleted();
        };
    }, [selectedConversation]);

    useEffect(() => {
        
        console.log("last_message_read_id", last_message_read_id);
        if (!message || message.data.length === 0) {
            setLocalMessage(message ? [...message.data].reverse() : []);
            return;
        }

        // users chatting ka case hai
        if (
            user.id == message.data[0].receiver_id &&
            !Boolean(message.data[0].is_read)
        ) {
            axios
                .post(route("update.is_read"), {
                    conversation_id: [
                        message.data[0].sender_id,
                        message.data[0].receiver_id,
                    ]
                        .sort()
                        .join("_"),
                    receiver_id: message.data[0].receiver_id,
                })
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
        }

        // group chatting ka case hai
        if (
            message.data[0].id > last_message_read_id &&
            message.data[0].group_id
        ) {
            axios
                .post(route("update.read_message_id"), {
                    group_id: message.data[0].group_id,
                    user_id: user.id,
                    last_message_id: message.data[0].id,
                })
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
        }
        setShowUnreadLabel(true);
        setLocalMessage(message ? [...message.data].reverse() : []);
    }, [message]);

    const loadMoreMessages = useCallback(() => {
        const scrollHeight = messagesCtrRef.current.scrollHeight;
        const clientHeight = messagesCtrRef.current.clientHeight;
        const scrollTop = messagesCtrRef.current.scrollTop;

        //first we find a very first message at the top of the container
        const firstMessage = localMessage[0];
        if (localMessage.length > 20) {
            setIsLoading(true);
        }

        axios
            .get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    setScrollFromBottom(
                        scrollHeight - scrollTop - clientHeight
                    );
                    return;
                }

                const temScrollBottomHeight =
                    scrollHeight - scrollTop - clientHeight;

                setScrollFromBottom(temScrollBottomHeight);

                setTimeout(() => {
                    setLocalMessage((prevMessages) => {
                        return [...data.data.reverse(), ...prevMessages];
                    });
                    setIsLoading(false);
                }, 100);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [localMessage, noMoreMessages]);

    useEffect(() => {
        if (messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight -
                messagesCtrRef.current.offsetHeight -
                scrollFromBottom;

            setScrollFromBottom(0);
        }

        if (noMoreMessages) {
            console.log("no more messages true hai ");
            setIsLoading(false);
            setScrollFromBottom(0);
            setNoMoreMessagesNotification(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadMoreMessages();
                    }
                });
            },
            {
                rootMargin: "0px 0px 250px 0px",
            }
        );

        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }

        return () => {
            observer.disconnect();
        };
    }, [localMessage, noMoreMessages]);

    return (
        <>
            {!message && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-5xl py-5 px-16 text-slate-200">
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
                </div>
            )}

            {message && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />

                    {/* Main scrollable area hai jahan all chats show hongi  */}

                    <div
                        id="messageCtrRef"
                        ref={messagesCtrRef}
                        className="flex overflow-y-auto py-5 px-5 mb-4 h-screen"
                    >
                        {/* Messages */}

                        {localMessage.length === 0 && (
                            <div className="flex justify-center items-center h-full w-full">
                                <div className="text-lg text-slate-200">
                                    No Chats are avaiable
                                </div>
                            </div>
                        )}

                        {localMessage.length !== 0 && (
                            <div className="flex flex-1 flex-col">
                                {noMoreMessagesNotification &&
                                    localMessage.length > 20 && (
                                        <h1 className="text-md text-center capitalize text-gray-50">
                                            no more messages
                                        </h1>
                                    )}
                                {isLoading && (
                                    <div className="text-gray-400 text-center">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </div>
                                )}
                                <div ref={loadMoreIntersect}></div>
                                <MessagesRender
                                    localMessage={localMessage}
                                    last_message_read_id={last_message_read_id}
                                    showUnreadLabel={showUnreadLabel}
                                    user={user}
                                    onAttachmentClick={onAttachmentClick}
                                    unreadMessageRef={unreadMessageRef}
                                />
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
            )}

            {previewAttachment.attachments && (
                <AttachmentPreviewModel
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.index}
                    show={showAttachmentPreview}
                    onClose={() => setShowAttachmentPreview(false)}
                />
            )}
        </>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout>
            <ChatLayout>{page}</ChatLayout>
        </AuthenticatedLayout>
    );
};

export default Home;
