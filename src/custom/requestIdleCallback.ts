export interface IdleObject {
	didTimeout: boolean,
	timeRemaining: () => number,
}
// eslint-disable-next-line
export const requestIdleCallback = (cb:((obj:IdleObject) => void)) => {
    const start = Date.now();
    return setTimeout(() => {
		cb({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
        })
    })
}


