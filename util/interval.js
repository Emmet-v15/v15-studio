module.exports = {
    instantInterval: (fn, delay, ...args) => {
        fn(...args);
        setInterval(fn, delay, ...args);
    },
    sleep: async (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },
};
