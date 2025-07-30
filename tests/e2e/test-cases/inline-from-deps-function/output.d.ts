import { Derived } from 'fake-types-lib-2';

export interface Interface {
}
export type Type = number | string;
declare module ModuleWithoutQuotes {
	export type A = string;
}
declare class SomeClass {
	private x;
	public constructor();
}
export type TestType = Interface | Type;
export declare class MyClass extends SomeClass {
}
export type ReExportedTypes = Derived;
export type T = ModuleWithoutQuotes.A;

export {};
