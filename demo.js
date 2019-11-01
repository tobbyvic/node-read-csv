const http = require("http"); // http模块
const https = require("https"); // https模块
const fs = require("fs"); // fs模块

const parse = require("csv-parse/lib/sync"); // 引入csv-parse.  a parser converting CSV text input into arrays or objects.
const iconv = require("iconv-lite"); // 处理 GBK 编码

// 读取本地GBK编码文件，并将转换成json数据
// csv -> Buffer(GBK) -> Buffer(utf8) -> parse为json
function readLocalFile(pathname) {
  const buf = iconv.decode(fs.readFileSync(pathname), "gbk"); // bin为 Buffer数据; readFileSync为同步方法

  const records = parse(buf, {
    columns: true,
    skip_empty_lines: true
  }); // 生成json数据
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

// 测试结果

console.log("读取本地文件:");
console.log(readLocalFile("./2019_10_21.csv"));

console.log("读取远程文件:")
const url =
  "https://tobbyvic-home.oss-cn-shanghai.aliyuncs.com/2019_10_21.csv?Expires=1572622156&OSSAccessKeyId=TMP.hguqFPGqzZA7dfNu6XyQLHJuo1m998iD3KuuNA8JvAVGg4pMZ6Vs2fAdo37nvBYiZ6EuFJcPh6qZc4FNXuXtDzfpfwMgoRfYUP519iQyZ1Lu2VBe6vFE64hrkMy7JK.tmp&Signature=c%2BHC1OLYCM4t2GjcqHCcrErff80%3D";
readHTTPFile(url)
  .then(res => {
    console.log(res);
  })
  .catch(e => {
    console.log(e.message);
  });


// const stream = fs.createReadStream('./2019_10_21.csv', { encoding: 'binary' });
// let data = '';
// stream.on('error', err => {
//   console.error('读取行错误');
//   console.error(err);
// });
// stream.on('data', chunk => {
//   data += chunk;
// });
// stream.on('end', () => {
//   const buf = Buffer.from(data, 'binary');
//   const str = iconv.decode(buf, 'GBK'); // 得到正常的字符串，没有乱码
//   console.log(str);
// });
// console.log(records);
