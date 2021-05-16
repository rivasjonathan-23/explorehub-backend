const util = require('util')
const gc = require('../config')
const bucket = gc.bucket('explorehub_photos') // should be your bucket name

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

module.exports.saveImageToCloud = (file) => new Promise((resolve, reject) => {
    const { originalname, buffer, mimetype } = file
    let filetype = "";
    if (mimetype === "image/png") {
        filetype = "png";
    }
    else if (mimetype === "image/jpeg") {
        filetype = "jpg";
    } else {
        reject("invalid_file_type")
    }
    let name = originalname.replace(/ /g, "_")
    name =  "ExploreHub_" + Date.now()+name.replace(".", "_") +"."+filetype
    const blob = bucket.file(name)
    const blobStream = blob.createWriteStream({
        resumable: false
    })
    blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`

        resolve(publicUrl)
    })
        .on('error', (error) => {
            console.log(error)
            reject(`Unable to upload image, something went wrong`)
        })
        .end(buffer)
})