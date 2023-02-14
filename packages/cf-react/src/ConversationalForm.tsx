import { useEffect, useRef } from 'react';
import { ConversationalForm as CF } from '@dbosoft/conversational-form';
import { RefObject } from "react";
import { CreateOptions } from '@dbosoft/conversational-form';


export type FormlessProps = {
    formTags: any[],
}

export type FormProps = {
    formRef: RefObject<HTMLFormElement>
}

export type CFProps = (FormlessProps | FormProps) & CreateOptions;

export type CFWithContextProps = CFProps & {
    context: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
}

export type CFWithContextRefProps = CFProps & {
    contextRef: RefObject<HTMLElement>
}

export function ConversationalForm({
    ...props }
    : CFWithContextProps | CFWithContextRefProps) {

    const cfRef = useRef<CF | null>(null);;
    const localContextRef = useRef<HTMLDivElement>(null);

    const contextProps = hasContext(props) ? { ...props.context } : {}

    useEffect(function mount() {

        const context = hasContextRef(props) ? props.contextRef.current : localContextRef.current;
        const form = isFormless(props) ? CF.generateForm(props.formTags) : props.formRef.current;

        if (context == null || form == null) return;

        cfRef.current = new CF({
            ...props,
            context,
            form
        });
        cfRef.current.start();

        return function unMount() {
            cfRef?.current?.remove();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return hasContextRef(props) ? <></> : <div ref={localContextRef} {...contextProps} />
}

function hasContextRef(props: CFWithContextRefProps | CFWithContextProps)
    : props is CFWithContextRefProps {
    return (props as CFWithContextRefProps)?.contextRef !== undefined;
}

function hasContext(props: CFWithContextRefProps | CFWithContextProps)
    : props is CFWithContextProps {
    return (props as CFWithContextProps)?.context !== undefined;
}

function isFormless(props: FormlessProps | FormProps)
    : props is FormlessProps {

    return (props as FormlessProps)?.formTags !== undefined;
}