import { TestCaseConfig } from '../test-case-config';

const config: TestCaseConfig = {
	libraries: {
		inlinedLibraries: (libraryName: string) => libraryName === 'fake-package',
	},
};

export = config;
