#!/usr/bin/env node
const program = require('commander');
const common = require('./common');
const init = require('./init');
const inquirer = require('inquirer');
// const fs = require('fs-extra');
// const path = require('path');

const { message } = common;

if (process.argv.slice(2).join('') === '-v') {
  const pkg = require('../package');
  message.info('version ' + pkg.version);
  process.exit()
}

program
  .command('new [name]')
  .alias('n')
  .description('Creates a new project')
  .action(function (name) {
    const promps = [];
    if(!name) {
      promps.push({
        type: 'input',
        name: 'app',
        message: '请输入项目名称',
        validate: function (input){
            if(!input) {
                return '不能为空'
            }
            return true
        }
      })
    }
    const isDemand = {
      type: 'confirm',
      name: 'isDemand',
      message: '是否按需加载',
    }
    promps.push(isDemand);
    inquirer.prompt(promps).then(function (answers) {
      if(!answers.name){
        answers.name = name;
      }
      console.log(answers);
      init(answers);
    })
  });

program.parse(process.argv);

const cmd = process.argv[2];
if (!['p', 'page', 'new', 'n'].includes(cmd)) {
  program.help();
}
