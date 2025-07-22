/// <reference types="expo/types" />
/// <reference types="react" />
/// <reference types="react-native" />

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

// Global environment variables
declare const __DEV__: boolean;

declare const process: {
  env: {
    NODE_ENV: 'development' | 'production';
    [key: string]: string | undefined;
  };
};
