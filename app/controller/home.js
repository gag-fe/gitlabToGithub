'use strict';
let baseUrl = 'http://git.gag.cn/api/v3';

let Git = require('simple-git')();
let SimpleGit = require('simple-git');
let shell = require('shelljs');
let path = require('path');
let fs = require('fs');
let base = '/Users/yaojiasong/gooagoo/gitlab';
let githubBaseUrl = 'https://api.github.com';
module.exports = app => {
  class HomeController extends app.Controller {
    * index(ctx) {
        let { gitlabToken } = ctx.query;
        if(!gitlabToken) {
            this.error('参数有误');
            return;
        }
        let group = yield ctx.curl(`${baseUrl}/groups?private_token=${gitlabToken}`, {
            dataType: 'json'
        });
        this.ctx.status = group.status;
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
        let outPut = [];
        for (let i = 0; i < arr.length; i++) {
            let result = yield ctx.curl(`${githubBaseUrl}/orgs/${groupName}/repos?access_token=${githubToken}`,{
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
            outPut.push({
                data: result.data,
                status: result.status
            })
        }
        ctx.body = outPut;
    }
    * git_push_to_github (ctx) {
        let { groupName , commitText = 'first commit'} = ctx.query;
        if (!groupName) {
            this.error('参数有误');
            return;
        }
        let groupPath = `${base}/${groupName}`;
        shell.cd(`${groupPath}`);
        shell.rm('-rf', '.DS_Store');
        let arr = fs.readdirSync(groupPath);
        let outPut = [];
        for (let i = 0; i< arr.length; i ++ ) {
            let result = this.gitpush(arr[i], groupPath, commitText, groupName);
            yield result.then(() => {
                outPut.push(arr[i], groupPath, commitText);
            })
        }
        ctx.body = outPut;
    }
    gitpush (name, baseLocal, commitText, groupName) {
        let gitHubPath = `${baseLocal}/${name}`;
        console.log(gitHubPath);
        shell.cd(gitHubPath);
        shell.rm('-rf','.git');
        let result = new Promise((resolve, reject) => {
            let git = SimpleGit(gitHubPath);
            let sshUrl = `https://github.com/${groupName}/${name}.git`;
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
