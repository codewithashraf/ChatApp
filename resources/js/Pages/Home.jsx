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
import AppLayout from "@/Layouts/AppLayout";
import AttachmentPreviewModel from "@/Components/App/AttachmentPreviewModel";

function Home({ message, selectedConversation }) {
    const [localMessage, setLocalMessage] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});

    const { on } = useEventBus();

    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);


    const onAttachmentClick = (attachments, index) => {
        console.log(attachments, index)
        setPreviewAttachment({
            attachments, 
            index,
        });
        setShowAttachmentPreview(true);
    }

    console.log(previewAttachment)

    const messageCreated = (message) => {
        console.log("messageCreated function ", message);
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setLocalMessage((prev) => [...prev, message]);
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            setLocalMessage((prev) => [...prev, message]);
        }
    };

    useEffect(() => {
        if (!messagesCtrRef.current) return;
        setTimeout(() => {
            messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight;
        }, 10);

        const offCreated = on("message.created", messageCreated);

        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessage(message ? message.data.reverse() : []);
    }, [message]);

    const loadMoreMessages = useCallback(() => {
        //first we find a very first message at the top of the container
        const firstMessage = localMessage[0];

        axios
            .get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }

                const scrollHeight = messagesCtrRef.current.scrollHeight;
                const clientHeight = messagesCtrRef.current.clientHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const temScrollBottomHeight =
                    scrollHeight - scrollTop - clientHeight;

                setScrollFromBottom(temScrollBottomHeight);

                setLocalMessage((prevMessages) => {
                    return [...data.data.reverse(), ...prevMessages];
                });


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
        }

        if (noMoreMessages) {
            console.log("no more messages true hai ");
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                //   if (noMoreMessages) {
                //     observer.disconnect();
                //     return;
                //   }

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
                        id='messageCtrRef'
                        ref={messagesCtrRef}
                        className="flex overflow-y-auto py-5 px-5 mb-4"
                    >
                        {/* Messages */}

                        {localMessage.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">
                                    No messages found
                                </div>
                            </div>
                        )}

                        {localMessage.length !== 0 && (
                            <div className="flex flex-1 flex-col">
                                <div ref={loadMoreIntersect}></div>
                                {localMessage.map((msg) => (
                                    <MessageItem key={msg.id} message={msg} 
                                        attachmentClick={onAttachmentClick}
                                    />
                                ))}
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
