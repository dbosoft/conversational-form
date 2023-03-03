import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CFProps } from '@dbosoft/cf-react';

export type ConversationalFormProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
{
    cf: CFProps
}

export default function ConversationalForm({ cf: cfProps, ...contextProps }: ConversationalFormProps) {
    const [isSSR, setIsSSR] = useState(true);
    const contextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsSSR(false);
    }, []);

    const ConversationFormCSR = dynamic(import('./ConversationalFormCSR'), { ssr: false });

    return <><div ref={contextRef} {...contextProps}>{!isSSR &&
        <React.Suspense fallback={<div />}>
            <ConversationFormCSR contextRef={contextRef} {...cfProps} />
        </React.Suspense>}</div></>

};
