import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from '../ProgressBar';

const meta: Meta<typeof ProgressBar> = {
    title: 'Shared UI/atoms/ProgressBar',
    component: ProgressBar,
    argTypes: {
        value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
        max: { control: 'number' },
    },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
    args: {
        value: 65,
        max: 100,
    },
};

export const Full: Story = {
    args: {
        value: 100,
    },
};

export const Empty: Story = {
    args: {
        value: 0,
    },
};
