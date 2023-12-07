export const NUMBER_REGEX = /^-?\d*\.?\d*$/;

export const IS_PROD = !import.meta.env.DEV;
export const apiDomain = `https://testnet.cashmere.exchange/` //!IS_PROD ? 'localhost:3003' : location.host;
// export const apiAddress = `//${apiDomain}`;
export const apiAddress = `https://testnet.cashmere.exchange/`;

