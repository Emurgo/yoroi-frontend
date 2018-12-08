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
