'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TextField from '../TextField';

const meta: Meta<typeof TextField> = {
    title: 'Shared UI/atoms/TextField',
    component: TextField,
    tags: ['autodocs'],
    argTypes: {
        type: { control: 'text' },
        label: { control: 'text' },
        placeholder: { control: 'text' },
        error: { control: 'text' },
    },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
    args: {
        label: 'Email Address',
        id: 'email',
        type: 'email',
        placeholder: 'you@example.com',
    },
};

export const Password: Story = {
    render: () => {
        const [show, setShow] = useState(false);
        return (
            <TextField
                label="Password"
                id="password"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                action={
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        onClick={() => setShow(!show)}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {show ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                }
            />
        );
    },
};

export const WithError: Story = {
    args: {
        label: 'Username',
        id: 'user',
        value: 'invalid_user',
        error: 'This username is already taken.',
    },
};
