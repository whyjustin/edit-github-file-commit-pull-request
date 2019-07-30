const process = require('process')
const octokit = require('@octokit/rest')()

const token = process.env.GITHUB_TOKEN
const owner = 'whyjustin'
const repo = 'edit-github-file-commit-pull-request'
const base = 'master'
const time = new Date().getTime().toString()
const head = time

octokit.authenticate({
  type: 'token',
  token: token
})

createPullRequest()
async function createPullRequest() {
  const commits = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: 1
  })
  const treeSha = commits.data[0].commit.tree.sha

  const tree = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: [
      { path: 'test/foo.txt', mode: '100644', content: `one\n${time}\ntwo` },
      { path: 'test/bar.txt', mode: '100644', content: `three\n${time}\nfour` }
    ]
  })

  const latestCommitSha = commits.data[0].sha
  const newTreeSha = tree.data.sha
  const commit = await octokit.git.createCommit({
    owner,
    repo,
    message: time,
    tree: newTreeSha,
    parents: [latestCommitSha],
    author: {
      name: 'Justin Young',
      email: 'jyoung@sonatype.com'
    }
  })
  const newCommitSha = commit.data.sha
  await octokit.git.createRef({
    owner,
    repo,
    sha: newCommitSha,
    ref: `refs/heads/${head}`
  })

  response = await octokit.pulls.create({
    owner,
    repo,
    head,
    base,
    title: `Title: ${time}`,
    body: `Body: ${time}`
  })
}