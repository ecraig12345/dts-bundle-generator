const nodeModulesFolderName = 'node_modules/';
const libraryNameRegex = /node_modules\/((?:(?=@)[^/]+\/[^/]+|[^/]+))\//;

export function getLibraryName(fileName: string): string | null {
	const lastNodeModulesIndex = fileName.lastIndexOf(nodeModulesFolderName);
	if (lastNodeModulesIndex === -1) {
		return null;
	}

	return libraryNameRegex.exec(fileName.slice(lastNodeModulesIndex))?.[1] || null;
}

export function getTypesLibraryName(path: string): string | null {
	const libraryName = getLibraryName(path);
	if (!libraryName) {
		return null;
	}

	const typesFolderPrefix = '@types/';
	return libraryName.startsWith(typesFolderPrefix) ? libraryName.slice(typesFolderPrefix.length) : null;
}
