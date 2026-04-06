import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Avatar from '../Avatar';

const meta: Meta<typeof Avatar> = {
    title: 'Shared UI/atoms/Avatar',
    component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
    args: {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC05pbB6Ev6MAeYBIxxfPedLyR6lWfJJAP8GcArN3gtk_EgNu-xZDH3lvLsi6ZYwG17DoZEaKEBZ0075z9qmXwB34xh9t83eNX4GZ6VutH8EX5KGnwoQKEbNUjPbaQHvG9C4_aDBzMl54aS5cCuNXkoOCf5HkSCuj1zkXu5XIGe7wpKDLbvoTitCxrltvslcuMVcCNEWC4y9xNSu93W2pT7_WjCe8I1UW8bqu0DCj_stgWTvb6eEQtt-PUB9ilgZ7B3T8mOBZFAZg8',
        alt: 'User profile',
        sizeClasses: 'size-12',
    },
};

export const Large: Story = {
    args: {
        ...Default.args,
        sizeClasses: 'size-24',
    },
};
