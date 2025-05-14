import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";



const GroupNotification = () => {

    const [toast, setToast] = useState([]);

    const {on} = useEventBus();

    useEffect(() => {
        console.log('on chala hai group notification ka')
        const offGroupNotification = on('toast.show', (message) => {
            const uuid = uuidv4();

            setToast((oldToast) => [...oldToast, {message, uuid}]);
            
            setTimeout(() => {
                setToast(toast.filter((t) => t.uuid !== uuid));
            }, 3000)
        })


        return () => {
            offGroupNotification();
        }

    }, [on])
 
    return (
        <div className=" toast toast-top toast-right min-w-[240px]">
            {toast.map((t) => {
                return (
                    <div
                        key={t.uuid}
                        className="alert alert-success text-gray-800 rounded-lg px-3 py-2"
                    >
                        <span>{t.message}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default GroupNotification;
