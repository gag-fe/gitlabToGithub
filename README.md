# gitlabToGithub


### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.

### API
```javascript
/*
* api [GET] http://localhost:7001/git_clone_gitlab_project
* Params groupName  gitlab项目组组名
* Params gitlabToken  gitlab token值
* */

/*
* api [GET]  http://localhost:7001/create_github_repo
* Params groupName github仓库组组名
* Params githubToken  github token值
* */

/*
* api [GET] http://localhost:7001/git_push_to_github
* Params  groupName （gitlab项目组组名)
* Params commitText（push 到仓库的 commit 默认‘‘fi’’）
* */
```

### url

拉取gitlab:http://127.0.0.1:7001/git_clone_gitlab_project?gitlabToken=-xCTWfH-C2XcFMVUpVza&groupName=rc-common
创建githab res:http://127.0.0.1:7001/create_github_repo?githubToken=464dafe713a228eabc35ba8ba4ff3328e4d78e2a_xx&groupName=bfkoldalibaba
pull githab： http://127.0.0.1:7001/git_push_to_github?githubToken=464dafe713a228eabc35ba8ba4ff3328e4d78e2a_qwe&groupName=bfkoldalibaba
