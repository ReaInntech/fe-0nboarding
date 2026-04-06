import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Icon from '../Icon';

const meta: Meta<typeof Icon> = {
    title: 'Shared UI/atoms/Icon',
    component: Icon,
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Standard: Story = {
    args: {
        name: 'star',
        className: 'text-2xl text-amber-500',
    },
};

export const Large: Story = {
    args: {
        name: 'cloud_done',
        className: 'text-6xl text-[#1978e5]',
    },
};
