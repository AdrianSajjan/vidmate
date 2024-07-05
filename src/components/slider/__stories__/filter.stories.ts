import type { Meta, StoryObj } from "@storybook/react";
import { FilterSlider } from "../filter";

type Story = StoryObj<typeof FilterSlider>;

const meta: Meta<typeof FilterSlider> = {
  component: FilterSlider,
  title: "Filter Slider",
};

export default meta;

export const UncontrolledSlider: Story = {
  args: {},
};
