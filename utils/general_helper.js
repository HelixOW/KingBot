const {createCanvas} = require("canvas");
module.exports = {
    getRandomArbitrary: function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    },

    getRandomInt: function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return ((Math.random() * (max - min))|0) + min;
    },

    chunk: function chunk(arr, chunkSize) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    },

    resize_image: function (image, w, h) {
        let canvas = createCanvas(w, h)
        let ctx = canvas.getContext("2d")

        ctx.save()
        ctx.scale(w / image.width, h / image.height)
        ctx.drawImage(image, 0, 0)
        ctx.restore()

        return canvas
    },

    removeItem: (arr, value, amount = 1) => {
        let i = 0;
        let amountCount = 0
        while (i < arr.length && amountCount < amount) {
            if (arr[i] === value)
                arr.splice(i, 1);
            else
                ++i;
        }
        return arr;
    }
}