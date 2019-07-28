# Abstract

This proposal describes a basic URI scheme to handle ADA transfers, as well
as possible approaches for a multiplatform implementation.

# Motivation

Users who create community content often want donations as a financial incentive.
However, no consumer wants to
- A) Open Daedalus as it takes too long to sync
- B) Copy paste the user address and decide how much to send

Yoroi is unique in that opening our wallet is near-instant and already runs in
your browser. We hope that adding a three-click donation system would greatly
encourage adoption of Ada payments. This URI scheme would enable users to easily
make payments by simply clicking links on webpages or scanning QR Codes.

# Proof of Concept

![proof of concept](../images/image1.gif)

# Core Implementation

The core implementation should follow the [BIP-21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) standard (with `bitcoin:` replaced with `web+cardano:`)

Rationale:
- Use `cardano:` over `ada:` as other projects that implement this standard tend
to take the project name over the currency name (this makes sense if we consider this protocol as a generic way for interacting with the blockchain through wallets -as opposed to a simple payment system)
- Many wallets support multiple currencies. Following the same standard will ensure higher adoption of our protocol.

Example:
```
<a href="web+cardano:Ae2tdPwUPEZ76BjmWDTS7poTekAvNqBjgfthF92pSLSDVpRVnLP7meaFhVd">Donate</a>
```
## Considerations

1. BIP-21 is limited to only features Bitcoin supports. A similar feature for Ethereum would, for example, also support gas as an extra parameter. BIP-21 is easily extensible but we have to take precaution to avoid different wallets having different implementations of these features as they become available on Cardano. To get an idea of some extra features that could be added, consider this (still under discussion) proposal for Ethereum: [EIP-681](https://eips.ethereum.org/EIPS/eip-681)

2. Depending on the protocol registration method (see next section), browsers
generally enforce a `web+` or `ext+` prefix for non-whitelisted
protocols (note: `bitcoin:` was whitelisted). The prefix `ext+` is recommended
for extensions, but not mandatory.

## ABNF Grammar (Proposal)

This is an initial, simplified protocol definition for fast implementation; it
only requires an address and an optional amount parameter.
As discussed above, these rules are likely to evolve in time in order to support
additional features, including unique capabilities of the Cardano blockchain.

```
cardanourn     = "web+cardano:" cardanoaddress [ "?" amountparam ]
cardanoaddress = *base58
amountparam    = "amount=" *digit [ "." *digit ]

```

The amount parameter must follow the [same rules](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki#transfer-amountsize) described in BIP-21, namely,
it must be specified in decimal ADA, without commas and using the period (.)
decimal separator.

# Multiplatform Implementation

An ideal, multiplatform implementation would allow users to launch Yoroi (or
possibly other Cardano wallets if they implement the protocol as well) to make
payments by simply clicking on any URL starting with `web+cardano:` - in a similar
way as a `mailto:` URL launches the default email client. To achieve this, the
protocol must be registered by browsers and by the mobile apps.
For integration with desktop clients, the protocol must be registered in the OS.

## Registering the Protocol in Web Browsers

There are two common approaches to register a custom protocol in modern web
browsers: `Navigator​.register​Protocol​Handler()` [(1)][1] and `protocol_handlers` [(2)][2]. The former currently works in Chrome and the latter
in Firefox.

### Using the `Navigator​.register​Protocol​Handler()` method (Chrome)

1. A new protocol is registered by executing:

        navigator.registerProtocolHandler(
          "web+cardano",
          "chrome-extension://ffnbelfdoeiohenkjibnmadjiehjhajb/main_window.html#/?a=%s",
          "Yoroi");

  Note that this requires a specific URL format (ie. must contain `%s`).

2. This method has a same-domain security policy, so protocol handlers can only be added for the same domain the user is currently viewing.
In our case, this means we can only register this protocol from within the Yoroi extension.

3. Registering a new protocol prompts the user to accept:
  ![permission dialog](../images/image2.png)

4. This method is in general **only available within secure contexts (HTTPS)**.
As a consequence, registering a protocol from within an extension doesn't work
in some browsers, (see row "Secure context required" in [(1, section Browser compatibility)][1]). Currently **works in Chrome but not
in Firefox**.

### Using the `protocol_handlers` method (Firefox)

1. The protocol is registered inside the `manifest.json` file, eg.:

        "protocol_handlers": [
          {
            "protocol": "web+cardano",
            "name": "Yoroi",
            "uriTemplate": "main_window.html#/wallets/1/transactions?a=%s"
          }
        ]

2. This method only seems to work using a relative `uriTemplate` as shown above. Using an absolute URL throws a security error (requires HTTPS).

3. It does not impose the same-domain security policy. This
means the protocol is simply pre-registered "from factory" and should be effectively activated after the first time the user clicks on a URI and gives the corresponding permissions.

4. This option is currently **only supported by Firefox** (see [(2, section Browser compatibility)][2])

## Suggested Implementation

1. As explained above, we will need to implement two different methods to register
  the protocol. The following approaches can be considered:

    - A) Chrome
      * Register protocol during first-boot.
      * We add an explanation of this feature and what the prompt will look
        like. Once the user presses a “understood button”, we register the
        protocol causing the browser prompt to appear.
    - B) Firefox
      * The protocol is pre-registered in the `manifest.json`.
        Users should simply grant (or deny) permission once clicking on a URI for
        the first time.

