'use strict';

module.exports = app => {
  app.get('/', 'home.index');
  app.get('/git_clone_gitlab_project', 'home.git_clone_project');
  app.get('/githubOrgs', 'home.githubOrgs');
  app.get('/create_github_repo', 'home.createdGithubRepo');
  app.get('/git_push_to_github', 'home.git_push_to_github');
};
