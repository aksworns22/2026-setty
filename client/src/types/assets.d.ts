declare module '*.module.css' {
  const classNames: Readonly<Record<string, string>>;
  export default classNames;
}

declare module '*.css';

declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
