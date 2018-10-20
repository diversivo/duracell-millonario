
const serve = require('koa-static');
const Koa = require('koa');
const app = new Koa();

// response
app.use(serve(__dirname + '/src'));

app.listen(process.env.PORT || 3000);
console.log(`listening on port ${process.env.PORT || 3000}`);