
const fs = require('fs');
const os = require('os');
const path = require('path');

const render = require('./render');
const router = require('koa-router')();
const koaBody = require('koa-body');
const Koa = require('koa');

const app = module.exports = new Koa();



app.keys = ['im a newer secret', 'i like turtle'];

app.use(koaBody({
    formidable: { uploadDir: './uploads' },
    multipart: true,
    urlencoded: true
}));

app.use(render);

router.get('/', list);
async function list(ctx) {
    await ctx.render('main.html');
};


router.post('/login', async (ctx) => {

    if (ctx.request.body.id == "las") {

        console.log(ctx.request.body);
        ctx.cookies.set('logined', 'true', { signed: true });

        await ctx.redirect('/');
    }

    else {
        await ctx.redirect('/l');
    }

});

router.post('/upload', async (ctx) => {

    const file = ctx.request.files.file;
    console.log('uploading %s -> %s', file.name, file.path);
    fs.rename(file.path,file.name,(err)=>{})
    await ctx.redirect('/');
})

app.use(router.routes());

if (!module.parent) app.listen(3000);