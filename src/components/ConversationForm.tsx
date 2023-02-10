import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';


export type ConversationFormProps = {
    formFields: any;
    onSubmit: (values: any) => void;
}

export default function ConversationForm(props: ConversationFormProps) {
    const [isSSR, setIsSSR] = useState(true);

    useEffect(() => {
        setIsSSR(false);
    }, []);

    const ConversationFormCSR = dynamic(import(`@/components/ConversationFormCSR`), { ssr: false });

    return <>{!isSSR &&
        <React.Suspense fallback={<div />}>
            <ConversationFormCSR {...props} />
        </React.Suspense>}</>

};
