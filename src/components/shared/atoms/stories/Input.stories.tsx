import type { Meta, StoryObj } from '@storybook/react';
import Input from '../Input';
import React from 'react';

const meta = {
  title: 'SHARED UI/atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    prefix: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' }
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper to show dark theme properly
const darkThemeDecorator = (Story: React.FC) => (
  <div className="bg-slate-900 p-8 rounded-xl w-[400px]">
    <Story />
  </div>
);

export const Default: Story = {
  args: {
    label: 'Product Name',
    placeholder: 'e.g. Premium Cloud API',
  },
  decorators: [darkThemeDecorator],
};

export const AmountInput: Story = {
  args: {
    label: 'Price',
    prefix: '$',
    placeholder: '0.00',
    type: 'number',
  },
  decorators: [darkThemeDecorator],
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@domain.com',
    error: 'Invalid email address provided',
    value: 'invalid-email',
  },
  decorators: [darkThemeDecorator],
};

export const Disabled: Story = {
  args: {
    label: 'Internal ID',
    value: 'USR_98234857',
    disabled: true,
  },
  decorators: [darkThemeDecorator],
};
