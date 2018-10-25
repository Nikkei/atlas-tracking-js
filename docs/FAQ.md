# Frequently Asked Questions

## Implementation

### How can I measure clicks on a specific link?

There are three choice.

1. Add a data attribute to `a`, `button` or `input` tags which is a target to be tracked. Default attribution name is `data-atlas-trackable` but you can change the name for detecting the target element through `trackClick.targetAttribute` option in `config()`.
2. Create an event listener to detect clicks on the target element, and call `trackAction()` from the listener.
3. Add `onClick` attribute to the target element and call `trackAction()`.

1 is the best way because it's easy and safe. (Imagine if an user clicks the link before Atlas Tracking is initialized?)
Most 3rd party tools recommend 2 or 3 in their document but 3 is hard to control the loading sequence.