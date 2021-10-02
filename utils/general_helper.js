const {createCanvas} = require("canvas");
const {IMG_SIZE} = require("./constants");
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
    }
}