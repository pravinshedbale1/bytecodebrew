var rand10 = function() {
    for (;;) {
        const x = (rand7() - 1) * 7 + rand7();
        if (x <= 40) return x % 10 + 1;
    }
};
