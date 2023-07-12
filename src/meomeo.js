var http = require("http");
var fs = require('fs');
var path = require('path');
var url = require('url');
var Multiparty = require('multiparty');

http.createServer((request, response) => {
    let urlObj = url.parse(request.url, true)

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
                    console.log("fields", fields)
                    console.log("files", files)
                    let userInfor = {
                        userName: fields.userName[0],
                        passWord: fields.passWord[0],
                    }

                    let uploadedFile = files.userAvatar[0];
                    
                    let typeFile = uploadedFile.originalFilename.split('.')[uploadedFile.originalFilename.split('.').length - 1];

                    let targetPath = path.join(__dirname, `images/${ Math.random() + Date.now() + "." + typeFile}`);

                    fs.copyFile(uploadedFile.path, targetPath, (err) => {
                        if (err) {
                            console.error(err);
                            response.statusCode = 500;
                            response.end('Lỗi sao chép file');
                            return;
                        }
                
                        console.log('File đã được lưu:', targetPath);

                        // Tiếp tục xử lý các thông tin khác hoặc trả về phản hồi thành công
                        response.end("Da nhan thong tin")
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
        default: 
            response.writeHead(404, { 'Content-Type': 'text/plain' })
            response.end("Trang khong ton tai")
    }
}).listen(2222)