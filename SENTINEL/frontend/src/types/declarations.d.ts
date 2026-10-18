// Global JSX and React typings for SENTINEL frontend
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface Element {
    [key: string]: any;
  }
}

declare namespace React {
  type ReactNode = any;
  type FC<P = any> = any;
  type ReactElement = any;
  type ComponentType<P = any> = any;
  type CSSProperties = any;
  type MouseEvent<T = any> = any;
  type ChangeEvent<T = any> = any;
  type FormEvent<T = any> = any;
  type KeyboardEvent<T = any> = any;
  function useState<T>(init: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void];
  function useState<T = any>(init?: any): [T, (val: any) => void];
  function useEffect(effect: any, deps?: any[]): void;
  function useMemo<T = any>(fn: () => T, deps?: any[]): T;
  function useCallback<T = any>(fn: T, deps?: any[]): T;
  function useRef<T = any>(val?: T): { current: T };
  const Fragment: any;
}

declare var process: {
  env: {
    [key: string]: string | undefined;
  };
};

declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prevState: T) => T)) => void];
  export function useState<T = any>(initialState?: any): [T, (value: any) => void];
  export function useEffect(effect: any, deps?: any[]): void;
  export function useMemo<T = any>(factory: () => T, deps?: any[]): T;
  export function useCallback<T = any>(callback: T, deps?: any[]): T;
  export function useRef<T = any>(initialValue?: any): { current: any };
  export const Fragment: any;
  export type ReactNode = any;
  export type FC<P = any> = any;
  export type ReactElement = any;
  export type ComponentType<P = any> = any;
  export type CSSProperties = any;
  export type MouseEvent<T = any> = any;
  export type ChangeEvent<T = any> = any;
  export type FormEvent<T = any> = any;
  export type KeyboardEvent<T = any> = any;
  const React: any;
  export default React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
  export const Fragment: any;
}

declare module 'react-dom';
declare module 'next/link';
declare module 'next/navigation';
declare module 'lucide-react';
declare module 'reactflow' {
  export type Node<T = any> = {
    id: string;
    position: { x: number; y: number };
    data: T;
    [key: string]: any;
  };
  export type Edge<T = any> = {
    id: string;
    source: string;
    target: string;
    [key: string]: any;
  };
  export const ReactFlow: any;
  export const Background: any;
  export const Controls: any;
  export const MiniMap: any;
  export function useNodesState(initialNodes: any[]): [any[], (changes: any) => void, (nodes: any) => void];
  export function useEdgesState(initialEdges: any[]): [any[], (changes: any) => void, (edges: any) => void];
  export const MarkerType: any;
  export default ReactFlow;
}
declare module 'recharts';
declare module 'framer-motion';
declare module '*.css';
