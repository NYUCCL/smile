# Persistence

A key concept in Smile is the idea of _persistence_. Persistence refers to the
fact that information about the application is preserved across page reloads.

It is fairly common for participants to reload their browser window, or to close
a window and reopen it at another time. In most experiment frameworks, the task
begins anew when a participant does this, which can be problematic for certain
research questions. Instead, Smile makes it easy to persist variables in a way
that they will survive page reloads.

Persistence has several important effects on how Smile applications behave both
during development and during "live" data collection.

The first is that if you reload the webpage in live or developer mode, it will
tend to return to the same state as when it was left off.

If you want to "reset" the state of the app completely (removing all
persistence), then press the lightning bolt icon
(<i-f7-bolt-fill class="inline vp-raw" />) in the developer tools.
