import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/hooks';

const ExternPage = () => {
    const appStore = useStores('appStore');

    return (
        <div style={{ height: "calc(100vh - 40px)" }}>
            <iframe src={appStore.curExtraMenu?.url ?? ""} width="100%" height="100%" />
        </div>
    );
};

export default observer(ExternPage);