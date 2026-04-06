import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from '../Button';
import Icon from '../Icon';

const meta: Meta<typeof Button> = {
    title: 'Shared UI/atoms/Button',
    component: Button,
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
        children: 'Save Changes',
        variant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        children: 'Cancel',
        variant: 'secondary',
    },
};

export const Outline: Story = {
    args: {
        children: 'Download',
        variant: 'outline',
    },
};

export const Ghost: Story = {
    args: {
        children: 'Dismiss',
        variant: 'ghost',
    },
};

export const Link: Story = {
    args: {
        children: 'Read more',
        variant: 'link',
    },
};

export const WithIcon: Story = {
    args: {
        children: (
            <>
                <Icon name="add" className="text-sm" /> Add New Item
            </>
        ),
        variant: 'primary',
    },
};
