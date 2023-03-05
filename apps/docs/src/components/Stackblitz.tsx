import React, { useEffect } from 'react';
import sdk, { EmbedOptions } from '@stackblitz/sdk';

export type StackblitzProps = EmbedOptions &
{
    projectId: string
}

export default function EmbeddedStackblitz({ projectId, ...embedOptions }: StackblitzProps) {

    useEffect(() => {
        sdk.embedProjectId(
            projectId,
            projectId, {
            clickToLoad: true, ...embedOptions
        });

    }, [projectId]);

    return <div id={projectId}></div>

};
