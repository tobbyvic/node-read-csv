const http = require("http"); // http模块
const https = require("https"); // https模块
const fs = require("fs"); // fs模块

const parse = require("csv-parse/lib/sync"); // 引入csv-parse.  a parser converting CSV text input into arrays or objects.
const iconv = require("iconv-lite"); // 处理 GBK 编码

// 监控本地文件
function watchLocalFile(pathname) {
    // 如果本地文件已存在，先读取一次
    fs.exists(pathname, function(exists) {
        exists && readLocalFile(pathname)
    })
    fs.watchFile(pathname,function(curr,prev){ 
        if(Date.parse(prev.ctime) == 0){ 
          console.log("文件被创建"); 
          readLocalFile(pathname);
        }else if(Date.parse(curr.ctime) == 0){ 
          console.log("文件被删除"); 
          fs.unwatchFile(pathname)
        }else if(Date.parse(prev.mtime) != Date.parse(curr.mtime)){ 
          console.log("文件被修改"); 
          readLocalFile(pathname);
        } 
      }); 
}

// 读取本地GBK编码文件，并将转换成json数据
// csv -> Buffer(GBK) -> Buffer(utf8) -> parse为json
function readLocalFile(pathname) {
  const buf = iconv.decode(fs.readFileSync(pathname), "gbk"); // bin为 Buffer数据; readFileSync为同步方法

  const records = parse(buf, {
    columns: true,
    skip_empty_lines: true
  }); // 生成json数据

  console.log('目前的文件数据为:')
  console.log(records);
  return records;
}

// 读取HTTP文件，并将转换成json数据
function readHTTPFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, function(response) {
      response.setEncoding("binary"); //二进制binary
      let Data = "";
      response
        .on("data", function(data) {
          //加载到内存
          Data += data;
        })
        .on("end", function() {
          //加载完
          const buf = iconv.decode(Buffer.from(Data, "binary"), "gbk"); // Data为binary数据，将binary数据转为Buffer
          const records = parse(buf, {
            columns: true,
            skip_empty_lines: true
          }); // 最后转化成的json数据
          resolve(records);
        });
    });
  });
}

// 测试读取本地文件并监控

console.log("读取本地文件:");
watchLocalFile("./2019_10_21.csv");

// 测试读取远程文件

// console.log("读取远程文件:")
// const url =
//   "https://tobbyvic-home.oss-cn-shanghai.aliyuncs.com/2019_10_21.csv?Expires=1572622156&OSSAccessKeyId=TMP.hguqFPGqzZA7dfNu6XyQLHJuo1m998iD3KuuNA8JvAVGg4pMZ6Vs2fAdo37nvBYiZ6EuFJcPh6qZc4FNXuXtDzfpfwMgoRfYUP519iQyZ1Lu2VBe6vFE64hrkMy7JK.tmp&Signature=c%2BHC1OLYCM4t2GjcqHCcrErff80%3D";
// readHTTPFile(url)
//   .then(res => {
//     console.log(res);
//   })
//   .catch(e => {
//     console.log(e.message);
//   });
