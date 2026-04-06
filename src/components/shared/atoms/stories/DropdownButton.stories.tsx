import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DropdownButton from '../DropdownButton';

const meta: Meta<typeof DropdownButton> = {
    title: 'Shared UI/atoms/DropdownButton',
    component: DropdownButton,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof DropdownButton>;

export const Default: Story = {
    render: () => (
        <DropdownButton
            options={[
                { label: 'Posponer', icon: 'schedule', onClick: () => alert('Posponer') },
                { label: 'Cancelar', icon: 'cancel', onClick: () => alert('Cancelar') },
                { label: 'Ceder', icon: '', onClick: () => alert('Ceder') },
            ]}
        >
            Acciones
        </DropdownButton>
    ),
};

export const WithDivider: Story = {
    render: () => (
        <DropdownButton
            variant="primary"
            options={[
                { label: 'Edit', icon: 'edit' },
                { label: 'Duplicate', icon: 'content_copy' },
                { divider: true },
                { label: 'Archive', icon: 'archive' },
                { label: 'Delete', icon: 'delete', danger: true },
            ]}
        >
            Options
        </DropdownButton>
    ),
};

export const NoIcons: Story = {
    render: () => (
        <DropdownButton
            variant="outline"
            options={[
                { label: 'Posponer' },
                { label: 'Reprogramar' },
                { divider: true },
                { label: 'Cancelar', danger: true },
            ]}
        >
            Más opciones
        </DropdownButton>
    ),
};

export const AlignRight: Story = {
    render: () => (
        <div className="flex justify-end" style={{ width: 400 }}>
            <DropdownButton
                dropdownAlign="right"
                options={[
                    { label: 'Download PDF', icon: 'download' },
                    { label: 'Print', icon: 'print' },
                    { label: 'Share', icon: 'share' },
                ]}
            >
                Export
            </DropdownButton>
        </div>
    ),
};
