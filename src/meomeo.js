var http = require("http");
var fs = require('fs');
var path = require('path');
var url = require('url');
var Multiparty = require('multiparty');
var axios = require("axios");
var cors = require("cors");
var {uploadImgToStorage} = require('./firebase.config');
var sharp = require('sharp');

http.createServer(async (request, response) => {
    let urlObj = url.parse(request.url, true)
    cors()(request, response, async () => {

        switch( "/" + urlObj.pathname.split('/')[1]) {
            case '/':
                let homePath = path.join(__dirname, "templates/home.html");
            
                fs.readFile(homePath, 'utf-8', (err, data) => {
                    if (err) {

                        response.writeHead(400, { 'Content-Type': 'text/plain' })

                        response.end("Trang Chủ")
                    }else {

                        response.writeHead(200, { 'Content-Type': 'text/html' })
                        response.end(data)
                    }
                })

                break
            case '/formui':
                let formPath = path.join(__dirname, "templates/form.html");
            
                fs.readFile(formPath, 'utf-8', (err, data) => {
                    if (err) {

                        response.writeHead(400, { 'Content-Type': 'text/plain' })

                        response.end("Load form failed")
                    }else {

                        response.writeHead(200, { 'Content-Type': 'text/html' })
                        response.end(data)
                    }
                })

                break
            case '/formjs':
                if (request.method == "GET") {
                    console.log("đã vào formjs", urlObj.query.username, urlObj.query.password)
                }

                if (request.method == "POST") {
                    const form = new Multiparty.Form();

                    form.parse(request, (err, fields, files) => {
                        if (err) {
                        // Xử lý lỗi
                        console.error(err);
                        response.statusCode = 400;
                        response.end('Lỗi xử lý dữ liệu');
                        return;
                        }
                        //console.log("fields", fields)
                        //console.log("files", files)
                        let userInfor = {
                            userName: fields.userName[0],
                            passWord: fields.passWord[0],
                        }

                        let uploadedFile = files.userAvatar[0];

  
 
                        let typeFile = uploadedFile.originalFilename.split('.')[uploadedFile.originalFilename.split('.').length - 1];

                        let fileName = Math.random() + Date.now() + "." + typeFile;

                        let fileNameBase = Math.random() + Date.now();

                        let targetPath = path.join(__dirname, `images/${ fileName}`);

                        fs.copyFile(uploadedFile.path, targetPath, (err) => {
                            if (err) {
                                console.error(err);
                                response.statusCode = 500;
                                response.end('Lỗi sao chép file');
                                return;
                            }
                            
                            fs.readFile(targetPath, async (err, data) => {
                                if (err) {
                                    response.end('Lỗi đọc file');
                                }

                                let result = await uploadImgToStorage(fileNameBase,data, "upload-nodejs", typeFile);
                                if (!result) {
                                    response.end('Lỗi đọc file');
                                }else {
                                    fs.unlink(targetPath, (err) => {
                                        if (err) {
                                            console.error(err);
                                            return;
                                        }
                                        
                                        console.log('File đã được xóa thành công.');
                                    });
                                    response.end(`Link file là: ${result}`);
                                }
                            })
                        });
                    });
                }
                break
            case '/images':
                let imagePath = path.join(__dirname, `${urlObj.pathname}`);

                fs.readFile(imagePath, (err, data) => {
                    if (err) {
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.end('File not found');
                    } else {
                    

                    response.writeHead(200, { 'Content-Type': `image/${urlObj.pathname.split('.')[urlObj.pathname.split('.').length - 1]}` });

                    response.end(data);
                    
                    }
                });
                
                break;
            case '/products':
                let posts = await axios.get("http://localhost:3000/posts");
                console.log("posts", posts.data)
                response.writeHead(200, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(
                    {
                        message: "Thành Công",
                        posts: posts.data
                    }
                ))
                break
            default: 
                response.writeHead(404, { 'Content-Type': 'text/plain' })
                response.end("Trang khong ton tai")
        }

        
    });
}).listen(2222)