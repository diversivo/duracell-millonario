
const serve = require('koa-static');
const Koa = require('koa');
const app = new Koa();

// response
app.use(serve(__dirname+'/src'));

app.listen(3000);
console.log('listening on port 3000');