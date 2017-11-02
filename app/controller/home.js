'use strict';
let baseUrl = 'http://git.gag.cn/api/v3';
let token = 'XfuKh_TqjqRt-KaZgyXc';
let Git = require('simple-git')();
let SimpleGit = require('simple-git');
let shell = require('shelljs');
let path = require('path');
let fs = require('fs');
let access_token = 'afe2d7e7393db63f0d3709cb61c0ff8be4575da0';
let base = '/Users/yaojiasong/gooagoo/gitlab';
let githubBaseUrl = 'https://api.github.com';
module.exports = app => {
  class HomeController extends app.Controller {
    * index(ctx) {
        let group = yield ctx.curl(`${baseUrl}/groups?private_token=${token}`, {
            dataType: 'json'
        });
        this.ctx.body = group.data;
    }
    * git_clone_project(ctx) {
        let { groupName, gitlabToken } = ctx.query;
        if (!groupName || !gitlabToken) {
            this.error('参数有误');
            return;
        }

        let group = yield ctx.curl(`${baseUrl}/groups?private_token=${gitlabToken}`, {
            dataType: 'json'
        });
        let groupId = null, groupArr = group.data;
        for (let i = 0; i < groupArr.length; i ++) {
            if (groupArr[i].name === groupName) {
                groupId = groupArr[i].id;
            }
        }
        if (!groupId) {
            this.error(`没有查询到${groupName}项目组`);
            return;
        }
        let projects = yield ctx.curl(`${baseUrl}/groups/${groupId}/projects?private_token=${gitlabToken}`, {
            dataType: 'json'
        });
        shell.cd(base);
        let groupNameCode = shell.find(groupName).code;
        if(groupNameCode === 1){
            shell.mkdir(groupName);
        }
        let gitlabUrl = `${base}/${groupName}`;
        let data = projects.data;
        let arr = [];
        for (let i = 0; i < data.length;  i++) {
            let obj = data[i];
            let name = obj.name;
            let FEArr = fs.readdirSync(gitlabUrl);
            let isHave = FEArr.some((key) => { return key === name });
            if (!isHave) {
                shell.cd(gitlabUrl);
                shell.mkdir(name);
                let p = `${gitlabUrl}/${name}`;
                let repo = obj.ssh_url_to_repo;
                console.log(repo,`  ${name}  `,p);
                let res =   this.cloneProject(repo, p);
                yield res.then((req) => {
                    console.log(name, '完成');
                    arr.push(`${name} 完成`);
                    shell.cd(p);
                    shell.rm('-rf', '.git')
                });
            }
        }
        ctx.body = {arr,data};
    }
    cloneProject (repo, p) {
        let result = new Promise((resolve, reject) => {
            Git.clone(repo, p, function (err, success) {
                if (err) {
                    reject(err)
                } else {
                    resolve(success);
                }
            })
        });
        return result;
    }
    * githubOrgs (ctx) {
        let { groupName , githubToken } = ctx.query;
        let orgs = yield ctx.curl(`${githubBaseUrl}/user/orgs?access_token=${githubToken}`,{
            dataType: 'json'
        });
        ctx.body = orgs.data;
    }
    * createdGithubRepo (ctx) {
        let { groupName , githubToken } = ctx.query;
        if (!groupName || !githubToken) {
            this.error('参数有误');
            return;
        }
        let p = `${base}/${groupName}`;
        shell.cd(`${p}`);
        shell.rm('-rf', '.DS_Store');
        let arr = fs.readdirSync(`${p}`);
        for (let i = 0; i < arr.length; i++) {
            yield ctx.curl(`${githubBaseUrl}/orgs/gag-fe/repos?access_token=${githubToken}`,{
                dataType: 'json',
                method: 'POST',
                contentType: 'json',
                data:{
                    name: arr[i],
                    description: 'GaG FE'+arr[i]
                },
                headers: {
                    'Accept': 'application/vnd.github.mercy-preview+json'
                }
            });
        }
        ctx.body = arr;
    }
    * git_push_to_github (ctx) {
        let { groupName , commitText = 'first commit'} = ctx.query;
        if (!groupName) {
            this.error('参数有误');
            return;
        }
        let groupPath = `${base}/${groupName}`;
        shell.cd(`${p}`);
        shell.rm('-rf', '.DS_Store');
        let arr = fs.readdirSync(groupPath);
        let outPut = [];
        for (let i = 0; i< arr.length; i ++ ) {
            let result = this.gitpush(arr[i]);
            yield result.then(() => {
                outPut.push(arr[i], groupPath, commitText);
            })
        }
        ctx.body = outPut;
    }
    gitpush (name, baseLocal, commitText) {
        shell.cd(`${baseLocal}/${name}`);
        shell.rm('-rf','.git');
        let result = new Promise((resolve, reject) => {
            let git = SimpleGit(`${baseLocal}/${name}`);
            let sshUrl = `https://github.com/gag-fe/${name}.git`;
            console.log(sshUrl);
            git.init()
                .add('./*')
                .commit(`${commitText} ${name}`)
                .addRemote('origin', sshUrl)
                .push(['-u', 'origin', 'master'], (err, success) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    console.log(name);
                    resolve(success)
                });
        });
        return result;
    }
  }
  return HomeController;
};
