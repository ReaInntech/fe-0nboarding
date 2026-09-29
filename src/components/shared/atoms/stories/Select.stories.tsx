import type { Meta, StoryObj } from '@storybook/react';
import Select from '../Select';
import React, { useState } from 'react';

const meta = {
  title: 'SHARED UI/atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'icon', 'color', 'billing'],
    },
    activeColor: { control: 'color' },
    label: { control: 'text' }
  },
  args: {
    onChange: () => {},
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper to show dark theme and manage state
const InteractiveDecorator = (Story: any, context: any) => {
  const [val, setVal] = useState(context.args.value || context.args.options[0].value);

  return (
    <div className="bg-slate-900 p-8 rounded-xl w-[400px]">
      <Story args={{ ...context.args, value: val, onChange: setVal }} />
    </div>
  );
};

const defaultOptions = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    label: 'Category',
    options: defaultOptions,
    value: 'opt1',
    type: 'default',
  },
  decorators: [InteractiveDecorator],
};

const billingOptions = [
  { value: 'monthly', label: 'Monthly', icon: 'calendar_month' },
  { value: 'annual', label: 'Annual', icon: 'event_available' },
  { value: 'one_time', label: 'One-time Payment', icon: 'payments' },
];

export const BillingStyle: Story = {
  args: {
    label: 'Billing Model',
    options: billingOptions,
    value: 'monthly',
    type: 'billing',
    activeColor: '#1978e5'
  },
  decorators: [InteractiveDecorator],
};

const iconOptions = [
  { value: 'cloud', label: 'Cloud' },
  { value: 'database', label: 'Database' },
  { value: 'security', label: 'Security' },
];

export const IconSelector: Story = {
  args: {
    label: 'Service Icon',
    options: iconOptions,
    value: 'cloud',
    type: 'icon',
    activeColor: '#7c3aed'
  },
  decorators: [InteractiveDecorator],
};

const colorOptions = [
  { value: '#1978e5', label: 'Blue' },
  { value: '#7c3aed', label: 'Purple' },
  { value: '#059669', label: 'Emerald' },
  { value: '#dc2626', label: 'Red' },
];

export const ColorSelector: Story = {
  args: {
    label: 'Primary Theme Color',
    options: colorOptions,
    value: '#059669',
    type: 'color',
  },
  decorators: [InteractiveDecorator],
};
