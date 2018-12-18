# Abstract

Allows user to lock their wallet with a pin like someone can do in iOS / Android.

# Motivation

Yoroi is completely secure (impossible to do tx without the password), but we want to add a lock screen similar to what phones have so we can protect the user privacy (balance and transactions) in case that someone else has access to the computer. This has a been a constant request from multiple people.

# Proposal

## How it should work

The user should have like a possibility to click an icon in the topbar (a lock) and then the app will be locked; in the locked state, the user can’t see any information except for a dialog where a PIN is asked (we will name this pin/ pincode to avoid confusion with the spending password)

## Requirements

- add a dummy icon in the top right part of the topbar -> activate a locking screen
- add a new item in the settings list with the option to enable / disable a locking screen (if it’s disable probably we should hide the icon on the top right bar) also besides a checkbox for this screen we should have: current password input / new password input / repeat new password input
- when the user selects the checkbox to enable a password, we should show a dialog asking for a password and repeat password
minimum 6 characters (max depending on the design). PIN will be stored as a hash + salt. Probably we should use SHA2, SHA3 or Blake2b.

### Advantages

- Even if this feature doesn’t add real security, it would help with privacy.
- Feature pairing with the upcoming mobile version.

### Disadvantages

- Users can get confused between PIN and password.
- Users can get confused if their PIN is not ”automatically” sync with other instances of Chrome App.

### Current flow
- User can go to the settings page and enable lock screen feature (it's disabled by default)
- After that user will be asked to set his PIN code. The pin code will be encrypted by the https://www.npmjs.com/package/bcryptjs - the JS implementation of the well-known bcrypt. Bcryptjs uses Blowfish algorithm under the hood and the great advantage is we don't have to store salt somewhere, the salt is generated on the fly by Bcryptjs itself. The encrypted pin code will be saved in localStorage.
- If the user have the lock screen feature enabled and pin code set, he will be able to see the icon in the topbar. 
- User can lock his app by clicking on this icon.
- If the app is locked, it will render only the lock screen, no matter on what page user is.
- User should enter his pin code to unlock the app
- The entered pin code will be processed by bcryptjs and if it's correct the app will be unlocked.
- note: since all the settings are stored locally, the user will be able to open Application tab in browser and remove all related items from the localStorage, thus the app will be unlocked after a page refresh.
- User is able to change his PIN code from settings page, but he have to remember his current PIN code for changing.

# Improvement proposal

### Flow 1: keep lock screen optional

If we want to keep lock screen optional as it is, we could just encrypt saved data as it was proposed. We also might display some kind of notification to user when there are no wallet data in localStorage, something like "Enable lock screen to improve the security". I think we need user to understand clearly that if he\she don't avoid the lock screen, his\her data won't be protected with encryption.

### Flow 2: make lock screen enabled by default for all users

In this case, we will have 3 states of the app
- state 1: there are no wallet data and no hashed pincode in the localStorage
This is like a state after you just have installed the app. State 1 asks user to set a pin code to proceed. 
- state 2: there is a hashed pincode in the localStorage
At this stage user is asked to confirm his pincode every time when the user opens the app. Now user can work with wallets. When user tries to add or restore the wallet, wallet data should be encrypted and then saved. 
- state 3: there is wallet data in localStorage, but no hashed pin code
In this case walled data should be cleared and the app goes to state 1.

Flow 2 has better security because if someone clears the lock screen-related fields in the localStorage, he\she won't be able to work with wallets.