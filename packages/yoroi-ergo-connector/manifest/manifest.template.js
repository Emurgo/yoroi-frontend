module.exports = ({
  packageName,
  displayName,
  version,
  icons,
}) => ({
  "name": packageName,
  "version": version,
  "description": "Allows the Yoroi extension to interface with dApps following the Ergo EIP-0012 spec.",
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "content_scripts": [
    {
      "matches": [
        "file://*/*",
        "http://*/*",
        "https://*/*"
      ],
      "js": [
        "inject.js"
      ],
      "run_at": "document_start",
      "all_frames": true
    }
  ],
  icons,
  "manifest_version": 2,
  "browser_action": {
    "default_title": displayName,
    default_icon: icons,
  },
  "permissions": [
    "activeTab",
    "storage"
  ]
});
