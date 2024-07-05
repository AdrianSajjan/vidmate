declare module "fabric" {
  namespace fabric {
    class CoverVideo extends Image {
      type: "coverVideo";
      disableCrop: boolean;
      cropWidth: number;
      cropHeight: number;
    }
    class CoverImage extends Image {
      type: "coverImage";
      disableCrop: boolean;
      cropWidth: number;
      cropHeight: number;
    }
  }
}
