import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Logo from '../Logo';

const meta: Meta<typeof Logo> = {
    title: 'Shared UI/atoms/Logo',
    component: Logo,
    argTypes: {
        className: { control: 'text' },
        showText: { control: 'boolean' },
        theme: { control: 'select', options: ['light', 'dark'] },
    },
    args: {
        className: '',
        showText: true,
        theme: 'light',
    },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
    args: {
        showText: true,
        theme: 'light',
    },
};

export const DarkTheme: Story = {
    args: {
        ...Default.args,
        theme: 'dark',
    },
};

export const NoText: Story = {
    args: {
        ...Default.args,
        showText: false,
    },
};

export const CustomClass: Story = {
    args: {
        ...Default.args,
        className: 'bg-blue-500 p-4',
    },
};
