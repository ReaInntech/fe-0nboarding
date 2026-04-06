import React from 'react';
import SupportLinks from '../SupportLinks';

export default {
    title: 'Client/Components/Organisms/Dashboard/SupportLinks',
    component: SupportLinks,
    parameters: {
        layout: 'fullscreen',
    },
};

export const Default = {
    decorators: [
        (Story: any) => (
            <div className="bg-[#f5f6f8] dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 font-sans min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    <Story />
                </div>
            </div>
        ),
    ],
};
