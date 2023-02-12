import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ConversationalFormProps } from 'cf-react';

export default function ConversationalForm(props: ConversationalFormProps) {
    const [isSSR, setIsSSR] = useState(true);

    useEffect(() => {
        setIsSSR(false);
    }, []);

    const ConversationFormCSR = dynamic(import('./ConversationalFormCSR'), { ssr: false });

    return <>{!isSSR &&
        <React.Suspense fallback={<div />}>
            <ConversationFormCSR {...props} />
        </React.Suspense>}</>

};
