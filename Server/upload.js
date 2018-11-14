const fs = require('fs');
const os = require('os');
const path = require('path');

const render = require('./render');
const router = require('koa-router')();
const koaBody = require('koa-body');
const Koa = require('koa');
const KoaStatic = require('koa-static');

const app = module.exports = new Koa();

app.use(koaBody({
    formidable: { uploadDir: './uploads' },
    multipart: true,
    urlencoded: true
}));
app.use(KoaStatic('../Client'));
app.use(render);

router.get('/', list);
async function list(ctx, next) {
    await ctx.render('upload.html');
};
router.get('/clear', list_);
async function list_(ctx, next) {
    await ctx.render('clear.html');
};
router.post('/upload', async (ctx) => {

    const file = ctx.request.files.file;
    const back = ctx.request.files.back;
    const path = "C:/Bitnami/wampstack-7.1.20-1/apache2/htdocs/GSMarket/item/";
    const req = ctx.request.body;
    
    fs.mkdirSync(path+req.name, { recursive: true });
    fs.appendFileSync(path+'../item_list.txt', "/"+req.name);
    fs.writeFileSync(path+req.name+'/developer.txt', req.dev_name, 'utf8');
    fs.writeFileSync(path+req.name+'/interduce.txt', req.document, 'utf8');
    fs.copyFileSync(file.path, path+req.name+'/file.zip');
    fs.copyFileSync(back.path, path+req.name+'/back.png');

    await ctx.redirect('/clear');
})

app.use(router.routes());

if (!module.parent) app.listen(3000);