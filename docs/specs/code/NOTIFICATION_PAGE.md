# Abstract

Provides ability to see wallet's various stakepool or rewards specific messages/certificates

# Motivation

This will help user to have better idea of rewards and stakepool related changes

# Proposal

Meaasges will displayed on per wallet basis. So when user makes a new wallet by create a new wallet or restoring one, a new notification icon will be seen like. <br/>![image](https://user-images.githubusercontent.com/19986226/70297213-82ca1500-1830-11ea-8551-1b4e57d66a71.png)

(We can also choose to show this icon only when there is at least one notification to show)

Messages will be grouped by per day in reverse chronological order (latest will be shown first).

Initially, certificates would be:
1. STAKE_DELEGATED
2. STAKE_UNDELEGATED
3. STAKE_REDELEGATED
4. FEE_CHANGED
5. COST_CHANGED
6. REWARD_RECEIVED
7. POOL_TO_RETIRE
8. NO_REWARDS_FOR_UNDELEGATION

Each type of message will have an unique icon.
A group of messages will look like. <br/>
![image](https://user-images.githubusercontent.com/19986226/70298171-0a655300-1834-11ea-8c9d-1c63b6d5906a.png)

# API
TBD