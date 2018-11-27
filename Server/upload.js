const fs = require('fs');
const fse = require('fs-extra');

const render = require('./render');
const router = require('koa-router')();
const koaBody = require('koa-body');
const Koa = require('koa');
const KoaStatic = require('koa-static');

var mysql = require('mysql');

const upload_form = "<div class='info' style='position: absolute; top: 50%;left: 50%; transform: translateY(-50%) translateX(-50%);''><form class='was-validated' action='/upload' method='post' enctype='multipart/form-data'><div><label for='form-2-first-name'>Name</label><input type='text' name='name' class='form-control width200'></div><div class='row-md-120'><label for='form-2-first-name'>Documentation</label><textarea name='document' cols='40' rows='8' class='form-control width200'></textarea></div><div class='row-md-120'><label for='form-2-first-name'>Files</label><div class='custom-file mb-3'><input type='file' class='custom-file-input' onchange='selected(\"file_\")' name='file' multiple><label class='custom-file-label' name='file_' for='customFile'>Default custom file input</label></div></div> <div class='row-md-120'><label for='form-2-first-name'>Photo</label><div class='custom-file mb-3'><input type='file' onchange='selected(\"photo_\")' class='custom-file-input' name='back' multiple><label class='custom-file-label' name='photo_' for='customFile'>Default custom file input</label></div></div><div class='row-md-120'><input type='submit' class='btn btn-success' value='Change'></div></form></div>";
const change_form = "<form class='was-validated' action='/change' method='post' enctype='multipart/form-data'><div class='col-md-12'><div class='row'><div class='row-md-120'><label for='form-2-first-name'>Name</label><input type='text' name='name' class='form-control width200'></div></div><div class='row'><div class='row-md-120'><label for='form-2-first-name'>Documentation</label><textarea name='document' cols='40' rows='8' class='form-control width200'>/<textarea></div></div><div class='row'><div class='row-md-120'><label for='form-2-first-name'>Files</label><div class='custom-file mb-3'><input type='file' class='custom-file-input' name='file' multiple><label class='custom-file-label' for='customFile'>Default custom file input</label></div></div></div><div class='row'><div class='row-md-120'><label for='form-2-first-name'>Photo</label><div class='custom-file mb-3'><input type='file' class='custom-file-input' name='back' multiple><label class='custom-file-label' for='customFile'>Default custom file input</label></div></div></div><div class='row'><div class='row-md-120'><input type='submit' class='btn btn-success' value='Change'></div></div></div></form>";

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
    const dev_name = ctx.cookies.get('name');
    console.log('name : ' + dev_name);
    const rootURL = '45.76.222.210/' + req.name;

    const SQL_ParameterValues = parseQuery([req.name, dev_name, req.document, rootURL + "/back.png", rootURL + '/file.zip']);

    connection.query("insert into item(name, developer, interduce, image, file) values ?", [SQL_ParameterValues], async (err) => {
        if (err) {
            console.log(err);
            return false;
        }
        console.log('good');
        fs.mkdirSync(path + req.name, { recursive: true });
        fs.copyFileSync(file.path, path + req.name + '/file.zip');
        fs.copyFileSync(back.path, path + req.name + '/back.png');
        await ctx.redirect('/clear');
    });
    console.log('end');
    await ctx.redirect('/error');
})

router.post('/change', async (ctx) => {

    const file = ctx.request.files.file;
    const back = ctx.request.files.back;
    const path = "../Items/";
    const req = ctx.request.body;
    const dev_name = ctx.cookies.get('name');
    console.log('name : ' + dev_name);
    const rootURL = '45.76.222.210/' + req.name;

    const SQL_ParameterValues = parseQuery([req.name, dev_name, req.document, rootURL + "/back.png", rootURL + '/file.zip']);

    connection.query("insert into item(name, developer, interduce, image, file) values ?", [SQL_ParameterValues], async (err) => {
        if (err) {
            console.log(err);
            return false;
        }
        console.log('good');
        fs.mkdirSync(path + req.name, { recursive: true });
        fs.copyFileSync(file.path, path + req.name + '/file.zip');
        fs.copyFileSync(back.path, path + req.name + '/back.png');
        await ctx.redirect('/clear');
    });
    console.log('end');
    await ctx.redirect('/error');
})

function wrapping(name) {
    return (data) => name + "='" + data + "'"
}
router.get('/Login', async (ctx, next) => {
    const req = ctx.request.query;

    await Promise.resolve(req)
        .then((request) => {
            const wrapped_id = wrapping('id')(request.id);
            const wrapped_pass = wrapping('pass')(request.password);
            return "select * from user where " + wrapped_id + " and " + wrapped_pass;
        })
        .then(async (sql) => {
            await new Promise((chain, r) => {
                connection.query(sql, (err, row) => {
                    if (err) {
                        chain(2);
                        return;
                    }
                    else if (row.length == 0) {
                        chain(2);
                        return;
                    }
                    else {
                        chain(row[0].name);
                        ctx.cookies.set('name', row[0].name);
                        return;
                    }
                });
            })
                .then((data) => {
                    console.log(data);
                    ctx.body = data;
                })
        });

})

router.get('/delete', (ctx) => {

    const req = ctx.request.query;
    const path = "../Items/";
    fse.removeSync(path + req.name);
    connection.query("delete from item where name = '" + req.name + "'", (err) => {
        if (err) {
            console.log(err);
        }
    });
    ctx.body = true;
})

router.get('/ff', (ctx) => {
    ctx.body = upload_form;
})
router.get('/list', async(ctx) => {
    const dev_name = "'"+ctx.cookies.get('name')+"'";
    console.log(dev_name);
    await new Promise((chain,r)=>{
        connection.query('select * from item where developer='+dev_name,(err,row)=>{
            if (err) {
                console.log(err);
                
                chain(2);
                return;
            }
            else if (row.length == 0) {
                chain(2);
                return;
            }
            const html = '<div class="card" style="width: 20rem; transform:translateY(190%);">\
            <img class="card-img-top" src="'+ row[0].image + '" alt="Card image cap">\
            <div class="card-body">\
              <h4 class="card-title">'+row[0].name+'</h4>\
              <p class="card-text">'+row[0].interduce+'</p>\
              <a href="#" class="btn btn-primary">Want Change?</a>\
            </div>\
          </div>';
          chain("<div class='row'>"+html+html+html+"</div>"+"<div class='row'>");
        })    
    }).
    then(data=>{
        ctx.body = data;
    })
})
app.use(router.routes());


if (!module.parent) app.listen(3000);
