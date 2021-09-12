module.exports = {
    IMG_SIZE: 150,
    H_IMG_SIZE: 75,
    LINK_SIZE: 50,
    H_LINK_SIZE: 25,
    remove_item: function (array, value) {
        let index = array.indexOf(value)
        if(index > -1)
            array.splice(index, 1)
        return array
    },
    remove_items: function (array, value) {
        let i = 0
        while (i < array.length) {
            if(array[i] === value)
                array.splice(i, 1)
            else
                ++i
        }
        return array
    }
}