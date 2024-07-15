import { fabric } from "fabric";
import { createInstance } from "@/lib/utils";

export interface Filter {
  name: string;
  filter: (intensity?:number)=> fabric.IBaseFilter[];
}

export interface Adjustment {
  name: string;
  filter: (intensity?:number)=> fabric.IBaseFilter;
}

export const adjustments:Array<Adjustment> = [
  {
    name: "Brightness",
    filter:(intensity = 0) => {
      const brightness = intensity / 100;
      return createInstance(fabric.Image.filters.Brightness, {
        brightness
      })
    }
  },
  {
    name: "Contrast",
    filter:(intensity = 0) => {
      const contrast = intensity / 100;
      return createInstance(fabric.Image.filters.Contrast, {
        contrast
      })
    }
  },
  {
    name: "Saturation",
    filter:(intensity = 0) => {
      const saturation = intensity / 100;
      return createInstance(fabric.Image.filters.Saturation, {
        saturation,
      })
    }
  },
  {
    name: "Gamma",
    filter:(intensity = 0) => {
      const gamma = (100 + intensity) / 100;
      return createInstance(fabric.Image.filters.Gamma, {
        gamma: [gamma, gamma, gamma],
      })
    }
  }
]

export const filters: Array<Filter> = [
  {
    name: "Warm",
    filter: (intensity = 50) => {
      const red = 1 + (intensity / 100) * 0.5; 
      const green = 1 + (intensity / 100) * 0.2;

      return [
        createInstance(fabric.Image.filters.ColorMatrix, {  
          matrix: [
            red, 0, 0, 0, 0,   
            0, green, 0, 0, 0, 
            0, 0, 1, 0, 0,  
            0, 0, 0, 1, 0     
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
            1 , 0, 0, 0, 0,   
            0, green, 0, 0, 0, 
            0, 0, blue, 0, 0,  
            0, 0, 0, 1, 0     
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
            saturation, 0, 0, 0, 0,  
            0, saturation, 0, 0, 0,  
            0, 0, saturation, 0, 0,  
            0, 0, 0, 1, 0     
          ] 
        }),
        createInstance(fabric.Image.filters.Contrast, {
          contrast,
        })
      ]
    },
  },
  {
    name: "Soft",
    filter: (intensity = 50) => {
      const brightness = (intensity / 100) * 0.2; 
      const contrast = 0.1 + (intensity / 100) * 0.2; 
      const blur = (intensity / 100) * 0.1; 
      return [  
        createInstance(fabric.Image.filters.Brightness, {
          brightness,
        }),
        createInstance(fabric.Image.filters.Contrast, {
          contrast,
        }),
        createInstance(fabric.Image.filters.Blur, {
          blur,
        })
      ]
    }
  },
  {
    name: "Vintage",
    filter: (intensity = 50) => {
      const sepia = intensity / 100; 
      const brightness = -0.1 + (intensity / 100) * 0.2; 
      const contrast = 0.1 + (intensity / 100) * 0.3; 
      return [  
        createInstance(fabric.Image.filters.Sepia, {
          sepia,
        }),
        createInstance(fabric.Image.filters.Brightness, {
          brightness,
        }),
        createInstance(fabric.Image.filters.Contrast, {
          contrast,
        }),
      ]
    }
  },
  {
    name: "Color Pop",
    filter: (intensity = 50) => {
      const saturation = 1 + (intensity / 100) * 0.7; 
      const brightness = -0.1 + (intensity / 100) * 0.2; 
      const contrast = 0.1 + (intensity / 100) * 0.3; 
      return [  
        createInstance(fabric.Image.filters.Saturation, {
          saturation,
        }),
        createInstance(fabric.Image.filters.Brightness, {
          brightness,
        }),
        createInstance(fabric.Image.filters.Contrast, {
          contrast,
        }),
      ]
    }
  },
  {
    name: "Monochrome",
    filter: (intensity = 50) => {
      const contrast = 0.1 + (intensity / 100) * 0.3;
      return [  
        createInstance(fabric.Image.filters.Grayscale, {
          mode: "average"
        }),
        createInstance(fabric.Image.filters.Contrast, {
          contrast
        }),
      ]
    }
  },
];

