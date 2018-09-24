const fs = require('fs');
const os = require('os');
const path = require('path');

const render = require('./render');
const router = require('koa-router')();
const koaBody = require('koa-body');
const Koa = require('koa');

const app = module.exports = new Koa();

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/las.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});


db.run('CREATE TABLE las(name text, id text, pass text)', (err) => {
    if (err) {
        console.error(err.message);
    }
});

app.keys = ['im a newer secret', 'i like turtle'];

app.use(koaBody({
    formidable: { uploadDir: './uploads' },
    multipart: true,
    urlencoded: true
}));

app.use(render);

router.get('/', list, list_);
async function list(ctx, next) {
    await next();
    await ctx.render('main.html');
};
async function list_(ctx, next) {
    console.log("Main page detect");
};


router.post('/login', login_);
async function login(ctx, next) {
    next();
};
async function login_(ctx) {
    var sql = "select name from las where id = '"+ctx.request.body.id+"' and pass = '"+ctx.request.body.pswd+"'";
    var name = '';
    db.get(sql, [], (er,row)=>{
        if(er){
            ctx.body = 'false';
            return console.log('login'+er.message);
        }
        if(row){
            name = row.name;
            ctx.body = 'true&' + name;
            console.log('Name is '+ name);
        }else{
            ctx.body = 'false';
            return console.log('Not exise');
        }
    })
};


router.post('/sign_up', async (ctx) => {
    console.log(ctx.request.body);
    ctx.body = 'true';
    db.run(`INSERT INTO las(name, pass, id) VALUES(?,?,?)`, [ctx.request.body.name,ctx.request.body.pswd, ctx.request.body.id], function (err) {
        if (err) {
            ctx.body = 'false';
            return console.log(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        
    });
});

router.post('/upload', async (ctx) => {

    const file = ctx.request.files.file;
    console.log('uploading %s -> %s', file.name, file.path);
    fs.rename(file.path, file.path + file.name, (err) => { })
    await ctx.redirect('/');
})

app.use(router.routes());

if (!module.parent) app.listen(3000);