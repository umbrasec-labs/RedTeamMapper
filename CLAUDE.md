# Working rules
- Commit identity comes from the environment or the repo's existing history (`git log --format='%an <%ae>' -3`). Never run git config or invent an identity.
- No Co-Authored-By trailers and no attribution lines in commits or PR bodies.
- Never use em-dashes or en-dashes; use a plain hyphen.
- Work on branches and open PRs. Merge only when CI is green and the build was checked locally.
- No emails, tokens or personal data in commits, code or docs.
- Prefix shell commands with `cd <repo> &&`; never assume the current directory.
