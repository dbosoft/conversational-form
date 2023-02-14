import { useEffect, useRef } from 'react';
import { ConversationalForm } from '@dbosoft/conversational-form';

import { RefObject } from "react";
import { IUserInterfaceOptions } from '@dbosoft/conversational-form';


export type FormlessProps = {
    formTags: any,
}

export type FormProps = {
    formRef: RefObject<HTMLFormElement>
}

export type ConversationalComponentProps = (FormlessProps | FormProps) & {
    userInterfaceOptions?: IUserInterfaceOptions;
    onSubmit?: (values: any) => void;
}

export type ConversationalComponentWithContextProps = ConversationalComponentProps & {
    context: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
}

export type ConversationalComponentWithContextRefProps = ConversationalComponentProps & {
    contextRef?: RefObject<HTMLElement>
}

export function ConversationalComponent({
    onSubmit,
    ...props }
    : ConversationalComponentWithContextProps | ConversationalComponentWithContextRefProps) {

    const cfRef = useRef<ConversationalForm | null>(null);;
    const localContextRef = useRef<HTMLDivElement>(null);
    function submitCallback() {
        const formDataSerialized = cfRef.current?.getFormData(true);

        if (onSubmit)
            onSubmit(formDataSerialized);
    }

    const contextProps = hasContext(props) ? { ...props.context } : {}

    useEffect(function mount() {
        cfRef.current = ConversationalForm.startTheConversation(
            isFormless(props) ?
                {
                    options: {
                        context: hasContextRef(props) ? props.contextRef : localContextRef.current!
                    },
                    tags: props.formTags
                }
                :
                {
                    formEl: (props as FormProps).formRef?.current!,
                    context: hasContextRef(props) ? props.contextRef : localContextRef.current!
                }
        );

        return function unMount() {
            cfRef?.current?.remove();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={localContextRef} {...contextProps} />
}

function hasContextRef(props: ConversationalComponentWithContextRefProps | ConversationalComponentWithContextProps)
    : props is ConversationalComponentWithContextRefProps {
    return (props as ConversationalComponentWithContextRefProps)?.contextRef !== undefined;
}

function hasContext(props: ConversationalComponentWithContextRefProps | ConversationalComponentWithContextProps)
    : props is ConversationalComponentWithContextProps {
    return (props as ConversationalComponentWithContextProps)?.context !== undefined;
}

function isFormless(props: FormlessProps | FormProps)
    : props is FormlessProps & (ConversationalComponentWithContextProps | ConversationalComponentWithContextRefProps) {

    return (props as FormlessProps)?.formTags !== undefined;
}