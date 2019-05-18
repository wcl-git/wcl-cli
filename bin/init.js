const fs = require('fs-extra');
// const chalk = require('chalk');
const {basename, join} = require('path');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const ora = require('ora');
const vfs = require('vinyl-fs');
const map = require('map-stream');

const common = require('./common');
const {message, write} = common;


const platePath = join(__dirname, '../plate');

function copyLog(file, cb) {
  message.success(file.path);
  cb(null, file);
}

// function initComplete(app) {
//   message.success(`Success! Created ${app} project complete!`);
//   message.light(`begin by typing:

//     cd ${app}
//     npm start

//     `)
//   process.exit();
// }

function createProject(dest,app) {
  const spinner = ora('downloading template')
  if (fs.existsSync(platePath)){
    fs.emptyDirSync(platePath);
  }
  inquirer.prompt([{
    type: 'input',
    name: 'description',
    message: '项目描述',
    validate: function (input){
      if(!input) {
          return '不能为空'
      }
      return true
    }
  }]).then(function (answers) {
    spinner.start();
    const template = app.isDemand ? 'https://github.com/wcl-git/router-react' : 'https://github.com/wcl-git/router-react';
    download(template, platePath, {clone:true},function (err) {
      spinner.stop()
      if (err) {
        console.log(err)
        process.exit()
      }

      fs
      .ensureDir(dest)
      .then(() => {
        vfs
          .src(['**/*', '!node_modules/**/*'], {
            cwd: platePath,
            cwdbase: true,
            dot: true,
          })
          .pipe(map(copyLog))
          .pipe(vfs.dest(dest))
          .on('end', function() {
            const app = basename(dest);
            const packagePath = `${dest}/package.json`;
            const packageFile = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
            packageFile.name = `${app}`;
            packageFile.description = answers.description || `${app}-project`;
            write(packagePath, JSON.stringify(packageFile, null, 2));
          })
          .resume();
      })
      .catch(err => {
        console.log(err);
        process.exit();
      });
    })
  })
}

function init(app) {
  const dest = process.cwd();
  const appDir = join(dest, `./${app.name}`);
  if (fs.existsSync(appDir)) {
    inquirer.prompt([{
      type: 'confirm',
      name: 'isClear',
      message: '是否清空文件',
    }]).then(function (answers) {
      if (answers.isClear) {
        const spinner = ora(`remove ${app.name} dir`).start();
        fs
          .emptyDir(appDir)
          .then(() => {
            spinner.stop();
            createProject(appDir,app);
          })
          .catch(err => {
            console.error(err);
          });
      } else{
        process.exit();
      }
    })
  }else {
    createProject(appDir,app);
  }
}

module.exports = init;
