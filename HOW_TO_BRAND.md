# Branding the Android SDK

This is a stopgap measure before we get the enterprise SDK. It will enable us to ship a binary SDK to Sparkcentral in order to meet our contractual obligations.

The parameters are:

| Parameter Name | Definition | Example |
| -------------- | ---------- | ------- |
| BRAND | The correctly cased brand name of the company | Smooch, Sparkcentral |
| DOMAIN | The company's domain, without com | smooch, sparkcentral, oracle |
| CLASS_PREFIX | Internal class prefix, "sk" in the virgin code base | sk, spark |

The tools you'll need are:

 * bash
 * a text editor
 * replace-and-rename.js

Make sure Android Studio is not open when you do this. If it is, not a big deal but best to do this undisturbed.

 1. Set environment variables

  * `export BRAND=Sparkcentral`
  * `export DOMAIN=sparkcentral`
  * `export CLASS_PREFIX=spark`

 2. Keep on running replace-and-rename.js until you don't get any more errors. 🙈

  * `find * -type d | grep BRAND | xargs node replace-and-rename.js Sparkcentral`
  * `find * -type f | grep BRAND | xargs node replace-and-rename.js Sparkcentral`
  * `find * -type d | grep DOMAIN | xargs node replace-and-rename.js DOMAIN`
  * `find * -type f | grep DOMAIN | xargs node replace-and-rename.js DOMAIN`
  * `find * -type d | grep CLASS_PREFIX | xargs node replace-and-rename.js CLASS_PREFIX`
  * `find * -type f | grep CLASS_PREFIX | xargs node replace-and-rename.js CLASS_PREFIX`    

 3. Open up atom or your favourite text editor and find/replace all using the substitutions above.

You should now be ready to build a branded SDK - 
