export interface EditorFont {
  family: string;
  styles: EditorFontStyle[];
}

export interface EditorFontStyle {
  name: string;
  weight: string;
  style: string;
  url: string;
}

export const fonts: EditorFont[] = [
  {
    family: "Inter",
    styles: [
      {
        name: "Inter Regular",
        weight: "400",
        style: "normal",
        url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ1rib2Bg-4.woff2",
      },
      {
        name: "Inter Bold 700",
        weight: "700",
        style: "normal",
        url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZ1rib2Bg-4.woff2",
      },
    ],
  },
  {
    family: "Poppins",
    styles: [
      {
        name: "Poppins Regular",
        weight: "regular",
        style: "normal",
        url: "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJXUc1NECPY.woff2",
      },
      {
        name: "Poppins 700",
        weight: "700",
        style: "normal",
        url: "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7V15vFP-KUEg.woff2",
      },
    ],
  },
  {
    family: "Montserrat",
    styles: [
      {
        name: "Montserrat Bold 700",
        weight: "700",
        style: "normal",
        url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w7Y3tcoqK5.woff2",
      },

      {
        name: "Montserrat Regular",
        weight: "regular",
        style: "normal",
        url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew7Y3tcoqK5.woff2",
      },
    ],
  },
  {
    family: "Roboto",
    styles: [
      {
        name: "Roboto Bold 700",
        weight: "700",
        style: "normal",
        url: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvBh05IsDqlA.woff2",
      },

      {
        name: "Roboto Regular",
        weight: "regular",
        style: "normal",
        url: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me4GZLCzYlKw.woff2",
      },
    ],
  },
  {
    family: "Raleway",
    styles: [
      {
        name: "Raleway Bold 700",
        weight: "700",
        style: "normal",
        url: "https://fonts.gstatic.com/s/raleway/v29/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVs9pYCKNLA3JC9c.woff2",
      },

      {
        name: "Raleway Regular",
        weight: "regular",
        style: "normal",
        url: "https://fonts.gstatic.com/s/raleway/v29/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaooCKNLA3JC9c.woff2",
      },
    ],
  },
  {
    family: "Playfair Display",
    styles: [
      {
        name: "Playfair Display Bold 700",
        weight: "700",
        style: "normal",
        url: "https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDVZNLo_U2r.woff2",
      },

      {
        name: "Playfair Display Regular",
        weight: "regular",
        style: "normal",
        url: "https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDVZNLo_U2r.woff2",
      },
    ],
  },
];
