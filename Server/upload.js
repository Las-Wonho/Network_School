const fs = require('fs');
const fse = require('fs-extra');

const render = require('./render');
const router = require('koa-router')();
const koaBody = require('koa-body');
const Koa = require('koa');
const KoaStatic = require('koa-static');

var mysql = require('mysql');

const upload_form = "<form class='was-validated' action='/upload' method='post' enctype='multipart/form-data'><div><label for='form-2-first-name'>Name</label><input type='text' name='name' class='form-control width200'></div><div class='row-md-120'><label for='form-2-first-name'>Documentation</label><textarea name='document' cols='40' rows='8' class='form-control width200'></textarea></div><div class='row-md-120'><label for='form-2-first-name'>Files</label><div class='custom-file mb-3'><input type='file' class='custom-file-input' onchange='selected(\"file_\")' name='file' multiple><label class='custom-file-label' name='file_' for='customFile'>Default custom file input</label></div></div> <div class='row-md-120'><label for='form-2-first-name'>Photo</label><div class='custom-file mb-3'><input type='file' onchange='selected(\"photo_\")' class='custom-file-input' name='back' multiple><label class='custom-file-label' name='photo_' for='customFile'>Default custom file input</label></div></div><div class='row-md-120'><input type='submit' class='btn btn-success' value='Change'></div></form>";
const change_form = "<form class='was-validated' action='/change' method='post' enctype='multipart/form-data'><div><label for='form-2-first-name'>Name</label><input type='text' name='name' class='form-control width200'></div><div class='row-md-120'><label for='form-2-first-name'>Documentation</label><textarea name='document' cols='40' rows='8' class='form-control width200'></textarea></div><div class='row-md-120'><label for='form-2-first-name'>Files</label><div class='custom-file mb-3'><input type='file' class='custom-file-input' onchange='selected(\"file_\")' name='file' multiple><label class='custom-file-label' name='file_' for='customFile'>Default custom file input</label></div></div> <div class='row-md-120'><label for='form-2-first-name'>Photo</label><div class='custom-file mb-3'><input type='file' onchange='selected(\"photo_\")' class='custom-file-input' name='back' multiple><label class='custom-file-label' name='photo_' for='customFile'>Default custom file input</label></div></div><div class='row-md-120'><input type='submit' class='btn btn-success' value='Change'></div></form>";

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
    await new Promise((c, r) => {
        connection.query("insert into item(name, developer, interduce, image, file) values ?", [SQL_ParameterValues], async (err) => {
            if (err) {
                console.log(err);
                c('/error');
            }
            console.log('good');
            fs.mkdirSync(path + req.name, { recursive: true });
            fs.copyFileSync(file.path, path + req.name + '/file.zip');
            fs.copyFileSync(back.path, path + req.name + '/back.png');
            c('/clear');
        });
    }).then(url => {
        ctx.redirect(url);
    });
})

router.post('/change', async (ctx) => {

    const file = ctx.request.files.file;
    const back = ctx.request.files.back;
    const path = "../Items/";
    const req = ctx.request.body;
    const dev_name = ctx.cookies.get('name');
    console.log('name : ' + dev_name);
    const rootURL = '45.76.222.210/' + req.name;

    const sql = "update item set interduce = " + Wrapping('"', req.document) + " where name = " + Wrapping('"', req.name);
    await new Promise((c, r) => {
        connection.query(sql, async (err) => {
            if (err) {
                console.log(err);
                c('/error');
            }
            if (file.size != 0) {
                fs.copyFileSync(file.path, path + req.name + '/file.zip');
            }
            if (back.size != 0) {
                fs.copyFileSync(back.path, path + req.name + '/back.png');
            }
            c('/clear');
        });
    }).then(url => {
        ctx.redirect(url);
    })

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
                    console.log("qwe");
                    console.log(data);
                    ctx.body = data;
                })
        });

})
function Wrapping(sep, params) {
    return sep + params + sep;
}
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
router.get('/fff', (ctx) => {
    ctx.body = change_form;
})
router.get('/list', async (ctx) => {
    const dev_name = "'" + ctx.cookies.get('name') + "'";
    console.log(dev_name);
    await new Promise((chain, r) => {
        connection.query('select * from item where developer=' + dev_name, (err, row) => {
            var result = "";
            if (err) {
                console.log(err);

                chain(2);
                return;
            }
            else if (row.length == 0) {
                chain(2);
                return;
            }
            for (let index = 0; index < row.length; index++) {
                const element = row[index];
                const html = '<div class="card" style="width: 20rem;">\
                <img class="card-img-top" src="http://'+ element.image + '" alt="Card image cap">\
                <div class="card-body">\
                  <h4 class="card-title">'+ element.name + '</h4>\
                  <p class="card-text">'+ element.interduce + '</p>\
                  <div onclick="OpenForm_change('+ Wrapping('\'', element.name) + "," + Wrapping('\'', element.interduce) + ')" class="btn btn-primary">Want Change?</div>\
                </div>\
              </div>';
                result += html;
            }
            chain("<div class='row'>" + result + "</div>");
        })
    }).
        then(data => {
            ctx.body = data;
        })
})
app.use(router.routes());


if (!module.parent) app.listen(3000);
