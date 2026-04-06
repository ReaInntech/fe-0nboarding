import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Divider from '../Divider';

const meta: Meta<typeof Divider> = {
    title: 'Shared UI/atoms/Divider',
    component: Divider,
    tags: ['autodocs'],
    argTypes: {
        children: { control: 'text' },
    },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
    args: {
        children: '',
    },
};

export const WithText: Story = {
    args: {
        children: 'Or continue with',
    },
};
