export const numberFormatter = (number: String) => {
	return Math.abs(Number(number)) >= 1.0e9
		? // Nine Zeroes for Billions
		  (Math.abs(Number(number)) / 1.0e9).toFixed(2) + "b"
		: // Six Zeroes for Millions
		Math.abs(Number(number)) >= 1.0e6
		? (Math.abs(Number(number)) / 1.0e6).toFixed(2) + "m"
		: // Three Zeroes for Thousands
		Math.abs(Number(number)) >= 1.0e3
		? (Math.abs(Number(number)) / 1.0e3).toFixed(2) + "k"
		: Math.abs(Number(number)).toFixed(2);
};
