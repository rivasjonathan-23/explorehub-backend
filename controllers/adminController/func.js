const formatArray = (arr) => {

    // let result = [];
    // Array.from(arr).forEach(el => {
    //     let newObject = {
    //         serviceGroupName: el._doc.serviceGroupName,
    //         data: []
    //     }
    //     let _data = el._doc.service.data
    //     if (Array.isArray(_data)) {
    //         _data.forEach((item) => {
    //             let { data } = item // hope this will work :)
    //             if (typeof data == 'object' && data.hasOwnProperty('defaultName')) { // only include the object with defaultName property okok
    //                 //    if(data.defaultName === "quantity")
    //                 return newObject.data.push({ defaultName: data.defaultName, text: data.text })

    //             }
    //         })
    //         result.push(newObject)
    //     }
    // })
    return result;
}

const formatComponentArray = (arr) => {
    if (!Array.isArray(arr)) {
        return
    }
    let item = {
            name: '',
            image: '',
            location: '',
            type: '',
            category: '',
            description: '',
        }
        // let result = [];
    arr.forEach(({ _doc }) => {

        if (_doc.type == 'photo') {
            return item.image = _doc.data[0].url;
        }
        let { defaultName, text } = _doc.data

        if (defaultName == 'pageName') {
            return item.name = text;
        }
        if (defaultName == 'description') {
            return item.description = text;
        }

        if (['barangay', 'municipality', 'province'].includes(defaultName)) {
            item.location += text;
            if (defaultName != 'province') {
                item.location += ','
            }
            return item.location
        }
        if (defaultName == 'category') {
            return item.category = text
        }
        if (defaultName == 'type') {
            return item.type = text
        }
    });
    return item;
}


const formatPendingArray = (arr) => {
    // let result = [];
    // arr.arr._doc.data = arr._doc.data.shift();
    // if (Array.isArray(arr)) {
    //     console.log("DATA:::", arr)
    //     result = arr.map(service => {
    //         service.data = service.data.map(item => {
    //             let newObject = { data: [], item: { photo: "", labelledText: "", text: "" } }
    //             console.log("Item: ", item);

    //             if (item.data.defaultName) {
    //                 newObject['serviceGroupName'] = item.data.text;
    //             } else if (item.type == "item") {

    //                 item.data.forEach(_item => {
    //                     if (_item.type == 'photo') {
    //                         newObject.data.push(_item.data[0])
    //                     }
    //                     if (typeof _item.data == 'object' && _item.data.hasOwnProperty('defaultName') || _item.type == "labelled-text") {
    //                         newObject.data.push({ label: _item.data.label, labelledText: _item.data.text })
    //                     }

    //                     if (_item.type == 'text' && !_item.data.hasOwnProperty('defaultName')) {
    //                         newObject.data.push({ text: _item.data.text })
    //                     }
    //                 })
    //             }
    //             return newObject
    //         })
    //         return service;
    //     })
    //     console.log(result);
    //     return result;
    // }
}
module.exports = { formatArray, formatComponentArray, formatPendingArray }