2. Since the extension ID is uniquely determined by the private key we use to upload our app to the Chrome store, we can safely assume it will not change and therefore we should just hard-code it. Alternatively, we may just use a relative
URL (eg. `main_window.html#/path/to/page`).

3. The URI (which replaces the placeholder `%s`) should be passed as an argument to a special page in the Yoroi app and not the send page (see Future Proof section for more detail)

## Note

Since the user can choose “block” or remove the handler at any time from his browser settings, we cannot enforce this feature.

## Registering the Protocol in Mobile Apps

Once again, handling custom protocols works differently for Android and iOS,
though the idea is basically the same and is based in Mobile Deep Linking.

In mobile, custom protocols are registered "from factory" in the app's code. An advantage with respect to browsers is that there is no requirement for a `web+` prefix.

### Android

The URI definition must be included inside the `AndroidManifest.xml` file as
an `intent-filter` (see [(3)](3)). Here's a minimum working example (assuming we keep `web+cardano` as the protocol handle):
```HTML
        <intent-filter>
          <action android:name="android.intent.action.VIEW" />
          <category android:name="android.intent.category.DEFAULT" />
          <category android:name="android.intent.category.BROWSABLE" />
          <data android:scheme="web+cardano"/>
        </intent-filter>
```
The example above simply opens the app when a `web+cardano:` URI is clicked.

### iOS

The URI definition can be included in the `info.plist` file through Xcode
[(5)](5). Some additional configuration is required (`RTCLinking` must be linked
to the project. See [(4)](4) for more details.)

#### Note:

- As of iOS 9, Apple encourages the use of [Universal Links](https://developer.apple.com/documentation/uikit/core_app/allowing_apps_and_websites_to_link_to_your_content) over custom URI schemes
for handling deep linking. This questions support for custom URIs in the future.

### Handling the Deep Links in react-native

This is done using the `Linking` [(4)](4) interface.
When the app intercepts an external URI call, the payload can then be retrieved through the `Linking.getInitialURL()` method.

## Non-protocol-based Solution

An alternative solution to the original problem described above is to use
standard URL links in combination with a routing
backend system. The routing system is used to redirect to the app's URI.
The advantage of this scheme is that it allows to provide a fallback mechanism
to handle the case when no application implementing the protocol is installed
(for instance, by redirecting to the App Store or Google Play).
This is the approach behind iOS Universal Links and Android App Links.
In general, it provides a better user experience.

# Security Considerations

1. We cannot prompt the user to send the funds right away as they may not be fully aware of the URI they clicked or were redirected to. Instead, it may be better to simply pre-populate fields in a transaction.
2. We should be wary of people who disguise “donate” links as actually opening up a phishing website that LOOKS like Yoroi with the fields pre-filled.

# Future Proof Considerations

## Considerations

1. Once we pick a page in Yoroi to send users to, we cannot easily change it (since it will be baked into the protocol)
2. Before sending a transaction, the user may have to make extra choices (such as which wallet to send from if Yoroi eventually supports multiple wallets). These options should not all be listed on the “send” page
3. For mobile, there is a clear trend toward the use of HTTP/HTTPS Deep Links.
It is likely that custom URIs will not be supported for much longer.

## Suggested Implementation
We should create a new page in Yoroi to handle these URI links that way we can prompt the user for additional decisions in the future before redirecting them to the appropriate page.

## Note
Users may have downloaded Yoroi and registered the protocol but have not created a wallet yet.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler

[2]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/protocol_handlers

[3]: https://developer.android.com/training/app-links/deep-linking#adding-filters

[4]: https://facebook.github.io/react-native/docs/linking.html

[5]: https://developer.apple.com/documentation/uikit/core_app/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app
