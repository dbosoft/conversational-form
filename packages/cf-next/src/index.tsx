import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CFProps } from '@dbosoft/cf-react';
import { ConversationalForm as CF } from '@dbosoft/conversational-form';

export type ConversationalFormProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
{
    cf: CFProps,
    onSubmit?: (values: any) => void;
}

export default function ConversationalForm({ onSubmit, cf: cfProps, ...contextProps }: ConversationalFormProps) {
    const [isSSR, setIsSSR] = useState(true);
    const contextRef = useRef<HTMLDivElement>(null);
    const cfRef = useRef<CF>(null);

    useEffect(() => {
        setIsSSR(false);
    }, []);

    function submitCallback() {
        if (onSubmit) {
            const formDataSerialized = cfRef.current?.getFormData(true);
            onSubmit(formDataSerialized);
        }
    }

    const ConversationFormCSR = dynamic(import('./ConversationalFormCSR'), { ssr: false });

    return <><div ref={contextRef} {...contextProps}>{!isSSR &&
        <React.Suspense fallback={<div />}>
            <ConversationFormCSR
                contextRef={contextRef}
                cfRef={cfRef}
                onSubmit={submitCallback}
                {...cfProps} />
        </React.Suspense>}</div></>

};
