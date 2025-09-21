我现在要解决 github issue 435

config being reset to the previous version on edge browser

only can reproduce on the production now

open many pages, then try to left them very long time to make them inactive
then open option page, change option, add api and choose a different provider, then go back to the inactive page tab
try to translate, then the config goes back to the previous config


This probably because the inactive page don't have config watch running, so when it becomes active, the watch function may run and write a previous config back.

