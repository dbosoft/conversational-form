import React, { useEffect, useRef } from 'react';

import style from './ConversationForm.module.css';

import { ConversationFormProps } from './ConversationForm';
import ConversationalForm from '@/cf/ConversationalForm';

export default function ConversationFormCSR(props: ConversationFormProps) {
    const cfRef = useRef<any>(null);;
    const ref = useRef<any>(null);


    function submitCallback() {
        const formDataSerialized = cfRef.current.getFormData(true);
        props?.onSubmit(formDataSerialized);
    }

    useEffect(function mount() {

        cfRef.current = ConversationalForm.startTheConversation({
            options: {
                robotImage: `/images/chatbot.svg`,
                submitCallback: submitCallback,
                preventAutoFocus: true,
                loadExternalStyleSheet: false
            },
            tags: props.formFields,
        });


        ref.current?.appendChild(cfRef.current.el);

        return function unMount() {
            cfRef?.current?.remove();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={style.myCF}>
            <div ref={ref} />

        </div>
    );
}