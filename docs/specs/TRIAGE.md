# Abstract

We need to decide a way to triage community issues. In this proposal we will only talk about the triage process -- not about the format feature proposals should follow.

# Motivation

We want to make Yoroi a product built by the community -- not just by Emurgo. 

Notably we want:
1) Community: easily make feature suggestions
1) Developers: easily triage feature suggestions


# Background

Two competing ideas
### 1) External Solution

Can use an external tool

##### Advantages
- May be easier to use

##### Disadvantage 
- Fragments knowledge
- Most likely costs money
- Centralization risk (somebody has to pay for it)

### 2) Track directly on Github

We can track on Github either through 
A) PR to a special `docs/specs` folder
B) Use the issue tracker

The user interaction would be:
- **Feature suggestion**: Create issue/PR on Github
- **Vote**: give 👍 reaction to issue/PR

##### Common Advantages
- Easy integration with Github 
- Not easily gamed (you'd have to create multiple github accounts)

##### Common Disadvantages
- Must create Github account to create & vote on an issue.
- May clutter our Github page if we have too many suggestions
- Limited to markdown support

##### Comparison table
　
| Issue-based  | PR-based |
| ------------- | ------------- |
| Easy to propose feature  | Requires Git knowledge  |
| Easily [sort issues by vote](https://github.com/Emurgo/yoroi-frontend/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A%22new+scenario+%28desired%29%22) | Easily [sort PRs by vote](https://github.com/Emurgo/yoroi-frontend/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A%22new+scenario+%28desired%29%22) |
| Cannot make inline comments | Can make inline comments |
| Cannot make suggested changes | Can make [suggested changes](https://help.github.com/articles/incorporating-feedback-in-your-pull-request/#applying-a-suggested-change) |
| Simple [edit history](https://help.github.com/articles/tracking-changes-in-a-comment/) | Full edit history |
| Not part of code-search | Part of code search |
| Intuitive | May often manually close issues and ask them to follow the PR process | 

##### Hybrid approach

Ethereum EIPs have a mandatory PR but also require a `discussions-to` link where people can discuss the proposal as a whole. This `discussions-to` often ends up being a Github issue link meaning that many proposals have both a PR (to discuss individual line changes, etc) and an issue (to discuss the idea in general)

# Proposal

I sugget we follow the PR process. Proposal-based repos (EIP, BIP, etc) have a mandatory PR for each feature suggestion because the advantages make up for the complexity. Since our proposals should more concrete than suggestions for a blockchain in general, I am not convinced we needed the added complexity of a `discussions-to` field.