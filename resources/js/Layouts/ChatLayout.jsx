import ConversationItem from "@/Components/App/ConversationItem";
import GroupModel from "@/Components/App/GroupModel";
import TextInput from "@/Components/TextInput";
import { useEventBus } from "@/EventBus";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const ChatLayout = ({ children }) => {
    const page = usePage();
    console.log()
    const authUser = page.props.auth.user;
    const { on, emit } = useEventBus();

    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedConversations;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversatons, setSortedConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [showGroupModal, setShowGroupModal] = useState(false);
    const isUserOnline = (userId) => onlineUsers[userId];

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    };

    const messageCreated = (message) => {
        setLocalConversations((oldConversations) => {
            return oldConversations.map((oldConversation) => {
                if (
                    message.receiver_id &&
                    oldConversation.is_user &&
                    (oldConversation.id == message.sender_id ||
                        oldConversation.id == message.receiver_id)
                ) {
                    oldConversation.last_message = message.message;
                    oldConversation.last_message_date = message.created_at;
                    return oldConversation;
                } else if (
                    message.group_id &&
                    oldConversation.is_group &&
                    oldConversation.id == message.group_id
                ) {
                    oldConversation.last_message = message.message;
                    oldConversation.last_message_date = message.created_at;
                    return oldConversation;
                }
                return oldConversation;
            });
        });
    };

    const messageDeleted = ({ message, prevMessage }) => {
        if (!prevMessage) return;

        messageCreated(prevMessage);
    };

    const updatedUser = ({ removedUsers, addedUsers, groupId, group }) => {
        
        if (removedUsers) {
            removedUsers.forEach((removedUserId) => {
                if (removedUserId == authUser.id) {
                    setLocalConversations((oldConversation) => {
                        return oldConversation.filter((conversation) => {
                            const shouldKeep = !(conversation.is_group && conversation.id == groupId);
                            return shouldKeep;
                        });
                    });
                
                if(page.url.split('/')[2] == groupId){
                    router.visit(route('dashboard'));
                }
                Echo.leave('group.updated.' + groupId)
                    emit("toast.show", `you are removed the "${group.name}" Group`);
                }
            });
        }
    };

    useEffect(() => {
        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);

        const offModalShow = on("GroupModel.show", (group) => {
            setShowGroupModal(true);
        });
        const offDeletedGroup = on("group.deleted", ({ id, name }) => {
            setLocalConversations((oldConversation) => {
                return oldConversation.filter(
                    (conversation) => conversation.id != id
                );
            });

            emit("toast.show", `Group ${name} was deleted`);

            if (
                !selectedConversations ||
                (selectedConversations.is_group &&
                    selectedConversations.id == id)
            ) {
                router.visit(route("dashboard"));
            }
        });

        console.log("on chala hai update users wala");
        const offUpdateUsers = on("update.users", updatedUser);

        return () => {
            console.log("off hogaya hai on listener");
            offCreated();
            offDeleted();
            offModalShow();
            offDeletedGroup();
            offUpdateUsers();
        };
    }, [on]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }
                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversations]);

    useEffect(() => {
        Echo.join("online")
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUsersObj };
                });
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                });
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });
            })
            .error((err) => {
                console.error("error", err);
            });

        return () => {
            Echo.leave("online");
        };
    }, []);

    return (
        <>
            <div className="flex flex-1 w-full overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[260px] md:w-[300px] bg-slate-800 ${
                        page.url === "/" ? "flex" : "hidden"
                    } sm:flex flex-col overflow-hidden ${
                        selectedConversations ? "-ml-[100%] sm:ml-0" : ""
                    } `}
                >
                    <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
                        My Conversations
                        <div
                            className="tooltip tooltip-left"
                            data-tip="Create new Group"
                        >
                            <button
                                onClick={(e) => setShowGroupModal(true)}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                <PencilSquareIcon className="w-6 h-6 inline-block ml-2" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <TextInput
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className="w-full bg-gray-900 border-gray-700"
                        />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {sortedConversatons &&
                            sortedConversatons.map((conversation) => (
                                <ConversationItem
                                    key={`${
                                        conversation.is_group
                                            ? "group_"
                                            : "user_"
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversations}
                                />
                            ))}
                    </div>
                </div>

                <div
                    className={`flex-1 ${
                        page.url !== "/" ? "flex" : "hidden"
                    } sm:flex flex-col overflow-hidden bg-slate-900`}
                >
                    {children}
                </div>
            </div>
            <GroupModel
                show={showGroupModal}
                onClose={() => setShowGroupModal(false)}
            />
        </>
    );
};

export default ChatLayout;
