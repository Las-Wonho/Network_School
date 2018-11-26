const fs = require('fs');
const os = require('os');
const path = require('path');

const render = require('./render');
const router = require('koa-router')();
const koaBody = require('koa-body');
const Koa = require('koa');
const KoaStatic = require('koa-static');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: '45.76.222.210',
    user: 'root',
    password: 'des123',
    port: '9099',
    database: 'gsmarket',
    insecureAuth: true
});

const app = module.exports = new Koa();

app.use(koaBody({
    formidable: { uploadDir: './uploads' },
    multipart: true,
    urlencoded: true
}));
app.use(KoaStatic('../Items'));
app.use(render);

router.get('/', list);
async function list(ctx, next) {
    await ctx.render('upload.html');
};
router.get('/clear', list_);
async function list_(ctx, next) {
    await ctx.render('clear.html');
};
function parseQuery(data) {
    return [
        [data[0], data[1], data[2], data[3], data[4]]
    ];
};
router.post('/upload', async (ctx) => {

    const file = ctx.request.files.file;
    const back = ctx.request.files.back;
    const path = "../Items/";
    const req = ctx.request.body;
    const rootURL = '45.76.222.210/'+req.name;

    const SQL_ParameterValues = parseQuery([req.name, req.dev_name,req.document,rootURL+"/back.png",rootURL+'/file.zip']);

    connection.query("insert into item(name, developer, interduce, image, file) values ?", [SQL_ParameterValues], async (err) => {
        if(err)
        {
            console.log(err);
            return false;
        }
        console.log('good');
        fs.mkdirSync(path+req.name, { recursive: true });
        fs.copyFileSync(file.path, path+req.name+'/file.zip');
        fs.copyFileSync(back.path, path+req.name+'/back.png');
        await ctx.redirect('/clear');
    });
    console.log('end');
    await ctx.redirect('/error');
})

router.get('/delete',(ctx)=>{
    const req = ctx.request.query;
    console.log(req);
    connection.query("delete from item where name = "+req.name,(err)=>{
        if(err){
            console.log(err);
        }
    });
})

app.use(router.routes());

if (!module.parent) app.listen(3000);