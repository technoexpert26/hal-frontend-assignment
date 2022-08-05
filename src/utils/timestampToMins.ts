export const timestampToMins = (timestamp: number) => {
	const difference = new Date().valueOf() - new Date(timestamp).valueOf();
	return new Date(difference).getMinutes();
};
