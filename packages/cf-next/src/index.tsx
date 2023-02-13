import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ConversationalComponentProps } from '@dbosoft/cf-react';

export type ConversationalFormProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    cf: ConversationalComponentProps
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
            <ConversationFormCSR {...cfProps} />
        </React.Suspense>}</div></>

};
