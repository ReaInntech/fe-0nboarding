import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Badge from '../Badge';

const meta: Meta<typeof Badge> = {
    title: 'Shared UI/atoms/Badge',
    component: Badge,
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'success', 'warning', 'primary'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    args: {
        children: 'Pending',
        variant: 'default',
    },
};

export const Success: Story = {
    args: {
        children: 'Active',
        variant: 'success',
    },
};

export const Warning: Story = {
    args: {
        children: 'Action Required',
        variant: 'warning',
    },
};

export const Primary: Story = {
    args: {
        children: 'New Feature',
        variant: 'primary',
    },
};
