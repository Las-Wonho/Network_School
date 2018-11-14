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
    console.log('uploading %s -> %s', file.name, file.path);
    fs.rename(file.path, "uploads\\"+file.name, (err) => { })
    await ctx.redirect('/clear');
})

app.use(router.routes());

if (!module.parent) app.listen(3000);