import type { Meta, StoryObj } from "@storybook/react";
import { GradientSlider } from "../gradient";

type Story = StoryObj<typeof GradientSlider>;

const meta: Meta<typeof GradientSlider> = {
  component: GradientSlider,
  title: "Gradient Slider",
};

export default meta;

export const LinearGradient: Story = {
  args: {
    width: 320,
  },
};
