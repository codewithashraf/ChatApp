import { useEventBus } from "@/EventBus";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import UserAvatar from "./UserAvatar";
import { Link } from "@inertiajs/react";
import GroupAvatar from "./GroupAvatar";

const NewMessageNotification = () => {
    const [toasts, setToasts] = useState([]);

    const { on } = useEventBus();

    useEffect(() => {
        const offNotification = on(
            "newMessageNotification",
            ({ message, user, group_id }) => {
                const uuid = uuidv4();

                setToasts((oldToats) => [
                    ...oldToats,
                    { message, user, group_id, uuid },
                ]);

                setTimeout(() => {
                    setToasts(toasts.filter((toast) => toast.uuid !== uuid));
                }, 3000);
            }
        );

        return () => {
            offNotification();
        };
    }, [on]);

    return (
        <div className="toast toast-top toast-center min-w-[240px]">
            {toasts.map((toast) => {
                return (
                    <div
                        key={toast.uuid}
                        className="alert alert-success text-gray-400 rounded-md px-3 py-2"
                    >
                        <Link
                            href={toast.group_id ? 
                                route('chat.group', toast.group_id)
                                : route('chat.user', toast.user.id)
                            }
                            className="flex items-center gap-2"
                        >
                            {toast.group_id ? <GroupAvatar /> : <UserAvatar user={toast.user} />}
                            <span>{toast.message}</span>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
};

export default NewMessageNotification;
