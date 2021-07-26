declare module '*.css' {
  const exports: { [exportName: string]: string };
  export = exports;
}

declare var IS_DEV: boolean;
declare var APP_TITLE: string;
declare var APP_DESCRIPTION: string;
declare var API_BASE: string;
declare var GMAPS_KEY: string;
