import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import LoginForm from '../LoginForm';

const meta: Meta<typeof LoginForm> = {
    title: 'Shared UI/molecules/LoginForm',
    component: LoginForm,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6f8', padding: '2rem' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const SignIn: Story = {
    args: {
        onEmailAuth: async (email: string, password: string) => {
            console.log('Email auth:', email, password);
        },
        onGoogleLogin: async () => {
            console.log('Google login clicked');
        },
    },
};
