declare module "jquery" {
  const jquery: any;
  export = jquery;
}

declare module "jquery-mousewheel" {
  const mousewheel: any;
  export = mousewheel;
}

declare module "spectrum-colorpicker" {
  const spectrum: any;
  export = spectrum;
}

declare module "luckysheet" {
  const luckysheet: any;
  export default luckysheet;
  export { luckysheet };
}

declare module "@ckeditor/ckeditor5-build-classic" {
  const ClassicEditor: any;
  export default ClassicEditor;
}
