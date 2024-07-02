import { fabric } from "fabric";
import { createInstance } from "@/lib/utils";

export interface Filter {
  name: string;
  filter: (intensity?:number)=> fabric.IBaseFilter[];
}

export const filters: Array<Filter> = [
  {
    name: "Warm",
    filter: (intensity = 50) => {
      const red = 1 + (intensity / 100) * 0.5; 
      const green = 1 + (intensity / 100) * 0.2;

      return [
        createInstance(fabric.Image.filters.ColorMatrix, {  
          matrix: [
            red, 0, 0, 0, 0,   // Red channel remains the same
            0, green, 0, 0, 0, // Increase green channel
            0, 0, 1, 0, 0,  // Increase blue channel
            0, 0, 0, 1, 0     // Alpha channel remains the same
          ]
        }),
      ]
    },
  },
  {
    name: "Cool",
    filter: (intensity = 50) => {
      const blue = 1 + (intensity / 100) * 0.5; 
      const green = 1 + (intensity / 100) * 0.2;

      return [
        createInstance(fabric.Image.filters.ColorMatrix, {  
          matrix: [
            1 , 0, 0, 0, 0,   // Red channel remains the same
            0, green, 0, 0, 0, // Increase green channel
            0, 0, blue, 0, 0,  // Increase blue channel
            0, 0, 0, 1, 0     // Alpha channel remains the same
          ]
        }),
      ]
    },
  },
  {
    name: "Vivid",
    filter: (intensity = 50) => {
      const saturation = 1 + (intensity / 100) * 0.3; 
      const contrast = 0.1 + (intensity / 100) * 0.3;
      return [
        createInstance(fabric.Image.filters.ColorMatrix, {  
          matrix: [
            saturation, 0, 0, 0, 0,  // Increase red channel
            0, saturation, 0, 0, 0,  // Increase green channel
            0, 0, saturation, 0, 0,  // Increase blue channel
            0, 0, 0, 1, 0     // Alpha channel remains the same
          ] 
        }),
        createInstance(fabric.Image.filters.Contrast, {
          contrast,
        })
      ]
    },
  },
];
