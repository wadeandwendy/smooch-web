# Branding the Android SDK

This is a stopgap measure before we get the enterprise SDK. It will enable us to ship a binary SDK to Sparkcentral in order to meet our contractual obligations.

The parameters are:

| Parameter Name | Definition | Example |
| -------------- | ---------- | ------- |
| BRAND | The correctly cased brand name of the company | Smooch, Sparkcentral, Oracle |
| TLD | The top-level domain of the company's domain | io, com, net, ai |
| DOMAIN | The company's domain, without com | smooch, sparkcentral, oracle |
| guiresource_name | Equivalent to sparkcentral, but used in GUI resources for Android | smooch, sparkcentral, oracle |

The tools you'll need are:

 * bash
 * a text editor
 * replace-and-rename.js

Make sure Android Studio is not open when you do this. If it is, not a big deal but best to do this undisturbed.

 1. Set environment variables

  * `export BRAND=Sparkcentral`
  * `export TLD=com`
  * `export DOMAIN=sparkcentral`
  * `export guiresource_name=$DOMAIN`

 2. Keep on running replace-and-rename.js until you don't get any more errors. 🙈

  * `find * -type d | grep BRAND | xargs node replace-and-rename.js Sparkcentral`
  * `find * -type f | grep BRAND | xargs node replace-and-rename.js Sparkcentral`
  * `find * -type d | grep TLD | xargs node replace-and-rename.js TLD`
  * `find * -type f | grep TLD | xargs node replace-and-rename.js TLD`
  * `find * -type d | grep DOMAIN | xargs node replace-and-rename.js DOMAIN`
  * `find * -type f | grep DOMAIN | xargs node replace-and-rename.js DOMAIN`
  * `find * -type d | grep guiresource_name | xargs node replace-and-rename.js guiresource_namea`
  * `find * -type f | grep guiresource_name | xargs node replace-and-rename.js guiresource_name`    

 3. Open up atom or your favourite text editor and find/replace all using the substitutions above.

You should now be ready to build a branded SDK!
